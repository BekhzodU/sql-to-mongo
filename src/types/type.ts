export type Expression = {
    id: string,
    comparison: string,
    value: string
}

export type WhereKey = Expression | { operation: string, arguments: Expression[] }

export type ASTForm = {
    select: string[]
    from: string
    where: WhereKey
}
