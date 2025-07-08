export enum TokenType {
  SOF = 'SOF',
  Whitespace = 'Whitespace',
  Number = 'Number',
  Plus = 'Plus',
  Minus = 'Minus',
  Multiply = 'Multiply',
  Divide = 'Divide',
  EOF = 'EOF',
}

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
