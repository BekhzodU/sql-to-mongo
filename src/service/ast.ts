import {Token, AST} from "../interfaces/interface";
import {ASTModes, TokenTypeEnum} from "../enums/enum";
import {Expression, WhereKey, ASTForm} from "../types/type";
import {ASTError} from "../errorClasses/astError";

export class ASTBuilder implements AST {
    private tokens: Token[];
    private currentMode: ASTModes = ASTModes.SELECT;
    private currentIteration: number = 1;
    private ast: ASTForm = {select: [], from: '', where: {id: '', comparison: '', value: ''}}

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public buildAST(): ASTForm {
        try {
            this.checkMainRulesAreCorrect()
            this.buildSelectTree();
            this.buildFromTree()
            this.buildWhereTree()
        } catch (e) {
            console.log(this.ast)
            throw e
        }

        return this.ast
    }

    private checkMainRulesAreCorrect(): void {

        if (this.tokens.filter(value => (value.type === TokenTypeEnum.SELECT || value.type === TokenTypeEnum.FROM)).length !== 2) {
            throw new ASTError('SELECT and FROM keywords should be both in command', 0)
        }

        if (this.tokens.at(0)?.type !== TokenTypeEnum.SELECT) {
            throw new ASTError('SELECT must be first keyword', 0)
        }

        if (!this.areBracketsBalanced()) {
            throw new ASTError("Brackets are not balanced", 0)
        }
    }

    private buildSelectTree(): void {

        while (this.currentIteration < this.tokens.length && this.currentMode === ASTModes.SELECT) {
            let currentToken: Token = this.tokens[this.currentIteration]

            if (currentToken.type === TokenTypeEnum.STAR) {

                if (this.tokens[this.currentIteration + 1].type !== TokenTypeEnum.FROM) {
                    throw new ASTError(`Must be FROM keyword after STAR char.`, currentToken.position)
                }

            } else if (currentToken.type === TokenTypeEnum.VALUE) {

                if (this.tokens[this.currentIteration + 1].type !== TokenTypeEnum.COMMA && this.tokens[this.currentIteration + 1].type !== TokenTypeEnum.FROM) {
                    throw new ASTError("After Select argument should be comma or FROM keyword.", currentToken.position);
                }

                this.ast.select.push(currentToken.variable)

            } else if (currentToken.type === TokenTypeEnum.COMMA) {

                if (this.tokens[this.currentIteration + 1].type !== TokenTypeEnum.VALUE) {
                    throw new ASTError("After comma must be another argument.", currentToken.position)
                }

            } else if (currentToken.type === TokenTypeEnum.FROM) {
                this.currentMode = ASTModes.FROM

            } else {
                throw new ASTError("After Select must be argument/s.", currentToken.position)
            }

            this.currentIteration += 1
        }
    }


    private buildFromTree(): void {
        while (this.currentIteration < this.tokens.length && this.currentMode === ASTModes.FROM) {
            let currentToken: Token = this.tokens[this.currentIteration]

            if (currentToken.type === TokenTypeEnum.VALUE && this.currentIteration === this.tokens.length - 1) {
                this.ast.from = currentToken.variable;

            } else if (currentToken.type === TokenTypeEnum.VALUE && this.tokens[this.currentIteration + 1].type === TokenTypeEnum.WHERE) {
                this.ast.from = currentToken.variable;

            } else if (currentToken.type === TokenTypeEnum.WHERE && this.tokens[this.currentIteration - 1].type === TokenTypeEnum.VALUE) {
                this.currentMode = ASTModes.WHERE

            } else {
                throw new ASTError("Should be 1 argument after FROM", currentToken.position)
            }

            this.currentIteration += 1
        }
    }

    private buildWhereTree(): void {
        this.ast.where = this.getConvertedCommand(false)
    }

    private getConvertedCommand(recursion: boolean = false): WhereKey {
        let localCommands: Expression[] = []
        let operations: Token[] = []

        while (this.currentIteration < this.tokens.length && this.currentMode === ASTModes.WHERE) {
            let currentToken = this.tokens[this.currentIteration]
            let nextVariable = this.tokens[this.currentIteration + 1]
            let afterVariable = this.tokens[this.currentIteration + 2]
            this.currentIteration += 1

            if (this.currentIteration === this.tokens.length) {

                if (currentToken.type !== TokenTypeEnum.VALUE && currentToken.type !== TokenTypeEnum.CLOSEBRACKET) {
                    throw new ASTError(`Wrong argument.`, currentToken.position)

                } else if (currentToken.type === TokenTypeEnum.VALUE && this.tokens[this.currentIteration - 2].type !== TokenTypeEnum.COMPARISON) {
                    throw new ASTError(`Wrong argument.`, currentToken.position)
                }
            }

            if (currentToken.type === TokenTypeEnum.VALUE && nextVariable?.type === TokenTypeEnum.COMPARISON && afterVariable?.type === TokenTypeEnum.VALUE) {
                localCommands.push({
                    id: currentToken.variable,
                    comparison: nextVariable.variable,
                    value: afterVariable.variable
                })

            } else if (currentToken.type === TokenTypeEnum.OPENBRACKET) {

                if (nextVariable?.type !== TokenTypeEnum.OPENBRACKET && nextVariable?.type !== TokenTypeEnum.VALUE) {
                    throw new ASTError("Wrong argument after Open Bracket", currentToken.position)
                }

                localCommands.push(<Expression>this.getConvertedCommand(true))

            } else if (currentToken.type === TokenTypeEnum.OR || currentToken.type === TokenTypeEnum.AND) {

                if (!nextVariable || (nextVariable.type !== TokenTypeEnum.OPENBRACKET && nextVariable.type !== TokenTypeEnum.VALUE)) {
                    throw new ASTError("Wrong argument after or/and", currentToken.position)
                }

                operations.push(currentToken)

            } else if (recursion && currentToken.type === TokenTypeEnum.CLOSEBRACKET) {
                return this.getOperatedCommandArray(localCommands, operations);
            }
        }

        return this.getOperatedCommandArray(localCommands, operations)
    }

    private getOperatedCommandArray(commands: Expression[], operations: Token[]): WhereKey {

        if (operations.length === 0) {
            return commands[0]
        }

        let operatedCommand: {} = {}
        let commandIteration: number = 0

        for (let operation of operations) {

            if (Object.keys(operatedCommand).length === 0) {
                operatedCommand = {
                    operation: operation.variable,
                    arguments: [commands[commandIteration], commands[commandIteration + 1]]
                }
                commandIteration += 2;

            } else {
                operatedCommand = {
                    operation: operation.variable,
                    arguments: [operatedCommand, commands[commandIteration]]
                }
                commandIteration += 1
            }
        }

        return <WhereKey>operatedCommand
    }

    private areBracketsBalanced(): boolean {
        let brackets: string[] = this.tokens.filter(value => value.type === TokenTypeEnum.OPENBRACKET || value.type === TokenTypeEnum.CLOSEBRACKET).map(value => value.variable)
        let stack: string[] = [];

        for (let i = 0; i < brackets.length; i++) {
            let x = brackets[i];
            let check;

            if (x == '(') {
                stack.push(x);
                continue;
            }

            if (stack.length == 0) {
                return false;
            }

            switch (x) {
                case ')':
                    check = stack.pop();
                    if (check == '{' || check == '[')
                        return false;
                    break;

            }
        }

        return (stack.length == 0);
    }
}
