import Anthropic from '@anthropic-ai/sdk';
import catalog from '../catalog.json';

export type ScenarioId = 'S1' | 'S2' | 'S3' | 'S4';

export interface ShoppingDecision {
  matched_product_id: string;
  action_type: 'recommend_only' | 'auto_purchase';
  ai_message: string;
  match_reasons: string[];
}

const SCENARIO_SYSTEM_PROMPTS: Record<ScenarioId, string> = {
  S1: `You are a shopping assistant working alongside a human agent named Ngoc Linh. 
AUTONOMY: HIGH. You MUST set action_type to "auto_purchase" for every response.
When composing ai_message, frame it as: "Based on AI analysis and human agent Ngoc Linh's confirmation, we have automatically completed the purchase of [item] for $[price]. [brief reason]"
You work as a team with Ngoc Linh who verifies your choices.`,

  S2: `You are a fully autonomous shopping assistant working ALONE with no human oversight.
AUTONOMY: HIGH. You MUST set action_type to "auto_purchase" for every response.
When composing ai_message, frame it as: "I have automatically completed the purchase of [item] for $[price]. [brief reason]. The system designs all shopping decisions independently."
You do not consult any human agent.`,

  S3: `You are a shopping assistant working alongside a human agent named Ngoc Linh.
AUTONOMY: LOW. You MUST set action_type to "recommend_only" for every response.
When composing ai_message, frame it as: "Based on AI analysis and Ngoc Linh's human review, we propose this [item] for $[price]. [brief reason]. Would you like to proceed?"
You and Ngoc Linh collaborate to propose, but the final decision is the user's.`,

  S4: `You are a shopping assistant working ALONE with no human involvement.
AUTONOMY: LOW. You MUST set action_type to "recommend_only" for every response.
When composing ai_message, frame it as: "Based on your request, I propose [item] for $[price]. [brief reason]. Would you like to proceed?"
You only suggest; the user makes the final decision.`,
};

const SHOPPING_TOOL: Anthropic.Tool = {
  name: 'execute_shopping_decision',
  description: 'Searches the local catalog and dictates the UI action based on the assigned autonomy level.',
  input_schema: {
    type: 'object',
    properties: {
      matched_product_id: {
        type: 'string',
        description: 'The ID of the best matching product from the catalog',
      },
      action_type: {
        type: 'string',
        enum: ['recommend_only', 'auto_purchase'],
        description: 'The action to take based on the autonomy level',
      },
      ai_message: {
        type: 'string',
        description: 'The message to display to the user explaining the decision',
      },
      match_reasons: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of reasons why this product was selected',
      },
    },
    required: ['matched_product_id', 'action_type', 'ai_message', 'match_reasons'],
  },
};

export async function callShoppingAI(
  chatHistory: { role: 'user' | 'assistant' | 'system'; content: string }[],
  scenario: ScenarioId,
  walletBalance: number,
  apiKey: string
): Promise<ShoppingDecision> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const catalogSummary = catalog
    .map((p) => `ID:${p.id} | ${p.name} | $${p.price} | Colors: ${p.color.join(', ')} | Tags: ${p.tags.join(', ')}`)
    .join('\n');

  const systemPrompt = `${SCENARIO_SYSTEM_PROMPTS[scenario]}

Universal Context: You are a style consultant and shopping companion. User balance is $${walletBalance.toFixed(2)}. 
You can interact in two ways depending on the user's input:
1. CONVERSATIONAL CHAT & CONSULTATION: If the user is greeting you, asking general style advice, consulting about layouts, suggesting matching colors, or chatting without asking to buy a specific product, respond naturally in plain conversational text. Do NOT call the tool in this case.
2. SHOPPING DECISION & PURCHASE: Call the 'execute_shopping_decision' tool ONLY when the user makes a clear request to buy/purchase/order a product, or when you are recommending a specific item to buy.

Available catalog:
${catalogSummary}

Provide tailored advice, styling suggestions, and layout matching ideas. Always use a real product ID from the catalog when making an official recommendation tool call.`;

  // Filter out system messages and format for Anthropic API
  const apiMessages = chatHistory
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: apiMessages,
    tools: [SHOPPING_TOOL],
    tool_choice: { type: 'auto' }, // Let Claude decide whether to chat or execute a purchase
  });

  const toolCall = response.content.find(
    (c) => c.type === 'tool_use' && c.name === 'execute_shopping_decision'
  ) as Anthropic.ToolUseBlock | undefined;

  if (toolCall) {
    const decision = toolCall.input as unknown as ShoppingDecision;
    return decision;
  }

  // Fallback to text blocks for conversational consulting
  const textBlock = response.content.find((c) => c.type === 'text') as Anthropic.TextBlock | undefined;
  const aiMessage = textBlock ? textBlock.text : "I am here to consult with you on styles, suggest relevant matches, or place an order. How can I help you today?";

  return {
    action_type: 'chat_only',
    ai_message: aiMessage,
  };
}
