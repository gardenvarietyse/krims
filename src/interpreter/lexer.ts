import {
  is_arithmetic_operator,
  is_digit,
  is_number,
  is_whitespace,
} from './test';
import { ArithmeticType, Token, TokenType } from './token';

export class Lexer {
  text: string;
  _position: number;
  current_token?: Token;

  constructor(text: string) {
    this.text = text;
    this._position = 0;
  }

  position(): number {
    return this._position;
  }

  error(msg = 'syntax error'): never {
    throw new Error(`${msg} @ ${this._position}`);
  }

  get_next_token(): Token {
    const text = this.text;

    if (this._position > text.length - 1) {
      return new Token(TokenType.EOF);
    }

    const current_char = text[this._position];

    if (is_whitespace(current_char)) {
      const token = new Token(TokenType.Whitespace, current_char);

      this._position += 1;

      return token;
    }

    if (is_digit(current_char)) {
      const digits = [current_char];

      for (let i = this._position + 1; i < text.length; i++) {
        if (is_number(text[i])) {
          digits.push(text[i]);
          this._position += 1;
        } else {
          break;
        }
      }

      this._position += 1;

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

      this._position += 1;
      return new Token(TokenType.Arithmetic, arithmeticType);
    }

    this.error(`unexpected character '${current_char}'`);
  }
}
