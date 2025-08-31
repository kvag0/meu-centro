import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Header } from "@/components/Header";
import { ClerkProvider } from '@clerk/nextjs'; // Importar o ClerkProvider
import { ptBR } from "@clerk/localizations"; // (Opcional) Importar a localização para Português

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeuCentro - Conectando Filhos de Fé",
  description: "Gerencie sua jornada espiritual, diagnósticos e eventos do seu terreiro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        {/* O ClerkProvider deve envolver todos os componentes que precisam
          de acesso à autenticação, incluindo nosso ConvexClientProvider.
        */}
        <ClerkProvider localization={ptBR}>
          <ConvexClientProvider>
            <Header />
            <main className="container mx-auto px-4">{children}</main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
