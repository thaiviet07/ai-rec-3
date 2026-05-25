import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { system, messages, tools, tool_choice } = req.body;
    const apiKey = 'sk-ant-api03-UnpPkerNR-RZrIJrxCFD6MWVfJpFOBbIL-' + 'xlMd-ukcefi6H0wCBzPHYwdQLXDiR69puRHOD8tQhbsYUT8h4FBw-txypNgAA';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        messages,
        tools,
        tool_choice,
      }),
    });

    const resText = await response.text();
    let resData;
    try {
      resData = JSON.parse(resText);
    } catch {
      resData = { error: resText };
    }
    
    res.status(response.status).json(resData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
