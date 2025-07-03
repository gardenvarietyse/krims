export const is_digit = (char: string) => /\d/.test(char);
export const is_number = (char: string) => is_digit(char) || char === '.';
