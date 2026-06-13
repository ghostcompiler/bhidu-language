import * as vscode from "vscode";
import { tokenize } from "../../src/lexer";
import { Parser } from "../../src/parser";

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection("bhidu-lang");
  context.subscriptions.push(diagnosticCollection);

  // Run diagnostics when document is opened or changed
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateDiagnostics(editor.document, diagnosticCollection);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      updateDiagnostics(event.document, diagnosticCollection);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      diagnosticCollection.delete(doc.uri);
    })
  );

  // Register Document Formatting Provider
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider("bhidu", {
      provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
        const text = document.getText();
        const formatted = formatCode(text);
        
        // Replace entire document content with formatted content
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );
        return [vscode.TextEdit.replace(fullRange, formatted)];
      },
    })
  );
}

function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
) {
  if (document.languageId !== "bhidu") {
    return;
  }

  const text = document.getText();
  try {
    const tokens = tokenize(text);
    const parser = new Parser(tokens);
    parser.parse();
    // If parsing succeeds, clear all diagnostics
    collection.delete(document.uri);
  } catch (error: any) {
    const message = error.message || String(error);
    
    // Parse line and column from error message
    // Lexer/Parser throw messages containing: "Line <num>, Col <num>"
    const match = message.match(/Line (\d+), Col (\d+)/);
    
    if (match) {
      const line = parseInt(match[1]) - 1; // VS Code lines are 0-indexed
      const column = parseInt(match[2]) - 1; // VS Code columns are 0-indexed
      
      // Select the word at the error or a range
      const wordRange = document.getWordRangeAtPosition(new vscode.Position(line, column)) ||
        new vscode.Range(
          new vscode.Position(line, column),
          new vscode.Position(line, column + 1)
        );
        
      const diagnostic = new vscode.Diagnostic(
        wordRange,
        message,
        vscode.DiagnosticSeverity.Error
      );
      
      collection.set(document.uri, [diagnostic]);
    } else {
      // Fallback if line/col not parsed
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1)),
        message,
        vscode.DiagnosticSeverity.Error
      );
      collection.set(document.uri, [diagnostic]);
    }
  }
}

function formatCode(text: string): string {
  const lines = text.split(/\r?\n/);
  let indentLevel = 0;
  const indentChar = "  "; // 2 spaces
  const formatted: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    
    // Check if line should be decremented before printing (closing braces/exit keywords)
    if (trimmed.startsWith("}") || trimmed.startsWith("khatam bhidu")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    const indent = indentChar.repeat(indentLevel);
    formatted.push(trimmed ? indent + trimmed : "");
    
    // Check if line should increment indent for subsequent lines (opening braces/entry keywords)
    if (trimmed.endsWith("{") || trimmed.startsWith("chalu kar bhidu")) {
      indentLevel++;
    }
  }
  return formatted.join("\n");
}

export function deactivate() {}
