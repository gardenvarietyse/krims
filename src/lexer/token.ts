export enum TokenType {
  SOF = 'SOF',
  Whitespace = 'Whitespace',
  Number = 'Number',
  Plus = 'Plus',
  Minus = 'Minus',
  Multiply = 'Multiply',
  Divide = 'Divide',
  Pow = 'Pow',
  LeftParen = 'LeftParen',
  RightParen = 'RightParen',
  EOF = 'EOF',
}

export type MathTokenType =
  | TokenType.Plus
  | TokenType.Minus
  | TokenType.Multiply
  | TokenType.Divide
  | TokenType.Pow;

export class Token {
  type: TokenType;
  value?: string | number;

  constructor(type: TokenType, value?: string | number) {
    this.type = type;
    this.value = value;
  }

  toString(): string {
    return `(${this.type}, ${this.value})`;
  }
}
