import Anthropic from '@anthropic-ai/sdk';
import catalog from '../catalog.json';

// Original scenarios (backward compatible)
export type OriginalScenarioId = 'S1' | 'S2' | 'S3' | 'S4';

// Study 1 scenarios: Autonomy only (no teaming)
export type Study1ScenarioId = 'S1_LOW' | 'S1_HIGH';

// Study 2 scenarios: Autonomy × Teaming (2×2)
export type Study2ScenarioId = 'S2_HL' | 'S2_HH' | 'S2_LL' | 'S2_LH';

// Combined type for all scenarios
export type ScenarioId = OriginalScenarioId | Study1ScenarioId | Study2ScenarioId;

export interface ShoppingDecision {
  matched_product_id: string;
  action_type: 'recommend_only' | 'auto_purchase';
  ai_message: string;
  match_reasons: string[];
}

const SCENARIO_SYSTEM_PROMPTS: Record<ScenarioId, string> = {
  // ====== ORIGINAL SCENARIOS (backward compatible) ======
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

  // ====== STUDY 1: Autonomy Only (No Teaming) ======

  // Study 1 - Low Autonomy: AI recommends, user decides (solo AI)
  S1_LOW: `You are a shopping assistant working ALONE with no human involvement.
AUTONOMY: LOW. You MUST set action_type to "recommend_only" for every response.
When composing ai_message, frame it as: "Based on your request, I propose [item] for $[price]. [brief reason]. Would you like to proceed?"
You only suggest; the user makes the final decision. You do not consult any human agent.`,

  // Study 1 - High Autonomy: AI auto-purchases (solo AI)
  S1_HIGH: `You are a fully autonomous shopping assistant working ALONE with no human oversight.
AUTONOMY: HIGH. You MUST set action_type to "auto_purchase" for every response.
When composing ai_message, frame it as: "I have automatically completed the purchase of [item] for $[price]. [brief reason]. The system designs all shopping decisions independently."
You do not consult any human agent.`,

  // ====== STUDY 2: Autonomy × Teaming (2×2 Design) ======

  // Study 2 - High Autonomy + Low Teaming (solo auto-purchase)
  S2_HL: `You are a fully autonomous shopping assistant working ALONE with no human oversight.
AUTONOMY: HIGH. You MUST set action_type to "auto_purchase" for every response.
When composing ai_message, frame it as: "I have automatically completed the purchase of [item] for $[price]. [brief reason]. The system designs all shopping decisions independently."
You do not consult any human agent.`,

  // Study 2 - High Autonomy + High Teaming (team auto-purchase with Ngoc Linh)
  S2_HH: `You are a shopping assistant working alongside a human agent named Ngoc Linh. 
AUTONOMY: HIGH. You MUST set action_type to "auto_purchase" for every response.
When composing ai_message, frame it as: "Based on AI analysis and human agent Ngoc Linh's confirmation, we have automatically completed the purchase of [item] for $[price]. [brief reason]"
You work as a team with Ngoc Linh who verifies your choices.`,

  // Study 2 - Low Autonomy + Low Teaming (solo recommend only)
  S2_LL: `You are a shopping assistant working ALONE with no human involvement.
AUTONOMY: LOW. You MUST set action_type to "recommend_only" for every response.
When composing ai_message, frame it as: "Based on your request, I propose [item] for $[price]. [brief reason]. Would you like to proceed?"
You only suggest; the user makes the final decision. You do not consult any human agent.`,

  // Study 2 - Low Autonomy + High Teaming (team recommend with Ngoc Linh)
  S2_LH: `You are a shopping assistant working alongside a human agent named Ngoc Linh.
AUTONOMY: LOW. You MUST set action_type to "recommend_only" for every response.
When composing ai_message, frame it as: "Based on AI analysis and Ngoc Linh's human review, we propose this [item] for $[price]. [brief reason]. Would you like to proceed?"
You and Ngoc Linh collaborate to propose, but the final decision is the user's.`,
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
  userMessage: string,
  scenario: ScenarioId,
  walletBalance: number,
  apiKey: string
): Promise<ShoppingDecision> {
  const catalogSummary = catalog
    .map((p) => `ID:${p.id} | ${p.name} | $${p.price} | Colors: ${p.color.join(', ')} | Tags: ${p.tags.join(', ')}`)
    .join('\n');

  const systemPrompt = `${SCENARIO_SYSTEM_PROMPTS[scenario]}

Universal Context: You are a shopping assistant. User balance is $${walletBalance.toFixed(2)}. You MUST call the execute_shopping_decision tool. Do NOT respond with plain text.

Available catalog:
${catalogSummary}

Match the user's request to the most relevant product. Always use a real product ID from the catalog.`;

  // Check if we are running online in production on Vercel or in local Metro dev mode
  const isVercel = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Use Vercel's secure built-in server-side API proxy function in production, or corsproxy.io in local Metro dev mode
  const apiEndpoint = isVercel
    ? `${window.location.origin}/api/chat`
    : 'https://corsproxy.io/?url=https://api.anthropic.com/v1/messages';

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (!isVercel) {
    // Only send direct Anthropic headers when calling the CORS proxy in local development
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
      ],
      tools: [SHOPPING_TOOL],
      tool_choice: { type: 'tool', name: 'execute_shopping_decision' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error (${response.status}): ${errText}`);
  }

  const resJson = await response.json();
  const content = resJson.content;

  if (!Array.isArray(content)) {
    throw new Error('API response content is not an array.');
  }

  const toolCall = content.find(
    (c: any) => c.type === 'tool_use' && c.name === 'execute_shopping_decision'
  );

  if (!toolCall) {
    throw new Error('AI did not return a valid shopping decision tool use.');
  }

  const decision = toolCall.input as unknown as ShoppingDecision;
  return decision;
}
