import { SymbolBase } from './SymbolBase';

export class Identifier extends SymbolBase
{
    constructor(symbolCode, stringValue, string, column)
    {
        super(symbolCode, stringValue, stringValue);
        this.str = string;
        this.col = column;
    }
}