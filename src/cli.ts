#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { tokenize } from "./lexer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";
import { Environment } from "./environment";
import { startDevServer, generateHTML } from "./server";

const version = "1.0.1";

function printHelp() {
  console.log(`
  Bhidu-Lang CLI v${version}
  
  Usage:
    bhidu run <file.bhidu>    Execute a .bhidu file
    bhidu ast <file.bhidu>    Print the Abstract Syntax Tree (AST) of a file
    bhidu repl                Start the interactive REPL
    bhidu shuru hoja [file]   Start the live-reloading Dev Server (default: index.bhidu)
    bhidu faad de [file]      Compile project to a static HTML page in out/ (default: index.bhidu)
    bhidu help                Show this help message
    
  Example:
    bhidu shuru hoja
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

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function getLogoSource(): string | null {
  const pkgLogo = path.join(__dirname, "..", "docs", "logo.png");
  if (fs.existsSync(pkgLogo)) {
    return pkgLogo;
  }
  const localLogo = path.resolve("docs/logo.png");
  if (fs.existsSync(localLogo)) {
    return localLogo;
  }
  return null;
}

async function main() {
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
    case "shuru": {
      if (args[1] !== "hoja") {
        console.error("Kya re bhidu! 'shuru' ke baad 'hoja' likhna bhool gaya? Usage: bhidu shuru hoja [file.bhidu]");
        process.exit(1);
      }
      const devFile = args[2] || "index.bhidu";
      const TEMPLATE_CODE = `chalu kar bhidu
  bhidu bolta hai("<div style='text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 0 auto;'>");
  bhidu bolta hai("  <img src='logo.png' alt='logo' style='width: 120px; height: 120px; border-radius: 20px; margin-bottom: 2rem; border: 3px solid #8ee43f; box-shadow: 0 0 35px rgba(142, 228, 63, 0.4); object-fit: cover;'>");
  bhidu bolta hai("  <h1 style='font-size: 3.2rem; font-weight: 800; background: linear-gradient(135deg, #ffffff 40%, #8ee43f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-top: 0; margin-bottom: 0.5rem; letter-spacing: -1px;'>Bhidu App</h1>");
  bhidu bolta hai("  <p style='font-size: 1.25rem; color: #9ca3af; margin-bottom: 3rem; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto;'>Bole toh ekdum solid local web app re bhidu! HTML preview is fully ready on localhost. 🕶️</p>");
  bhidu bolta hai("  <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; text-align: left; max-width: 800px; width: 100%; margin: 0 auto 3rem;'>");
  bhidu bolta hai("    <div style='background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.5rem;'>");
  bhidu bolta hai("      <h3 style='color: #8ee43f; margin-top: 0; margin-bottom: 0.5rem; font-size: 1.15rem;'>📁 Get Started</h3>");
  bhidu bolta hai("      <p style='color: #9ca3af; font-size: 0.95rem; margin: 0; line-height: 1.5;'>Start editing <strong>index.bhidu</strong> or place files inside <strong>pages/</strong> to see changes refresh.</p>");
  bhidu bolta hai("    </div>");
  bhidu bolta hai("    <div style='background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.5rem;'>");
  bhidu bolta hai("      <h3 style='color: #8ee43f; margin-top: 0; margin-bottom: 0.5rem; font-size: 1.15rem;'>🔗 GitHub Repo</h3>");
  bhidu bolta hai("      <p style='color: #9ca3af; font-size: 0.95rem; margin: 0; line-height: 1.5;'>Check out the compiler code and give it a star: <a href=\\"https://github.com/ghostcompiler/bhidu-language\\" target=\\"_blank\\" style='color: #8ee43f; text-decoration: none; font-weight: 600;'>ghostcompiler/bhidu-language</a></p>");
  bhidu bolta hai("    </div>");
  bhidu bolta hai("  </div>");
  bhidu bolta hai("  <div style='display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;'>");
  bhidu bolta hai("    <span style='font-family: monospace; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; color: #b6f376;'>dev: bhidu shuru hoja</span>");
  bhidu bolta hai("    <span style='font-family: monospace; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; color: #b6f376;'>build: bhidu faad de</span>");
  bhidu bolta hai("  </div>");
  bhidu bolta hai("</div>");
khatam bhidu
`;

        if (!fs.existsSync(devFile)) {
          console.log(`⚠️ '${devFile}' file nahi mili. Apun ek basic index.bhidu bana raha hai re!`);
          
          // Generate public directory and copy logo if not exists
          const publicDir = path.resolve("public");
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
          }
          const logoSrc = getLogoSource();
          if (logoSrc && !fs.existsSync(path.join(publicDir, "logo.png"))) {
            fs.copyFileSync(logoSrc, path.join(publicDir, "logo.png"));
          }
          
          fs.writeFileSync(devFile, TEMPLATE_CODE);
        }
        startDevServer(devFile, 3000);
      }
      break;
    case "faad": {
      if (args[1] !== "de") {
        console.error("Kya re bhidu! 'faad' ke baad 'de' likhna bhool gaya? Usage: bhidu faad de [file.bhidu]");
        process.exit(1);
      }
      const buildFile = args[2] || "index.bhidu";
      if (!fs.existsSync(buildFile)) {
        console.error(`Kya re bhidu! Build file '${buildFile}' mil hi nahi rahi!`);
        process.exit(1);
      }
      
      console.log(`⚙️ Building project from '${buildFile}'...`);
      try {
        const buildHtml = generateHTML(buildFile, false);
        const outDir = path.resolve("out");
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir);
        }
        
        fs.writeFileSync(path.join(outDir, "index.html"), buildHtml);
        
        // Copy logo from public/ to out/ if exists
        const publicLogo = path.join("public", "logo.png");
        if (fs.existsSync(publicLogo)) {
          fs.copyFileSync(publicLogo, path.join(outDir, "logo.png"));
        } else {
          // Fallback: copy from docs/logo.png
          const docsLogo = path.resolve("docs/logo.png");
          if (fs.existsSync(docsLogo)) {
            fs.copyFileSync(docsLogo, path.join(outDir, "logo.png"));
          }
        }

        // Copy entire public/ folder to out/ recursively if it exists
        const publicDir = path.resolve("public");
        if (fs.existsSync(publicDir)) {
          fs.cpSync(publicDir, outDir, { recursive: true });
        }
        
        console.log(`✨ Project compiled and built successfully inside out/!`);
        console.log(`📁 View production output: out/index.html`);
      } catch (err: any) {
        console.error(`❌ Build failure: ${err.message || err}`);
        process.exit(1);
      }
      break;
    }
    case "hagde": {
      let projectName = args[1];
      if (!projectName) {
        projectName = await askQuestion("bhidu is project ka naam kya rkhna h wo to bta: ");
        if (!projectName) {
          projectName = "bhidu-app";
        }
      }

      // Start scaffolding
      try {
        const projectDir = path.resolve(projectName);
        const publicDir = path.join(projectDir, "public");
        const componentsDir = path.join(projectDir, "components");
        const pagesDir = path.join(projectDir, "pages");

        if (!fs.existsSync(projectDir)) {
          fs.mkdirSync(projectDir, { recursive: true });
        }
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir);
        if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir);

        // Copy logo
        const logoSrc = getLogoSource();
        if (logoSrc) {
          fs.copyFileSync(logoSrc, path.join(publicDir, "logo.png"));
        }

        const TEMPLATE_CODE = `chalu kar bhidu
  bhidu bolta hai("<div style='text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 0 auto;'>");
  bhidu bolta hai("  <img src='logo.png' alt='logo' style='width: 120px; height: 120px; border-radius: 20px; margin-bottom: 2rem; border: 3px solid #8ee43f; box-shadow: 0 0 35px rgba(142, 228, 63, 0.4); object-fit: cover;'>");
  bhidu bolta hai("  <h1 style='font-size: 3.2rem; font-weight: 800; background: linear-gradient(135deg, #ffffff 40%, #8ee43f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-top: 0; margin-bottom: 0.5rem; letter-spacing: -1px;'>Bhidu App</h1>");
  bhidu bolta hai("  <p style='font-size: 1.25rem; color: #9ca3af; margin-bottom: 3rem; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto;'>Bole toh ekdum solid local web app re bhidu! HTML preview is fully ready on localhost. 🕶️</p>");
  bhidu bolta hai("  <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; text-align: left; max-width: 800px; width: 100%; margin: 0 auto 3rem;'>");
  bhidu bolta hai("    <div style='background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.5rem;'>");
  bhidu bolta hai("      <h3 style='color: #8ee43f; margin-top: 0; margin-bottom: 0.5rem; font-size: 1.15rem;'>📁 Get Started</h3>");
  bhidu bolta hai("      <p style='color: #9ca3af; font-size: 0.95rem; margin: 0; line-height: 1.5;'>Start editing <strong>index.bhidu</strong> or place files inside <strong>pages/</strong> to see changes refresh.</p>");
  bhidu bolta hai("    </div>");
  bhidu bolta hai("    <div style='background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.5rem;'>");
  bhidu bolta hai("      <h3 style='color: #8ee43f; margin-top: 0; margin-bottom: 0.5rem; font-size: 1.15rem;'>🔗 GitHub Repo</h3>");
  bhidu bolta hai("      <p style='color: #9ca3af; font-size: 0.95rem; margin: 0; line-height: 1.5;'>Check out the compiler code and give it a star: <a href=\\"https://github.com/ghostcompiler/bhidu-language\\" target=\\"_blank\\" style='color: #8ee43f; text-decoration: none; font-weight: 600;'>ghostcompiler/bhidu-language</a></p>");
  bhidu bolta hai("    </div>");
  bhidu bolta hai("  </div>");
  bhidu bolta hai("  <div style='display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;'>");
  bhidu bolta hai("    <span style='font-family: monospace; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; color: #b6f376;'>dev: bhidu shuru hoja</span>");
  bhidu bolta hai("    <span style='font-family: monospace; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem; color: #b6f376;'>build: bhidu faad de</span>");
  bhidu bolta hai("  </div>");
  bhidu bolta hai("</div>");
khatam bhidu
`;

        // Create READMEs
        fs.writeFileSync(
          path.join(componentsDir, "README.md"),
          `# Components Folder\n\nPlace your modular components here re bhidu!\n`
        );
        fs.writeFileSync(
          path.join(pagesDir, "README.md"),
          `# Pages Folder\n\nPlace your page scripts and routing resources here re bhidu!\n`
        );

        // Create index.bhidu
        fs.writeFileSync(path.join(projectDir, "index.bhidu"), TEMPLATE_CODE);

        const absoluteProjectDir = path.resolve(projectDir);
        console.log(`\nCreating a new Bhidu app in \x1b[1m\x1b[32m${absoluteProjectDir}\x1b[0m.\n`);
        console.log(`Initializing project...`);
        console.log(`  \x1b[36m✔\x1b[0m Creating project directory: \x1b[90m${projectName}/\x1b[0m`);
        console.log(`  \x1b[36m✔\x1b[0m Creating subfolders: \x1b[90mpublic/, components/, pages/\x1b[0m`);
        console.log(`  \x1b[36m✔\x1b[0m Creating entry file: \x1b[90m${projectName}/index.bhidu\x1b[0m`);
        console.log(`  \x1b[36m✔\x1b[0m Copying brand assets: \x1b[90mpublic/logo.png\x1b[0m`);
        console.log(`  \x1b[36m✔\x1b[0m Writing folder documentation: \x1b[90mcomponents/README.md, pages/README.md\x1b[0m`);
        
        console.log(`\n\x1b[1m\x1b[32mSuccess!\x1b[0m Created \x1b[1m${projectName}\x1b[0m at \x1b[32m${absoluteProjectDir}\x1b[0m\n`);
        console.log(`Inside that directory, you can run several commands:\n`);
        console.log(`  \x1b[1mbhidu shuru hoja\x1b[0m`);
        console.log(`    Starts the live-reloading development server.\n`);
        console.log(`  \x1b[1mbhidu faad de\x1b[0m`);
        console.log(`    Builds the production-ready static HTML bundle.\n`);
        console.log(`We suggest that you begin by typing:\n`);
        console.log(`  \x1b[36mcd\x1b[0m ${projectName}`);
        console.log(`  \x1b[36mbhidu shuru hoja\x1b[0m\n`);
        console.log(`🕶️  \x1b[1mHappy coding, bhidu!\x1b[0m\n`);
      } catch (err: any) {
        console.error(`❌ Scaffolding failed: ${err.message || err}`);
        process.exit(1);
      }
      break;
    }
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
