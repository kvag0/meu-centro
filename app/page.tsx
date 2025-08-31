import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 md:py-32">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
        Bem-vindo ao MeuCentro
      </h1>
      <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
        Conectando filhos de fé aos seus guias e ao seu terreiro.
        Organize sua jornada espiritual, receba diagnósticos e não perca mais nenhum evento.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <SignUpButton mode="modal">
          <Button size="lg">Começar Agora</Button>
        </SignUpButton>
        <SignInButton mode="modal">
          <Button size="lg" variant="outline">Já Tenho Conta</Button>
        </SignInButton>
      </div>
    </div>
  );
}
