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

export class Interpreter {
  current_node?: AST;

  memory: Record<string, number> = {};

  write(identifier: string, value: number): void {
    this.memory[identifier] = value;
  }

  read(identifier: string): number {
    if (this.identifier_exists(identifier)) {
      return this.memory[identifier];
    }

    this.error(`Undeclared identifier ${identifier}`);
  }

  identifier_exists(identifier: string): boolean {
    return identifier in this.memory;
  }

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
    if (this.identifier_exists(node.identifier)) {
      this.error(`Identifier ${node.identifier} already exists`);
    }

    const identifier = node.identifier;
    const value = this.visit(node.value);

    this.write(identifier, value);

    return value;
  }

  visit_assignment(node: Assignment): number {
    if (!this.identifier_exists(node.identifier)) {
      this.error(`Undeclared identifier ${node.identifier}`);
    }

    const identifier = node.identifier;
    const value = this.visit(node.value);

    this.write(identifier, value);

    return value;
  }

  visit_read(node: Read): number {
    const identifier = node.identifier;

    return this.read(identifier);
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
