import {TokenTypeEnum} from "../enums/enum";
import {Token} from "../interfaces/interface";

export class SQLToken implements Token {
    constructor(public type: TokenTypeEnum, public variable: string, public position: number) {}
}