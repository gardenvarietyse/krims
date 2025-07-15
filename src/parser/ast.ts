import type { MathTokenType, Token } from '../lexer/token';

export interface AST {}

export class Program implements AST {
  body: AST[];

  constructor(body: AST[]) {
    this.body = body;
  }
}

export class Assignment implements AST {
  identifier: string;
  value: AST;
  token: Token;

  constructor(identifier: string, value: AST, token: Token) {
    this.identifier = identifier;
    this.value = value;
    this.token = token;
  }
}

export class Read implements AST {
  identifier: string;
  token: Token;

  constructor(identifier: string, token: Token) {
    this.identifier = identifier;
    this.token = token;
  }
}

export class UnaryOp implements AST {
  operator: MathTokenType;
  operand: AST;
  token: Token;

  constructor(operator: MathTokenType, operand: AST, token: Token) {
    this.operator = operator;
    this.operand = operand;
    this.token = token;
  }
}

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
}

export class Number implements AST {
  value: number;
  token: Token;

  constructor(value: number, token: Token) {
    this.value = value;
    this.token = token;
  }
}
