'use client';
import { SnackbarProvider } from 'notistack';

export function Providers({ children }: { children: JSX.Element }) {
  return <SnackbarProvider>{children}</SnackbarProvider>;
}
