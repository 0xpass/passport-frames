import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from '../config';

const frameMetadata = getFrameMetadata({
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
});

export const metadata: Metadata = {
  title: '0xPass',
  description: 'Create a Passport Passkey',
  openGraph: {
    title: 'Passport Protocol',
    description: 'LFG',
    images: [`${NEXT_PUBLIC_URL}/congrats.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>Passport Protocol</h1>
    </>
  );
}
