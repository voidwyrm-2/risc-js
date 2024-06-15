import { Interpreter } from "./interpreter"
import { Lexer } from "./lexer"
import { Token, AssemblyError, tokenTypes } from "./common"



const scripts: Map<string, string> = new Map()
scripts.set("test", `
addi s0, zero, 10
addi s1, zero, 21
add s2, s0, s1
`)
scripts.set("test_withglobal", `.global _start

_start:
    addi s0, zero, 10
    addi s1, zero, 21
    add s2, s0, s1
`)
scripts.set("branching", `
beq x18, x19, loop

loop:
    addi x21, zero, 66
`)
scripts.set("branchtest", `
# from https://github.com/hackclub/some-assembly-required/blob/main/code/riscv/riscv.s

# Setting up for a loop below
addi x18, zero, 0
addi x19, zero, 10
addi x20, zero, 0

# We can also branch to a label
## Branch not equal
bne x18, x19, loop

# Prove we branch to loop instead of ever hitting this instruction
addi x18, zero, 333

## Label
# by the end of the loop:
# x18 = 10
# x19 = 10
# x20 = 20
loop:
	# increment our counter
	addi x18, x18, 1
	# increment another value for fun
	addi x20, x20, 2
	# Branch less than
	blt x18, x19, loop

# Prove we've left the loop
# x21 = 66
addi x21, zero, 66
`)
scripts.set("pctest", `
# this will produce an infinite loop
# incredible /s
NOP
addi s0, zero, 1
sub pc, pc, s0
`)


function main() {
    const scriptName = "pctest"

    const script = scripts.get(scriptName)
    if (script == undefined) return
    const scriptLines: string[] = script.split('\n')

    let tokenLines: Token[][] = []

    scriptLines.forEach((l, ln) => {
        if (l.trim() != '') {
            const lexer = new Lexer(l, ln + 1)
            const lexed = lexer.Lex()

            if (lexed.length > 0) {
                if (lexed.length > 1) {
                    tokenLines.push(lexed)
                } else if (lexed[0].type != tokenTypes.TAB) {
                    tokenLines.push(lexed)
                }
            }
        }
    })

    //console.log(tokenLines)

    const interpreter = new Interpreter(tokenLines, false, 256, 1)
    interpreter.Interpret()
}



try {
    main()
} catch (e: AssemblyError | any) {
    try {
        console.error(e.Error())
    } catch {
        console.error(e)
    }
}