import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey || process.env.MOCK_EXTERNAL_SERVICES === "true") {
      return NextResponse.json({
        reply: "Mock assistant: complete the form, then click Verify Response to get credited.",
      });
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a helpful customer support agent for SurveyHustler, a platform where students earn cash by taking academic surveys, and researchers get respondents. Provide short, concise answers. User asks: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ reply: "Sorry, I'm currently unable to connect to my brain. Please try again later." }, { status: 500 });
  }
}
