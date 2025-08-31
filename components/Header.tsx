"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { Crown } from "lucide-react";

export function Header() {
  const currentUser = useQuery(api.users.getMe);
  const isAdmin = currentUser?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">
          MeuCentro
        </Link>
        <nav className="flex items-center gap-4">
          <SignedIn>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Meu Painel</Link>
            </Button>
            {isAdmin && (
              <Button variant="secondary" asChild>
                <Link href="/admin">
                  <Crown className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <div className="w-8 h-8">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Entrar</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Cadastrar</Button>
            </SignUpButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
