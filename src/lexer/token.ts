export enum TokenType {
  Whitespace = 'Whitespace',
  Newline = 'Newline',

  Semicolon = 'Semicolon',

  KeywordLet = 'KeywordLet',
  Identifier = 'Identifier',
  Number = 'Number',

  Plus = 'Plus',
  Minus = 'Minus',
  Multiply = 'Multiply',
  Divide = 'Divide',
  Pow = 'Pow',
  Equals = 'Equals',

  LeftParen = 'LeftParen',
  RightParen = 'RightParen',

  SOF = 'SOF',
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
