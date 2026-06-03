import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type, getFallbackPersonalizedMission } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grade, subject, topic, state, language, baselineScore, category } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json(getFallbackPersonalizedMission(grade, subject, topic, state, baselineScore, category));
  }

  try {
    const prompt = `Generate a personalized Socratic inquiry mission for a student based on their baseline assessment profile.
INPUTS:
- Class: ${grade}
- Subject: ${subject}
- Topic: ${topic}
- State: ${state}
- Language: ${language}
- Student Baseline Score: ${baselineScore}/100 (Category: ${category})

Personalization rules:
- Beginner (0-30): Simpler mission goals, structured tasks, more guided hints.
- Developing (31-60): Interactive, clear scaffold steps.
- Intermediate (61-80): Balanced, requires critical resource mapping.
- Advanced (81-100): High-level system design, complex trade-offs, critical thinking prompts.

Respond in this JSON format:
{
  "missionTitle": "Short catchy mission name",
  "missionGoal": "1-2 sentence core objective calibrated for their category",
  "realWorldTask": "Specific action task they must solve",
  "reflectionQuestions": ["Reflection Q1", "Reflection Q2"],
  "parentActivity": "Home-based discussion or activity for parent involvement",
  "teacherRubric": [
    {
      "criteria": "Name of capability",
      "description": "What is evaluated",
      "levels": {
        "beginner": "Criteria for beginners",
        "intermediate": "Criteria for intermediate",
        "advanced": "Criteria for advanced"
      }
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
            missionTitle: { type: Type.STRING },
            missionGoal: { type: Type.STRING },
            realWorldTask: { type: Type.STRING },
            reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            parentActivity: { type: Type.STRING },
            teacherRubric: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criteria: { type: Type.STRING },
                  description: { type: Type.STRING },
                  levels: {
                    type: Type.OBJECT,
                    properties: {
                      beginner: { type: Type.STRING },
                      intermediate: { type: Type.STRING },
                      advanced: { type: Type.STRING }
                    },
                    required: ['beginner', 'intermediate', 'advanced']
                  }
                },
                required: ['criteria', 'description', 'levels']
              }
            }
          },
          required: ['missionTitle', 'missionGoal', 'realWorldTask', 'reflectionQuestions', 'parentActivity', 'teacherRubric']
        }
      }
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Generate personalized mission error:', error);
    return res.status(200).json(getFallbackPersonalizedMission(grade, subject, topic, state, baselineScore, category));
  }
}
