import { NextResponse } from 'next/server';

/**
 * Handles GET requests to create a new Realtime API session.
 * This function makes a POST request to the OpenAI Realtime API to obtain an ephemeral session token.
 *
 * @returns A NextResponse object containing the session data or an error message.
 */
export async function GET() {
  try {
    const response = await fetch(
      'https://api.openai.com/v1/realtime/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2025-06-03',
        }),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
