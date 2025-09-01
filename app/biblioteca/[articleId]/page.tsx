    "use client";

    import { useQuery } from "convex/react";
    import { api } from "@/convex/_generated/api";
    import {
      Card,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
    } from "@/components/ui/card";
    import { Badge } from "@/components/ui/badge";
    import { Loader2 } from "lucide-react";
    import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from "@/components/ui/select";
    import { useState } from "react";
    import Link from "next/link";

    const categories = [
      "Todos",
      "Orixás",
      "Entidades",
      "Rituais e Práticas",
      "Conceitos Fundamentais",
      "Banhos e Ervas",
    ];

    const createExcerpt = (markdown: string, length = 150) => {
      const plainText = markdown
        .replace(/^#+\s/gm, "")
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(.*?)\1/g, "$2")
        .replace(/!\[(.*?)\]\(.*?\)/g, "")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();

      if (plainText.length <= length) {
        return plainText;
      }
      return plainText.slice(0, length).trim() + "...";
    };

    export default function BibliotecaPage() {
      const [selectedCategory, setSelectedCategory] = useState("Todos");

      // NOME CORRETO E DEFINITIVO: api.articles.getAllPublic
      const articles = useQuery(
        api.articles.getAllPublic,
        selectedCategory === "Todos" ? {} : { category: selectedCategory }
      );

      return (
        <div className="container mx-auto py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold">Biblioteca de Axé</h1>
              <p className="text-muted-foreground">
                Explore o conhecimento e os fundamentos da nossa fé.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Select
                onValueChange={(value) => setSelectedCategory(value)}
                defaultValue={selectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {articles === undefined && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}

          {articles && articles.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold">Nenhum artigo encontrado</h2>
              <p className="text-muted-foreground mt-2">
                Ainda não há artigos nesta categoria. Volte em breve!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles?.map((article) => (
                <Link href={`/biblioteca/${article._id}`} key={article._id}>
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <Badge variant="secondary">{article.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription>
                        {createExcerpt(article.content)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }