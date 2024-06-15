# RISC-JS
RISC-JS is a RISC-V interpreter written in TypeScript<br>
This is a successor to all of my other ones because this one is written well and I actually know how Assembly works

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
Zero | zero/x0
