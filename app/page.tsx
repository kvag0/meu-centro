"use client";

import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 bg-brand-linen">
      <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-graphite leading-tight">
        Bem-vindo ao <span className="text-brand-golden-earth">MeuCentro</span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-brand-soft-gray">
        Um espaço digital para organizar, aprender e conectar-se com o sagrado. Gestão de eventos, diagnósticos e uma biblioteca de axé, tudo num só lugar.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        {isLoading ? (
          <Button size="lg" disabled>Carregando...</Button>
        ) : isAuthenticated ? (
          <Link href="/dashboard" passHref>
            <Button size="lg" className="bg-brand-golden-earth hover:bg-brand-golden-earth/90 text-white">
              Acessar meu Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        ) : (
           <Link href="/dashboard" passHref>
            <Button size="lg" className="bg-brand-golden-earth hover:bg-brand-golden-earth/90 text-white">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
        <Link href="/biblioteca" passHref>
          <Button size="lg" variant="outline" className="border-brand-golden-earth text-brand-golden-earth hover:bg-brand-golden-earth/10 hover:text-brand-golden-earth">
            Explorar Biblioteca
          </Button>
        </Link>
      </div>
    </div>
  );
}
