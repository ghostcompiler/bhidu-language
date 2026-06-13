import {
  ASTNode,
  ProgramNode,
  BlockNode,
  VarDecNode,
  AssignNode,
  PrintNode,
  IfNode,
  WhileNode,
  BreakNode,
  ContinueNode,
  BinaryExpressionNode,
  LiteralNode,
  IdentifierNode,
} from "./types";
import { Environment } from "./environment";

class BreakException extends Error {}
class ContinueException extends Error {}

export class Interpreter {
  private outputWriter: (msg: string) => void;

  constructor(outputWriter: (msg: string) => void = console.log) {
    this.outputWriter = outputWriter;
  }

  interpret(program: ProgramNode, env: Environment = new Environment()): void {
    try {
      this.executeBlock(program.body, env);
    } catch (err) {
      if (err instanceof BreakException) {
        throw new Error(
          `Kya re bhidu! Line ${err.message || "unknown"} pe error: Loop ke bahar break ('bas kar bhidu') kis khushi mein likha hai?`
        );
      }
      if (err instanceof ContinueException) {
        throw new Error(
          `Kya re bhidu! Line ${err.message || "unknown"} pe error: Loop ke bahar continue ('agli baar bhidu') nahi chalta re!`
        );
      }
      throw err;
    }
  }

  private executeBlock(body: ASTNode[], env: Environment): void {
    for (const stmt of body) {
      this.execute(stmt, env);
    }
  }

  private execute(node: ASTNode, env: Environment): void {
    switch (node.type) {
      case "Program":
        this.executeBlock(node.body, env);
        break;

      case "Block": {
        const blockEnv = new Environment(env);
        this.executeBlock(node.body, blockEnv);
        break;
      }

      case "VarDec": {
        const initVal = node.init !== null ? this.evaluate(node.init, env) : null;
        env.declare(node.id, initVal, node.line);
        break;
      }

      case "Assignment": {
        const val = this.evaluate(node.value, env);
        env.assign(node.id, val, node.line);
        break;
      }

      case "Print": {
        const output = node.arguments
          .map((arg) => {
            const v = this.evaluate(arg, env);
            if (v === null) return "khali bhidu";
            if (v === true) return "sahi bhidu";
            if (v === false) return "galat bhidu";
            return String(v);
          })
          .join(" ");
        this.outputWriter(output);
        break;
      }

      case "If": {
        const testVal = this.evaluate(node.test, env);
        if (testVal) {
          this.execute(node.consequent, env);
        } else if (node.alternate) {
          this.execute(node.alternate, env);
        }
        break;
      }

      case "While": {
        while (true) {
          // Re-evaluate test condition inside the loop
          const testVal = this.evaluate(node.test, env);
          if (!testVal) break;

          try {
            this.execute(node.body, env);
          } catch (err) {
            if (err instanceof BreakException) {
              break;
            }
            if (err instanceof ContinueException) {
              continue;
            }
            throw err;
          }
        }
        break;
      }

      case "Break": {
        const breakErr = new BreakException();
        breakErr.message = String(node.line);
        throw breakErr;
      }

      case "Continue": {
        const contErr = new ContinueException();
        contErr.message = String(node.line);
        throw contErr;
      }

      case "ExpressionStatement":
        this.evaluate(node.expression, env);
        break;

      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  private evaluate(node: ASTNode, env: Environment): any {
    switch (node.type) {
      case "Literal":
        return node.value;

      case "Identifier":
        return env.lookup(node.name, node.line);

      case "BinaryExpression": {
        const leftVal = this.evaluate(node.left, env);
        const rightVal = this.evaluate(node.right, env);
        return this.evaluateBinary(node.operator, leftVal, rightVal, node.line);
      }

      default:
        throw new Error(`Unknown expression node type: ${(node as any).type}`);
    }
  }

  private evaluateBinary(
    operator: string,
    left: any,
    right: any,
    line: number
  ): any {
    switch (operator) {
      // Arithmetic
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) {
          throw new Error(
            `Kya re bhidu! Line ${line} pe error: Zero (0) se divide kar raha hai? Dhandha bandh karwayega kya!`
          );
        }
        return left / right;
      case "%":
        return left % right;

      // Comparisons
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<":
        return left < right;
      case "<=":
        return left <= right;
      case ">":
        return left > right;
      case ">=":
        return left >= right;

      // Logical
      case "&&":
        return left && right;
      case "||":
        return left || right;

      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }
}
