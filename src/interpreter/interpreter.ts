import { Lexer } from './lexer';
import { ArithmeticType, Token, TokenType } from './token';

export class Interpreter {
  text: string;
  current_token: Token = new Token(TokenType.SOF);
  lexer: Lexer;

  constructor(text: string) {
    this.text = text;
    this.lexer = new Lexer(text);

    this.eat(TokenType.SOF);
  }

  error(msg = 'syntax error'): never {
    throw new Error(`${msg} @ ${this.lexer.position()}`);
  }

  eat(token_type: TokenType): void {
    const current_type = this.current_token.type;

    if (current_type === token_type) {
      this.current_token = this.lexer.get_next_token();

      while (this.current_token.type === TokenType.Whitespace) {
        this.current_token = this.lexer.get_next_token();
      }
    } else {
      this.error(
        `unexpected token; ${this.current_token.type} ≠ ${token_type}`
      );
    }
  }

  // expr   : factor (Arithmetic factor)*;
  // factor : Number;

  factor(): void {
    this.eat(TokenType.Number);
  }

  arithmetic(): void {
    this.eat(TokenType.Arithmetic);
  }

  expr(): number {
    let result: number = this.current_token.value as number;
    this.factor();

    while (this.current_token.type === TokenType.Arithmetic) {
      const op = this.current_token;
      this.eat(TokenType.Arithmetic);
      result = this.perform_arithmetic(
        result,
        this.current_token.value as number,
        op
      );

      this.factor();
    }

    return result;
  }

  perform_arithmetic(left: number, right: number, op: Token): number {
    switch (op.value) {
      case ArithmeticType.Addition:
        return left + right;
      case ArithmeticType.Subtraction:
        return left - right;
      case ArithmeticType.Multiplication:
        return left * right;
      case ArithmeticType.Division:
        if (right === 0) {
          this.error('division by zero');
        }

        return left / right;
      default:
        this.error(`unknown operator ${op.value}`);
    }
  }
}
