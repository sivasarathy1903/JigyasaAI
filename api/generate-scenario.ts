import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type, getFallbackScenario } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grade, subject, topic, state, language, tier } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json(getFallbackScenario(grade, subject, topic, state, language, tier));
  }

  try {
    const prompt = `Generate a hyper-local, age-appropriate, culturally relevant real-world challenge for an Indian student.
INPUTS:
- Grade: ${grade}
- Subject: ${subject}
- Curriculum topic: ${topic}
- Student's state/region: ${state}
- Preferred language: ${language}
- Student Tier: ${tier} (SPROUT: LKG–Class 2, EXPLORER: Class 3–5, BUILDER: Class 6–8, INNOVATOR: Class 9–12)

Strict rules:
1. Be rooted in a real situation from the student's geography/culture (${state}).
2. Require the student to DECIDE and REASON, not recall facts.
3. Frame as a mission, crisis, or community problem — never a textbook question.
4. Have no single correct answer — there should be trade-offs.
5. If the preferred language is not English, translate inputs & outputs gracefully, providing English translations adjacent or inside prompt elements.

Respond strictly in the following JSON format structure:
{
  "scenario_title": "Short catchy title",
  "context": "2-3 sentence real-world setup rooted in the student's local geography",
  "mission": "One clear sentence — what the student must decide or solve",
  "constraints": ["Constraint 1", "Constraint 2", "Constraint 3"],
  "what_skills_this_tests": ["Skill 1", "Skill 2"],
  "opening_question": "The first Socratic question to ask the student about this scenario (incorporate the preferred language if appropriate, e.g. Bilingual or direct translation)",
  "teacher_note": "One sentence explaining what critical thinking this develops"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario_title: { type: Type.STRING },
            context: { type: Type.STRING },
            mission: { type: Type.STRING },
            constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
            what_skills_this_tests: { type: Type.ARRAY, items: { type: Type.STRING } },
            opening_question: { type: Type.STRING },
            teacher_note: { type: Type.STRING },
          },
          required: ['scenario_title', 'context', 'mission', 'constraints', 'what_skills_this_tests', 'opening_question', 'teacher_note'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error generating scenario:', error);
    return res.status(200).json(getFallbackScenario(grade, subject, topic, state, language, tier));
  }
}
