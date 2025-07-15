import type { MathTokenType, Token } from '../lexer/token';

export interface AST {}

export class BinaryOp implements AST {
  left: AST;
  right: AST;
  operator: MathTokenType;
  token: Token;

  constructor(left: AST, right: AST, operator: MathTokenType, token: Token) {
    this.left = left;
    this.right = right;
    this.operator = operator;
    this.token = token;
  }

  toString(): string {
    return 'meow';
  }
}

export class Number implements AST {
  value: number;
  token: Token;

  constructor(value: number, token: Token) {
    this.value = value;
    this.token = token;
  }
}
