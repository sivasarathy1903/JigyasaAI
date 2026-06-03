import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type, getFallbackPassport } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentName, grade, sessionsCompleted, metrics } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json(getFallbackPassport(studentName, grade));
  }

  try {
    const prompt = `Generate a gorgeous Skill Passport competency profile JSON structure based on student logs.
Student Name: ${studentName}
Grade: ${grade}
Sessions: ${sessionsCompleted}
Metrics: ${JSON.stringify(metrics || {})}

Output strictly in JSON:
{
  "passport_id": "JIG-2024-884930",
  "student_name": "${studentName}",
  "grade": "${grade}",
  "issued_date": "June 1, 2026",
  "skill_scores": {
    "critical_thinking": { "score": 85, "level": "Advanced", "evidence": "Defended lake preservation policy successfully" },
    "problem_solving": { "score": 78, "level": "Proficient", "evidence": "Resolved the ₹50L budget constraint problem" },
    "creativity": { "score": 88, "level": "Advanced", "evidence": "Proposed solar evaporation recovery domes" },
    "communication": { "score": 80, "level": "Proficient", "evidence": "Expressed thoughts clearly in regional vernacular" },
    "leadership": { "score": 70, "level": "Developing", "evidence": "Considered village leader roles in Chennai" },
    "collaboration": { "score": 75, "level": "Proficient", "evidence": "Created localized task force divisions" },
    "adaptability": { "score": 82, "level": "Proficient", "evidence": "Adjusted strategy under sudden budget cuts" },
    "innovation": { "score": 84, "level": "Advanced", "evidence": "Devised micro-channel groundwater routing system" }
  },
  "strongest_skill": "Creativity",
  "growth_area": "Leadership",
  "signature_achievement": "Presented a resilient, hyper-localized water restoration roadmap for Chennai council",
  "employer_summary": "Meena is a highly adaptive and analytical young thinker. She excels at combining geographical science constraints with local community realities to drive sustainable, creative civic projects. Ready for realworld environmental action challenges.",
  "recommended_next_challenges": [
    "Drought simulation crisis management",
    "Smart sustainable township design challenge"
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
            passport_id: { type: Type.STRING },
            student_name: { type: Type.STRING },
            grade: { type: Type.STRING },
            issued_date: { type: Type.STRING },
            skill_scores: {
              type: Type.OBJECT,
              properties: {
                critical_thinking: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                problem_solving: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                creativity: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                communication: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                leadership: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                collaboration: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                adaptability: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                innovation: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
              },
              required: ['critical_thinking', 'problem_solving', 'creativity', 'communication', 'leadership', 'collaboration', 'adaptability', 'innovation'],
            },
            strongest_skill: { type: Type.STRING },
            growth_area: { type: Type.STRING },
            signature_achievement: { type: Type.STRING },
            employer_summary: { type: Type.STRING },
            recommended_next_challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['passport_id', 'student_name', 'grade', 'issued_date', 'skill_scores', 'strongest_skill', 'growth_area', 'signature_achievement', 'employer_summary', 'recommended_next_challenges'],
        },
      },
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Skill passport error:', error);
    return res.status(200).json(getFallbackPassport(studentName, grade));
  }
}
