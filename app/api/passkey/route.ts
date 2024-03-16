import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
  const body: FrameRequest = await req.json();

  console.log(body);

  const { untrustedData } = body;
  const options = { method: 'GET', headers: { Authorization: `Bearer ${process.env.PINATA_API}` } };

  const userDetails = await fetch(
    `https://api.pinata.cloud/v3/farcaster/users/${untrustedData.fid}`,
    options,
  );
  const { data: userData } = await userDetails.json();

  const username = userData.username;

  const castHash = untrustedData.castId.hash;
  let castDetails = await fetch(`https://api.pinata.cloud/v3/farcaster/casts/${castHash}`, options);
  let { data } = await castDetails.json();

  const redirect_shortHash = data.short_hash;
  const redirect_username = data.author.username;

  const redirectUrl = new URL(`${NEXT_PUBLIC_URL}/passkey-create`);
  redirectUrl.searchParams.append('redirect_shorthash', redirect_shortHash);
  redirectUrl.searchParams.append('redirect_username', redirect_username);
  redirectUrl.searchParams.append('username', username);

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
