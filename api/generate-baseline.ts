import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type, getFallbackBaselineQuestions } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grade, subject, state, language } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json({ questions: getFallbackBaselineQuestions(grade, subject, state) });
  }

  try {
    const prompt = `Generate exactly 5 baseline assessment questions to test a student's current knowledge before an inquiry mission.
INPUTS:
- Grade/Class: ${grade}
- Subject: ${subject}
- State/Region: ${state}
- Language: ${language}

Strict Rules:
1. Difficulty must be precisely calibrated for ${grade}.
2. Provide a mix of question types: MCQ, True/False (TF), Match the Following (MATCH).
3. The Match the following type must include matchPairs (left items and right items).
4. If language is not English, translate the question text and options/pairs appropriately.
5. Return the correct answer in answerKey.

Respond in this JSON format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "matchPairs": [{"left": "A", "right": "1"}],
      "answerKey": "correct answer or pattern"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['MCQ', 'TF', 'MATCH', 'IMAGE'] },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  matchPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        left: { type: Type.STRING },
                        right: { type: Type.STRING }
                      },
                      required: ['left', 'right']
                    }
                  },
                  answerKey: { type: Type.STRING }
                },
                required: ['id', 'question', 'type', 'answerKey']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Generate baseline error:', error);
    return res.status(200).json({ questions: getFallbackBaselineQuestions(grade, subject, state) });
  }
}
