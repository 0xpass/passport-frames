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
  const options = { method: 'GET', headers: { Authorization: `Bearer ${process.env.PINATA_API}` } };

  const userDetails = await fetch(
    `https://api.pinata.cloud/v3/farcaster/users/${untrustedData.fid}`,
    options,
  );
  const { data: userData } = await userDetails.json();

  const username = userData.username;

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
