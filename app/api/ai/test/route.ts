// app/api/ai/test/route.ts
import { testOpenAIConnection } from '@/app/services/openai-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await testOpenAIConnection();
    return NextResponse.json({ success: true, message: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to connect to OpenAI' },
      { status: 500 }
    );
  }
}
