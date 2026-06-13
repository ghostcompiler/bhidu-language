import { describe, it, expect } from "vitest";
import { tokenize } from "../src/lexer";
import { Parser } from "../src/parser";
import { Interpreter } from "../src/interpreter";

describe("Bhidu Lang Lexer", () => {
  it("should tokenize keywords and identifiers", () => {
    const code = `chalu kar bhidu
      bhidu ye hai a = 10;
      bhidu bolta hai(a);
    khatam bhidu`;
    const tokens = tokenize(code);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0].type).toBe("CHALU_KAR_BHIDU");
  });

  it("should throw error on invalid character", () => {
    expect(() => tokenize("chalu kar bhidu @ khatam bhidu")).toThrow("pe kuch alag hi dikh raha hai");
  });
});

describe("Bhidu Lang Parser", () => {
  it("should parse variables and print statements", () => {
    const code = `chalu kar bhidu
      bhidu ye hai a = 10;
      bhidu bolta hai(a);
    khatam bhidu`;
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.type).toBe("Program");
    expect(ast.body.length).toBe(2);
    expect(ast.body[0].type).toBe("VarDec");
  });

  it("should throw error on missing program entry point", () => {
    const code = `bhidu ye hai a = 10;
    khatam bhidu`;
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    expect(() => parser.parse()).toThrow("Program chalu karne ke liye");
  });
});

describe("Bhidu Lang Interpreter", () => {
  const runCode = (code: string): string[] => {
    const outputs: string[] = [];
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter((msg) => outputs.push(msg));
    interpreter.interpret(ast);
    return outputs;
  };

  it("should run basic arithmetic and variables", () => {
    const code = `chalu kar bhidu
      bhidu ye hai a = 10;
      bhidu ye hai b = 20;
      bhidu bolta hai(a + b);
      bhidu bolta hai(a - b);
      bhidu bolta hai(a * b);
      bhidu bolta hai(b / a);
      bhidu bolta hai(b % 3);
    khatam bhidu`;
    const outputs = runCode(code);
    expect(outputs).toEqual(["30", "-10", "200", "2", "2"]);
  });

  it("should evaluate booleans and nulls correctly", () => {
    const code = `chalu kar bhidu
      bhidu ye hai t = sahi bhidu;
      bhidu ye hai f = galat bhidu;
      bhidu ye hai n = khali bhidu;
      bhidu bolta hai(t);
      bhidu bolta hai(f);
      bhidu bolta hai(n);
    khatam bhidu`;
    const outputs = runCode(code);
    expect(outputs).toEqual(["sahi bhidu", "galat bhidu", "khali bhidu"]);
  });

  it("should support if-else-if-else conditions", () => {
    const code = `chalu kar bhidu
      bhidu ye hai x = 15;
      agar bhidu (x > 20) {
        bhidu bolta hai("x is greater than 20");
      } warna agar bhidu (x > 10) {
        bhidu bolta hai("x is greater than 10");
      } warna bhidu {
        bhidu bolta hai("x is small");
      }
    khatam bhidu`;
    const outputs = runCode(code);
    expect(outputs).toEqual(["x is greater than 10"]);
  });

  it("should support while loops with break and continue", () => {
    const code = `chalu kar bhidu
      bhidu ye hai i = 0;
      jab tak bhidu (i < 5) {
        i = i + 1;
        agar bhidu (i == 2) {
          agli baar bhidu;
        }
        agar bhidu (i == 4) {
          bas kar bhidu;
        }
        bhidu bolta hai(i);
      }
    khatam bhidu`;
    const outputs = runCode(code);
    expect(outputs).toEqual(["1", "3"]);
  });

  it("should throw division by zero error", () => {
    const code = `chalu kar bhidu
      bhidu ye hai x = 10 / 0;
    khatam bhidu`;
    expect(() => runCode(code)).toThrow("Zero (0) se divide kar raha hai");
  });

  it("should support nested scopes for variables", () => {
    const code = `chalu kar bhidu
      bhidu ye hai a = 10;
      {
        bhidu ye hai a = 20;
        bhidu bolta hai(a);
      }
      bhidu bolta hai(a);
    khatam bhidu`;
    const outputs = runCode(code);
    expect(outputs).toEqual(["20", "10"]);
  });
});
