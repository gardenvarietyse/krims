import {
  is_arithmetic_operator,
  is_digit,
  is_equals,
  is_identifier,
  is_left_paren,
  is_newline,
  is_number,
  is_pow,
  is_question_mark,
  is_right_paren,
  is_semicolon,
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

    if (is_newline(current_char)) {
      const token = new Token(TokenType.Newline, current_char);

      this._position += 1;

      return token;
    }

    if (is_whitespace(current_char)) {
      const token = new Token(TokenType.Whitespace, current_char);

      this._position += 1;

      return token;
    }

    if (is_identifier(current_char)) {
      const token = new Token(TokenType.Identifier, current_char);

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

    if (is_equals(current_char)) {
      this._position += 1;
      return new Token(TokenType.Equals);
    }

    if (is_semicolon(current_char)) {
      this._position += 1;
      return new Token(TokenType.Semicolon);
    }

    if (is_question_mark(current_char)) {
      this._position += 1;

      if (is_identifier(text[this._position])) {
        const identifier = text[this._position];
        this._position += 1;
        return new Token(TokenType.Retrieval, identifier);
      }

      this.error(
        `expected identifier after question mark, got '${text[this._position]}'`
      );
    }

    this.error(`unexpected character '${current_char}'`);
  }
}
