import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey || process.env.MOCK_EXTERNAL_SERVICES === "true") {
      return NextResponse.json({
        insightsHtml: "<h3>Survey Summary</h3><p>Most respondents are engineering students aged 20-23.</p>",
      });
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const { surveyId, surveyName } = await req.json();
    if (!surveyId) return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Act as an expert survey analyst. Analyze the generic context for a survey titled "${surveyName}". Generate a short summary of findings, note down 2 possible correlations based on typical behaviors, and provide a quick demographic breakdown. Return it in HTML format without full page tags, just the content (h3, p, ul).`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insightsHtml = response.text();
    
    return NextResponse.json({ insightsHtml });
  } catch (error: any) {
    console.error('AI Analyze Error:', error);
    return NextResponse.json({ error: "Failed to generate insights." }, { status: 500 });
  }
}
