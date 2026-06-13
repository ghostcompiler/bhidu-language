import { Token, TokenType } from "./types";

interface TokenRule {
  type: TokenType | "SKIP" | "COMMENT";
  regex: RegExp;
}

const RULES: TokenRule[] = [
  // Skip whitespace
  { type: "SKIP", regex: /^\s+/ },

  // Comments (// or apun bola:)
  { type: "COMMENT", regex: /^\/\/.*|^\bapun bola\b:.*/ },

  // Keywords (longest first, must end with word boundary \b)
  { type: TokenType.WARNA_AGAR_BHIDU, regex: /^warna agar bhidu\b/ },
  { type: TokenType.CHALU_KAR_BHIDU, regex: /^chalu kar bhidu\b/ },
  { type: TokenType.BHIDU_BOLTA_HAI, regex: /^bhidu bolta hai\b/ },
  { type: TokenType.BHIDU_YE_HAI, regex: /^bhidu ye hai\b/ },
  { type: TokenType.JAB_TAK_BHIDU, regex: /^jab tak bhidu\b/ },
  { type: TokenType.BAS_KAR_BHIDU, regex: /^bas kar bhidu\b/ },
  { type: TokenType.AGLI_BAAR_BHIDU, regex: /^agli baar bhidu\b/ },
  { type: TokenType.KHATAM_BHIDU, regex: /^khatam bhidu\b/ },
  { type: TokenType.SAHI_BHIDU, regex: /^sahi bhidu\b/ },
  { type: TokenType.GALAT_BHIDU, regex: /^galat bhidu\b/ },
  { type: TokenType.KHALI_BHIDU, regex: /^khali bhidu\b/ },
  { type: TokenType.AGAR_BHIDU, regex: /^agar bhidu\b/ },
  { type: TokenType.WARNA_BHIDU, regex: /^warna bhidu\b/ },

  // Identifiers
  { type: TokenType.IDENTIFIER, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },

  // Literals
  { type: TokenType.STRING, regex: /^"[^"\\]*(?:\\.[^"\\]*)*"/ },
  { type: TokenType.NUMBER, regex: /^\d+(\.\d+)?/ },

  // Operators (double-char)
  { type: TokenType.EQ, regex: /^==/ },
  { type: TokenType.NEQ, regex: /^!=/ },
  { type: TokenType.LTE, regex: /^<=/ },
  { type: TokenType.GTE, regex: /^>=/ },
  { type: TokenType.AND, regex: /^&&/ },
  { type: TokenType.OR, regex: /^\|\|/ },

  // Operators (single-char)
  { type: TokenType.ASSIGN, regex: /^=/ },
  { type: TokenType.PLUS, regex: /^\+/ },
  { type: TokenType.MINUS, regex: /^-/ },
  { type: TokenType.STAR, regex: /^\*/ },
  { type: TokenType.SLASH, regex: /^\// },
  { type: TokenType.MODULO, regex: /^%/ },
  { type: TokenType.LT, regex: /^</ },
  { type: TokenType.GT, regex: /^>/ },

  // Punctuators
  { type: TokenType.OPEN_PAREN, regex: /^\(/ },
  { type: TokenType.CLOSE_PAREN, regex: /^\)/ },
  { type: TokenType.OPEN_CURLY, regex: /^\{/ },
  { type: TokenType.CLOSE_CURLY, regex: /^\}/ },
  { type: TokenType.SEMICOLON, regex: /^;/ },
];

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let column = 1;

  while (index < code.length) {
    const remainingCode = code.slice(index);
    let matched = false;

    for (const rule of RULES) {
      const match = remainingCode.match(rule.regex);
      if (match) {
        const value = match[0];
        const tokenLine = line;
        const tokenColumn = column;

        // Update line and column based on matched value
        for (let i = 0; i < value.length; i++) {
          if (value[i] === "\n") {
            line++;
            column = 1;
          } else {
            column++;
          }
        }

        index += value.length;
        matched = true;

        if (rule.type === "SKIP" || rule.type === "COMMENT") {
          break; // Don't produce tokens for skips/comments
        }

        let tokenValue = value;
        if (rule.type === TokenType.STRING) {
          // Strip quotes and handle basic escape characters
          tokenValue = value
            .slice(1, -1)
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\");
        }

        tokens.push({
          type: rule.type,
          value: tokenValue,
          line: tokenLine,
          column: tokenColumn,
        });
        break;
      }
    }

    if (!matched) {
      const chunk = remainingCode.slice(0, 15).replace(/\n/g, " ");
      throw new Error(
        `Kya re bhidu! Line ${line}, Col ${column} pe kuch alag hi dikh raha hai: "${chunk}..."`
      );
    }
  }

  tokens.push({
    type: TokenType.EOF,
    value: "EOF",
    line,
    column,
  });

  return tokens;
}
