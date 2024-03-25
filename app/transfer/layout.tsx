import '../globals.css';
import { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <html lang="en">
        <body className={`bg-black text-white`}>{children}</body>
      </html>
    </Suspense>
  );
}
