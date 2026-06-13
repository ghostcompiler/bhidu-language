#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { tokenize } from "./lexer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";
import { Environment } from "./environment";

const version = "1.0.0";

function printHelp() {
  console.log(`
  Bhidu-Lang CLI v${version}
  
  Usage:
    bhidu run <file.bhidu>    Execute a .bhidu file
    bhidu ast <file.bhidu>    Print the Abstract Syntax Tree (AST) of a file
    bhidu repl                Start the interactive REPL
    bhidu help                Show this help message
    
  Example:
    bhidu run hello.bhidu
  `);
}

function runFile(filePath: string) {
  if (!filePath.endsWith(".bhidu")) {
    console.error("Kya re bhidu! File extension .bhidu hona chahiye!");
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Kya re bhidu! File '${filePath}' mil hi nahi rahi. Sahi path dal!`);
    process.exit(1);
  }

  const code = fs.readFileSync(absolutePath, "utf-8");
  try {
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter();
    interpreter.interpret(ast);
  } catch (error: any) {
    console.error(error.message || error);
    process.exit(1);
  }
}

function printAST(filePath: string) {
  if (!filePath.endsWith(".bhidu")) {
    console.error("Kya re bhidu! File extension .bhidu hona chahiye!");
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Kya re bhidu! File '${filePath}' mil hi nahi rahi.`);
    process.exit(1);
  }

  const code = fs.readFileSync(absolutePath, "utf-8");
  try {
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log(JSON.stringify(ast, null, 2));
  } catch (error: any) {
    console.error(error.message || error);
    process.exit(1);
  }
}

function runREPL() {
  console.log(`=========================================`);
  console.log(`   Bhidu-Lang Interactive REPL v${version}`);
  console.log(`   Sab chalta hai bhidu! Type '.exit' to exit.`);
  console.log(`=========================================`);
  console.log("chalu kar bhidu");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "bhidu> ",
  });

  const interpreter = new Interpreter();
  const persistentEnv = new Environment();

  rl.prompt();

  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (trimmed === ".exit") {
      console.log("khatam bhidu");
      rl.close();
      return;
    }

    if (!trimmed) {
      rl.prompt();
      return;
    }

    // Wrap the line in the entry/exit keywords so the parser accepts it
    const wrappedCode = `chalu kar bhidu\n${line}\nkhatam bhidu`;
    try {
      const tokens = tokenize(wrappedCode);
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      // Execute the parsed statements using the persistent environment
      interpreter.interpret(ast, persistentEnv);
    } catch (err: any) {
      console.error(err.message || err);
    }
    rl.prompt();
  });
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    runREPL();
    return;
  }

  const command = args[0];
  switch (command) {
    case "run":
      if (!args[1]) {
        console.error("Kya re bhidu! File name kaun daalega? Usage: bhidu run <file.bhidu>");
        process.exit(1);
      }
      runFile(args[1]);
      break;
    case "ast":
      if (!args[1]) {
        console.error("Kya re bhidu! File name kidhar hai? Usage: bhidu ast <file.bhidu>");
        process.exit(1);
      }
      printAST(args[1]);
      break;
    case "repl":
      runREPL();
      break;
    case "help":
    case "-h":
    case "--help":
      printHelp();
      break;
    default:
      // If the first argument is a file, run it directly (e.g. bhidu hello.bhidu)
      if (command.endsWith(".bhidu") || fs.existsSync(command)) {
        runFile(command);
      } else {
        console.error(`Kya re bhidu! '${command}' kaunsa command hai?`);
        printHelp();
        process.exit(1);
      }
      break;
  }
}

main();
