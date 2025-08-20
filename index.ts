const { createInterface } = require('readline');

import { Interpreter } from './src/interpreter/interpreter';
import { Lexer } from './src/lexer/lexer';
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
  const interpreter = new Interpreter();

  while (true) {
    try {
      const input = await get_input('> ');

      if (!input.trim()) {
        continue;
      }

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);

      const ast = parser.parse();

      const result = interpreter.interpret(ast);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
};

main();
