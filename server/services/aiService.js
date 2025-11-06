import fetch from "node-fetch";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function generateBookSummary(title, author, description) {
  const prompt = `צור סיכום תמציתי (2–3 משפטים) לספר בשם "${title}" מאת "${author}". 
תיאור הספר: ${description}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";
}