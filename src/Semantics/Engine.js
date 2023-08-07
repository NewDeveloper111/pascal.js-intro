import { Addition } from '../SyntaxAnalyzer/Tree/Addition';
import { Multiplication } from '../SyntaxAnalyzer/Tree/Multiplication';
import { Subtraction } from '../SyntaxAnalyzer/Tree/Subtraction';
import { Division } from '../SyntaxAnalyzer/Tree/Division';
import { NumberConstant } from '../SyntaxAnalyzer/Tree/NumberConstant';
import { Variable } from '../SyntaxAnalyzer/Tree/Variable';
import { Inversion } from '../SyntaxAnalyzer/Tree/Inversion';
import { Assignation } from '../SyntaxAnalyzer/Tree/Assignation';
import { NumberVariable } from './Variables/NumberVariable';

export class Engine
{
    /**
     * Результаты вычислений (изначально - один для каждой строки)
     * 
     * @type string[]
     */
    results;

    constructor(trees)
    {
        this.trees = trees;
        this.results = [];
        this.acc = {};
    }

    run()
    {
        let self = this;

        this.trees.forEach(

            function(tree)
            {
                self.evaluateResult(tree);
            }
        );

    }

    evaluateResult(tree) {
        let num = null;
        if (tree instanceof Assignation) {
            num = this.evaluateResult(tree.right);
            this.acc[tree.left.value] = Number.parseInt(num);
        } else {
            num = this.evaluateSimpleExpression(tree).value;
            this.results.push(Number.parseInt(num));
        }
        return num;
    }

    evaluateSimpleExpression(expression)
    {
        if (expression instanceof Addition ||
                expression instanceof Subtraction) {

            let leftOperand = this.evaluateSimpleExpression(expression.left);
            let rightOperand = this.evaluateSimpleExpression(expression.right);

            let result = null;
            if (expression instanceof Addition) {
                result = leftOperand.value + rightOperand.value;
            } else if (expression instanceof Subtraction) {
                result = leftOperand.value - rightOperand.value;
            }

            return new NumberVariable(result);
        } else {
            return this.evaluateTerm(expression);
        }
    }

    evaluateTerm(expression)
    {
        if (expression instanceof Multiplication) {
            let leftOperand = this.evaluateTerm(expression.left);
            let rightOperand = this.evaluateTerm(expression.right);

            let result = leftOperand.value * rightOperand.value;

            return new NumberVariable(result);
        } else if (expression instanceof Division) {
            let leftOperand = this.evaluateTerm(expression.left);
            let rightOperand = this.evaluateTerm(expression.right);
            let result = leftOperand.value / rightOperand.value;

            return new NumberVariable(result);
        } else {
            return this.evaluateMultiplier(expression);
        }
    }

    evaluateMultiplier(expression)
    {
        let exp = expression, minus = false, num = null;
        if (expression instanceof Inversion) {
            minus = true;
            exp = exp.expr;
        }
        if (exp instanceof NumberConstant) {
            num = exp.symbol.value;
        } else if (exp instanceof Variable) {
            if (exp.symbol.value in this.acc) {
                num = this.acc[exp.symbol.value];
            } else {
                throw '  Ошибка: переменная не инициализирована.\n' +
                `Строка: ${exp.symbol.str}, столбец: ${exp.symbol.col}`;
            }
        } else {
            num = this.evaluateSimpleExpression(exp).value;
        } 
        return new NumberVariable(minus ? -num : num);        
    }
};