import '../globals.css';
import { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <html lang="en">
        <body className={`bg-black text-white`}>{children}</body>
      </html>
    </Suspense>
  );
}
