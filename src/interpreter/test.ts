const ArithmeticOperatorRegex = /[+\-*/]/;
const WhitespaceRegex = /[\t\f\cK ]/;

export const is_digit = (char: string) => /\d/.test(char);
export const is_number = (char: string) => is_digit(char) || char === '.';
export const is_whitespace = (char: string) => WhitespaceRegex.test(char);
export const is_arithmetic_operator = (char: string) =>
  ArithmeticOperatorRegex.test(char);
export const is_left_paren = (char: string) => char === '(';
export const is_right_paren = (char: string) => char === ')';
export const is_pow = (char: string) => char === '^';
