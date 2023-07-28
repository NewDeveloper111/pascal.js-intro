import { Addition } from '../SyntaxAnalyzer/Tree/Addition';
import { Multiplication } from '../SyntaxAnalyzer/Tree/Multiplication';
import { Subtraction } from '../SyntaxAnalyzer/Tree/Subtraction';
import { Division } from '../SyntaxAnalyzer/Tree/Division';
import { NumberConstant } from '../SyntaxAnalyzer/Tree/NumberConstant';
import { Inversion } from '../SyntaxAnalyzer/Tree/Inversion';
import { Expression } from '../SyntaxAnalyzer/Tree/Expression';
import { Assignation } from '../SyntaxAnalyzer/Tree/Assignation';
import { NumberVariable } from './Variables/NumberVariable';
import { IntegerConstant } from '../LexicalAnalyzer/Symbols/IntegerConstant';

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
                let result = self.evaluateSimpleExpression(tree instanceof Assignation ?
                    tree.right : tree);
                console.log(result.value);
                if (tree instanceof Assignation) {
                    self.acc[tree.left.value] = Number.parseInt(result.value);
                }
                self.results.push(Number.parseInt(result.value)); // пишем в массив результатов
            }
        );

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
        let expr = expression, minus = false;
        if (expression instanceof Inversion) {
            minus = true;
            expr = expr.symbol;
        }
        if (expr instanceof Expression || expr instanceof NumberConstant) {
            let num = null;
            if (expr instanceof Expression ) {
                num = this.evaluateSimpleExpression(expr.symbol).value;
            } else if (expr.symbol instanceof IntegerConstant) {
                num = expr.symbol.value;
            } else if (expr.symbol.value in this.acc) {
                num = this.acc[expr.symbol.value];
            } else {
                throw '  Ошибка: переменная не инициализирована.\n' +
                `Строка: ${expr.symbol.str}, столбец: ${expr.symbol.col}`;
            }
            return new NumberVariable(minus ? -num : num);
        } else {
            throw 'Number Constant expected.';
        }
    }
};