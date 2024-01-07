import {Expression, WhereKey, ASTForm} from "../types/type";
import {Parser} from "../interfaces/interface";

export class ParserImpl implements Parser {
    private ast: ASTForm;

    constructor(ast: ASTForm) {
        this.ast = ast;
    }

    public parseAST(): string {
        return `db.${this.ast.from}.find(${this.getWhereArguments(this.ast.where)}).project(${this.getSelectArguments()})`
    }

    private getSelectArguments(): string {
        let project: Record<string, number> = this.ast.select.reduce((acc: Record<string, number>, val) => {
            acc[val] = 1;
            return acc
        }, {})

        return this.beautifyJSON(project)
    }

    private getWhereArguments(whereArgument: WhereKey): string {
        let find: WhereKey = whereArgument

        if (this.isExpression(find)) {
            return this.beautifyJSON({
                [find.id]: {
                    [find.comparison]: find.value
                }
            })

        } else {
            return this.beautifyJSON({
                [find.operation]: find.arguments.map(value => this.getWhereArguments(value))
            })
        }
    }

    private isExpression(candidate: WhereKey): candidate is Expression {
        return Object.keys(candidate).includes('id')
    }

    private beautifyJSON(object: object): string {
        return JSON.stringify(object).replace(/\\"/g, '')
    }
}