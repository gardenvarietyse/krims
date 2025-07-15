import { MathTokenType, Token, TokenType } from '../lexer/token';
import { Lexer } from '../lexer/lexer';
import { AST, BinaryOp, Number } from './ast';

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

      console.log('eat:', token_types.join(', '));
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

  atom(): Number | BinaryOp {
    if (this.current_token.type === TokenType.Number) {
      const number_token = this.current_token;
      const value = number_token.value as number;
      this.eat(TokenType.Number);

      console.log('  -> ate number, token is now ', this.current_token);
      return new Number(value, number_token);
    }

    this.eat(TokenType.LeftParen);

    const expr = this.expr();
    this.eat(TokenType.RightParen);

    return expr;
  }

  // factor : atom (POW factor)*;

  factor(): Number | BinaryOp {
    console.log('factor');
    var left = this.atom();

    if (this.current_token.type !== TokenType.Pow) {
      console.log('  factor: left side only');
      return left;
    }

    const pow_token = this.current_token;

    this.eat(TokenType.Pow);
    const right = this.factor();

    return new BinaryOp(left, right, TokenType.Pow, pow_token);
  }

  // term   : factor ((MUL|DIV) factor)*;

  mathTokenType(...token_types: MathTokenType[]): MathTokenType {
    return this.eatType(...token_types);
  }

  term(): Number | BinaryOp {
    const OP_TYPES = [TokenType.Multiply, TokenType.Divide];

    var left = this.factor();

    if (!OP_TYPES.includes(this.current_token.type)) {
      console.log('term() returns left, token is now ', this.current_token);
      return left;
    }

    const op_token = this.current_token;
    const op = this.mathTokenType(...(OP_TYPES as MathTokenType[]));
    const right = this.factor();

    return new BinaryOp(left, right, op, op_token);
  }

  // expr   : term ((PLUS|MINUS) term)*;

  expr(): Number | BinaryOp {
    const OP_TYPES = [TokenType.Plus, TokenType.Minus];

    console.log('expr');

    var left = this.term();
    console.log('expr() got left expression, token now:', this.current_token);

    if (!OP_TYPES.includes(this.current_token.type)) {
      console.log('  expr: left not followed by + or -; returning left');
      return left;
    }

    const op_token = this.current_token;
    const op = this.mathTokenType(...(OP_TYPES as MathTokenType[]));
    const right = this.term();

    return new BinaryOp(left, right, op, op_token);
  }

  parse(): AST {
    return this.expr();
  }
}
