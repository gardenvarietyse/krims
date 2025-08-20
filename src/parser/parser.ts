import { MathTokenType, Token, TokenType } from '../lexer/token';
import { Lexer } from '../lexer/lexer';
import {
  Assignment,
  AST,
  BinaryOp,
  Initialization,
  Number,
  Program,
  Read,
  UnaryOp,
} from './ast';

export class Parser {
  lexer: Lexer;
  current_token: Token = new Token(TokenType.SOF);

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.current_token = this.lexer.get_next_token();
  }

  error(msg = 'syntax error'): never {
    throw new Error(`${msg} @ ${this.lexer.position()}`);
  }

  eat(...token_types: TokenType[]): void {
    const current_type = this.current_token.type;

    if (token_types.includes(current_type)) {
      this.current_token = this.lexer.get_next_token();

      while (this.current_token.type === TokenType.Whitespace) {
        this.current_token = this.lexer.get_next_token();
      }
    } else {
      this.error(
        `expected ${token_types.join(', ')}, got ${this.current_token.type}`
      );
    }
  }

  eatType<T extends TokenType>(...token_types: T[]): T {
    const token_type = this.current_token.type;
    this.eat(...token_types);

    return token_type as T;
  }

  atom(): Read | Number | UnaryOp | BinaryOp {
    if (this.current_token.type === TokenType.Identifier) {
      const identifier_token = this.current_token;
      const identifier = identifier_token.value as string;

      this.eat(TokenType.Identifier);

      return new Read(identifier, identifier_token);
    }

    if (this.current_token.type === TokenType.Number) {
      const number_token = this.current_token;
      const value = number_token.value as number;
      this.eat(TokenType.Number);

      return new Number(value, number_token);
    }

    this.eat(TokenType.LeftParen);

    const expr = this.formula();
    this.eat(TokenType.RightParen);

    return expr;
  }

  power(): Read | Number | UnaryOp | BinaryOp {
    var left = this.atom();

    if (this.current_token.type === TokenType.Pow) {
      const pow_token = this.current_token;

      this.eat(TokenType.Pow);
      const right = this.power();

      return new BinaryOp(left, right, TokenType.Pow, pow_token);
    }

    return left;
  }

  unary(): Read | Number | UnaryOp | BinaryOp {
    const UNARY_OP = [TokenType.Plus, TokenType.Minus];

    const unary_token = this.current_token;

    if (UNARY_OP.includes(this.current_token.type)) {
      const token_type = this.eatType(...UNARY_OP) as MathTokenType;
      const operand = this.power();

      return new UnaryOp(token_type, operand, unary_token);
    }

    return this.power();
  }

  mathTokenType(...token_types: MathTokenType[]): MathTokenType {
    return this.eatType(...token_types);
  }

  term(): Read | Number | UnaryOp | BinaryOp {
    const OP_TYPES = [TokenType.Multiply, TokenType.Divide];

    var left = this.unary();

    while (OP_TYPES.includes(this.current_token.type)) {
      const op_token = this.current_token;
      const op = this.mathTokenType(...(OP_TYPES as MathTokenType[]));
      const right = this.unary();

      left = new BinaryOp(left, right, op, op_token);
    }

    return left;
  }

  formula(): Read | Number | UnaryOp | BinaryOp {
    const OP_TYPES = [TokenType.Plus, TokenType.Minus];

    var left = this.term();

    while (OP_TYPES.includes(this.current_token.type)) {
      const op_token = this.current_token;
      const op = this.mathTokenType(...(OP_TYPES as MathTokenType[]));
      const right = this.term();

      left = new BinaryOp(left, right, op, op_token);
    }

    return left;
  }

  assignment(): Assignment {
    const identifier = this.current_token.value as string;
    const identifier_token = this.current_token;

    this.eat(TokenType.Identifier);
    this.eat(TokenType.Equals);

    const value = this.formula();

    return new Assignment(identifier, value, identifier_token);
  }

  initialization(): Initialization {
    this.eat(TokenType.KeywordLet);

    const identifier = this.current_token.value as string;
    const identifier_token = this.current_token;

    this.eat(TokenType.Identifier);
    this.eat(TokenType.Equals);

    const value = this.formula();

    return new Initialization(identifier, value, identifier_token);
  }

  expr(): AST {
    if (this.current_token.type === TokenType.KeywordLet) {
      return this.initialization();
    } else if (this.current_token.type === TokenType.Identifier) {
      if (this.lexer.peek().type === TokenType.Equals) {
        return this.assignment();
      }
    }

    return this.formula();
  }

  separator(): void {
    this.eat(TokenType.Semicolon, TokenType.Newline);
  }

  program(): AST {
    const SEPARATOR = [TokenType.Semicolon, TokenType.Newline, TokenType.EOF];

    const statements: AST[] = [];

    while (true) {
      statements.push(this.expr());

      const maybe_eof = this.current_token.type;
      this.eat(...SEPARATOR);

      if (maybe_eof === TokenType.EOF) {
        break;
      }
    }

    return new Program(statements);
  }

  parse(): AST {
    return this.program();
  }
}
