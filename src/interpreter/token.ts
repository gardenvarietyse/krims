export enum TokenType {
  Integer = 'Integer',
  Addition = 'Addition',
  EOF = 'EOF',
}

export class Token {
  type: TokenType;
  value: string | number;

  constructor(type: TokenType, value: string | number) {
    this.type = type;
    this.value = value;
  }

  toString(): string {
    return `Token(${this.type}, ${this.value})`;
  }
}
