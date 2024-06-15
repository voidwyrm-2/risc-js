import {
    Token,
    tokenTypes,
    AsmError,
    InvalidRegisterCallError,
    valid_ident_chars,
    instructions,
    digits,
    startsWithAny
} from "./common"



export class Lexer {
    private text: string
    private idx: number
    private readonly ln: number
    //private decln: boolean
    private cchar: string | null

    constructor(text: string, ln: number = 1) {
        this.text = text.replace("    ", '\t')
        this.idx = -1
        this.ln = ln
        //this.decln = false
        this.cchar = null
        this.advance()
    }

    private advance() {
        this.idx++
        this.cchar = this.text[this.idx] == undefined ? null : this.text[this.idx]
        //if (this.cchar == '\n') this.ln++
    }

    private withdraw() {
        this.idx--
        this.cchar = this.text[this.idx] == undefined ? null : this.text[this.idx]
        /*
        if (this.decln) {
            this.ln--
            this.decln = false
        }
        if (this.cchar == '\n') this.decln = true
        */
    }

    private getRegister(register: string): number {
        const convertToNumber = (n: string) => {
            const num = Number(n)
            if (num == undefined) {
                throw new InvalidRegisterCallError(this.ln, this.idx + 1, `invalid register call '${register}'`)
            }
            return num
        }
        if (register[0] == 'x') {
            return convertToNumber(register.slice(1))
        } else if (register[0] == 't') {
            return convertToNumber(register.slice(1)) + 6
        } else if (register[0] == 's') {
            return convertToNumber(register.slice(1)) + 13
        } else if (register[0] == 'a') {
            return convertToNumber(register.slice(1)) + 25
        } else {
            throw new InvalidRegisterCallError(this.ln, this.idx + 1, `invalid register call '${register}'`)
        }
    }

    public Lex(): Token[] {
        let tokens: Token[] = []
        while (this.cchar != null) {
            if (String(" \n").indexOf(this.cchar) != -1) {
                this.advance()
            } else if (this.cchar == '\t') {
                tokens.push(new Token(tokenTypes.TAB, this.ln, this.idx + 1))
                this.advance()
            } else if (this.cchar == ',') {
                tokens.push(new Token(tokenTypes.COMMA, this.ln, this.idx + 1))
                this.advance()
            } else if (this.cchar == '(') {
                tokens.push(new Token(tokenTypes.OPENING_PAREN, this.ln, this.idx + 1))
                this.advance()
            } else if (this.cchar == ')') {
                tokens.push(new Token(tokenTypes.CLOSING_PAREN, this.ln, this.idx + 1))
                this.advance()
            } else if (valid_ident_chars.indexOf(this.cchar) != -1) {
                if (startsWithAny(this.cchar, "xtsa")) {
                    const regChar = this.cchar
                    const orig_idx = this.idx + 1
                    this.advance()
                    if (digits.indexOf(this.cchar) != -1) {
                        const regNum = this.collectImmediate().literal
                        if (regNum == null) return []
                        tokens.push(new Token(tokenTypes.REGCALL, this.ln, orig_idx, String(this.getRegister(regChar + regNum))))
                    } else {
                        this.withdraw()
                        tokens.push(this.collectIdent())
                    }
                } else {
                    tokens.push(this.collectIdent())
                }
            } else if (digits.indexOf(this.cchar) != -1) {
                tokens.push(this.collectImmediate())
            } else if (this.cchar == '.') {
                this.advance()
                tokens.push(this.collectIdent(true))
            } else if (this.cchar == '"') {
                tokens.push(this.collectString())
            } else if (this.cchar == '#') {
                this.advance()
                tokens.push(this.collectComment())
            } else {
                throw new AsmError("IllegalCharacterError", this.ln, this.idx, `illegal character '${this.cchar}'`)
            }
        }

        let out_tokens: Token[] = []

        tokens.forEach(tok => {
            if (tok.type != tokenTypes.COMMENT) out_tokens.push(tok)
        })

        return out_tokens
    }

    private collectComment(): Token {
        const start = this.idx

        while (this.cchar == ' ') this.advance()

        let comment_str = ""
        while (this.cchar != null && this.cchar != '\n') {
            comment_str += this.cchar
            this.advance()
        }

        return new Token(tokenTypes.COMMENT, this.ln - 1, start, comment_str)
    }

    private collectIdent(return_as_directive: boolean = false): Token {
        const start = this.idx + 1

        let ident_str = ""
        while (this.cchar != null && valid_ident_chars.indexOf(this.cchar) != -1) {
            ident_str += this.cchar
            this.advance()
        }

        if (return_as_directive) return new Token(tokenTypes.DIRECTIVE, this.ln, start, ident_str)

        if (this.cchar == ':') {
            this.advance()
            return new Token(tokenTypes.LABEL, this.ln, start, ident_str)
        } else if (instructions.indexOf(ident_str.toLowerCase()) != -1) {
            return new Token(tokenTypes.INSTRUCTION, this.ln, start, ident_str.toLowerCase())
        } else if (ident_str == "zero") {
            return new Token(tokenTypes.REGCALL, this.ln, start, "0")
        } else if (ident_str == "pc") {
            return new Token(tokenTypes.REGCALL, this.ln, start, "32")
        } else if (ident_str == "ret") {
            return new Token(tokenTypes.RETURN, this.ln, start)
        } else if (ident_str == "ecall") {
            return new Token(tokenTypes.ECALL, this.ln, start)
        } else if (ident_str == "NOP") {
            return new Token(tokenTypes.NOP, this.ln, start)
        }

        return new Token(tokenTypes.IDENT, this.ln, start, ident_str)
    }

    private collectString(): Token {
        const start = this.idx

        let string_str = ""
        while (this.cchar != null && this.cchar != '"') {
            string_str += this.cchar
            this.advance()
        }

        return new Token(tokenTypes.IDENT, this.ln, start, string_str)
    }

    private collectImmediate(): Token {
        const start = this.idx

        let immediate_str = ""
        while (this.cchar != null && digits.indexOf(this.cchar) != -1) {
            immediate_str += this.cchar
            this.advance()
        }

        return new Token(tokenTypes.IMMEDIATE, this.ln, start, immediate_str)
    }
}

// const lexer = new Lexer("addi s0, zero, 10")

// console.log(lexer.Lex())