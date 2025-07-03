import {
  is_arithmetic_operator,
  is_digit,
  is_number,
  is_whitespace,
} from './test';
import { ArithmeticType, Token, TokenType } from './token';

export class Interpreter {
  text: string;
  position: number;
  current_token?: Token;

  constructor(text: string) {
    this.text = text;
    this.position = 0;
  }

  error(msg = 'syntax error'): never {
    throw new Error(`${msg} @ ${this.position}`);
  }

  get_next_token(): Token {
    const text = this.text;

    if (this.position > text.length - 1) {
      return new Token(TokenType.EOF, '');
    }

    const current_char = text[this.position];

    if (is_whitespace(current_char)) {
      const token = new Token(TokenType.Whitespace, current_char);

      this.position += 1;

      return token;
    }

    if (is_digit(current_char)) {
      const digits = [current_char];

      for (let i = this.position + 1; i < text.length; i++) {
        if (is_number(text[i])) {
          digits.push(text[i]);
          this.position += 1;
        } else {
          break;
        }
      }

      this.position += 1;

      const token = new Token(
        TokenType.Number,
        Number.parseFloat(digits.join(''))
      );

      return token;
    }

    if (is_arithmetic_operator(current_char)) {
      const arithmeticType = {
        '+': ArithmeticType.Addition,
        '-': ArithmeticType.Subtraction,
        '*': ArithmeticType.Multiplication,
        '/': ArithmeticType.Division,
      }[current_char];

      if (!arithmeticType) {
        this.error('invalid arithmetic operator');
      }

      this.position += 1;
      return new Token(TokenType.Arithmetic, arithmeticType);
    }

    this.error(`unexpected character '${current_char}'`);
  }

  eat(token_type: TokenType): void {
    const current_type = this.current_token?.type;

    if (current_type === token_type) {
      this.current_token = this.get_next_token();

      while (this.current_token?.type === TokenType.Whitespace) {
        this.current_token = this.get_next_token();
      }
    } else {
      this.error(
        `unexpected token; ${this.current_token?.type} != ${token_type}`
      );
    }
  }

  expr(): number {
    this.current_token = this.get_next_token();

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
