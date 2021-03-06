
const ADD = 0b10101000;
const AND = 0b10110011;
// const DIV = 0b10101011;
const LDI = 0b10011001;
const MUL = 0b10101010;
const PRN = 0b01000011;
const HLT = 0b00000001;
const POP = 0b01001100;
const PUSH = 0b01001101;
const CALL = 0b01001000;
const RET = 0b00001001;
const CMP = 0b10100000;
const JMP = 0b01010000;
const JEQ = 0b01010001;
const JNE = 0b01010010;

const IM = 5;
const IS = 6;
const SP = 7;


class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers R0-R7
        
        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg[SP] = 0xf8;

        this.flags = {
            equal: null,
        }
    }
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        this.clock = setInterval(() => {
            this.tick();
        }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz

        // this.timer = setInterval(() => {
        //     this.reg[IS]= 0b00000001;
        // }, 1000);
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
        clearInterval(this.timer);
    }
    alu(op, regA, regB) {
        switch (op) {
            case 'MUL':
            // !!! IMPLEMENT ME
                this.reg[regA] = this.reg[regA] * this.reg[regB];
                break;
            case 'ADD':
                this.reg[regA] = this.reg[regA] + this.reg[regB];
                break;
            case 'CMP':
                //console.log('regA, regB',regA, regB);
                if(this.reg[regA] === this.reg[regB]) {
                    this.flags.equal = true;
                }else if(this.reg[regA] > this.reg[regB]) {
                    this.flags.equal = false;
                } else if(this.reg[regA] < this.reg[regB]) {
                    this.flags.equal = false;
                }
                break;
            case 'AND':
                this.reg[regA] = this.reg[regA] && this.reg[regB];
                break;
            default:
                break;                
        }
    }
    tick() {
        let IR = this.ram.read(this.reg.PC);
        //console.log(IR);
        
        let operandA = this.ram.read(this.reg.PC + 1);
        let operandB = this.ram.read(this.reg.PC + 2);

        //console.log(`${this.reg.PC}: ${IR.toString(2)}`);
        const handle_CMP = (operandA, operandB) => {
            //console.log("CMP operands",operandA,operandB);
           this.alu('CMP', operandA, operandB);
        };
        const handle_LDI = (operandA, operandB) => {
            
            this.reg[operandA] = operandB;
            //console.log("LDI operands",operandA,operandB);
        };
        const handle_JMP = (operandA) => {
            this.reg.PC = this.reg[operandA];
        };
        const handle_JEQ = (operandA) => {
            if(this.flags.equal) {
                handle_JMP(operandA);
            } else {
                this.reg.PC += 2;
            }
        };
        const handle_JNE = (operandA) => {
            if(this.flags.equal === false) {
                handle_JMP(operandA);
            } else {
                this.reg.PC += 2;
            }
        };
        const handle_HLT = () => {
            this.stopClock();
        };

        const handle_PRN = (operandA) => {
            console.log(this.reg[operandA]);
        };

        const handle_MUL = (operandA, operandB) => {
            this.alu('MUL', operandA, operandB);
        };

        const handle_ADD = (operandA, operandB) => {
            this.alu('ADD', operandA, operandB);
        };

        const handle_POP = (operandA) => {
            this.reg[operandA] = this.ram.read(this.reg[SP]);
            this.reg[SP]++;
        };

        const handle_PUSH = (operandA) => {
            this.reg[SP]--;
            this.ram.write(this.reg[SP], this.reg[operandA]);
        };

        const handle_CALL = (operandA) => {
            this.reg[SP]--;
            this.ram.write(this.reg[SP], this.reg.PC + 2);
            this.reg.PC = this.reg[operandA];
        };

        const handle_RET = () => {
            this.reg.PC = this.ram.read(this.reg[SP]);
            this.reg[SP]++;
        };
        

        const branchTable = {
            [LDI]: handle_LDI,
            [HLT]: handle_HLT,
            [PRN]: handle_PRN,
            [MUL]: handle_MUL,
            [ADD]: handle_ADD,
            [POP]: handle_POP,
            [PUSH]: handle_PUSH,
            [CALL]: handle_CALL,
            [RET]: handle_RET,
            [CMP]: handle_CMP,
            [JMP]: handle_JMP,
            [JEQ]: handle_JEQ,
            [JNE]: handle_JNE,
        };
       // console.log("branchTable[IR]",branchTable[IR]);
        branchTable[IR](operandA, operandB);
        // const handler = this.branchTable[IR](operandA, operandB);
        // if (!handler) {
        //   console.error(
        //     `Invalid instruction at address ${this.reg.PC}: ${this.reg.IR.toString(
        //       2
        //     )}`
        //   );
        //   this.stopClock();
        //   return;
        // }
        // handler.call(this);
      
       // if ( IR !== CALL && IR !== RET && IR !== JMP && IR !== JEQ && IR !== JNE) {
        let operandCount = (IR >>>6) & 0b11;
        let totalInstructionLen = operandCount +1;
        this.reg.PC += totalInstructionLen;
        //}

    }
}
module.exports = CPU;