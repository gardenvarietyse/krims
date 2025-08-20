import { createInterface } from 'readline';
import fs from 'fs/promises';

import { Interpreter } from './src/interpreter/interpreter';
import { Lexer } from './src/lexer/lexer';
import { Parser } from './src/parser/parser';

const run_repl = async (interpreter: Interpreter) => {
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

const run_file = async (interpreter: Interpreter, file_path: string) => {
  const content = await fs.readFile(file_path, 'utf-8');

  const lexer = new Lexer(content);
  const parser = new Parser(lexer);

  const ast = parser.parse();
  const result = interpreter.interpret(ast);

  console.log(result);
};

const main = async () => {
  const interpreter = new Interpreter();

  var args = process.argv.slice(2);

  if (args.length > 0) {
    await run_file(interpreter, args[0]);
  } else {
    await run_repl(interpreter);
  }
};

main();
