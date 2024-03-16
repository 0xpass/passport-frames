import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const data = await req.json();
  const { username } = data;

  if (username) {
    const user = await kv.get(`user:${username}`);
    return NextResponse.json(user);
  }

  return NextResponse.json({ error: 'Username not found' });
}

export async function POST(req: Request) {
  const data = await req.json();
  const { username, address } = data;

  if (username && address) {
    await kv.set(`user:${username}`, address);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid username or address' });
}
