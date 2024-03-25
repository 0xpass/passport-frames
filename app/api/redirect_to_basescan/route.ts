import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body: FrameRequest = await req.json();
  const { isValid } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (!isValid) {
    throw new Error('Invalid frame request');
  }

  const { untrustedData } = body;
  const options = {
    method: 'GET',
    headers: { api_key: `NEYNAR_ONCHAIN_KIT` },
  };

  const userDetailsResponse = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${untrustedData.fid}`,
    options,
  );

  if (!userDetailsResponse.ok) {
    throw new Error(`Failed to fetch user details: ${userDetailsResponse.statusText}`);
  }

  const { users } = await userDetailsResponse.json();
  const username = users[0].username;

  const address = await kv.get(`user:${username}`);

  return NextResponse.redirect(`https://basescan.org/address/${address}`, {
    status: 302,
  });
}
