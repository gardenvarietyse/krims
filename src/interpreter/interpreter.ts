import { Lexer } from './lexer';
import { ArithmeticType, Token, TokenType } from './token';

export class Interpreter {
  text: string;
  current_token?: Token;
  lexer: Lexer;

  constructor(text: string) {
    this.text = text;
    this.lexer = new Lexer(text);
  }

  error(msg = 'syntax error'): never {
    throw new Error(`${msg} @ ${this.lexer.position()}`);
  }

  eat(token_type: TokenType): void {
    const current_type = this.current_token?.type;

    if (current_type === token_type) {
      this.current_token = this.lexer.get_next_token();

      while (this.current_token?.type === TokenType.Whitespace) {
        this.current_token = this.lexer.get_next_token();
      }
    } else {
      this.error(
        `unexpected token; ${this.current_token?.type} ≠ ${token_type}`
      );
    }
  }

  expr(): number {
    this.current_token = this.lexer.get_next_token();

    let tokens: Token[] = [];
    let expected_type = TokenType.Number;

    while (this.current_token?.type !== TokenType.EOF) {
      const token = this.current_token;
      this.eat(expected_type);

      tokens.push(token);
      expected_type =
        expected_type === TokenType.Number
          ? TokenType.Arithmetic
          : TokenType.Number;
    }

    if (tokens.length < 3) {
      this.error('need at least 3 tokens');
    }

    if (tokens[tokens.length - 1].type !== TokenType.Number) {
      this.error('expression must end with number');
    }

    while (tokens.length > 1) {
      const [left, op, right, ...rest] = tokens;

      const result = this.arithmetic(
        Number(left.value),
        Number(right.value),
        op
      );
      tokens = [new Token(TokenType.Number, result), ...rest];
    }

    if (tokens.length !== 1 || tokens[0].type !== TokenType.Number) {
      this.error('expression did not resolve to a single number');
    }

    return Number(tokens[0].value);
  }

  arithmetic(left: number, right: number, op: Token): number {
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
