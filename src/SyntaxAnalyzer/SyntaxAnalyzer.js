import { Multiplication } from './Tree/Multiplication';
import { Division } from './Tree/Division';
import { Addition } from './Tree/Addition';
import { Subtraction } from './Tree/Subtraction';
import { NumberConstant } from './Tree/NumberConstant';
import { Variable } from './Tree/Variable';
import { Inversion } from './Tree/Inversion';
import { Assignation } from './Tree/Assignation';
import { SymbolsCodes } from '../LexicalAnalyzer/SymbolsCodes';

/**
 * Синтаксический анализатор - отвечат за построения дерева выполнения
 */
export class SyntaxAnalyzer
{
    constructor(lexicalAnalyzer)
    {
        this.lexicalAnalyzer = lexicalAnalyzer;
        this.symbol = null;
        this.tree = null;
        this.trees = [];
        this.accSym = [];
        this.id = 0;
    }

    nextSym()
    {
        this.symbol = this.id < this.accSym.length ? this.accSym[this.id++] :
            this.lexicalAnalyzer.nextSym();
    }

    accept(expectedSymbolCode)
    {
        if (this.symbol === null) {
            throw `${expectedSymbolCode} expected but eol found!`;
        }
        if (this.symbol.symbolCode === expectedSymbolCode) {
            this.nextSym();
        } else {
            throw `${expectedSymbolCode} expected but ${this.symbol.symbolCode} found!`;
        }
    }

    analyze()
    {
        this.nextSym();

        while (this.symbol !== null) {
            let expression = this.scanResult();
            this.trees.push(expression);
            console.log(expression);
            // Последняя строка может не заканчиваться переносом на следующую строку.
            if (this.symbol !== null) {
                this.accept(SymbolsCodes.endOfLine);
            }
            this.id = 0;
            this.accSym = [];
        }

        return this.tree;
    }
    // Разбор выражения или разбор выражения с присваиванием
    scanResult() {
        if (this.symbol !== null && this.symbol.symbolCode === SymbolsCodes.identifier) {
            this.id = 1;
            this.accSym.push(this.symbol);
            this.nextSym();
            this.accSym.push(this.symbol);
            if (this.symbol !== null && this.symbol.symbolCode === SymbolsCodes.equal) {
                this.id = 2;
                this.nextSym();
                return new Assignation(this.accSym.pop(), this.accSym.pop(), this.scanResult());
            }
            this.symbol = this.accSym[0];
        }
        return this.scanExpression();
    }
    // Разбор выражения
    scanExpression()
    {
        let term = this.scanTerm();
        let operationSymbol = null;

        while ( this.symbol !== null && (
                    this.symbol.symbolCode === SymbolsCodes.plus ||
                    this.symbol.symbolCode === SymbolsCodes.minus
            )) {

            operationSymbol = this.symbol;
            this.nextSym();

            switch (operationSymbol.symbolCode) {
                case SymbolsCodes.plus:
                    term = new Addition(operationSymbol, term, this.scanTerm());
                    break;
                case SymbolsCodes.minus:
                    term = new Subtraction(operationSymbol, term, this.scanTerm());
                    break;
            }
        }

        return term;
    }
    // Разбор слагаемого
    scanTerm()
    {
        let term = this.scanMultiplier();
        let operationSymbol = null;

        while ( this.symbol !== null && (
                    this.symbol.symbolCode === SymbolsCodes.star ||
                    this.symbol.symbolCode === SymbolsCodes.slash
            )) {

            operationSymbol = this.symbol;
            this.nextSym();

            switch (operationSymbol.symbolCode) {
                case SymbolsCodes.star:
                    term = new Multiplication(operationSymbol, term, this.scanMultiplier());
                    break;
                case SymbolsCodes.slash:
                    term = new Division(operationSymbol, term, this.scanMultiplier());
                    break;
            }
        }

        return term;
    }
    // Разбор множителя
    scanMultiplier()
    {
        let minus = false;
        if (this.symbol !== null && this.symbol.symbolCode === SymbolsCodes.minus) {
            minus = !minus;
            this.nextSym();
        }
        let integer = null, intOrVar = this.symbol;
        if (this.symbol !== null && this.symbol.symbolCode === SymbolsCodes.openParenthesis) {
            this.nextSym();
            integer = this.scanExpression();
            this.accept(SymbolsCodes.closedParenthesis);
        } else {
            if (intOrVar !== null && intOrVar.symbolCode === SymbolsCodes.identifier) {
                this.nextSym();
                integer = new Variable(intOrVar);
            } else {
                this.accept(SymbolsCodes.integerConst);
                integer = new NumberConstant(intOrVar);
            }
        }
        return minus ? new Inversion(integer) : integer;
    }
};