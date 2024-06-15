"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const common_1 = require("./common");
class Lexer {
    text;
    idx;
    ln;
    cchar;
    constructor(text, ln = 1) {
        this.text = text.replace("    ", '\t');
        this.idx = -1;
        this.ln = ln;
        this.cchar = null;
        this.advance();
    }
    advance() {
        this.idx++;
        this.cchar = this.text[this.idx] == undefined ? null : this.text[this.idx];
    }
    withdraw() {
        this.idx--;
        this.cchar = this.text[this.idx] == undefined ? null : this.text[this.idx];
    }
    getRegister(register) {
        const convertToNumber = (n) => {
            const num = Number(n);
            if (num == undefined) {
                throw new common_1.InvalidRegisterCallError(this.ln, this.idx + 1, `invalid register call '${register}'`);
            }
            return num;
        };
        if (register[0] == 'x') {
            return convertToNumber(register.slice(1));
        }
        else if (register[0] == 't') {
            return convertToNumber(register.slice(1)) + 6;
        }
        else if (register[0] == 's') {
            return convertToNumber(register.slice(1)) + 13;
        }
        else if (register[0] == 'a') {
            return convertToNumber(register.slice(1)) + 25;
        }
        else {
            throw new common_1.InvalidRegisterCallError(this.ln, this.idx + 1, `invalid register call '${register}'`);
        }
    }
    Lex() {
        let tokens = [];
        while (this.cchar != null) {
            if (String(" \n").indexOf(this.cchar) != -1) {
                this.advance();
            }
            else if (this.cchar == '\t') {
                tokens.push(new common_1.Token(common_1.tokenTypes.TAB, this.ln, this.idx + 1));
                this.advance();
            }
            else if (this.cchar == ',') {
                tokens.push(new common_1.Token(common_1.tokenTypes.COMMA, this.ln, this.idx + 1));
                this.advance();
            }
            else if (this.cchar == '(') {
                tokens.push(new common_1.Token(common_1.tokenTypes.OPENING_PAREN, this.ln, this.idx + 1));
                this.advance();
            }
            else if (this.cchar == ')') {
                tokens.push(new common_1.Token(common_1.tokenTypes.CLOSING_PAREN, this.ln, this.idx + 1));
                this.advance();
            }
            else if (common_1.valid_ident_chars.indexOf(this.cchar) != -1) {
                if ((0, common_1.startsWithAny)(this.cchar, "xtsa")) {
                    const regChar = this.cchar;
                    const orig_idx = this.idx + 1;
                    this.advance();
                    if (common_1.digits.indexOf(this.cchar) != -1) {
                        const regNum = this.collectImmediate().literal;
                        if (regNum == null)
                            return [];
                        tokens.push(new common_1.Token(common_1.tokenTypes.REGCALL, this.ln, orig_idx, String(this.getRegister(regChar + regNum))));
                    }
                    else {
                        this.withdraw();
                        tokens.push(this.collectIdent());
                    }
                }
                else {
                    tokens.push(this.collectIdent());
                }
            }
            else if (common_1.digits.indexOf(this.cchar) != -1) {
                tokens.push(this.collectImmediate());
            }
            else if (this.cchar == '.') {
                this.advance();
                tokens.push(this.collectIdent(true));
            }
            else if (this.cchar == '"') {
                tokens.push(this.collectString());
            }
            else if (this.cchar == '#') {
                this.advance();
                tokens.push(this.collectComment());
            }
            else {
                throw new common_1.AsmError("IllegalCharacterError", this.ln, this.idx, `illegal character '${this.cchar}'`);
            }
        }
        let out_tokens = [];
        tokens.forEach(tok => {
            if (tok.type != common_1.tokenTypes.COMMENT)
                out_tokens.push(tok);
        });
        return out_tokens;
    }
    collectComment() {
        const start = this.idx;
        while (this.cchar == ' ')
            this.advance();
        let comment_str = "";
        while (this.cchar != null && this.cchar != '\n') {
            comment_str += this.cchar;
            this.advance();
        }
        return new common_1.Token(common_1.tokenTypes.COMMENT, this.ln - 1, start, comment_str);
    }
    collectIdent(return_as_directive = false) {
        const start = this.idx + 1;
        let ident_str = "";
        while (this.cchar != null && common_1.valid_ident_chars.indexOf(this.cchar) != -1) {
            ident_str += this.cchar;
            this.advance();
        }
        if (return_as_directive)
            return new common_1.Token(common_1.tokenTypes.DIRECTIVE, this.ln, start, ident_str);
        if (this.cchar == ':') {
            this.advance();
            return new common_1.Token(common_1.tokenTypes.LABEL, this.ln, start, ident_str);
        }
        else if (common_1.instructions.indexOf(ident_str.toLowerCase()) != -1) {
            return new common_1.Token(common_1.tokenTypes.INSTRUCTION, this.ln, start, ident_str.toLowerCase());
        }
        else if (ident_str == "zero") {
            return new common_1.Token(common_1.tokenTypes.REGCALL, this.ln, start, "0");
        }
        else if (ident_str == "pc") {
            return new common_1.Token(common_1.tokenTypes.REGCALL, this.ln, start, "32");
        }
        else if (ident_str == "ret") {
            return new common_1.Token(common_1.tokenTypes.RETURN, this.ln, start);
        }
        else if (ident_str == "ecall") {
            return new common_1.Token(common_1.tokenTypes.ECALL, this.ln, start);
        }
        else if (ident_str == "NOP") {
            return new common_1.Token(common_1.tokenTypes.NOP, this.ln, start);
        }
        return new common_1.Token(common_1.tokenTypes.IDENT, this.ln, start, ident_str);
    }
    collectString() {
        const start = this.idx;
        let string_str = "";
        while (this.cchar != null && this.cchar != '"') {
            string_str += this.cchar;
            this.advance();
        }
        return new common_1.Token(common_1.tokenTypes.IDENT, this.ln, start, string_str);
    }
    collectImmediate() {
        const start = this.idx;
        let immediate_str = "";
        while (this.cchar != null && common_1.digits.indexOf(this.cchar) != -1) {
            immediate_str += this.cchar;
            this.advance();
        }
        return new common_1.Token(common_1.tokenTypes.IMMEDIATE, this.ln, start, immediate_str);
    }
}
exports.Lexer = Lexer;
