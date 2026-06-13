export class Environment {
  private variables: Map<string, any> = new Map();
  private parent: Environment | null = null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  /**
   * Declare a new variable in the current scope.
   */
  declare(name: string, value: any, line: number): void {
    if (this.variables.has(name)) {
      throw new Error(
        `Kya re bhidu! Line ${line} pe error: Ye '${name}' variable pehle se bana chuka hai tu!`
      );
    }
    this.variables.set(name, value);
  }

  /**
   * Assign a new value to an existing variable, searching up the scope chain.
   */
  assign(name: string, value: any, line: number): void {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return;
    }

    if (this.parent) {
      this.parent.assign(name, value, line);
      return;
    }

    throw new Error(
      `Kya re bhidu! Line ${line} pe error: Ye '${name}' variable kidhar se laya? Pehle declare toh kar ('bhidu ye hai ${name} = ...')!`
    );
  }

  /**
   * Look up a variable's value, searching up the scope chain.
   */
  lookup(name: string, line: number): any {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }

    if (this.parent) {
      return this.parent.lookup(name, line);
    }

    throw new Error(
      `Kya re bhidu! Line ${line} pe error: Ye '${name}' variable kidhar se laya? Pehle declare toh kar!`
    );
  }
}
