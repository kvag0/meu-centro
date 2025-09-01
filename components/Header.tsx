"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import {
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

// CORRIGIDO: Exportação nomeada
export function Header() {
  const { isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getMe);

  return (
    <header className="bg-brand-linen shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" passHref>
          <div className="text-2xl font-serif font-bold text-brand-golden-earth cursor-pointer">
            MeuCentro
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/biblioteca" passHref>
            <Button variant="ghost" className="text-brand-graphite">Biblioteca</Button>
          </Link>
          
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <>
              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button variant="outline" className="border-brand-golden-earth text-brand-golden-earth">Entrar</Button>
                </SignInButton>
              </Unauthenticated>
              <Authenticated>
                {currentUser?.role === "admin" && (
                  <Link href="/admin" passHref>
                    <Button variant="ghost" className="text-brand-graphite">Admin</Button>
                  </Link>
                )}
                <Link href="/dashboard" passHref>
                  <Button variant="ghost" className="text-brand-graphite">Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </Authenticated>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
