import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { currentScenario, chatHistory, latestMessage, tier, language } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json({
      classification: 'PARTIAL_REASONING',
      text: `That is an interesting thought! But what would happen if the local community feels left out of this decision? How would you solve that?`,
    });
  }

  try {
    const formattedHistory = (chatHistory || [])
      .map((m: any) => `${m.sender === 'ai' ? 'AI Socratic Coach' : 'Student'}: ${m.text}`)
      .join('\n');

    const prompt = `You are conducting a Socratic questioning session on the following scenario.
SCENARIO: ${JSON.stringify(currentScenario)}
STUDENT TIER: ${tier}
LANGUAGE: ${language}

CHAT CONTEXT:
${formattedHistory}
Student's latest response: "${latestMessage}"

Your tasks:
1. Classify the user response internally as exactly one of: [RECALL], [PARTIAL_REASONING], [FULL_REASONING].
- [RECALL]: Definition/memorized. Probes deeper with a "why" or "what if".
- [PARTIAL_REASONING]: Acknowledges one thing, probes the key remaining gap.
- [FULL_REASONING]: Excellent logic. Takes it one level deeper with a harder follow-up.
2. Formulate your Socratic reply in 2-3 sentences. Do not define terms. Ask an open query that pushes reasoning.
3. Answer back in the same language code or language tone used by the student (including regional mixes).

Return strictly in JSON:
{
  "classification": "RECALL" | "PARTIAL_REASONING" | "FULL_REASONING",
  "text": "Your Socratic follow-up reply"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: { type: Type.STRING, enum: ['RECALL', 'PARTIAL_REASONING', 'FULL_REASONING'] },
            text: { type: Type.STRING },
          },
          required: ['classification', 'text'],
        },
      },
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Socratic Probe error:', error);
    return res.status(200).json({
      classification: 'PARTIAL_REASONING',
      text: 'How would that option affect the other people living in that village? What could we do to balance both needs?',
    });
  }
}
