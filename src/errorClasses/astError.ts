export class ASTError
    extends Error {
    constructor(message: string, position: number) {
        super(`AST Error. ${message} Position: ${position}`);
    }
}