import { Token, TokenType } from './token';

export class Interpreter {
  text: string;
  position: number;
  current_token?: Token;

  constructor(text: string) {
    this.text = text;
    this.position = 0;
  }

  error(): never {
    throw new Error(`Syntax error at position ${this.position}`);
  }

  get_next_token(): Token {
    const text = this.text;

    if (this.position > text.length - 1) {
      return new Token(TokenType.EOF, '');
    }

    const current_char = text[this.position];

    if (/\d/.test(current_char)) {
      const token = new Token(
        TokenType.Integer,
        Number.parseInt(current_char, 10)
      );
      this.position += 1;
      return token;
    }

    if (current_char === '+') {
      this.position += 1;
      return new Token(TokenType.Addition, current_char);
    }

    this.error();
  }

  eat(token_type: TokenType): void {
    if (this.current_token?.type === token_type) {
      this.current_token = this.get_next_token();
    } else {
      this.error();
    }
  }

  expr(): number {
    this.current_token = this.get_next_token();

    const left = this.current_token;
    this.eat(TokenType.Integer);

    const op = this.current_token;
    this.eat(TokenType.Addition);

    const right = this.current_token;
    this.eat(TokenType.Integer);

    return (left.value as number) + (right.value as number);
  }
}
