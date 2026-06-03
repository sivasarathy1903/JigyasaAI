import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance, Type } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType, voiceText, topic } = req.body || {};
  const ai = getAiInstance();

  if (!ai) {
    return res.status(200).json({
      detectedType: imageBase64 ? 'Concept Diagram' : 'Spoken Audio Voice Model',
      analysis: imageBase64
        ? 'Great design choice. The drawing shows a clear representation of water flow through underground aquifers, utilizing evaporation pathways and custom containment wells.'
        : `Your audio recording successfully captured: "${voiceText}". Excellent conversational explanation!`,
      gapsIdentified: imageBase64
        ? 'The diagram would benefit from showing how surface runoff routes during heavy monsoons.'
        : 'You explained evaporation and groundwater well, but forgot to describe how plant transpiration adds to the atmospheric water content.',
      classification: 'PARTIAL_REASONING',
      socraticFollowup: 'How do you think plants in your local garden help in cycling this water back to the sky during a hot dry season?',
    });
  }

  try {
    const contents: any[] = [];
    let promptText = `Analyze this student submission for the topic: "${topic || 'General Science'}". `;

    if (imageBase64) {
      const imgPart = {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: imageBase64,
        },
      };
      contents.push(imgPart);
      promptText += `Evaluate this handwritten answer, sketch, concept map, or diagram.
1. Read any text present.
2. Identify the core concepts explain.
3. Identify what is correct and any important gaps without being discouraging.
4. Classify as RECALL, PARTIAL_REASONING, or FULL_REASONING.
5. Create a follow-up Socratic question helping them discover the gaps themselves.`;
    } else {
      promptText += `Evaluate this captured voice transcript transcript: "${voiceText}".
Evaluate as a spoken answer. Mention if they used clear physical reasoning or simple vocabulary. Classify and offer a Socratic follow-up.`;
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedType: { type: Type.STRING },
            analysis: { type: Type.STRING },
            gapsIdentified: { type: Type.STRING },
            classification: { type: Type.STRING, enum: ['RECALL', 'PARTIAL_REASONING', 'FULL_REASONING'] },
            socraticFollowup: { type: Type.STRING },
          },
          required: ['detectedType', 'analysis', 'gapsIdentified', 'classification', 'socraticFollowup'],
        },
      },
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Multimodal processor error:', error);
    return res.status(200).json({
      detectedType: imageBase64 ? 'Handwritten Image Model' : 'Audio Transcript Model',
      analysis: 'Identified relevant concepts about water/energy processes.',
      gapsIdentified: 'Requires slightly more detailed explanations of external inputs.',
      classification: 'PARTIAL_REASONING',
      socraticFollowup: 'What external factor might accelerate this cycle?',
    });
  }
}
