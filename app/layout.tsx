import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").host;
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const title = "Maysa Braids | Trancista em Nova Contagem - MG";
  const description = "Tranças com identidade, cuidado e elegância: box braids, fulani, goddess, french curls e mais. Veja os horários livres e agende online.";

  return {
    title,
    description,
    icons: { icon: "/images/maysa-icon.jpg", apple: "/images/maysa-icon.jpg" },
    openGraph: {
      title: "Maysa Braids | Trancista",
      description: "Tranças que elevam a sua autoestima.",
      type: "website",
      locale: "pt_BR",
      images: [{ url: `${baseUrl}/og.png`, width: 1200, height: 630, alt: "Maysa Braids, trancista" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Maysa Braids | Trancista",
      description: "Tranças que elevam a sua autoestima.",
      images: [`${baseUrl}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
