import {
  is_arithmetic_operator,
  is_digit,
  is_left_paren,
  is_number,
  is_pow,
  is_right_paren,
  is_whitespace,
} from './test';
import { Token, TokenType } from './token';

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

    // todo: break out into number() function
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
      const arithmeticTokenType = {
        '+': TokenType.Plus,
        '-': TokenType.Minus,
        '*': TokenType.Multiply,
        '/': TokenType.Divide,
      }[current_char];

      if (!arithmeticTokenType) {
        this.error('invalid arithmetic operator');
      }

      this._position += 1;
      return new Token(arithmeticTokenType);
    }

    if (is_left_paren(current_char)) {
      this._position += 1;
      return new Token(TokenType.LeftParen);
    }

    if (is_right_paren(current_char)) {
      this._position += 1;
      return new Token(TokenType.RightParen);
    }

    if (is_pow(current_char)) {
      this._position += 1;
      return new Token(TokenType.Pow);
    }

    this.error(`unexpected character '${current_char}'`);
  }
}
