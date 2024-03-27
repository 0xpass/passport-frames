import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

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

  if (['jimbo00007', 'tombornal', 'limone.eth'].includes(username)) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            action: 'post_redirect',
            label: 'See Wallet on Basescan',
            target: `${NEXT_PUBLIC_URL}/api/redirect_to_basescan`,
          },
          {
            action: 'post_redirect',
            label: 'Transfer $DEGEN',
            target: `${NEXT_PUBLIC_URL}/api/redirect_to_transfer`,
          },
        ],
        image: {
          src: `${NEXT_PUBLIC_URL}/congrats.png`,
          aspectRatio: '1.91:1',
        },
      }),
    );
  } else {
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${NEXT_PUBLIC_URL}/notwinner.png`,
          aspectRatio: '1.91:1',
        },
      }),
    );
  }
}
