// import type { VercelRequest, VercelResponse } from '@vercel/node';

// const OPENAI_API_KEY = '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';

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   // CORS headers
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     // Respond to preflight request
//     return res.status(200).end();
//   }

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const { imageUrl } = req.body;
//   if (!imageUrl) {
//     return res.status(400).json({ error: 'Missing imageUrl' });
//   }

//   try {
//     const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o',
//         messages: [
//           {
//             role: 'user',
//             content: [
//               { type: 'text', text: 'Describe this product image for an e-commerce listing.' },
//               { type: 'image_url', image_url: { url: imageUrl } },
//             ],
//           },
//         ],
//         max_tokens: 100,
//       }),
//     });

//     if (!openaiRes.ok) {
//       const error = await openaiRes.text();
//       return res.status(500).json({ error: 'OpenAI API error', details: error });
//     }

//     const data = await openaiRes.json();
//     const description = data.choices?.[0]?.message?.content?.trim() || '';
//     return res.status(200).json({ description });
//   } catch (err: any) {
//     return res.status(500).json({ error: 'Server error', details: err.message });
//   }
// } 