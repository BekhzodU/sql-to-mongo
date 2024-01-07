import {CharChecker} from "../interfaces/interface";

export class StandardCharChecker implements CharChecker {
    constructor() {}

    public isWhitespace(char: string): boolean {
        let whitespaceList: string[] = ['', ' ', '\n', '\t'];
        return whitespaceList.includes(char);
    }

    public isQuote(char: string): boolean {
        if (!char) {
            return false
        }
        return char.charCodeAt(0) === 34 || char.charCodeAt(0) === 39;
    }

    public validateQuotes(text: string): void {
        if (text.includes("'") && (text.at(0)?.charCodeAt(0) !== 39 || text.at(-1)?.charCodeAt(0) !== 39)) {
            throw Error(`Quotes must be on both sides.`)

        } else if (text.includes('"') && (text.at(0)?.charCodeAt(0) !== 34 || text.at(-1)?.charCodeAt(0) !== 34)) {
            throw Error(`Quotes must be on both sides.`)

        } else if ((text.includes("'") || text.includes('"')) && text.length <= 2) {
            throw Error(`Empty string.`)
        }
    }

    public isLetterOrDigit(char: string): boolean {
        return this.isCharNumber(char) || this.isCharLetter(char);
    }

    private isCharLetter(char: string): boolean {
        if (char === undefined) {
            return false
        }
        return char.toLowerCase() !== char.toUpperCase();
    }

    private isCharNumber(char: string): boolean {
        return !isNaN(parseInt(char)) || !isNaN(parseFloat(char));
    }
}