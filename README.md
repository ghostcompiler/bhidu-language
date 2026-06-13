<p align="center">
  <img src="https://res.cloudinary.com/djgvfl1tv/image/upload/v1780666791/logo_mqnqn4.png" alt="Bhidu Language" width="180">
</p>

<h1 align="center">Bhidu Language</h1>

<p align="center">
  A premium, feature-rich toy programming language written in TypeScript with Mumbai local slang, featuring a custom lexer, recursive-descent parser, nested environment scoping, CLI, and an interactive REPL.
</p>
---

## 📜 Table of Contents

- [Features](#-features)
- [Keywords Dictionary](#-keywords-dictionary)
- [Syntax Guide](#-syntax-guide)
  - [Variables](#variables)
  - [Control Flow](#control-flow)
  - [Loops](#loops)
  - [Printing](#printing)
- [Installation](#-installation)
- [Usage](#-usage)
  - [Running a file](#1-running-a-file)
  - [Interactive REPL](#2-interactive-repl)
  - [Printing AST](#3-printing-ast)
- [Testing](#-testing)

---

## ⚡ Features

- **Slang syntax**: Fully custom slang parser (e.g., `chalu kar bhidu` for entry, `bas kar bhidu` for break).
- **Interactive REPL**: Write and evaluate statements line-by-line using a persistent environment scope.
- **Nested Scoping**: Declare shadowing variables inside loops or custom blocks `{ ... }`.
- **Slang Errors**: Clear, funny, localized error messages when syntax or runtimes break (e.g. division by zero).

---

## 📖 Keywords Dictionary


| Bhidu Slang             | JS/TS Equivalent   | Description                     |
| ----------------------- | ------------------ | ------------------------------- |
| `chalu kar bhidu`       | *(entry)*          | Start of the program            |
| `khatam bhidu`          | *(exit)*           | End of the program              |
| `bhidu ye hai`          | `let` / `var`      | Variable declaration            |
| `sahi bhidu`            | `true`             | Boolean True                    |
| `galat bhidu`           | `false`            | Boolean False                   |
| `khali bhidu`           | `null`             | Null/empty value                |
| `bhidu bolta hai(...)`  | `console.log(...)` | Print to stdout                 |
| `agar bhidu(...)`       | `if(...)`          | Conditional Block               |
| `warna agar bhidu(...)` | `else if(...)`     | Else If Block                   |
| `warna bhidu`           | `else`             | Else Block                      |
| `jab tak bhidu(...)`    | `while(...)`       | Loop Block                      |
| `bas kar bhidu`         | `break`            | Exit loop immediately           |
| `agli baar bhidu`       | `continue`         | Skip to the next loop iteration |


---

## 📝 Syntax Guide

### Variables

Declare variables using `bhidu ye hai` and assign values using `=`. Semicolons are mandatory re bhidu!

```bhidu
chalu kar bhidu
  bhidu ye hai naam = "Jackie Shroff";
  bhidu ye hai age = 69;
  age = 70; // Reassignment
khatam bhidu
```

### Control Flow

Supports `agar bhidu` (if), `warna agar bhidu` (else if), and `warna bhidu` (else) blocks:

```bhidu
chalu kar bhidu
  bhidu ye hai temper = 90;
  agar bhidu (temper > 100) {
    bhidu bolta hai("Ekdum gussa!");
  } warna agar bhidu (temper > 50) {
    bhidu bolta hai("Chill hai bhidu");
  } warna bhidu {
    bhidu bolta hai("Thanda!");
  }
khatam bhidu
```

### Loops

Supports while loop `jab tak bhidu` with loop control keywords `bas kar bhidu` (break) and `agli baar bhidu` (continue):

```bhidu
chalu kar bhidu
  bhidu ye hai i = 0;
  jab tak bhidu (i < 5) {
    i = i + 1;
    agar bhidu (i == 3) {
      agli baar bhidu; // skip 3
    }
    bhidu bolta hai("Counter: " + i);
  }
khatam bhidu
```

### Printing

Print strings, variables, or expressions to the console using `bhidu bolta hai(...)`:

```bhidu
chalu kar bhidu
  bhidu bolta hai("Apun ka code mast chalta hai!");
khatam bhidu
```

---

## 🛠️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/bhidu-lang.git
cd bhidu-lang
npm install
```

Build the compiler:

```bash
npm run build
```

---

## 🎮 Usage

Once globally installed (`npm install -g bhidu-lang`) or linked locally (`npm link`), you can execute `bhidu` directly from anywhere in your terminal.

### CLI Command Reference

Here is the complete list of all commands supported by the `bhidu` compiler CLI:

| Command Syntax | Description | Usage Example |
| :--- | :--- | :--- |
| `bhidu run <file.bhidu>` | Execute a `.bhidu` script file directly in the console. | `bhidu run test.bhidu` |
| `bhidu repl` or `bhidu` | Start the interactive REPL shell to run statements line-by-line. | `bhidu repl` |
| `bhidu ast <file.bhidu>` | Print the parsed Abstract Syntax Tree (AST) as structured JSON. | `bhidu ast test.bhidu` |
| `bhidu hagde [project-name]` | Scaffold a new project structure (`public/`, `components/`, `pages/`, `index.bhidu`). Prompts if name is omitted. | `bhidu hagde my-web-app` |
| `bhidu shuru hoja [file.bhidu]` | Start the live-reloading Dev Server on port 3000 with static asset resolution. | `bhidu shuru hoja` |
| `bhidu faad de [file.bhidu]` | Compile the application to a production-ready static HTML bundle in `out/`. | `bhidu faad de` |
| `bhidu help` | Display the helper menu with CLI commands. | `bhidu help` |

---

### 1. Running a `.bhidu` Script

Write your code inside a `.bhidu` file (e.g. `program.bhidu`) and execute it directly:

```bash
# Global execution
bhidu run program.bhidu

# Alternatively, run from file directly
bhidu program.bhidu

# Local development execution
node dist/cli.js run program.bhidu
npx ts-node src/cli.ts run program.bhidu
```

### 2. Interactive REPL (Slang Shell)

Enter the interactive playground shell to run statements line-by-line:

```bash
# Global execution
bhidu repl
# or just:
bhidu

# Local development execution
node dist/cli.js repl
```

```text
=========================================
   Bhidu-Lang Interactive REPL v1.0.2
   Sab chalta hai bhidu! Type '.exit' to exit.
=========================================
chalu kar bhidu
bhidu> bhidu ye hai x = 15;
bhidu> bhidu bolta hai("Value: " + (x * 2));
Value: 30
bhidu> .exit
khatam bhidu
```

### 3. Debugging the AST (Abstract Syntax Tree)

Parse your slang code and print the compiled JSON AST nodes for debugging:

```bash
# Global execution
bhidu ast program.bhidu

# Local development execution
node dist/cli.js ast program.bhidu
```

### 4. Bhidu Web Framework (Local Dev & Production Build)

You can bootstrap, build, and run interactive web applications inside the browser using `.bhidu` slang code!

- **Scaffold a Project**:
  ```bash
  bhidu hagde
  ```
  - Bootstraps a complete folder structure:
    - `public/`: For static assets (such as images, icons, CSS).
    - `components/`: For modular reusable components.
    - `pages/`: For page views.
  - Copies the default branding logo into `public/logo.png`.
  - Creates a premium dark-themed homepage entry at `index.bhidu`.

- **Start Hot-Reloading Dev Server**:
  ```bash
  bhidu shuru hoja [file.bhidu]
  ```
  - Launches a local development server at `http://localhost:3000`.
  - Serves static assets directly from the `public/` folder (e.g. `/logo.png` resolves to `public/logo.png`).
  - Automatically watches the entry file for changes and performs a **Hot Refresh** on the page.
  - If syntax errors occur, it displays a premium **Red Screen Slang Error Overlay** in Mumbai local slang to help you debug quickly!

- **Compile & Build for Production**:
  ```bash
  bhidu faad de [file.bhidu]
  ```
  - Transpiles `.bhidu` code to standard static HTML/JS.
  - Generates a standalone production output folder named `out/` (e.g. `out/index.html`).
  - Recursively copies all static assets from `public/` into `out/` (e.g. copying `public/logo.png` to `out/logo.png`), making the build ready to deploy to GitHub Pages, Netlify, Vercel, or any static provider.

#### ⚡ Reactive State & Effects
The Bhidu Web Framework features a built-in client-side reactive state and side-effects system:
* **Reactive State**: Any variable declared using `bhidu ye hai` maintains state across page renders. You can trigger updates and re-renders by calling `bhiduSetState('variableName', newValue)` inside your HTML handlers (e.g. `onclick`).
* **Reactive Effects**: Run side effects using `bhiduEffect(callback, dependencies)` inside your code (similar to React's `useEffect`).
* **Component CSS Auto-Bundling**: Any `.css` stylesheet files placed in your project directories (`public/`, `components/`, or `pages/`) are automatically detected, bundled, and injected directly into the compiled HTML page's `<head>`.

---

## 💻 VS Code IDE Extension

`bhidu-lang` comes with a dedicated VS Code extension providing:
* **Syntax Highlighting**: Beautiful color-coding for all slang keywords.
* **Document Formatting**: Formats your code cleanly with standard indentation.
* **Real-time Diagnostics (Linter)**: Displays red squiggly lines in the editor on syntax errors with Mumbai slang error messages in real-time as you write!

### Install Extension
Install the extension package from the workspace root:
```bash
code --install-extension extension/bhidu-vscode-1.0.2.vsix
```

---

## 🧪 Testing

Run the automated test suite powered by **Vitest**:

```bash
npm run test
```

