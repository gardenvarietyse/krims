import { TokenType } from '../lexer/token';
import {
  Assignment,
  AST,
  BinaryOp,
  Initialization,
  Number,
  Program,
  Read,
  UnaryOp,
} from '../parser/ast';
import { InterpreterMemory } from './memory';

export class Interpreter {
  memory: InterpreterMemory = new InterpreterMemory();
  current_node?: AST;

  error(msg = 'runtime error'): never {
    throw new Error(msg);
  }

  visit(node: AST): number {
    this.current_node = node;

    if (node instanceof UnaryOp) {
      return this.visit_unary_op(node);
    }

    if (node instanceof BinaryOp) {
      return this.visit_binary_op(node);
    }

    if (node instanceof Program) {
      return this.visit_program(node);
    }

    if (node instanceof Initialization) {
      return this.visit_initialization(node);
    }

    if (node instanceof Assignment) {
      return this.visit_assignment(node);
    }

    if (node instanceof Read) {
      return this.visit_read(node);
    }

    if (node instanceof Number) {
      return this.visit_number(node);
    }

    this.error(`Unknown node type: ${node.constructor.name}`);
  }

  interpret(ast: AST): number | undefined {
    return this.visit(ast);
  }

  /*
    visitors
  */

  visit_program(program: Program): number {
    let result: number = 0;

    for (const child of program.body) {
      result = this.visit(child);
    }

    return result;
  }

  visit_initialization(node: Initialization): number {
    const identifier = node.identifier;
    const value = this.visit(node.value);

    try {
      this.memory.insert(identifier, value);
    } catch (e) {
      this.error(`${e}`);
    }

    return value;
  }

  visit_assignment(node: Assignment): number {
    const identifier = node.identifier;
    const value = this.visit(node.value);

    try {
      this.memory.write(identifier, value);
    } catch (e) {
      this.error(`${e}`);
    }

    return value;
  }

  visit_read(node: Read): number {
    const identifier = node.identifier;

    let value: number;

    try {
      value = this.memory.read(identifier);
    } catch (e) {
      this.error(`${e}`);
    }

    return value;
  }

  visit_number(node: Number): number {
    return node.value;
  }

  visit_unary_op(node: UnaryOp): number {
    const operand_value = this.visit(node.operand);

    switch (node.operator) {
      case TokenType.Plus:
        return operand_value;
      case TokenType.Minus:
        return -operand_value;
      default:
        this.error(`Unknown unary operator: ${node.operator}`);
    }
  }

  visit_binary_op(node: BinaryOp): number {
    switch (node.operator) {
      case TokenType.Plus:
        return this.visit(node.left) + this.visit(node.right);
      case TokenType.Minus:
        return this.visit(node.left) - this.visit(node.right);
      case TokenType.Multiply:
        return this.visit(node.left) * this.visit(node.right);
      case TokenType.Divide:
        return this.visit(node.left) / this.visit(node.right);
      case TokenType.Pow:
        return Math.pow(this.visit(node.left), this.visit(node.right));
      default:
        this.error(`Unknown operator: ${node.operator}`);
    }
  }
}
