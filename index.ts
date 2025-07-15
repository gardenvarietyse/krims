const { createInterface } = require('readline');

import { Interpreter } from './src/interpreter/interpreter';
import { Lexer } from './src/lexer/lexer';
import { TokenType } from './src/lexer/token';
import { Parser } from './src/parser/parser';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const get_input = (prompt: string) =>
  new Promise<string>((resolve) => {
    rl.question(prompt, (input: string) => {
      resolve(input);
    });
  });

const main = async () => {
  while (true) {
    try {
      const input = await get_input('> ');

      if (!input.trim()) {
        continue;
      }

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);

      const result = parser.parse();
      parser.eat(TokenType.EOF);

      console.log('\nresult:\n');
      console.log(result);
      console.log('');
    } catch (error) {
      console.error(error);
    }
  }
};

main();
