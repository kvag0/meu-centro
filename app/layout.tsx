import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ["latin"],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: "MeuCentro",
  description: "Gerencie seu terreiro com facilidade e axé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // O ClerkProvider envolve toda a aplicação
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body className={`${inter.variable} ${lora.variable} font-sans`}>
          {/* O ConvexClientProvider fica dentro do ClerkProvider */}
          <ConvexClientProvider>
            <Header />
            <main>{children}</main>
            <Toaster />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

