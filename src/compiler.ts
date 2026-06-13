import { ASTNode, ProgramNode } from "./types";

export class Compiler {
  compile(program: ProgramNode): string {
    return this.compileBlock(program.body);
  }

  private compileBlock(body: ASTNode[]): string {
    return body.map((stmt) => this.compileNode(stmt)).join("\n");
  }

  private compileNode(node: ASTNode): string {
    switch (node.type) {
      case "Program":
        return this.compileBlock(node.body);

      case "Block":
        return `{\n${this.compileBlock(node.body)}\n}`;

      case "VarDec": {
        const initVal = node.init !== null ? this.compileNode(node.init) : "null";
        return `let ${node.id} = ${initVal};`;
      }

      case "Assignment":
        return `${node.id} = ${this.compileNode(node.value)};`;

      case "Print": {
        const arg = this.compileNode(node.arguments[0]);
        return `bhiduRender(${arg});`;
      }

      case "If": {
        const test = this.compileNode(node.test);
        const consequent = this.compileNode(node.consequent);
        let alternate = "";
        if (node.alternate) {
          if (node.alternate.type === "If") {
            alternate = ` else ${this.compileNode(node.alternate)}`;
          } else {
            alternate = ` else ${this.compileNode(node.alternate)}`;
          }
        }
        return `if (${test}) ${consequent}${alternate}`;
      }

      case "While": {
        const test = this.compileNode(node.test);
        const body = this.compileNode(node.body);
        return `while (${test}) ${body}`;
      }

      case "Break":
        return "break;";

      case "Continue":
        return "continue;";

      case "ExpressionStatement":
        return `${this.compileNode(node.expression)};`;

      case "Literal":
        if (node.value === null) return "null";
        if (node.value === true) return "true";
        if (node.value === false) return "false";
        if (typeof node.value === "string") {
          return JSON.stringify(node.value);
        }
        return String(node.value);

      case "Identifier":
        return node.name;

      case "BinaryExpression":
        return `(${this.compileNode(node.left)} ${node.operator} ${this.compileNode(node.right)})`;

      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }
}
