import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
  try {
    const body: FrameRequest = await req.json();

    console.log(body);

    const { untrustedData } = body;
    const options = {
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.PINATA_API}` },
    };

    const userDetailsResponse = await fetch(
      `https://api.pinata.cloud/v3/farcaster/users/${untrustedData.fid}`,
      options,
    );

    if (!userDetailsResponse.ok) {
      throw new Error(`Failed to fetch user details: ${userDetailsResponse.statusText}`);
    }

    const { data: userData } = await userDetailsResponse.json();
    console.log('userData', userData);

    const username = userData.username;

    const castHash = untrustedData.castId.hash;

    const castDetailsResponse = await fetch(
      `https://api.pinata.cloud/v3/farcaster/casts/${castHash}`,
      options,
    );

    if (!castDetailsResponse.ok) {
      throw new Error(`Failed to fetch cast details: ${castDetailsResponse.statusText}`);
    }

    let { data } = await castDetailsResponse.json();
    console.log('castDetails', data);

    const redirect_shortHash = data.short_hash;
    const redirect_username = data.author.username;

    const redirectUrl = new URL(`${NEXT_PUBLIC_URL}/passkey-create`);
    redirectUrl.searchParams.append('redirect_shorthash', redirect_shortHash);
    redirectUrl.searchParams.append('redirect_username', redirect_username);
    redirectUrl.searchParams.append('username', username);

    return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
  } catch (error) {
    console.error(error);
    return new NextResponse(error instanceof Error ? error.message : String(error), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
