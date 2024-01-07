import {CommandLexer} from "./service/lexer";
import {ASTBuilder} from "./service/ast";
import {ParserImpl} from "./service/parser";
import {ASTForm} from "./types/type";
import {Parser, Token} from "./interfaces/interface"

// SQL QUERY 
const command: string = `select aj, c from b where a>20 and (c > 3 or (a>"400") and b>"300")`;

const tokens: Token[] = new CommandLexer(command).parseCommand()
const tree: ASTForm = new ASTBuilder(tokens).buildAST()
const parser: Parser = new ParserImpl(tree);
const mongoCommand = parser.parseAST();
console.log('RESULT : ', mongoCommand)
