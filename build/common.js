"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchOperationBase = exports.immediateOperationBase = exports.nonimmediateOperationBase = exports.UnknownLabelError = exports.UnexpectedTokenError = exports.InvalidRegisterCallError = exports.SyntaxError = exports.AsmError = exports.digits = exports.valid_ident_chars = exports.instructions = exports.tokenTypes = exports.startsWithAny = exports.Token = void 0;
class Token {
    type;
    literal;
    ln;
    col;
    constructor(type, ln, col, literal = null) {
        this.type = type;
        this.literal = literal;
        this.ln = ln;
        this.col = col;
    }
    Copy() {
        return new Token(this.type, this.ln, this.col, this.literal);
    }
}
exports.Token = Token;
function startsWithAny(str, chars) {
    for (let i = 0; i < chars.length; i++) {
        if (str[0] == chars[i])
            return true;
    }
    return false;
}
exports.startsWithAny = startsWithAny;
exports.tokenTypes = {
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
};
exports.instructions = [
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
];
const alphabet_low = "abcdefghijklmnopqrstuvwxyz";
exports.valid_ident_chars = alphabet_low + alphabet_low.toUpperCase() + "_";
exports.digits = "0123456789";
class AsmError {
    name;
    ln;
    col;
    msg;
    constructor(name, ln, col, msg = null) {
        this.name = name;
        this.ln = ln;
        this.col = col;
        this.msg = msg;
    }
    Error() {
        let err = `${this.name} from line ${this.ln}`;
        if (this.col != null)
            err += `, col ${this.col}`;
        if (this.msg != null)
            err += `: ${this.msg}`;
        return err;
    }
}
exports.AsmError = AsmError;
class SyntaxError extends AsmError {
    constructor(ln, col, msg = null) {
        super("SyntaxError", ln, col, msg);
    }
}
exports.SyntaxError = SyntaxError;
class InvalidRegisterCallError extends AsmError {
    constructor(ln, col, msg = null) {
        super("InvalidRegisterCallError", ln, col, msg);
    }
}
exports.InvalidRegisterCallError = InvalidRegisterCallError;
class UnexpectedTokenError extends AsmError {
    constructor(ln, col, msg = null) {
        super("UnexpectedTokenError", ln, col, msg);
    }
}
exports.UnexpectedTokenError = UnexpectedTokenError;
class UnknownLabelError extends AsmError {
    constructor(ln, col, labelname) {
        super("UnknownLabelError", ln, col, `unknown label '${labelname}'`);
    }
}
exports.UnknownLabelError = UnknownLabelError;
exports.nonimmediateOperationBase = [
    exports.tokenTypes.INSTRUCTION,
    exports.tokenTypes.REGCALL,
    exports.tokenTypes.COMMA,
    exports.tokenTypes.REGCALL,
    exports.tokenTypes.COMMA,
    exports.tokenTypes.REGCALL
];
exports.immediateOperationBase = [
    exports.tokenTypes.INSTRUCTION,
    exports.tokenTypes.REGCALL,
    exports.tokenTypes.COMMA,
    exports.tokenTypes.REGCALL,
    exports.tokenTypes.COMMA,
    exports.tokenTypes.IMMEDIATE
];
exports.branchOperationBase = [
    exports.tokenTypes.INSTRUCTION,
    exports.tokenTypes.REGCALL,
    exports.tokenTypes.COMMA,
    exports.tokenTypes.REGCALL,
    exports.tokenTypes.COMMA,
    [exports.tokenTypes.IDENT, exports.tokenTypes.IMMEDIATE]
];
