/**
 * NutriSoil Backend — server/index.js
 *
 * What this does:
 *   1. Loads GROQ_API_KEY from server/.env — never exposed to the browser
 *   2. Queries Groq /openai/v1/models at startup to find what is actually
 *      available to this key, and auto-selects the best working model
 *   3. Exposes POST /api/chat as a secure proxy for the React frontend
 *
 * Endpoint:
 *   POST /api/chat
 *   Body  → { messages: [{role, content}], temperature?, max_tokens? }
 *   Reply ← { reply: string, model: string }
 */

import 'dotenv/config';
import express from 'express';
import cors    from 'cors';

const app  = express();
const PORT = Number(process.env.PORT) || 3001;

/* ─── 1. Load & validate the API key ────────────────────────────────────── */
const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();

if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
  console.error('\n  ❌  GROQ_API_KEY is not set in server/.env');
  console.error('  ➜  Open server/.env, replace "your_groq_api_key_here" with your gsk_... key');
  console.error('  ➜  https://console.groq.com/keys\n');
  process.exit(1);
}

/* ─── 2. Groq endpoint ───────────────────────────────────────────────────── */
const GROQ_BASE = 'https://api.groq.com/openai/v1';

/* ─── 3. Model preference list ──────────────────────────────────────────── */
// Tried in order — first one found in the account's model list wins.
const PREFERRED_MODELS = [
  'qwen/qwen3.6-27b',
  'llama-3.1-8b-instant',    // fast, 128 k ctx — best default
  'llama3-8b-8192',          // legacy 8 k alias
  'llama3-70b-8192',         // larger legacy
  'llama-3.3-70b-versatile', // may exist on some keys
  'gemma2-9b-it',            // Google Gemma via Groq
  'mixtral-8x7b-32768',      // Mixtral fallback
];

let activeModel = null;

/* ─── 4. Auto-discover the best available model ──────────────────────────── */
async function discoverModel() {
  try {
    const res = await fetch(`${GROQ_BASE}/models`, {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`[Backend] Cannot list models (HTTP ${res.status}): ${txt}`);
      return null;
    }

    const { data } = await res.json();
    const ids = (data || []).map((m) => m.id);

    console.log('[Backend] Models available to this key:');
    ids.forEach((id) => console.log(`  • ${id}`));

    // Pick the first preferred model that the key can actually access
    for (const pref of PREFERRED_MODELS) {
      if (ids.includes(pref)) {
        console.log(`[Backend] ✅  Selected model: ${pref}`);
        return pref;
      }
    }

    // Generic fallback — any non-audio model
    const fallback = ids.find(
      (id) =>
        !id.includes('whisper') &&
        !id.includes('tts') &&
        !id.includes('guard') &&
        !id.includes('orpheus') &&
        !id.includes('arabic') &&
        !id.includes('translation')
    );
    if (fallback) {
      console.log(`[Backend] ⚠️  No preferred model found — falling back to: ${fallback}`);
      return fallback;
    }

    console.error('[Backend] ❌  No usable chat model found for this API key.');
    return null;
  } catch (err) {
    console.error('[Backend] ❌  Error querying /models:', err.message);
    return null;
  }
}

/* ─── 5. Middleware ──────────────────────────────────────────────────────── */
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '2mb' }));

/* ─── 6. GET /api/health ─────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: activeModel });
});

/* ─── 7. POST /api/chat ──────────────────────────────────────────────────── */
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!activeModel) {
    return res.status(503).json({ error: 'NO_MODEL_AVAILABLE' });
  }

  const payload = {
    model: activeModel,
    messages,
    temperature: 0.7,
    max_tokens: 512,
    top_p: 0.8,
    stream: false,
    reasoning_effort: 'none',
    reasoning_format: 'hidden'
  };

  let groqRes;
  try {
    groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
  } catch (netErr) {
    console.error('[Backend] Network error reaching Groq:', netErr.message);
    return res.status(502).json({ error: 'GROQ_UNREACHABLE' });
  }

  console.log('[Backend] Chat model:', activeModel);
  console.log('[Backend] Groq status:', groqRes.status);

  if (!groqRes.ok) {
    const errorBody = await groqRes.json().catch(() => null);
    const errorText = errorBody ? JSON.stringify(errorBody) : await groqRes.text().catch(() => 'No details available');
    console.error('[Backend] Groq Error Status:', groqRes.status);
    console.error('[Backend] Groq Error Message:', errorText);
    return res.status(groqRes.status).json({ error: `GROQ_ERROR_${groqRes.status}`, message: errorText });
  }

  const groqBody = await groqRes.json().catch(() => ({}));
  const rawReply = groqBody?.choices?.[0]?.message?.content;
  if (!rawReply) return res.status(500).json({ error: 'EMPTY_RESPONSE' });

  // Clean reasoning <think> blocks and leftover headers
  let cleanedReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '');
  cleanedReply = cleanedReply.replace(/^\s*\[output\]\s*/i, '');
  cleanedReply = cleanedReply.replace(/^\s*output:\s*/i, '');
  cleanedReply = cleanedReply.replace(/^\s*\[Output\]\s*/i, '');
  cleanedReply = cleanedReply.trim();

  return res.json({
    reply: cleanedReply,
    model: activeModel
  });
});

/* ─── 8. Start ───────────────────────────────────────────────────────────── */
(async () => {
  console.log('[Backend] Querying Groq for available models…');
  activeModel = await discoverModel();

  if (!activeModel) {
    console.error('[Backend] ❌  Startup failed — no usable model. Check your API key.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('');
    console.log(`  🚀  NutriSoil backend  →  http://localhost:${PORT}`);
    console.log(`  🤖  Groq model         →  ${activeModel}`);
    console.log(`  🔒  API key            →  loaded from server/.env  (never sent to browser)`);
    console.log('');
  });
})();
