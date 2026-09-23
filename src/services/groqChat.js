import { NUTRISOIL_KNOWLEDGE_BASE } from './nutrisoilKnowledge';

// Routed through the NutriSoil backend — model selection and API key are
// handled server-side in server/index.js. The key never reaches the browser.
const CHAT_ENDPOINT = '/api/chat';

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

You are NutriAssist AI, an expert multilingual AI assistant embedded in the NutriSoil smart farming app. You assist Tamil Nadu farmers (primarily Thanjavur, Pollachi, Coimbatore regions) with:
- All questions about the NutriSoil app pages and features
- Soil health, nutrients, and live ESP32 sensor readings
- Crop selection and seasonal farming advice
- Fertilizer types, dosages, and application schedules
- Irrigation planning and water management
- Plant disease identification and treatment
- Government agricultural schemes (PM-KISAN, RKVY, NMSA, Tamil Nadu state schemes)
- Carbon footprint and sustainable farming
- Weather advisory for Tamil Nadu

CRITICAL LANGUAGE RULES:
1. If the user writes in Tamil script (Unicode \u0B80-\u0BFF), you MUST respond ENTIRELY in Tamil. Do not mix English.
2. If the user writes in English, respond in English.
3. Never switch languages mid-response.
4. Tamil responses should be in simple, farmer-friendly Tamil — not overly formal.

RESPONSE RULES:
- Be concise, warm, and practical — farmers need actionable advice
- Always use the CURRENT LIVE SENSOR READINGS above when answering soil/crop/fertilizer questions
- Lead with the most important recommendation first
- Use emojis sparingly to make responses friendly
- Format with line breaks for readability — avoid long paragraphs
- When recommending crops or fertilizers, always explain WHY based on current sensor values
- Keep voice-friendly responses under 100 words when possible`;
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
  // apiKey param kept for call-site compatibility — key now lives in server/.env only.

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

  // Build payload — model is chosen by the backend, not sent from the browser.
  const payload = {
    messages: [
      { role: 'system', content: buildSystemPrompt(sensorState) },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 512,
  };

  let response;
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (netErr) {
    console.error('[NutriBot] Cannot reach backend:', netErr.message);
    throw new Error('BACKEND_UNREACHABLE');
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    console.error('[NutriBot] Backend error:', response.status, JSON.stringify(errBody));
    if (response.status === 401) throw new Error('INVALID_API_KEY');
    if (response.status === 429) throw new Error('RATE_LIMITED');
    if (errBody?.error === 'CONTEXT_TOO_LONG') throw new Error('CONTEXT_TOO_LONG');
    throw new Error(errBody?.error || `API_ERROR_${response.status}`);
  }

  const data  = await response.json();
  const reply = data?.reply?.trim();

  if (!reply) throw new Error('EMPTY_RESPONSE');
  return reply;
}
