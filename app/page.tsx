import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
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
    src: `${NEXT_PUBLIC_URL}/intro.png`,
    aspectRatio: '1.91:1',
  },
});

export const metadata: Metadata = {
  title: '0xPass',
  description: 'Create a Passport Passkey',
  openGraph: {
    title: 'Passport Protocol',
    description: 'LFG',
    images: [`${NEXT_PUBLIC_URL}/intro.png`],
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
