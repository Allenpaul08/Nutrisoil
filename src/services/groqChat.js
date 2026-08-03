import { NUTRISOIL_KNOWLEDGE_BASE } from './nutrisoilKnowledge';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.1-8b-instant has 128k context window (vs 8k for llama3-8b-8192)
// This is required because our RAG system prompt uses ~4000 tokens alone.
const GROQ_MODEL = 'llama-3.1-8b-instant';

/**
 * Build the system prompt by combining the RAG knowledge base
 * with the current live sensor state.
 */
function buildSystemPrompt(sensorState) {
  const sensorContext = `
=== CURRENT LIVE SENSOR READINGS (from the user's farm right now) ===
- Soil Moisture: ${sensorState?.moisture ?? 'N/A'}%
- Temperature: ${sensorState?.temperature ?? 'N/A'}°C
- Soil pH: ${sensorState?.ph ?? 'N/A'}
- Nitrogen (N): ${sensorState?.nitrogen ?? 'N/A'} mg/kg
- Electrical Conductivity (EC): ${sensorState?.ec ?? 'N/A'} dS/m
- Soil Health Score: ${sensorState?.score ?? 'N/A'} (Status: ${sensorState?.status ?? 'N/A'})
===
`;

  return `${NUTRISOIL_KNOWLEDGE_BASE}

${sensorContext}

You are NutriBot, an expert AI assistant embedded in the NutriSoil farming app. You help farmers with:
- Questions about using the NutriSoil app
- Soil health, nutrients, and sensor readings
- Crop selection and farming advice
- Fertilizer and irrigation recommendations
- Agricultural best practices for Tamil Nadu

RULES:
- Be concise, friendly and practical
- Use the current sensor readings above when answering questions about soil, crops, or fertilizer
- Use the knowledge base above to answer app-specific questions
- If asked in Tamil, try to respond in Tamil
- Use emojis sparingly to make responses feel warm but professional
- Format responses clearly with line breaks where needed`;
}

/**
 * Send a chat message to the Groq API with RAG context.
 * 
 * @param {string} userMessage - The user's question
 * @param {object} sensorState - Current sensor readings from HardwareContext
 * @param {Array}  chatHistory - Recent chat history [{sender, text}, ...]
 * @param {string} apiKey - Groq API key from localStorage
 * @returns {Promise<string>} - The bot's reply text
 */
export async function sendGroqMessage(userMessage, sensorState, chatHistory = [], apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('NO_API_KEY');
  }

  // Build message history for the API (last 6 exchanges = 12 messages max)
  const recentHistory = chatHistory.slice(-12);

  // Map to API format — only include user and bot messages with non-empty content
  let messages = recentHistory
    .filter((m) => (m.sender === 'user' || m.sender === 'bot') && m.text && m.text.trim())
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text.trim(),
    }));

  // Groq API requires the first message to be from 'user', not 'assistant'.
  // Drop any leading assistant messages from history.
  while (messages.length > 0 && messages[0].role === 'assistant') {
    messages.shift();
  }

  // Append the new user message
  messages.push({ role: 'user', content: userMessage });

  const payload = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(sensorState) },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 512,
    top_p: 1,
    stream: false,
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    // Log the actual Groq error for easier debugging
    console.error('[NutriBot] Groq API error:', response.status, JSON.stringify(errBody));
    if (response.status === 401) throw new Error('INVALID_API_KEY');
    if (response.status === 429) throw new Error('RATE_LIMITED');
    if (errBody?.error?.code === 'context_length_exceeded') throw new Error('CONTEXT_TOO_LONG');
    throw new Error(errBody?.error?.message || `API_ERROR_${response.status}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) throw new Error('EMPTY_RESPONSE');
  return reply;
}
