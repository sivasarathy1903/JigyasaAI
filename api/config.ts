import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiInstance } from './_utils/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(455).json({ error: 'Method not allowed' });
  }

  const ai = getAiInstance();
  return res.status(200).json({
    hasApiKey: !!ai,
    appUrl: process.env.APP_URL || 'http://localhost:3000',
  });
}
