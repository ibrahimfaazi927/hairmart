import type { Metadata } from "next";
import "./globals.css";
import HairMartChatbot from "@/components/HairMartChatbot";

export const metadata: Metadata = {
  title: "Hair Mart Studio — Unisex Family Salon | Surathkal, Mangalore",
  description: "Hair Mart Studio Unisex Family Salon near Vishal Mart, Surathkal, Mangalore. Professional haircuts, beard sculpting, hair spas, O3+ & Gold facials. Call 0824-4060938 or WhatsApp 8660549348.",
  keywords: "Hair Mart, Unisex Salon Surathkal, Mangalore Salon, Vishal Mart Surathkal, hair spa, botox, O3+ facial, men haircut, women salon",
  openGraph: {
    title: "Hair Mart Studio — Unisex Family Salon | Surathkal",
    description: "Professional hair care, facial treatments, and grooming services at Hair Mart Unisex Salon, Surathkal, Mangalore.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#080A0D" />
      </head>
      <body>
        {children}
        <HairMartChatbot />
      </body>
    </html>
  );
}
