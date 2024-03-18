import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
  try {
    const body: FrameRequest = await req.json();

    console.log(body);
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
    console.log('userData', users[0]);

    const username = users[0].username;

    const castHash = untrustedData.castId.hash;
    console.log('castHash', castHash);

    const castDetailsResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`,
      options,
    );

    if (!castDetailsResponse.ok) {
      let errorMessage = `Failed to fetch cast details: ${castDetailsResponse.statusText}`;
      try {
        const errorBody = await castDetailsResponse.json();
        errorMessage += ` - ${errorBody.message}`;
      } catch (bodyError) {
        console.error('Error parsing error response body:', bodyError);
      }
      throw new Error(errorMessage);
    }

    const cast = await castDetailsResponse.json();
    console.log('castDetails', cast);

    const redirect_hash = cast.cast.hash;
    const redirect_username = cast.cast.author.username;

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
