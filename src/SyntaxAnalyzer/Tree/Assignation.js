import { BinaryOperation } from './BinaryOperation';

export class Assignation extends BinaryOperation
{
    constructor(symbol, left, right)
    {
        super(symbol, left, right);
    }
}