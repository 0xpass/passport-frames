import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

export async function POST(req: Request) {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

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
  const liked = message?.liked;
  const recasted = message?.recasted;

  if (address && liked && recasted) {
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${NEXT_PUBLIC_URL}/eligible.png`,
          aspectRatio: '1.91:1',
        },
      }),
    );
  } else {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            action: 'post_redirect',
            label: 'Create Passkey',
            target: `${NEXT_PUBLIC_URL}/api/passkey`,
          },
        ],
        image: {
          src: `${NEXT_PUBLIC_URL}/not-eligible.png`,
          aspectRatio: '1.91:1',
        },
      }),
    );
  }
}
