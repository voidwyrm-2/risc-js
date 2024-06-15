import { Interpreter } from "./interpreter"
import { Lexer } from "./lexer"
import { Token, AssemblyError, tokenTypes } from "./common"



const scripts: Map<string, string> = new Map()

scripts.set("test", `
# set s0 to 10
addi s0, zero, 10

# set s1 to 21
addi s1, zero, 21

# add s0 + s1 together and put the result in s2
add s2, s0, s1
`)

scripts.set("test_withglobal", `.global _start
# first we use the '.global' directive to jump to '_start'

_start:
    # set s0 to 10
    addi s0, zero, 10

    # set s1 to 21
    addi s1, zero, 21

    # add s0 + s1 together and put the result in s2
    add s2, s0, s1
`)

scripts.set("branching", `
beq x18, x19, loop

# to prove we branched to 'loop'
addi x22, zero, 420

loop:
    addi x21, zero, 66
`)

scripts.set("branchtest", `
# from https://github.com/hackclub/some-assembly-required/blob/main/code/riscv/riscv.s
# (hackclub does really cool stuff, btw)

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
NOP # empty lines are ignored by the lexer, so this gives us enough lines to jump back

# set s0 to 1 so we can subtract 1 from the program counter
addi s0, zero, 1

# subtract 1 from the program counter, making us sit on this line forever
# (because I increment the program counter after each line so the subtraction cancels out)
sub pc, pc, s0
`)

scripts.set("memtest", `
# set s0 to 20
addi s0, zero, 20

# store s0 into memory address 0
sb s0, 0(zero)

# load memory address 0 into s2
lb s2, 0(zero)
`)

/*
scripts.set("comment_define_test", `
# define 'TESTVAR' as 21
#$TESTVAR = 21

# use TESTVAR for stuff
addi s0, zero, TESTVAR
`)
*/



function main() {
    const scriptName = "memtest"

    const script = scripts.get(scriptName)
    const scriptLines: string[] = script == undefined ? [] : script.split('\n') // needed or typescript yells at me

    let tokenLines: Token[][] = []

    scriptLines.forEach((l, ln) => {
        if (l.trim() != '') {
            const lexer = new Lexer(l, ln + 1)
            const lexed = lexer.Lex()

            if (lexed.length > 1) {
                tokenLines.push(lexed)
            } else if (lexed.length > 0) {
                if (lexed[0].type != tokenTypes.TAB) {
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