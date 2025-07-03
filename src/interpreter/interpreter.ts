import { ArithmeticType, Token, TokenType } from './token';

const ArithmeticOperatorRegex = /[+\-*/]/;
const IgnoreWhitespaceRegex = /[\t\f\cK ]/;

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

    if (IgnoreWhitespaceRegex.test(current_char)) {
      const token = new Token(TokenType.Whitespace, current_char);

      this.position += 1;

      return token;
    }

    if (/\d/.test(current_char)) {
      const digits = [current_char];

      for (let i = this.position + 1; i < text.length; i++) {
        if (/\d/.test(text[i])) {
          digits.push(text[i]);
          this.position += 1;
        } else {
          break;
        }
      }

      this.position += 1;

      const token = new Token(
        TokenType.Integer,
        Number.parseInt(digits.join(''), 10)
      );

      return token;
    }

    if (ArithmeticOperatorRegex.test(current_char)) {
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

    const left = this.current_token;
    this.eat(TokenType.Integer);

    const op = this.current_token;
    this.eat(TokenType.Arithmetic);

    const right = this.current_token;
    this.eat(TokenType.Integer);

    return this.arithmetic(Number(left.value), Number(right.value), op);
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
