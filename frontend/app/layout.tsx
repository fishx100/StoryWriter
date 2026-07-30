import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StoryWriter',
  description: 'A browser-based story writing workspace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
