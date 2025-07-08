import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * Handles POST requests to the OpenAI Responses API.
 * This acts as a proxy endpoint, forwarding requests to OpenAI and handling structured vs. text responses.
 *
 * @param req The NextRequest object containing the request body.
 * @returns A NextResponse object containing the OpenAI response or an error message.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (body.text?.format?.type === 'json_schema') {
    return await structuredResponse(openai, body);
  } else {
    return await textResponse(openai, body);
  }
}

/**
 * Handles structured responses from the OpenAI Responses API.
 *
 * @param openai The OpenAI client instance.
 * @param body The request body for the structured response.
 * @returns A NextResponse object containing the structured response or an error message.
 */
async function structuredResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.parse({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

/**
 * Handles text responses from the OpenAI Responses API.
 *
 * @param openai The OpenAI client instance.
 * @param body The request body for the text response.
 * @returns A NextResponse object containing the text response or an error message.
 */
async function textResponse(openai: OpenAI, body: any) {
  try {
    const response = await openai.responses.create({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
