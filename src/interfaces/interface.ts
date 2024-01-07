import {TokenTypeEnum} from "../enums/enum";
import {ASTForm} from "../types/type";

export interface Token {
    type: TokenTypeEnum
    variable: string
    position: number
}

export interface AST {
    buildAST(): ASTForm
}

export interface Lexer {
    parseCommand(): Token[]
}

export interface CharChecker {
    isWhitespace(char: string): boolean
    isQuote(char: string): boolean
    isLetterOrDigit(char: string): boolean
    validateQuotes(text: string): void
}

export interface Parser {
    parseAST(): string
}
