import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { currentScenario, latestStudentAnswer, tier, language } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json({
      challengeText: `I see where you're coming from. But let's look at the numbers. Who is going to bear the cost of this program? Are the small vendors ready to pay for paper bags?`,
      acknowledgedValue: 'Your strategy is quite environment friendly',
      assumptionChallenged: 'Assuming vendors can afford paper bags',
      scores: {
        evidenceQuality: 4,
        logicalConsistency: 3,
        awarenessOfTradeoffs: 3,
        creativity: 4,
      },
    });
  }

  try {
    const prompt = `You are the Devil's Advocate module of Jigyasa AI.
SCENARIO: ${JSON.stringify(currentScenario)}
STUDENT ANSWER: "${latestStudentAnswer}"
STUDENT TIER: ${tier}
LANGUAGE: ${language}

Your task:
Take the strongest possible opposing position to challenge the student's reasoning to make their thinking stronger.
Rules:
1. Always acknowledge ONE reasonable thing the student said before challenging.
2. Pick the weakest assumption in their argument and challenge it directly.
3. Ask ONE sharp challenge question calibrated to their tier.
4. Rate their answer on 4 parameters (out of 5):
   - Evidence Quality
   - Logical Consistency
   - Awareness of Trade-offs
   - Creativity

Output strictly as JSON:
{
  "challengeText": "Calibrated Devil's Advocate challenge message",
  "acknowledgedValue": "What you agreed was reasonable",
  "assumptionChallenged": "The key weak assumption you are targeting",
  "scores": {
    "evidenceQuality": 4,
    "logicalConsistency": 3,
    "awarenessOfTradeoffs": 3,
    "creativity": 4
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
            challengeText: { type: Type.STRING },
            acknowledgedValue: { type: Type.STRING },
            assumptionChallenged: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                evidenceQuality: { type: Type.INTEGER },
                logicalConsistency: { type: Type.INTEGER },
                awarenessOfTradeoffs: { type: Type.INTEGER },
                creativity: { type: Type.INTEGER },
              },
              required: ['evidenceQuality', 'logicalConsistency', 'awarenessOfTradeoffs', 'creativity'],
            },
          },
          required: ['challengeText', 'acknowledgedValue', 'assumptionChallenged', 'scores'],
        },
      },
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Devils advocate error:', error);
    return res.status(200).json({
      challengeText: 'Good initial idea, but if funds are halved, how will that work?',
      acknowledgedValue: 'Promoting native crops',
      assumptionChallenged: 'Unlimited resources available',
      scores: { evidenceQuality: 3, logicalConsistency: 3, awarenessOfTradeoffs: 3, creativity: 4 },
    });
  }
}
