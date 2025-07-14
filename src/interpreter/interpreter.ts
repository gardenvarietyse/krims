import { Lexer } from './lexer';
import { Token, TokenType } from './token';

export class Interpreter {
  text: string;
  current_token: Token = new Token(TokenType.SOF);
  lexer: Lexer;

  indent: number = 0;

  log(...args: any[]): void {
    console.log(' '.repeat(this.indent), ...args);
  }

  tab(): void {
    this.indent += 2;
  }

  untab(): void {
    this.indent = Math.max(0, this.indent - 2);
  }

  constructor(text: string) {
    this.text = text;
    this.lexer = new Lexer(text);

    this.eat(TokenType.SOF);
  }

  error(msg = 'syntax error'): never {
    throw new Error(`${msg} @ ${this.lexer.position()}`);
  }

  eat(...token_types: TokenType[]): void {
    // this.log(
    //   'eat[',
    //   token_types.join(', '),
    //   '] ',
    //   this.current_token.value ?? ''
    // );
    const current_type = this.current_token.type;

    if (token_types.includes(current_type)) {
      this.current_token = this.lexer.get_next_token();

      while (this.current_token.type === TokenType.Whitespace) {
        this.current_token = this.lexer.get_next_token();
      }
    } else {
      this.error(
        `unexpected token; ${this.current_token.type} ≠ ${token_types.join(
          ', '
        )}`
      );
    }
  }

  // expr   : term ((PLUS|MINUS) term)*;
  // term   : factor ((MUL|DIV) factor)*;
  // factor : NUMBER | LPAREN expr RPAREN;

  factor(): number {
    if (this.current_token.type === TokenType.LeftParen) {
      this.log('factor: (');
      this.tab();

      this.eat(TokenType.LeftParen);

      const result = this.expr();

      this.eat(TokenType.RightParen);

      this.untab();
      this.log('factor: )');

      return result;
    }

    const value = this.current_token.value;
    this.eat(TokenType.Number);

    this.log('factor: ', value);

    return value as number;
  }

  plusMinus(): TokenType.Plus | TokenType.Minus {
    const token_type = this.current_token.type;
    this.eat(TokenType.Plus, TokenType.Minus);

    this.log('plusMinus');
    this.log('-> ', token_type, '\n');

    return token_type as TokenType.Plus | TokenType.Minus;
  }

  multiplyDivide(): TokenType.Multiply | TokenType.Divide {
    const token_type = this.current_token.type;
    this.eat(TokenType.Multiply, TokenType.Divide);

    this.log('multiplyDivide');
    this.log('-> ', token_type, '\n');

    return token_type as TokenType.Multiply | TokenType.Divide;
  }

  term(): number {
    this.log('term');
    this.tab();

    let result = this.factor();

    while (
      [TokenType.Multiply, TokenType.Divide].includes(this.current_token.type)
    ) {
      const operation = this.multiplyDivide();

      result = this.perform_arithmetic(result, this.factor(), operation);
    }

    this.untab();
    this.log('->', result, '\n');

    return result;
  }

  expr(): number {
    this.log('expr');
    this.tab();

    let result = this.term();

    while (
      [TokenType.Plus, TokenType.Minus].includes(this.current_token.type)
    ) {
      const operation = this.plusMinus();

      result = this.perform_arithmetic(result, this.term(), operation);
    }

    this.untab();
    this.log('->', result, '\n');

    return result;
  }

  perform_arithmetic(
    left: number,
    right: number,
    operationType:
      | TokenType.Plus
      | TokenType.Minus
      | TokenType.Multiply
      | TokenType.Divide
  ): number {
    switch (operationType) {
      case TokenType.Plus:
        return left + right;
      case TokenType.Minus:
        return left - right;
      case TokenType.Multiply:
        return left * right;
      case TokenType.Divide:
        if (right === 0) {
          this.error('division by zero');
        }

        return left / right;
      default:
        this.error(`unknown operator ${operationType}`);
    }
  }
}
