import './globals.css';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Providers>
        <body className={`bg-black text-white`}>{children}</body>
      </Providers>
    </html>
  );
}
