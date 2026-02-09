import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Bricolage_Grotesque } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flow CRM — Menux",
  description: "CRM nativo do ecossistema Menux para gestão comercial e sucesso do cliente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} ${bricolage.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
