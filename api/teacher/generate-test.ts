import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type, getFallbackQuestions } from '../_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, grade, subject } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json({ questions: getFallbackQuestions(topic) });
  }

  try {
    const prompt = `You are Today's Test Generator for Jigyasa AI.
Generate exactly 10 questions at 3 Bloom taxonomy levels (Knowledge, Application, Analysis) calibrated for:
Grade: ${grade}
Subject: ${subject}
Topic: ${topic}

Include MCQ option formats (where appropriate) or open answers with key reasoning hints.
Output strictly as JSON structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "level": "Knowledge" | "Application" | "Analysis",
      "options": ["A", "B", "C", "D"],
      "answerKey": "The correct answer or ideal critical answer pattern"
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
                  question: { type: Type.STRING },
                  level: { type: Type.STRING, enum: ['Knowledge', 'Application', 'Analysis'] },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answerKey: { type: Type.STRING },
                },
                required: ['question', 'level', 'answerKey'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Generate quiz error:', error);
    return res.status(200).json({ questions: getFallbackQuestions(topic) });
  }
}
