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
    console.log('userData', users[0]);

    const username = users[0].username;

    const castHash = untrustedData.castId.hash;

    const castDetailsResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`,
    );

    if (!castDetailsResponse.ok) {
      throw new Error(`Failed to fetch cast details: ${castDetailsResponse}`);
    }

    let { cast, author } = await castDetailsResponse.json();
    console.log('castDetails', cast);

    const redirect_hash = cast.hash;
    const redirect_username = author.username;

    const redirectUrl = new URL(`${NEXT_PUBLIC_URL}/passkey-create`);
    redirectUrl.searchParams.append('redirect_hash', redirect_hash);
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
