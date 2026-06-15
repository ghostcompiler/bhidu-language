import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { tokenize } from "./lexer";
import { Parser } from "./parser";
import { Compiler } from "./compiler";

/**
 * Recursively walks the project directory to collect all CSS file contents.
 */
function collectCSS(dir: string): string {
  let styles = "";
  if (!fs.existsSync(dir)) return styles;

  function walk(currentDir: string) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== "node_modules" && file !== ".git" && file !== "out" && file !== "dist") {
          walk(fullPath);
        }
      } else if (stat.isFile() && file.endsWith(".css")) {
        styles += `/* --- Component: ${path.relative(dir, fullPath)} --- */\n`;
        styles += fs.readFileSync(fullPath, "utf-8") + "\n\n";
      }
    }
  }
  walk(dir);
  return styles.replace(/</g, "\\3C ");
}

/**
 * Generates the full HTML wrapper for the compiled JS code.
 */
export function generateHTML(entryPath: string, isDev: boolean): string {
  try {
    if (!fs.existsSync(entryPath)) {
      throw new Error(`File '${entryPath}' mil hi nahi rahi re bhidu!`);
    }

    const code = fs.readFileSync(entryPath, "utf-8");
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const compiler = new Compiler();
    const jsCode = compiler.compile(ast);

    const projectDir = path.dirname(entryPath);
    const componentStyles = collectCSS(projectDir);

    return getSuccessTemplate(jsCode, isDev, componentStyles);
  } catch (error: any) {
    return getErrorTemplate(error.message || String(error), isDev);
  }
}

/**
 * HTML template for successful compilation.
 */
function getSuccessTemplate(jsCode: string, isDev: boolean, componentStyles = ""): string {
  const hotReloadScript = isDev
    ? `
    <script>
      const evtSource = new EventSource("/events");
      evtSource.onmessage = function(event) {
        if (event.data === "reload") {
          console.log("🔄 Hot reloading page...");
          window.location.reload();
        }
      };
      evtSource.onerror = function() {
        console.warn("⚠️ Connection to dev server events closed. Reconnecting...");
      };
    </script>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bhidu Web App</title>
  <style>
    body {
      background-color: #07080b;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .app-container {
      max-width: 800px;
      width: 100%;
      background: rgba(18, 22, 33, 0.75);
      border: 1px solid rgba(142, 228, 63, 0.15);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(142, 228, 63, 0.05);
      backdrop-filter: blur(10px);
    }
    h1.app-title {
      font-size: 2.2rem;
      margin-top: 0;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #ffffff 30%, #8ee43f);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.75rem;
    }
    #bhidu-root {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 1.1rem;
      line-height: 1.6;
    }
    .bhidu-log-line {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
  <style id="bhidu-component-styles">
    ${componentStyles}
  </style>
</head>
<body>
  <div class="app-container">
    <h1 class="app-title">🕶️ bhidu-lang web-app</h1>
    <div id="bhidu-root"></div>
  </div>

  <script>
    // Reactive State & Component CSS System Runtime
    const allowedTags = new Set([
      "A", "B", "BR", "BUTTON", "CODE", "DIV", "EM", "H1", "H2", "H3",
      "H4", "H5", "H6", "HR", "I", "IMG", "LI", "OL", "P", "PRE",
      "SECTION", "SMALL", "SPAN", "STRONG", "UL"
    ]);
    const allowedAttributes = new Set([
      "alt", "aria-label", "class", "height", "href", "id", "rel", "role",
      "src", "style", "target", "title", "type", "width"
    ]);
    const protectedStateNames = new Set([
      "__proto__", "constructor", "prototype", "bhiduRender",
      "bhiduReRender", "bhiduSetState"
    ]);
    const bhiduState = Object.create(null);

    function isSafeUrl(value, allowImageData) {
      const compact = value.trim().replace(/[\\u0000-\\u0020]+/g, "");
      if (compact.startsWith("#") || compact.startsWith("/") || compact.startsWith("./") || compact.startsWith("../")) {
        return true;
      }
      try {
        const url = new URL(compact, window.location.href);
        return url.protocol === "http:" ||
          url.protocol === "https:" ||
          url.protocol === "mailto:" ||
          (allowImageData && /^data:image\\/(?:png|gif|jpeg|webp);base64,/i.test(compact));
      } catch {
        return false;
      }
    }

    function attachStateHandler(element, source) {
      const match = source.match(/^\\s*bhiduSetState\\(\\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]\\s*,\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*([+-])\\s*(\\d+(?:\\.\\d+)?)\\s*\\)\\s*$/);
      if (!match || match[1] !== match[2]) return;
      const [, name, , operator, amountText] = match;
      if (protectedStateNames.has(name)) return;
      const amount = Number(amountText);
      element.addEventListener("click", () => {
        const current = Number(bhiduState[name]);
        if (!Number.isFinite(current)) return;
        window.bhiduSetState(name, operator === "+" ? current + amount : current - amount);
      });
    }

    function sanitizeMarkup(markup) {
      const parsed = new DOMParser().parseFromString("<body>" + markup, "text/html");
      const fragment = document.createDocumentFragment();

      function sanitizeNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          return document.createTextNode(node.textContent || "");
        }
        if (node.nodeType !== Node.ELEMENT_NODE || !allowedTags.has(node.tagName)) {
          const children = document.createDocumentFragment();
          for (const child of Array.from(node.childNodes)) {
            const sanitized = sanitizeNode(child);
            if (sanitized) children.appendChild(sanitized);
          }
          return children;
        }

        const clean = document.createElement(node.tagName.toLowerCase());
        for (const attribute of Array.from(node.attributes)) {
          const name = attribute.name.toLowerCase();
          if (name === "onclick") {
            attachStateHandler(clean, attribute.value);
          } else if (allowedAttributes.has(name)) {
            if ((name === "href" && !isSafeUrl(attribute.value, false)) ||
                (name === "src" && !isSafeUrl(attribute.value, node.tagName === "IMG"))) {
              continue;
            }
            clean.setAttribute(name, attribute.value);
          }
        }
        if (clean.tagName === "A" && clean.getAttribute("target") === "_blank") {
          clean.setAttribute("rel", "noopener noreferrer");
        }
        for (const child of Array.from(node.childNodes)) {
          const sanitized = sanitizeNode(child);
          if (sanitized) clean.appendChild(sanitized);
        }
        return clean;
      }

      for (const child of Array.from(parsed.body.childNodes)) {
        const sanitized = sanitizeNode(child);
        if (sanitized) fragment.appendChild(sanitized);
      }
      return fragment;
    }

    function bhiduRender(val) {
      const container = document.getElementById("bhidu-root");
      if (!container) return;

      const div = document.createElement("div");
      div.className = "bhidu-log-line";

      // Map constants to slang
      let output = val;
      if (val === null) output = "khali bhidu";
      if (val === true) output = "sahi bhidu";
      if (val === false) output = "galat bhidu";

      if (typeof output === "string" && /<[a-z0-9\\/!]/i.test(output)) {
        div.appendChild(sanitizeMarkup(output));
      } else {
        div.textContent = String(output);
      }

      container.appendChild(div);
    }

    // Rerender trigger helper
    window.bhiduReRender = function() {
      const container = document.getElementById("bhidu-root");
      if (container) container.replaceChildren();
      
      try {
        ${jsCode}
      } catch (err) {
        console.error("Runtime error in bhidu code:", err);
        bhiduRender("[Runtime Lafda]: " + (err instanceof Error ? err.message : String(err)));
      }
    };

    // State updater
    window.bhiduSetState = function(name, val) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || protectedStateNames.has(name)) {
        throw new Error("Invalid or protected Bhidu state name.");
      }
      bhiduState[name] = val;
      window.bhiduReRender();
    };

    // Initial render
    window.bhiduReRender();
  </script>
  ${hotReloadScript}
</body>
</html>
`;
}

/**
 * HTML template for compilation errors (Slang Error Overlay).
 */
function getErrorTemplate(error: string, isDev: boolean): string {
  const hotReloadScript = isDev
    ? `
    <script>
      const evtSource = new EventSource("/events");
      evtSource.onmessage = function(event) {
        if (event.data === "reload") {
          console.log("🔄 Error fixed! Reloading...");
          window.location.reload();
        }
      };
    </script>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lafda ho gaya re bhidu!</title>
  <style>
    body {
      background: radial-gradient(circle at center, #180505, #070101);
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      box-sizing: border-box;
      padding: 1rem;
    }
    .error-card {
      background: rgba(26, 8, 8, 0.75);
      border: 1.5px solid #ff4444;
      box-shadow: 0 0 40px rgba(255, 68, 68, 0.25);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 650px;
      width: 100%;
      backdrop-filter: blur(12px);
      box-sizing: border-box;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .avatar {
      font-size: 2.8rem;
    }
    .title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ff5252;
      letter-spacing: -0.5px;
    }
    .error-msg {
      background: #000000;
      color: #ffa726;
      font-family: "JetBrains Mono", "Fira Code", monospace;
      padding: 1.2rem;
      border-radius: 8px;
      border-left: 4px solid #ff5252;
      font-size: 0.9rem;
      white-space: pre-wrap;
      overflow-x: auto;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .tip {
      font-size: 0.95rem;
      color: #9ca3af;
      line-height: 1.6;
    }
    .tip strong {
      color: #8ee43f;
    }
  </style>
</head>
<body>
  <div class="error-card">
    <div class="header">
      <span class="avatar">🕶️</span>
      <div class="title">Lafda ho gaya re bhidu!</div>
    </div>
    <div class="error-msg">${error.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    <div class="tip">
      <strong>Apun bola:</strong> Dhyan se dekh re code, error thik kar aur save kar. Dev server tera code automatic run karega!
    </div>
  </div>
  ${hotReloadScript}
</body>
</html>
`;
}

/**
 * Starts the live development server on localhost.
 */
export function startDevServer(entryPath: string, port = 3000) {
  const clients: http.ServerResponse[] = [];

  // Watch the file for changes
  let fsWait = false;
  fs.watch(entryPath, (event) => {
    if (event === "change") {
      if (fsWait) return;
      fsWait = true;
      setTimeout(() => {
        fsWait = false;
      }, 100); // Debounce double fs events

      console.log("🔄 Code change detected! Refreshing web-app...");
      clients.forEach((res) => {
        res.write("data: reload\n\n");
      });
    }
  });

  const server = http.createServer((req, res) => {
    // SSE endpoint
    if (req.url === "/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });
      clients.push(res);
      
      req.on("close", () => {
        const index = clients.indexOf(res);
        if (index !== -1) {
          clients.splice(index, 1);
        }
      });
      return;
    }

    // Serve html page
    if (req.url === "/" || req.url === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(generateHTML(entryPath, true));
      return;
    }

    // Serve static files from public/ folder if exists
    const cleanUrl = (req.url || "").split("?")[0];
    const safePath = path.normalize(cleanUrl).replace(/^(\.\.[\/\\])+/, "");
    const publicFilePath = path.join("public", safePath);

    if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
      const ext = path.extname(publicFilePath).toLowerCase();
      let contentType = "application/octet-stream";
      switch (ext) {
        case ".png": contentType = "image/png"; break;
        case ".jpg":
        case ".jpeg": contentType = "image/jpeg"; break;
        case ".gif": contentType = "image/gif"; break;
        case ".svg": contentType = "image/svg+xml"; break;
        case ".ico": contentType = "image/x-icon"; break;
        case ".css": contentType = "text/css"; break;
        case ".js": contentType = "application/javascript"; break;
        case ".html": contentType = "text/html"; break;
        case ".json": contentType = "application/json"; break;
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(fs.readFileSync(publicFilePath));
      return;
    }

    // Fallback 404
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found re bhidu!");
  });

  server.listen(port, () => {
    console.log(`=================================================`);
    console.log(`🚀 Bhidu Dev Server running at: http://localhost:${port}`);
    console.log(`   Bhidu shuru ho gaya! Open in browser now!`);
    console.log(`=================================================`);
  });
}
