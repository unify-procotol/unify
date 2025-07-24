import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.redirect(new URL('/favicon.ico', 'https://ai-chat-example.pages.dev'));
} 