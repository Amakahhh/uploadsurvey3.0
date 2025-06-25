// pages/api/kora/checkout.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const secretKey = process.env.KORA_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ error: 'KORA_SECRET_KEY not set in .env.local' });
  }

  try {
    const response = await fetch('https://api.korapay.com/merchant/api/v1/checkout/session', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 10000, // Must be in kobo: ₦100 = 10000
        currency: 'NGN',
        reference: `SURVEY-${Date.now()}`,
        redirect_url: 'http://localhost:3000/survey/success',
        customer: {
          name: 'Test User',
          email: 'test@example.com',
        },
      }),
    });

    const data = await response.json();

    console.log('🧾 Kora Response:', JSON.stringify(data, null, 2)); // 👈 LOG the response

    if (!data?.data?.checkout_url) {
      return res.status(400).json({ error: data?.message || 'Unable to create payment link' });
    }

    return res.status(200).json({ checkout_url: data.data.checkout_url });
  } catch (error) {
    console.error('🔥 Kora API error:', error);
    return res.status(500).json({ error: 'Something went wrong while creating payment link' });
  }
}
