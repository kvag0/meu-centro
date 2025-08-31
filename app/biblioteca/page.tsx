"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const articleCategories = [
  "Entidades",
  "Orixás",
  "Rituais e Cerimônias",
  "Ervas e Banhos",
  "Conceitos e Termos",
  "História da Umbanda",
];

export default function BibliotecaPage() {
  const articles = useQuery(api.articles.getAll);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtra os artigos no lado do cliente
  const filteredArticles = articles?.filter(
    (article) => !selectedCategory || article.category === selectedCategory
  );

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Biblioteca de Axé</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Um espaço para aprender e se aprofundar nos conhecimentos da Umbanda.
        </p>
      </div>

      {/* NOVO: Filtros de Categoria */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <Button
          variant={!selectedCategory ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </Button>
        {articleCategories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {articles === undefined && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {filteredArticles && filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">Nenhum artigo encontrado</h2>
          <p className="text-muted-foreground mt-2">
            {selectedCategory
              ? `Ainda não há artigos na categoria "${selectedCategory}".`
              : "Volte em breve para encontrar novos conteúdos."}
          </p>
        </div>
      )}

      {filteredArticles && filteredArticles.length > 0 && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Card key={article._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{article.title}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{article.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-4">{article.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
