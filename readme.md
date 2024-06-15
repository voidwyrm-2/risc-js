# RISC-JS
RISC-JS is a RISC-V interpreter written in TypeScript<br>
This is a successor to all the ones I've made before because this one is written well and I actually kinda know how Assembly works

This isn't a very good Assembly interpreter(I, in fact, do not know how to write Assembly other than a simple "hello world")

## Instructions currently implemented
Inst | Name | Summary
--- | --- | ---
add | ADD | `rd = rs1 + rs2`
sub | SUB | `rd = rs1 - rs2`
and | AND | `rd = rs1 & rs2`
or | OR | `rd = rs1 \| rs2`
xor | XOR | `rd = rs1 ^ rs2`
sll | Shift Left Logical | `rd = rs1 << rs2`
srl | Shift Right Logical | `rd = rs1 >> rs2`
slt | Set Less Than | `rd = (rs1 < rs2)?1:0`
addi | ADD Immediate | `rd = rs1 + imm`
andi | AND Immediate | `rd = rs1 & imm`
ori | OR Immediate | `rd = rs1 \| imm`
xori | XOR Immediate | `rd = rs1 ^ imm`
slli | Shift Left Logical Imm | `rd = rs1 << imm`
srli | Shift Right Logical Imm | `rd = rs1 >> imm`
slti | Set Less Than Imm | `rd = (rs1 < imm)?1:0`
beq | Branch == | `if (rs1 == rs2) PC += imm or label`
bne | Branch != | `if (rs1 != rs2) PC += imm or label`
blt | Branch < | `if (rs1 < rs2) PC += imm or label`
bqe | Branch >= | `if (rs1 >= rs2) PC += imm or label`


## Registers
There are 33 registers including pc(x0-x31 + pc)
* 6 special purpose
* 7 temporary (tO-t6)
* 12 saved (s0-s11)
* 8 argument (a0-a7)

Register Name | Register ID
---- | ----
zero register | x0/zero
return address | x1/ra
stack pointer | x2/sp
global pointer | x3/gp
thread pointer | x4/tp
|
tempory register | x5/t0
tempory register  | x6/t1
tempory register  | x7/t2
9tempory register  | x8/t3
tempory register  | x9/t4
tempory register  | x10/t5
tempory register  | x11/t6
|
saved register/frame pointer | x12/s0/fp
saved register | x13/s1
saved register | x14/s2
saved register | x15/s3
saved register | x16/s4
saved register | x17/s5
saved register | x18/s6
saved register | x19/s7
saved register | x20/s8
saved register | x21/s9
saved register | x22/s10
saved register | x23/s11
|
function argument/return value | x24/a0
function argument/return value | x25/a1
function argument | x26/a2
function argument | x27/a3
function argument | x28/a4
function argument | x29/a5
function argument | x30/a6
function argument | x31/a7
|
program counter | x32/pc


## License
[MIT](./LICENSE)