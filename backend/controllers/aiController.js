import { getGeminiModel } from '../config/gemini.js';
import Event from '../models/Event.js';

export const summarizeNotice = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide notice text to summarize' });
    }

    const model = getGeminiModel();

    const prompt = `Analyze the following college notice and return a JSON object with these exact keys:
{
  "summary": "2-3 sentence summary",
  "important_dates": ["list of dates mentioned"],
  "deadlines": ["list of deadlines"],
  "venue": "venue if mentioned, else empty string",
  "key_instructions": ["list of key instructions"]
}

Notice text:
${text}

Return ONLY valid JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);
    } catch {
      parsed = {
        summary: response.substring(0, 200),
        important_dates: [],
        deadlines: [],
        venue: '',
        key_instructions: [],
      };
    }

    res.json({ analysis: parsed });
  } catch (error) {
    next(error);
  }
};

export const eventAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a question' });
    }

    const college_id = req.user.college_id || '';
    const events = await Event.find(
      college_id ? { college_id } : {}
    )
      .sort({ date: 1 })
      .limit(50)
      .lean();

    const eventsContext = events.length > 0
      ? events.map(e => `- ${e.title} | ${new Date(e.date).toISOString().split('T')[0]} | ${e.venue} | ${e.time || 'N/A'} | ${e.category} | ${e.description}`).join('\n')
      : 'No events found.';

    const model = getGeminiModel();

    const prompt = `You are a helpful campus event assistant. Answer the user's question based ONLY on the events data provided below.

Available events:
${eventsContext}

User question: ${message}

Provide a friendly, concise answer based on the event data. If the answer isn't in the event data, say so politely.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (error) {
    next(error);
  }
};
