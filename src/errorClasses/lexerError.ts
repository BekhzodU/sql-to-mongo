export class LexerError extends Error {
    constructor(message: string, public position: number) {
        super(`Lexer Error. ${message} Position: ${position}`);
    }
}