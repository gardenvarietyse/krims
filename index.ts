const { createInterface } = require('readline');

import { Interpreter } from './src/interpreter/interpreter';
import { TokenType } from './src/interpreter/token';

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

      const interpreter = new Interpreter(input);
      const result = interpreter.expr();

      interpreter.eat(TokenType.EOF);

      console.log(result);
      console.log('');
    } catch (error) {
      console.error(error);
    }
  }
};

main();
