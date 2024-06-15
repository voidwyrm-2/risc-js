import {
    Token,
    tokenTypes,
    AsmError,
    SyntaxError,
    InvalidRegisterCallError,
    UnexpectedTokenError,
    UnknownLabelError,
    nonimmediateOperationBase,
    immediateOperationBase,
    branchOperationBase
} from "./common"

/** 
* memory print modes:
* 
* 0: do nothing
* 
* 1: print only registers each line
* 
* 2: print only memory each line
* 
* 3: print registers and memory each line
* */
export class Interpreter {
    private readonly lines: Token[][]
    //private pc: number

    private memory: number[]
    private registers: number[]
    private labels: Map<string, number>

    private readonly enforceGlobalUsingDirective: boolean
    private readonly memoryPrintMode: number

    constructor(lines: Token[][], enforceGlobalUsingDirective: boolean = true, memorySizeInBytes: number = 256, memoryPrintMode: number = 0) {

        this.lines = lines
        //this.registers[32] = 0
        this.registers = []
        for (let i = 0; i < 33; i++) {
            this.registers.push(0)
        }
        this.memory = []
        for (let i = 0; i < memorySizeInBytes; i++) {
            this.memory.push(0)
        }
        this.labels = new Map()
        this.enforceGlobalUsingDirective = enforceGlobalUsingDirective
        this.memoryPrintMode = memoryPrintMode
        this.parse()
    }

    private parse() {
        this.lines.forEach((toks, ln) => {
            while (true) {
                if (toks.length == 0) break
                if (toks[0].type == tokenTypes.TAB) {
                    const tabToken = toks.shift()
                    if (tabToken == undefined) return
                    if (toks.length > 0) {
                        if (toks[0].type == tokenTypes.TAB) {
                            continue
                        } else {
                            toks.unshift(tabToken)
                        }
                    }
                }
                break
            }

            if (toks.length > 0) {
                if (toks[0].type == tokenTypes.LABEL) {
                    if (toks[0].literal == null) return
                    this.labels.set(toks[0].literal, ln)
                }
            }
        })
    }

    public Interpret() {
        //console.log(this.lines)
        while (this.registers[32] < this.lines.length) {
            if (this.registers[32] == 0 && this.enforceGlobalUsingDirective) {
                const l = this.lines[this.registers[32]][0].type == tokenTypes.TAB ? this.lines[this.registers[32]].slice(1) : this.lines[this.registers[32]]
                if (l[0].type != tokenTypes.DIRECTIVE && l[0].type != "global") {
                    throw new AsmError("MissingGlobalDirectiveError", l[0].ln, l[0].col, `expected '.global [label name]' at the top of the file, but found '${l[0].type.toLowerCase()}' instead`)
                }
                this.processDirective(l)
                this.registers[32]++
            } else {
                const l = this.lines[this.registers[32]][0].type == tokenTypes.TAB ? this.lines[this.registers[32]].slice(1) : this.lines[this.registers[32]]
                const first = l[0]

                //console.log(this.registers[32], l)

                switch (first.type) {
                    case tokenTypes.NOP:
                        this.registers[32]++
                        break
                    case tokenTypes.LABEL:
                        this.registers[32]++
                        while (this.registers[32] < this.lines.length) {
                            if (this.lines[this.registers[32]][0].type != tokenTypes.TAB) break
                            this.registers[32]++
                        }
                        break
                    // case tokenTypes.TAB:
                    //     throw new SyntaxError(first.ln, first.col, `random tabs are not allowed`)
                    case tokenTypes.INSTRUCTION:
                        this.processInstruction(l)
                        this.registers[32]++
                        break
                    case tokenTypes.DIRECTIVE:
                        this.processDirective(l)
                        this.registers[32]++
                        break
                    default:
                        throw new UnexpectedTokenError(first.ln, first.col, `unexpected token '${first.type}'`)
                }

                //console.log('\n')

                //console.log(l)

                switch (this.memoryPrintMode) {
                    case 1:
                        console.log(`\nregisters: ${this.registers}\n`)//\nmemory: ${this.memory}\n`)
                        break
                    case 2:
                        console.log(`\nmemory: ${this.memory}\n`)
                        break
                    case 3:
                        console.log(`\nregisters: ${this.registers}\nmemory: ${this.memory}\n`)
                        break
                    default:
                        break
                }
            }
        }

    }

    private verifyTokenTypePattern(toks: Token[], typePattern: any[] | any[][]) {
        for (let t = 0; t < typePattern.length; t++) {
            const patternLiteral = typeof typePattern[t] == 'string' ? typePattern[t].toString().toLowerCase() : typePattern[t].slice(0, typePattern[t].length - 1).toString() + ', or ' + typePattern[t][typePattern[t].length - 1]

            if (toks[t] == undefined) {
                throw new SyntaxError(toks[t].ln, toks[t].col, `expected '${patternLiteral}', but found nothing instead`)
            }

            if (typeof typePattern[t] == 'string') {
                if (toks[t].type != typePattern[t]) {
                    throw new SyntaxError(toks[t].ln, toks[t].col, `expected '${patternLiteral}', but found '${toks[t].type.toLowerCase()}' instead`)
                }
            } else {
                if (!typePattern[t].includes(toks[t].type)) {
                    throw new SyntaxError(toks[t].ln, toks[t].col, `expected '${patternLiteral}', but found '${toks[t].type.toLowerCase()}' instead`)
                }
            }
        }
    }

    private processInstruction(args: Token[]) {
        const instruct = args[0]
        switch (instruct.literal) {
            case 'add':
                this.verifyTokenTypePattern(args, nonimmediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) +
                    this.getReg(args[5].literal, instruct.ln, args[5].col),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'sub':
                this.verifyTokenTypePattern(args, nonimmediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) -
                    this.getReg(args[5].literal, instruct.ln, args[5].col),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'and':
                this.verifyTokenTypePattern(args, nonimmediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) &
                    this.getReg(args[5].literal, instruct.ln, args[5].col),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'or':
                this.verifyTokenTypePattern(args, nonimmediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) |
                    this.getReg(args[5].literal, instruct.ln, args[5].col),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'xor':
                this.verifyTokenTypePattern(args, nonimmediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) ^
                    this.getReg(args[5].literal, instruct.ln, args[5].col),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'sll':
                this.verifyTokenTypePattern(args, nonimmediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) <<
                    this.getReg(args[5].literal, instruct.ln, args[5].col),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'srl':
                this.verifyTokenTypePattern(args, nonimmediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) >>
                    this.getReg(args[5].literal, instruct.ln, args[5].col),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'slt':
                this.verifyTokenTypePattern(args, nonimmediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) <
                    this.getReg(args[5].literal, instruct.ln, args[5].col) ? 1 : 0,
                    args[1].ln,
                    args[1].col
                )
                break

            // immediates
            case 'addi':
                this.verifyTokenTypePattern(args, immediateOperationBase)
                this.setReg(args[1].literal,
                    this.getReg(args[3].literal, instruct.ln, args[3].col) +
                    Number(args[5].literal),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'andi':
                this.verifyTokenTypePattern(args, immediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) &
                    Number(args[5].literal),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'ori':
                this.verifyTokenTypePattern(args, immediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) |
                    Number(args[5].literal),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'xori':
                this.verifyTokenTypePattern(args, immediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) ^
                    Number(args[5].literal),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'slli':
                this.verifyTokenTypePattern(args, immediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) <<
                    Number(args[5].literal),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'srli':
                this.verifyTokenTypePattern(args, immediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) >>
                    Number(args[5].literal),
                    args[1].ln,
                    args[1].col
                )
                break
            case 'slti':
                this.verifyTokenTypePattern(args, immediateOperationBase)
                this.setReg(args[1].literal, this.getReg(args[3].literal, instruct.ln, args[3].col) <
                    Number(args[5].literal) ? 1 : 0,
                    args[1].ln,
                    args[1].col
                )
                break

            // branches
            case 'beq':
                this.verifyTokenTypePattern(args, branchOperationBase)
                if (this.getReg(args[1].literal, instruct.ln, args[1].col) == this.getReg(args[3].literal, instruct.ln, args[3].col)) {
                    if (args[5].type == tokenTypes.IMMEDIATE) {
                        this.registers[32] += Math.floor(Number(args[5].literal) / 4)
                    } else {
                        this.jumpToLabel(!args[5].literal ? "" : args[5].literal, args[5].ln, args[5].col)
                    }
                }
                break
            case 'bne':
                this.verifyTokenTypePattern(args, branchOperationBase)
                if (this.getReg(args[1].literal, instruct.ln, args[1].col) != this.getReg(args[3].literal, instruct.ln, args[3].col)) {
                    if (args[5].type == tokenTypes.IMMEDIATE) {
                        this.registers[32] += Math.floor(Number(args[5].literal) / 4)
                    } else {
                        this.jumpToLabel(!args[5].literal ? "" : args[5].literal, args[5].ln, args[5].col)
                    }
                }
                break
            case 'blt':
                this.verifyTokenTypePattern(args, branchOperationBase)
                if (this.getReg(args[1].literal, instruct.ln, args[1].col) < this.getReg(args[3].literal, instruct.ln, args[3].col)) {
                    if (args[5].type == tokenTypes.IMMEDIATE) {
                        this.registers[32] += Math.floor(Number(args[5].literal) / 4)
                    } else {
                        this.jumpToLabel(!args[5].literal ? "" : args[5].literal, args[5].ln, args[5].col)
                    }
                }
                break
            default:
                throw new AsmError("UnknownInstructionError", instruct.ln, instruct.col, `unknown instruction '${instruct.literal}'`)
        }
    }

    private setReg(reg: number | string | null, value: number, ln: number, col: number) {
        reg = Number(reg)
        if (reg == 0) {
            throw new InvalidRegisterCallError(ln, col, `register 0 is an unchangable constant`)
        } else if (reg > this.registers.length - 1 || reg < 0) {
            throw new InvalidRegisterCallError(ln, col, `register ${reg} is outside of register bounds`)
        }
        this.registers[reg] = value
    }

    private getReg(reg: number | string | null, ln: number, col: number): number {
        reg = Number(reg)
        if (reg > this.registers.length - 1 || reg < 0) {
            throw new InvalidRegisterCallError(ln, col, `register ${reg} is outside of register bounds`)
        }
        return this.registers[reg]
    }


    private processDirective(args: Token[]) {
        const directive = args[0]
        switch (directive.literal) {
            case 'global':
                if (directive.ln != 1) {
                    throw new AsmError("InvalidDirectiveError", directive.ln, directive.col, `directive '${directive.literal}' can only be used at the top of the file`)
                }
                this.verifyTokenTypePattern(args, [tokenTypes.DIRECTIVE, tokenTypes.IDENT])
                this.jumpToLabel(args[1].literal == null ? "" : args[1].literal, args[1].ln, args[1].col)
                break
            default:
                throw new AsmError("UnknownDirectiveError", directive.ln, directive.col, `unknown directive '${directive.literal}'`)
        }
    }

    private jumpToLabel(labelname: string, ln: number, col: number) {
        if (this.labels.get(labelname) == undefined) {
            throw new UnknownLabelError(ln, col, labelname)
        }

        const labelpos = this.labels.get(labelname)

        this.registers[32] = labelpos == undefined ? 0 : labelpos // needed or it yells at me
    }
}