"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Componente da página da Biblioteca de Axé
export default function BibliotecaPage() {
  // Busca todos os artigos usando a nova query pública
  const articles = useQuery(api.articles.getAll);

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Biblioteca de Axé</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Um espaço para aprender e se aprofundar nos conhecimentos da Umbanda.
        </p>
      </div>

      {/* Exibe um loader enquanto os artigos estão a ser carregados */}
      {articles === undefined && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Exibe uma mensagem se não houver artigos */}
      {articles && articles.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">Nenhum artigo publicado</h2>
          <p className="text-muted-foreground mt-2">
            Volte em breve para encontrar novos conteúdos sobre a nossa fé.
          </p>
        </div>
      )}

      {/* Mapeia e exibe cada artigo num card */}
      {articles && articles.length > 0 && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-4">
                  {article.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
