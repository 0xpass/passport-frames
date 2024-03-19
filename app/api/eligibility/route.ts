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

  const usersInChannelResponse = await fetch(
    `https://api.neynar.com/v2/farcaster/channel/followers?id=0xpass&limit=300`,
    options,
  );

  if (!usersInChannelResponse.ok) {
    throw new Error(`Failed to fetch user details: ${usersInChannelResponse.statusText}`);
  }

  const { users: usersInChannel } = await usersInChannelResponse.json();
  const inChannel = usersInChannel.some((user: any) => user.fid === untrustedData.fid);

  const eligible = liked && recasted && address && inChannel;

  if (eligible) {
    await kv.set(`eligiblity:${username}`, true);

    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `https://dynamic-image.vercel.app/api/generate/png/yellowish-yellow.png?title=You%20are%20eligible%20your%20passport%20wallet%20address%20is%20below&content=${address}&ref=website`,
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
          {
            action: 'post',
            label: 'Check Eligbility',
            target: `${NEXT_PUBLIC_URL}/api/eligibility`,
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
