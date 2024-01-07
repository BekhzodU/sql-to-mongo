import {SQLToken} from "./token";
import {TokenTypeEnum} from "../enums/enum";
import {StandardCharChecker} from "./char_checker";
import {Token, CharChecker, Lexer} from "../interfaces/interface";
import {LexerError} from "../errorClasses/lexerError";

export class CommandLexer implements Lexer {
    private tokens: Token[] = [];
    private command: string;
    private char: string = '';
    private currentPosition: number = 0;
    private charChecker: CharChecker = new StandardCharChecker();

    constructor(command: string) {
        this.command = command;
    }

    public parseCommand(): Token[] {
        return this.convertStringToTokens().tokens;
    }

    private convertStringToTokens(): this {

        while (this.currentPosition < this.command.length) {
            this.char = this.command[this.currentPosition];

            if (this.charChecker.isWhitespace(this.char)) {
                this.currentPosition += 1;

            } else if (this.char === '*') {
                this.tokens.push(new SQLToken(TokenTypeEnum.STAR, this.char, this.currentPosition))
                this.currentPosition += 1;

            } else if (this.char === ',') {
                this.tokens.push(new SQLToken(TokenTypeEnum.COMMA, this.char, this.currentPosition))
                this.currentPosition += 1;

            } else if (this.char === '>' || this.char === '<' || this.char === '=') {
                this.getEqualityValue()

            } else if (this.char === '!') {

                if (this.command[this.currentPosition + 1] !== '=') {
                    throw new LexerError(`No equality sign (=).`, this.currentPosition)
                }

                this.char += '=';
                this.currentPosition += 1;
                this.getEqualityValue();

            } else if (this.charChecker.isLetterOrDigit(this.char)) {
                this.checkWholeWord(TokenTypeEnum.VALUE)

            } else if (this.char === '(') {
                this.tokens.push(new SQLToken(TokenTypeEnum.OPENBRACKET, this.char, this.currentPosition))
                this.currentPosition += 1

            } else if (this.char === ')') {
                this.tokens.push(new SQLToken(TokenTypeEnum.CLOSEBRACKET, this.char, this.currentPosition))
                this.currentPosition += 1

            } else {
                throw new LexerError(`Wrong character: ${this.char}`, this.currentPosition)
            }
        }

        return this
    }

    private getEqualityValue(): this {

        if (this.command[this.currentPosition + 1] === '=') {
            this.char = this.translateComparisonSign(this.char += '=')
            this.tokens.push(new SQLToken(TokenTypeEnum.COMPARISON, this.char, this.currentPosition))
            this.currentPosition += 2

        } else {
            this.char = this.translateComparisonSign(this.char)
            this.tokens.push(new SQLToken(TokenTypeEnum.COMPARISON, this.char, this.currentPosition))
            this.currentPosition += 1;
        }

        if (this.charChecker.isLetterOrDigit(this.command[this.currentPosition]) || this.charChecker.isQuote(this.command[this.currentPosition])) {
            this.currentPosition -= 1;
            this.char = '';
            this.checkWholeWord(TokenTypeEnum.VALUE, true);
        }

        return this
    }

    private checkWholeWord(type: TokenTypeEnum, checkQuotes: boolean = false): this {
        let charPosition: number = this.currentPosition;
        let text: string = this.char;
        this.currentPosition += 1;
        this.char = this.command[this.currentPosition]

        if (checkQuotes) {
            while (this.charChecker.isLetterOrDigit(this.char) || this.charChecker.isQuote(this.char)) {
                text += this.char;
                this.currentPosition += 1;
                this.char = this.command[this.currentPosition]
            }

            try {
                this.charChecker.validateQuotes(text);
            } catch (e) {

                if (e instanceof Error) {
                    throw new LexerError(e.message, this.currentPosition)
                }

                throw e
            }

        } else {
            while (this.charChecker.isLetterOrDigit(this.char)) {
                text += this.char;
                this.currentPosition += 1;
                this.char = this.command[this.currentPosition]
            }
        }

        switch (text.toUpperCase()) {
            case 'SELECT':
                type = TokenTypeEnum.SELECT;
                break;
            case 'WHERE':
                type = TokenTypeEnum.WHERE;
                break;
            case 'FROM':
                type = TokenTypeEnum.FROM;
                break;
            case 'AND':
                text = '$and'
                type = TokenTypeEnum.AND;
                break;
            case 'OR':
                text = '$or'
                type = TokenTypeEnum.OR;
                break;
            default:
                break;
        }

        this.tokens.push(new SQLToken(type, text, charPosition))
        return this
    }

    private translateComparisonSign(text: string): string {
        switch (text) {
            case ('>'):
                return '$gt';
            case ('>='):
                return '$gte'
            case ('<'):
                return '$lt'
            case ('<='):
                return '$lte'
            case ('='):
                return '$eq'
            case ('!='):
                return '$ne'
            default:
                return text
        }
    }
}
