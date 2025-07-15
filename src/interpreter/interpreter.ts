import { TokenType } from '../lexer/token';
import { AST, BinaryOp, Number, UnaryOp } from '../parser/ast';

export class Interpreter {
  ast: AST;

  current_node: AST;

  constructor(ast: AST) {
    this.ast = ast;
    this.current_node = ast;
  }

  error(msg = 'syntax error'): never {
    throw new Error(`${msg} @ ${this.current_node}`);
  }

  visit(node: AST): number {
    this.current_node = node;

    if (node instanceof UnaryOp) {
      return this.visit_unary_op(node);
    }

    if (node instanceof BinaryOp) {
      return this.visit_binary_op(node);
    }

    if (node instanceof Number) {
      return this.visit_number(node);
    }

    this.error(`Unknown node type: ${node.constructor.name}`);
  }

  interpret(): number {
    return this.visit(this.ast);
  }

  /*
    visitors
  */

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
