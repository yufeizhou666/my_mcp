import { ToolInput } from '../types/index.js';

interface ExplainErrorInput extends ToolInput {
  errorContent: string;
  contextLines?: number;
}

export async function explainError(input: ToolInput): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { errorContent, contextLines = 10 } = input as ExplainErrorInput;

  if (!errorContent) {
    return { content: [{ type: 'text', text: 'Error: errorContent is required' }] };
  }

  const formatted = `Please analyze the following error and help me understand:
1. What is the root cause of this error?
2. What steps should I take to resolve it?
3. Are there any related logs or patterns I should look for?

Error Log:
\`\`\`
${errorContent}
\`\`\`

Context: The error occurred with ${contextLines} lines of context around it.`;

  return {
    content: [
      { type: 'text', text: 'Error analysis request formatted. The AI will analyze the error content.' },
      { type: 'text', text: formatted }
    ]
  };
}