import { FileIO } from '../IO/FileIO';
import { IntegerConstant } from '../LexicalAnalyzer/Symbols/IntegerConstant';
import { Identifier } from '../LexicalAnalyzer/Symbols/Identifier';
import { Symbol } from '../LexicalAnalyzer/Symbols/Symbol';
import { SymbolsCodes } from './SymbolsCodes';


export class LexicalAnalyzer
{
    constructor(fileIO)
    {
        this.fileIO = fileIO;
        this.char = ' ';
        this.currentWord = '';
        this.pos = -1;
        this.strNum = 1;
    }

    nextSym()
    {
        if (this.char === null) {
            return null;
        }

        this.skipWhiteSpaces();

        return this.scanSymbol();
    }

    skipWhiteSpaces()
    {
        let ws = /[ \t]/;

        while (ws.exec(this.char) !== null) {
            this.char = this.fileIO.nextCh();
            this.pos++;
        }
    }

    scanSymbol()
    {
        if (this.char === null) {
            return null;
        }

        this.currentWord = '';

        if (/\d/.exec(this.char) !== null) {

            while (/[\d.]/.exec(this.char) !== null) {
                this.currentWord += this.char;
                this.char = this.fileIO.nextCh();
                this.pos++;
            }

            return new IntegerConstant(SymbolsCodes.integerConst, this.currentWord);

        } else if (/\w/i.exec(this.char) !== null) {

            while (/\w/i.exec(this.char) !== null && this.char !== null) {
                this.currentWord += this.char;                
                this.char = this.fileIO.nextCh();
                this.pos++;                
            }
            return new Identifier(SymbolsCodes.identifier, this.currentWord, 
                this.strNum, this.pos);

        } else if (/\n/.exec(this.char) !== null) {
            this.char = this.fileIO.nextCh();
            this.pos = 0;
            this.strNum++;
            return this.getSymbol(SymbolsCodes.endOfLine, this.currentWord);
        } else {
            this.pos++;
            switch (this.char) {
                case '-':
                    this.char = this.fileIO.nextCh();
                    return this.getSymbol(SymbolsCodes.minus);

                case '+':
                    this.char = this.fileIO.nextCh();
                    return this.getSymbol(SymbolsCodes.plus);

                case '*':
                    this.char = this.fileIO.nextCh();
                    return this.getSymbol(SymbolsCodes.star);

                case '/':
                    this.char = this.fileIO.nextCh();
                    return this.getSymbol(SymbolsCodes.slash);

                case '=':
                    this.char = this.fileIO.nextCh();
                    return this.getSymbol(SymbolsCodes.equal);

                case '(':
                    this.char = this.fileIO.nextCh();
                    return this.getSymbol(SymbolsCodes.openParenthesis);

                case ')':
                    this.char = this.fileIO.nextCh();
                    return this.getSymbol(SymbolsCodes.closedParenthesis);
            }
        }
        throw `Inadmissible symbol:${this.char}.`;
    }

    getSymbol(symbolCode)
    {
        return new Symbol(symbolCode, this.currentWord);
    }
}