# Bhidu Lang Support (VS Code Extension)

This is the official Visual Studio Code extension for **bhidu-lang** — Mumbai's own local slang programming language written in TypeScript. It provides a rich set of editor features to make writing and debugging `.bhidu` files a premium and smooth experience.

---

## ⚡ Features

The extension provides comprehensive IDE support for the Bhidu Language:

1. **Syntax Highlighting**:
   * Color-codes all slang keywords (`chalu kar bhidu`, `bhidu ye hai`, `bhidu bolta hai`, `agar bhidu`, `jab tak bhidu`, etc.).
   * Highlights data types, boolean constants (`sahi bhidu`, `galat bhidu`, `khali bhidu`), double-quoted strings, operators, and number literals.
   * Full highlighting for comments (both standard double-slash `//` comments and slang comments starting with `apun bola:`).

2. **Real-Time Linter & Diagnostics**:
   * Runs the compiler in the background on every file edit or save.
   * Detects syntax and parser errors dynamically and displays red squiggles under offending tokens.
   * Hovering over the error reveals funny, local Mumbai slang compiler errors to help you debug with a smile!

3. **Code Formatting**:
   * Registers a VS Code Document Formatter for `bhidu` files.
   * Auto-indents blocks cleanly between curly braces `{ ... }` and block boundary keywords (e.g. `chalu kar bhidu` and `khatam bhidu`).
   * Trigger format instantly using standard shortcuts (e.g., `Shift + Option + F` on macOS or `Shift + Alt + F` on Windows).

4. **Branding & File Icon**:
   * Automatically maps `.bhidu` files to the custom language.
   * Renders the custom Bhidu glasses logo in your file explorer tree and editor tabs.

---

## 🛠️ Installation

You can install this extension manually from the packaged VSIX file inside the project root:

```bash
code --install-extension extension/bhidu-vscode-1.0.4.vsix
```

> [!IMPORTANT]
> Make sure to **fully reload or restart VS Code** after installing to ensure the bundled extension activates correctly.

---

## 🔗 Useful Links

* 💻 **GitHub Repository**: [github.com/ghostcompiler/bhidu-language](https://github.com/ghostcompiler/bhidu-language)
* 📖 **Documentation**: [ghostcompiler.github.io/bhidu-language/](https://ghostcompiler.github.io/bhidu-language/)
