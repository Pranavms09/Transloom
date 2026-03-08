declare module "*/services/geminiService" {
  export function analyzeEDI(content: string): Promise<any>;
  export function askCopilot(messages: any[], parsed: any, issues: any[]): Promise<string>;
}
