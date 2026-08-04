import type { Metadata } from "next";
import "./globals.css";

import { ModalProvider } from "@/components/modals/modal-provider";

export const metadata: Metadata = {
  title: "StoryWriter",
  description: "A browser-based story writing workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}
