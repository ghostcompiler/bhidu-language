export enum TokenType {
  // Keywords
  CHALU_KAR_BHIDU = "CHALU_KAR_BHIDU",
  KHATAM_BHIDU = "KHATAM_BHIDU",
  BHIDU_YE_HAI = "BHIDU_YE_HAI",
  SAHI_BHIDU = "SAHI_BHIDU",
  GALAT_BHIDU = "GALAT_BHIDU",
  KHALI_BHIDU = "KHALI_BHIDU",
  BHIDU_BOLTA_HAI = "BHIDU_BOLTA_HAI",
  AGAR_BHIDU = "AGAR_BHIDU",
  WARNA_AGAR_BHIDU = "WARNA_AGAR_BHIDU",
  WARNA_BHIDU = "WARNA_BHIDU",
  JAB_TAK_BHIDU = "JAB_TAK_BHIDU",
  BAS_KAR_BHIDU = "BAS_KAR_BHIDU",
  AGLI_BAAR_BHIDU = "AGLI_BAAR_BHIDU",

  // Literals & Identifiers
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",

  // Operators
  ASSIGN = "ASSIGN", // =
  PLUS = "PLUS", // +
  MINUS = "MINUS", // -
  STAR = "STAR", // *
  SLASH = "SLASH", // /
  MODULO = "MODULO", // %
  
  // Comparisons
  EQ = "EQ", // ==
  NEQ = "NEQ", // !=
  LT = "LT", // <
  GT = "GT", // >
  LTE = "LTE", // <=
  GTE = "GTE", // >=

  // Logical
  AND = "AND", // &&
  OR = "OR", // ||

  // Punctuators
  OPEN_PAREN = "OPEN_PAREN", // (
  CLOSE_PAREN = "CLOSE_PAREN", // )
  OPEN_CURLY = "OPEN_CURLY", // {
  CLOSE_CURLY = "CLOSE_CURLY", // }
  SEMICOLON = "SEMICOLON", // ;
  
  // EOF
  EOF = "EOF"
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export type ASTNode =
  | ProgramNode
  | BlockNode
  | VarDecNode
  | AssignNode
  | PrintNode
  | IfNode
  | WhileNode
  | BreakNode
  | ContinueNode
  | ExpressionStatementNode
  | BinaryExpressionNode
  | LiteralNode
  | IdentifierNode;

export interface ProgramNode {
  type: "Program";
  body: ASTNode[];
}

export interface BlockNode {
  type: "Block";
  body: ASTNode[];
  line: number;
}

export interface VarDecNode {
  type: "VarDec";
  id: string;
  init: ASTNode | null;
  line: number;
}

export interface AssignNode {
  type: "Assignment";
  id: string;
  value: ASTNode;
  line: number;
}

export interface PrintNode {
  type: "Print";
  arguments: ASTNode[];
  line: number;
}

export interface IfNode {
  type: "If";
  test: ASTNode;
  consequent: BlockNode;
  alternate: IfNode | BlockNode | null;
  line: number;
}

export interface WhileNode {
  type: "While";
  test: ASTNode;
  body: BlockNode;
  line: number;
}

export interface BreakNode {
  type: "Break";
  line: number;
}

export interface ContinueNode {
  type: "Continue";
  line: number;
}

export interface ExpressionStatementNode {
  type: "ExpressionStatement";
  expression: ASTNode;
  line: number;
}

export interface BinaryExpressionNode {
  type: "BinaryExpression";
  operator: string;
  left: ASTNode;
  right: ASTNode;
  line: number;
}

export interface LiteralNode {
  type: "Literal";
  value: any;
  line: number;
}

export interface IdentifierNode {
  type: "Identifier";
  name: string;
  line: number;
}
