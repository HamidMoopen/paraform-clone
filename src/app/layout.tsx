import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PersonaProvider } from "@/providers/persona-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jobaform",
  description: "A minimal job board for hiring managers and candidates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PersonaProvider>
          {children}
          <Toaster position="bottom-right" richColors theme="dark" />
        </PersonaProvider>
      </body>
    </html>
  );
}
