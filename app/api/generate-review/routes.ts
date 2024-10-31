import OpenAI from 'openai';
import { NextResponse } from 'next/server';

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
    // Validate request method
    if (request.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Parse the request body
    const body: RequestBody = await request.json();
    const { apiKey, formData } = body;

    // Validate required fields
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (!formData?.serviceType || !formData?.staffName || !formData?.specific || !formData?.improvement) {
      return NextResponse.json({ error: 'Missing required form fields' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Create completion
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

    // Check if the completion has choices and content
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    // Return the generated review
    return NextResponse.json({ review: completion.choices[0].message.content });

  } catch (error) {
    console.error('Error in generate-review route:', error);
    
    // Handle different types of errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    // For any other error, return a generic error message
    return NextResponse.json(
      { error: 'An error occurred while generating the review. Please try again.' },
      { status: 500 }
    );
  }
}