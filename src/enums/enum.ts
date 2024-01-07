export enum TokenTypeEnum {
    SELECT = 'SELECT',
    WHERE = 'WHERE',
    FROM = 'FROM',
    COMMA = 'COMMA',
    AND = 'AND',
    OR = 'OR',
    VALUE = 'VALUE',
    COMPARISON = 'COMPARISON',
    STAR = 'STAR',
    OPENBRACKET = 'OPENBRACKET',
    CLOSEBRACKET ='CLOSEBRACKET'
}

export enum ASTModes {
    'SELECT',
    'FROM',
    'WHERE'
}