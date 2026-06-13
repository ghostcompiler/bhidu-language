import {
  Token,
  TokenType,
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
  ExpressionStatementNode,
  BinaryExpressionNode,
  LiteralNode,
  IdentifierNode,
} from "./types";

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ProgramNode {
    const startToken = this.peek();
    
    // Check if the program starts with "chalu kar bhidu"
    if (this.isAtEnd()) {
      throw new Error("Abe bhidu! Khali file kyun diya? Code chalu karne ke liye 'chalu kar bhidu' likh pehle!");
    }
    
    this.consume(
      TokenType.CHALU_KAR_BHIDU,
      "Program chalu karne ke liye 'chalu kar bhidu' bolna padega!"
    );

    const body: ASTNode[] = [];

    // Parse statements until we hit "khatam bhidu" or EOF
    while (!this.check(TokenType.KHATAM_BHIDU) && !this.isAtEnd()) {
      body.push(this.statement());
    }

    if (this.isAtEnd()) {
      const lastToken = this.previous();
      throw new Error(
        `Kya re bhidu! Line ${lastToken.line} pe program khatam ho gaya par bandh nahi kiya? 'khatam bhidu' bolna padega!`
      );
    }

    this.consume(
      TokenType.KHATAM_BHIDU,
      "Program bandh karne ke liye 'khatam bhidu' bolna padega!"
    );

    // After "khatam bhidu", there should be nothing but EOF
    if (!this.isAtEnd()) {
      const nextToken = this.peek();
      throw new Error(
        `Kya re bhidu! Line ${nextToken.line}, Col ${nextToken.column} pe error: 'khatam bhidu' bolne ke baad kuch nahi likh sakta tu!`
      );
    }

    return {
      type: "Program",
      body,
    };
  }

  private statement(): ASTNode {
    if (this.match(TokenType.BHIDU_YE_HAI)) {
      return this.varDeclaration();
    }
    if (this.match(TokenType.BHIDU_BOLTA_HAI)) {
      return this.printStatement();
    }
    if (this.match(TokenType.AGAR_BHIDU)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.JAB_TAK_BHIDU)) {
      return this.whileStatement();
    }
    if (this.match(TokenType.BAS_KAR_BHIDU)) {
      return this.breakStatement();
    }
    if (this.match(TokenType.AGLI_BAAR_BHIDU)) {
      return this.continueStatement();
    }
    if (this.check(TokenType.OPEN_CURLY)) {
      return this.blockStatement();
    }

    return this.expressionStatement();
  }

  private varDeclaration(): VarDecNode {
    const line = this.previous().line;
    const nameToken = this.consume(
      TokenType.IDENTIFIER,
      "Variable ka naam toh bata re bhidu!"
    );
    const id = nameToken.value;

    let init: ASTNode | null = null;
    if (this.match(TokenType.ASSIGN)) {
      init = this.expression();
    }

    this.consume(
      TokenType.SEMICOLON,
      `Variable declare karne ke baad semicolon (;) laga re bhidu!`
    );

    return {
      type: "VarDec",
      id,
      init,
      line,
    };
  }

  private assignmentStatement(): AssignNode {
    const line = this.previous().line;
    const id = this.previous().value;
    this.consume(TokenType.ASSIGN, "Assign karne ke liye '=' lagana padega!");
    const value = this.expression();
    this.consume(
      TokenType.SEMICOLON,
      "Reassignment ke baad semicolon (;) lagana zaroori hai bhidu!"
    );

    return {
      type: "Assignment",
      id,
      value,
      line,
    };
  }

  private printStatement(): PrintNode {
    const line = this.previous().line;
    this.consume(
      TokenType.OPEN_PAREN,
      "Print karne ke liye parenthesis '(' chalu kar re bhidu!"
    );
    const arg = this.expression();
    this.consume(
      TokenType.CLOSE_PAREN,
      "Parenthesis ')' bandh karna bhool gaya kya bhidu?"
    );
    this.consume(
      TokenType.SEMICOLON,
      "Print line ke baad semicolon (;) kaun lagayega re bhidu?"
    );

    return {
      type: "Print",
      arguments: [arg],
      line,
    };
  }

  private ifStatement(): IfNode {
    const line = this.previous().line;
    this.consume(
      TokenType.OPEN_PAREN,
      "Agar condition check karni hai toh '(' chalu kar!"
    );
    const test = this.expression();
    this.consume(
      TokenType.CLOSE_PAREN,
      "Condition block bandh karne ke liye ')' laga re bhidu!"
    );

    const consequent = this.blockStatement();
    let alternate: IfNode | BlockNode | null = null;

    if (this.match(TokenType.WARNA_AGAR_BHIDU)) {
      alternate = this.ifStatement();
    } else if (this.match(TokenType.WARNA_BHIDU)) {
      alternate = this.blockStatement();
    }

    return {
      type: "If",
      test,
      consequent,
      alternate,
      line,
    };
  }

  private blockStatement(): BlockNode {
    const line = this.peek().line;
    this.consume(
      TokenType.OPEN_CURLY,
      "Block chalu karne ke liye '{' open kar re bhidu!"
    );
    const body: ASTNode[] = [];

    while (!this.check(TokenType.CLOSE_CURLY) && !this.isAtEnd()) {
      body.push(this.statement());
    }

    this.consume(
      TokenType.CLOSE_CURLY,
      "Block bandh karne ke liye curly brace '}' laga re bhidu!"
    );

    return {
      type: "Block",
      body,
      line,
    };
  }

  private whileStatement(): WhileNode {
    const line = this.previous().line;
    this.consume(
      TokenType.OPEN_PAREN,
      "Loop condition check karne ke liye '(' chalu kar!"
    );
    const test = this.expression();
    this.consume(
      TokenType.CLOSE_PAREN,
      "Loop condition bandh karne ke liye ')' laga re!"
    );

    const body = this.blockStatement();

    return {
      type: "While",
      test,
      body,
      line,
    };
  }

  private breakStatement(): BreakNode {
    const line = this.previous().line;
    this.consume(
      TokenType.SEMICOLON,
      "Break statement ke baad semicolon (;) lagana zaroori hai!"
    );
    return {
      type: "Break",
      line,
    };
  }

  private continueStatement(): ContinueNode {
    const line = this.previous().line;
    this.consume(
      TokenType.SEMICOLON,
      "Continue statement ke baad semicolon (;) lagana zaroori hai!"
    );
    return {
      type: "Continue",
      line,
    };
  }

  private expressionStatement(): ASTNode {
    // If it's an identifier followed by an assignment operator
    if (
      this.check(TokenType.IDENTIFIER) &&
      this.peekNext().type === TokenType.ASSIGN
    ) {
      this.advance(); // consume identifier
      return this.assignmentStatement();
    }

    const line = this.peek().line;
    const expr = this.expression();
    this.consume(
      TokenType.SEMICOLON,
      "Expression ke baad semicolon (;) lagana mat bhool bhidu!"
    );
    return {
      type: "ExpressionStatement",
      expression: expr,
      line,
    };
  }

  private expression(): ASTNode {
    return this.logicalOr();
  }

  private logicalOr(): ASTNode {
    let expr = this.logicalAnd();

    while (this.match(TokenType.OR)) {
      const operator = this.previous().value;
      const right = this.logicalAnd();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        line: this.previous().line,
      };
    }

    return expr;
  }

  private logicalAnd(): ASTNode {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous().value;
      const right = this.equality();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        line: this.previous().line,
      };
    }

    return expr;
  }

  private equality(): ASTNode {
    let expr = this.comparison();

    while (this.match(TokenType.EQ, TokenType.NEQ)) {
      const operator = this.previous().value;
      const right = this.comparison();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        line: this.previous().line,
      };
    }

    return expr;
  }

  private comparison(): ASTNode {
    let expr = this.term();

    while (this.match(TokenType.LT, TokenType.LTE, TokenType.GT, TokenType.GTE)) {
      const operator = this.previous().value;
      const right = this.term();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        line: this.previous().line,
      };
    }

    return expr;
  }

  private term(): ASTNode {
    let expr = this.factor();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.factor();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        line: this.previous().line,
      };
    }

    return expr;
  }

  private factor(): ASTNode {
    let expr = this.primary();

    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.MODULO)) {
      const operator = this.previous().value;
      const right = this.primary();
      expr = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right,
        line: this.previous().line,
      };
    }

    return expr;
  }

  private primary(): ASTNode {
    if (this.match(TokenType.SAHI_BHIDU)) {
      return {
        type: "Literal",
        value: true,
        line: this.previous().line,
      };
    }
    if (this.match(TokenType.GALAT_BHIDU)) {
      return {
        type: "Literal",
        value: false,
        line: this.previous().line,
      };
    }
    if (this.match(TokenType.KHALI_BHIDU)) {
      return {
        type: "Literal",
        value: null,
        line: this.previous().line,
      };
    }
    if (this.match(TokenType.NUMBER)) {
      return {
        type: "Literal",
        value: parseFloat(this.previous().value),
        line: this.previous().line,
      };
    }
    if (this.match(TokenType.STRING)) {
      return {
        type: "Literal",
        value: this.previous().value,
        line: this.previous().line,
      };
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return {
        type: "Identifier",
        name: this.previous().value,
        line: this.previous().line,
      };
    }
    if (this.match(TokenType.OPEN_PAREN)) {
      const expr = this.expression();
      this.consume(
        TokenType.CLOSE_PAREN,
        "Parenthesis matching nahi ho rahi re bhidu! ')' laga!"
      );
      return expr;
    }

    const token = this.peek();
    throw new Error(
      `Kya re bhidu! Line ${token.line}, Col ${token.column} pe error: Yeh kya likh diya re bhidu? Kuch samajh nahi aa raha: "${token.value}"`
    );
  }

  // Helpers
  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNext(): Token {
    if (this.current + 1 >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1];
    }
    return this.tokens[this.current + 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, errorMessage: string): Token {
    if (this.check(type)) return this.advance();
    const token = this.peek();
    throw new Error(
      `Kya re bhidu! Line ${token.line}, Col ${token.column} pe error: ${errorMessage}`
    );
  }
}
