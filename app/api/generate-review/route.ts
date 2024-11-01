import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface RequestBody {
  apiKey: string;
  formData: {
    serviceType: string;
    staffName: string;
    specific: string;
    improvement: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { apiKey, formData } = body;

    console.log(body);

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (!formData?.serviceType || !formData?.staffName || !formData?.specific || !formData?.improvement) {
      return NextResponse.json({ error: 'Missing required form fields' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `
          Generate a natural, detailed review for a ${formData.serviceType} service.
          Include these details naturally in the review:
          - Staff member name: ${formData.staffName}
          - Specific positive aspects: ${formData.specific}
          - Standout features: ${formData.improvement}
          
          The review should:
          - Sound natural and conversational
          - Include specific details but avoid overly promotional language
          - Be suitable for platforms like Google Reviews or Yelp
          - Be between 100-150 words
          - Maintain a positive but genuine tone
          - Include relevant keywords for SEO naturally
        `
      }],
      temperature: 0.7,
      max_tokens: 250
    });

    return NextResponse.json({ review: completion.choices[0].message.content });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: `OpenAI API error: ${error.message}` }, { status: error.status || 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}