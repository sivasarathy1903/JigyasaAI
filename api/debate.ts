import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type, getFallbackDebateResponse } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, studentPosition, currentStep, lastResponse, history, language, tier } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json(getFallbackDebateResponse(currentStep));
  }

  try {
    const formattedHistory = (history || [])
      .map((h: any) => `${h.role === 'student' ? 'Student' : 'AI Opponent'}: ${h.text}`)
      .join('\n');

    const prompt = `You are the AI Debate Moderator & Opponent for Jigyasa AI.
Current Step: Turn ${currentStep} of the 8-turn debate framework:
- Turn 1: RESEARCH PHASE (Gather student's 3 stronger arguments).
- Turn 2: OPENING ARGUMENT (Ask student to state opening in 3-4 sentences).
- Turn 3: AI CHALLENGE (AI presents strongest 2 counter-arguments).
- Turn 4: STUDENT REBUTTAL.
- Turn 5: ESCALATION (Introduce fresh complicated real-world detail).
- Turn 6: STUDENT COUNTER.
- Turn 7: REFLECTION (Would they change their mind, why?).
- Turn 8: SKILL ASSESSMENT (JSON with scores and critical analysis).

DEBATE CONTEXT:
Topic: ${topic}
Student Position: ${studentPosition} (FOR or AGAINST)
Tier: ${tier}
Language: ${language}

Chat history so far:
${formattedHistory}

Student's latest reply: "${lastResponse}"

Instructions for your turn:
Formulate the next turn according to the 8-turn sequence.
If currentStep is 8, you MUST output a valid JSON containing 'scoreCard'.
For all other turns, return the AI text directly.

Output strictly as JSON:
{
  "step": ${currentStep},
  "phase": "Phase Description name",
  "message": "AI voice speaking to student in standard text (calibrated to language/tier)",
  "scoreCard": {
    "communication": { "score": "8/10", "feedback": "Detailed feedback..." },
    "critical_thinking": { "score": "9/10", "feedback": "Detailed feedback..." },
    "evidence_use": { "score": "7/10", "feedback": "Detailed feedback..." },
    "persuasion": { "score": "8/10", "feedback": "Detailed feedback..." },
    "overall_summary": "Overall evaluation summary"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.INTEGER },
            phase: { type: Type.STRING },
            message: { type: Type.STRING },
            scoreCard: {
              type: Type.OBJECT,
              properties: {
                communication: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.STRING }, feedback: { type: Type.STRING } },
                  required: ['score', 'feedback'],
                },
                critical_thinking: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.STRING }, feedback: { type: Type.STRING } },
                  required: ['score', 'feedback'],
                },
                evidence_use: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.STRING }, feedback: { type: Type.STRING } },
                  required: ['score', 'feedback'],
                },
                persuasion: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.STRING }, feedback: { type: Type.STRING } },
                  required: ['score', 'feedback'],
                },
                overall_summary: { type: Type.STRING },
              },
              required: ['communication', 'critical_thinking', 'evidence_use', 'persuasion', 'overall_summary'],
            },
          },
          required: ['step', 'phase', 'message'],
        },
      },
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Debate error:', error);
    return res.status(200).json(getFallbackDebateResponse(currentStep));
  }
}
