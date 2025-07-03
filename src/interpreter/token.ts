export enum TokenType {
  Whitespace = 'Whitespace',
  Number = 'Number',
  Arithmetic = 'Arithmetic',
  EOF = 'EOF',
}

export enum ArithmeticType {
  Addition = 'Addition',
  Subtraction = 'Subtraction',
  Multiplication = 'Multiplication',
  Division = 'Division',
}

export class Token {
  type: TokenType;
  value: string | number;

  constructor(type: TokenType, value: string | number) {
    this.type = type;
    this.value = value;
  }

  toString(): string {
    return `(${this.type}, ${this.value})`;
  }
}
