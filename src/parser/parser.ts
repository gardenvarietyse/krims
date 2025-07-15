import { MathTokenType, Token, TokenType } from '../lexer/token';
import { Lexer } from '../lexer/lexer';
import { AST, BinaryOp, Number, UnaryOp } from './ast';

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

  // atom : NUMBER | LPAREN expr RPAREN;

  atom(): Number | UnaryOp | BinaryOp {
    if (this.current_token.type === TokenType.Number) {
      const number_token = this.current_token;
      const value = number_token.value as number;
      this.eat(TokenType.Number);

      return new Number(value, number_token);
    }

    this.eat(TokenType.LeftParen);

    const expr = this.expr();
    this.eat(TokenType.RightParen);

    return expr;
  }

  // power : atom (POW power)?;

  power(): Number | UnaryOp | BinaryOp {
    var left = this.atom();

    if (this.current_token.type === TokenType.Pow) {
      const pow_token = this.current_token;

      this.eat(TokenType.Pow);
      const right = this.power();

      return new BinaryOp(left, right, TokenType.Pow, pow_token);
    }

    return left;
  }

  // unary : (PLUS|MINUS)? power;

  unary(): Number | UnaryOp | BinaryOp {
    const unary_token = this.current_token;

    if (this.current_token.type === TokenType.Plus) {
      this.eat(TokenType.Plus);
      const power = this.power();

      return new UnaryOp(TokenType.Plus, power, unary_token);
    }

    if (this.current_token.type === TokenType.Minus) {
      this.eat(TokenType.Minus);
      const power = this.power();

      return new UnaryOp(TokenType.Minus, power, unary_token);
    }

    return this.power();
  }

  // term   : unary ((MUL|DIV) unary)*;

  mathTokenType(...token_types: MathTokenType[]): MathTokenType {
    return this.eatType(...token_types);
  }

  term(): Number | UnaryOp | BinaryOp {
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

  // expr   : term ((PLUS|MINUS) term)*;

  expr(): Number | UnaryOp | BinaryOp {
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

  parse(): AST {
    return this.expr();
  }
}
