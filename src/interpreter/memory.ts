export class InterpreterMemory {
  private memory: Record<string, number> = {};

  insert(identifier: string, value: number): void {
    if (this.identifier_exists(identifier)) {
      throw new Error(`Identifier ${identifier} already declared`);
    }

    this.memory[identifier] = value;
  }

  write(identifier: string, value: number): void {
    if (!this.identifier_exists(identifier)) {
      throw new Error(`Undeclared identifier ${identifier}`);
    }

    this.memory[identifier] = value;
  }

  read(identifier: string): number {
    if (this.identifier_exists(identifier)) {
      return this.memory[identifier];
    }

    throw new Error(`Undeclared identifier ${identifier}`);
  }

  identifier_exists(identifier: string): boolean {
    return identifier in this.memory;
  }
}
