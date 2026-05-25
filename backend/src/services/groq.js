import NodeCache from "node-cache";

// Cache Groq responses per satellite — 1 hour
// No point regenerating the same summary repeatedly
const cache = new NodeCache({ stdTTL: 60 * 60 });

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function getGroqApiKey() {
  const raw = process.env.GROQ_API_KEY || "";
  // Handle accidental quoting or trailing spaces in .env
  return raw.trim().replace(/^['"]|['"]$/g, "");
}

function sanitizeModelOutput(text) {
  if (!text) return "";

  // Remove internal reasoning blocks if a model emits them.
  const withoutThinkBlocks = text.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Remove stray think tags if the block is malformed.
  const withoutThinkTags = withoutThinkBlocks.replace(/<\/?think>/gi, "");

  return withoutThinkTags.trim();
}

export async function getMissionIntel(satellite) {
  const cacheKey = `groq_v3_${satellite.id}`;
  const cached = cache.get(cacheKey);

  if (cached) return { intel: cached, source: "cache" };

  const apiKey = getGroqApiKey();

  if (!apiKey) {
    const configError = new Error("GROQ_API_KEY not configured");
    configError.status = 500;
    throw configError;
  }

  const prompt = `You are an expert Science Communicator for ISRO, skilled at explaining complex space missions to the general public.
Write a 3-sentence summary for the following satellite that is easy to digest for a layman, focusing on its practical real-world value.
Avoid dense technical jargon and acronyms. Keep the tone clear, engaging, and factual.

Satellite Data:
- Name: ${satellite.name}
- Mission type: ${satellite.mission}
- Orbit: ${satellite.orbitType}
- Launch date: ${satellite.launched}
- Mass: ${satellite.mass}kg
- Description: ${satellite.description}

Format Requirements (Exactly 3 sentences):
1. Identity & Status: Introduce the satellite and its active status in simple terms.
2. Primary Purpose: Explain exactly what it does in everyday language (e.g., instead of "optical multispectral payload", use "takes high-resolution photos of Earth").
3. Real-World Impact: State the strategic significance or how it helps India (e.g., aiding farmers, disaster management, or communications).

Strict Constraints:
- Do not include any internal reasoning, analysis, or <think> tags.
- Return ONLY the final 3-sentence text. No introductory remarks, labels, or extra formatting.`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-32b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.4,
      reasoning_effort: "none",
      reasoning_format: "hidden",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401) {
      const authError = new Error(
        "Groq auth failed (401): invalid/expired GROQ_API_KEY in backend environment",
      );
      authError.status = 401;
      throw authError;
    }
    const apiError = new Error(`Groq API error: ${response.status} — ${err}`);
    apiError.status = response.status;
    throw apiError;
  }

  const data = await response.json();
  const rawIntel = data.choices?.[0]?.message?.content || "";
  const intel = sanitizeModelOutput(rawIntel) || rawIntel.trim();

  cache.set(cacheKey, intel);
  return { intel, source: "live" };
}
