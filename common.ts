export class Token {
    public readonly type: string
    public readonly literal: string | null
    public readonly ln: number
    public readonly col: number

    constructor(type: string, ln: number, col: number, literal: string | null = null) {
        this.type = type
        this.literal = literal
        this.ln = ln
        this.col = col
    }

    public Copy(): Token {
        return new Token(this.type, this.ln, this.col, this.literal)
    }
}

export function startsWithAny(str: string, chars: string): boolean {
    for (let i = 0; i < chars.length; i++) {
        if (str[0] == chars[i]) return true
    }
    return false
}

export const tokenTypes = {
    INSTRUCTION: "INSTRUCTION",
    IDENT: "IDENT",
    REGCALL: "REGCALL",
    IMMEDIATE: "IMMEDIATE",
    LABEL: "LABEL",
    COMMA: "COMMA",
    NEWLINE: "NEWLINE",
    COMMENT: "COMMENT",
    DIRECTIVE: "DIRECTIVE",
    STRING: "STRING",
    RETURN: "RETURN",
    TAB: "TAB",
    OPENING_PAREN: "OPENING_PAREN",
    CLOSING_PAREN: "CLOSING_PAREN",
    ECALL: "ECALL",
    NOP: "NOP"
} as const

export const instructions = [
    "add",
    "sub",
    "and",
    "or",
    "xor",
    "sll",
    "srl",
    "slt",
    "addi",
    "andi",
    "ori",
    "xori",
    "slli",
    "srli",
    "slti",
    "beq",
    "bne",
    "blt",
    "bqe"
]


const alphabet_low = "abcdefghijklmnopqrstuvwxyz"

export const valid_ident_chars = alphabet_low + alphabet_low.toUpperCase() + "_"

export const digits = "0123456789"


export interface AssemblyError {
    readonly name: string
    readonly ln: number
    readonly col: number | null
    readonly msg: string | null

    Error(): string
}


export class AsmError {
    private readonly name: string
    private readonly ln: number
    private readonly col: number | null
    private readonly msg: string | null

    constructor(name: string, ln: number, col: number, msg: string | null = null) {
        this.name = name
        this.ln = ln
        this.col = col
        this.msg = msg
    }

    public Error(): string {
        let err = `${this.name} from line ${this.ln}`
        if (this.col != null) err += `, col ${this.col}`
        if (this.msg != null) err += `: ${this.msg}`
        return err
    }
}


export class SyntaxError extends AsmError {
    constructor(ln: number, col: number, msg: string | null = null) {
        super("SyntaxError", ln, col, msg)
    }
}


export class InvalidRegisterCallError extends AsmError {
    constructor(ln: number, col: number, msg: string | null = null) {
        super("InvalidRegisterCallError", ln, col, msg)
    }
}


export class UnexpectedTokenError extends AsmError {
    constructor(ln: number, col: number, msg: string | null = null) {
        super("UnexpectedTokenError", ln, col, msg)
    }
}


export class UnknownLabelError extends AsmError {
    constructor(ln: number, col: number, labelname: string) {
        super("UnknownLabelError", ln, col, `unknown label '${labelname}'`)
    }
}



export const nonimmediateOperationBase = [
    tokenTypes.INSTRUCTION,
    tokenTypes.REGCALL,
    tokenTypes.COMMA,
    tokenTypes.REGCALL,
    tokenTypes.COMMA,
    tokenTypes.REGCALL
]

export const immediateOperationBase = [
    tokenTypes.INSTRUCTION,
    tokenTypes.REGCALL,
    tokenTypes.COMMA,
    tokenTypes.REGCALL,
    tokenTypes.COMMA,
    tokenTypes.IMMEDIATE
]

export const branchOperationBase = [
    tokenTypes.INSTRUCTION,
    tokenTypes.REGCALL,
    tokenTypes.COMMA,
    tokenTypes.REGCALL,
    tokenTypes.COMMA,
    [tokenTypes.IDENT, tokenTypes.IMMEDIATE]
]