import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type, getFallbackConsequence } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentDecision, scenarioContext, grade } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json(getFallbackConsequence(studentDecision));
  }

  try {
    const prompt = `You are the Consequence Simulator of Jigyasa AI.
YOUR JOB: Simulate realistic long-term consequences of this decision across multiple horizons. Show second-order effects.
INPUT DECISION: "${studentDecision}"
SCENARIO CONTEXT: "${scenarioContext}"
GRADE: ${grade}

Output structure strictly in JSON format:
{
  "decision_summary": "One sentence paraphrase of decision",
  "timeline": [
    {
      "period": "Week 1",
      "positive_effects": ["Positive impact 1"],
      "negative_effects": ["Negative impact 1"],
      "unexpected_effect": "Unforeseen scenario"
    },
    {
      "period": "Month 3",
      "positive_effects": ["Positive impact 2"],
      "negative_effects": ["Negative impact 2"],
      "unexpected_effect": "Unforeseen issue/gift"
    },
    {
      "period": "Year 1",
      "positive_effects": ["Positive impact 3"],
      "negative_effects": ["Negative impact 3"],
      "unexpected_effect": "Macro economic/community result"
    },
    {
      "period": "Year 5",
      "positive_effects": ["Future positive 4"],
      "negative_effects": ["Future trade-off 4"],
      "unexpected_effect": "Massive structural change"
    }
  ],
  "reflection_question": "One heavy Socratic reflection query about one trade-off in their system",
  "skills_demonstrated": ["Skill A", "Skill B"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision_summary: { type: Type.STRING },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING },
                  positive_effects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  negative_effects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  unexpected_effect: { type: Type.STRING },
                },
                required: ['period', 'positive_effects', 'negative_effects', 'unexpected_effect'],
              },
            },
            reflection_question: { type: Type.STRING },
            skills_demonstrated: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['decision_summary', 'timeline', 'reflection_question', 'skills_demonstrated'],
        },
      },
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Consequence simulator error:', error);
    return res.status(200).json(getFallbackConsequence(studentDecision));
  }
}
