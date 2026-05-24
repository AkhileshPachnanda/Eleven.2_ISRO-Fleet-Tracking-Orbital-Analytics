import NodeCache from "node-cache";

console.log(
  "Groq API key loaded:",
  process.env.GROQ_API_KEY
    ? "YES (length: " + process.env.GROQ_API_KEY.length + ")"
    : "NO",
);

// Cache Groq responses per satellite — 1 hour
// No point regenerating the same summary repeatedly
const cache = new NodeCache({ stdTTL: 60 * 60 });

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function getMissionIntel(satellite) {
  const cacheKey = `groq_${satellite.id}`;
  const cached = cache.get(cacheKey);

  if (cached) return { intel: cached, source: "cache" };

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const prompt = `You are a mission control analyst for ISRO (Indian Space Research Organisation).
Write a 3-sentence operational briefing for the following satellite.
Be terse, technical, and factual. No fluff.

Satellite: ${satellite.name}
Mission type: ${satellite.mission}
Orbit: ${satellite.orbitType}
Launch date: ${satellite.launched}
Mass: ${satellite.mass}kg
Description: ${satellite.description}

Format: Three sentences only. First sentence: current operational status. Second sentence: primary mission function. Third sentence: strategic significance to India.`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const intel = data.choices[0].message.content.trim();

  cache.set(cacheKey, intel);
  return { intel, source: "live" };
}
