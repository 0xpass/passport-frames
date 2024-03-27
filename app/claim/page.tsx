import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from '../config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: 'post',
      label: 'Click to check if you are a winner',
      target: `${NEXT_PUBLIC_URL}/api/check_if_winner`,
    },
  ],
  image: {
    src: `${NEXT_PUBLIC_URL}/check-if-winner.png`,
    aspectRatio: '1.91:1',
  },
});

export const metadata: Metadata = {
  title: '0xPass',
  description: 'Create a Passport Passkey',
  openGraph: {
    title: 'Passport Protocol',
    description: 'LFG',
    images: [`${NEXT_PUBLIC_URL}/check-if-winner.png`],
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
