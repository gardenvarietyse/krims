import {
  is_arithmetic_operator,
  is_digit,
  is_equals,
  is_identifier,
  is_left_paren,
  is_newline,
  is_number,
  is_pow,
  is_right_paren,
  is_semicolon,
  is_whitespace,
} from './test';
import { Token, TokenType } from './token';

export class Lexer {
  text: string;

  _line: number = 1;
  _position: number;

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

  peek(ignore_whitespace = true): Token {
    const current_position = this._position;
    let token = this.get_next_token();

    while (ignore_whitespace && token.type === TokenType.Whitespace) {
      token = this.get_next_token();
    }

    this._position = current_position;
    return token;
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

    if (
      current_char === 'l' &&
      text[this._position + 1] === 'e' &&
      text[this._position + 2] === 't' &&
      is_whitespace(text[this._position + 3])
    ) {
      this._position += 3;

      return new Token(TokenType.KeywordLet);
    }

    if (is_identifier(current_char)) {
      const identifier_chars = [current_char];

      for (let i = this._position + 1; i < text.length; i++) {
        if (is_identifier(text[i])) {
          identifier_chars.push(text[i]);
          this._position += 1;
        } else {
          break;
        }
      }

      this._position += 1;

      const token = new Token(TokenType.Identifier, identifier_chars.join(''));

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

      if (text[this._position] === '>') {
        this._position += 1;
        return new Token(TokenType.FatArrow);
      }

      return new Token(TokenType.Equals);
    }

    if (is_semicolon(current_char)) {
      this._position += 1;
      return new Token(TokenType.Semicolon);
    }

    this.error(`unexpected character '${current_char}'`);
  }
}
