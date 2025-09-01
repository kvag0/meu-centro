"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";

// Esta página recebe o ID do artigo a partir da URL
export default function ArticleDetailPage({
  params,
}: {
  params: { articleId: Id<"articles"> };
}) {
  // Busca os dados do artigo específico usando o ID da URL
  // CORREÇÃO: Adiciona a lógica "skip" para aguardar o ID estar pronto.
  const article = useQuery(
    api.articles.getById,
    params.articleId ? { articleId: params.articleId } : "skip"
  );

  // Estado de carregamento
  if (article === undefined) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Estado se o artigo não for encontrado
  if (article === null) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Artigo não encontrado</h1>
        <p className="text-muted-foreground mt-2">
          O artigo que você está a procurar pode ter sido removido ou não existe.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      {/* A classe mt-8 foi movida para aqui */}
      <article className="prose dark:prose-invert max-w-none mt-8">
        {/* Categoria como um Badge */}
        <Badge variant="secondary" className="mb-4">{article.category}</Badge>
        
        {/* Título do Artigo */}
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        
        {/* Conteúdo do Artigo renderizado a partir do Markdown */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
        >
          {article.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}

