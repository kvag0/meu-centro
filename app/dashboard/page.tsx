"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookHeart, Droplets, PartyPopper, CalendarDays, Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Certifique-se de que seu arquivo utils.ts existe

type DiagnosisWithDetails = Doc<"diagnoses"> & {
  details: Doc<"events"> | Doc<"bathRecipes"> | Doc<"rituals"> | null;
};

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <div className="p-8 text-center">Carregando sua jornada...</div>;
  }
  if (!isAuthenticated) {
    // Redireciona para a página de login se não estiver autenticado
    // (Você pode querer implementar um redirecionamento real aqui)
    return <div className="p-8">Acesso negado. Por favor, faça login.</div>;
  }
  return <MemberDashboard />;
}

function MemberDashboard() {
  const myDiagnoses = useQuery(api.diagnoses.getMyDiagnosesWithDetails) || [];
  const publicEvents = useQuery(api.events.getPublic) || [];
  const updateStatus = useMutation(api.diagnoses.updateStatus);

  const handleUpdateStatus = (diagnosisId: Id<"diagnoses">, currentStatus: "pending" | "completed") => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    updateStatus({ diagnosisId, status: newStatus });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold">Meu Painel</h1>
        <p className="text-muted-foreground">
          Acompanhe seus diagnósticos e os próximos eventos do terreiro.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Minhas Tarefas</h2>
        <div className="space-y-4">
          {myDiagnoses.length === 0 ? (
            <p className="text-muted-foreground">Você ainda não tem tarefas ou diagnósticos atribuídos.</p>
          ) : (
            myDiagnoses.map((diag: DiagnosisWithDetails) => (
              <div 
                key={diag._id} 
                className={cn(
                  "border bg-card text-card-foreground rounded-lg p-4 flex items-start space-x-4 shadow-sm transition-all",
                  diag.status === 'completed' && "bg-muted/50 opacity-70" // Estilo para tarefas concluídas
                )}
              >
                <div className="bg-primary/10 p-3 rounded-full mt-1">
                  {diag.type === 'event' && <PartyPopper className="h-6 w-6 text-primary" />}
                  {diag.type === 'bath' && <Droplets className="h-6 w-6 text-primary" />}
                  {diag.type === 'ritual' && <BookHeart className="h-6 w-6 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{diag.details?.title || "Item não encontrado"}</h3>
                     <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleUpdateStatus(diag._id, diag.status)}
                    >
                      {diag.status === 'pending' ? (
                        <>
                          <Circle className="h-4 w-4 mr-2" />
                          Marcar como concluído
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Concluído
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {diag.type === 'event' && diag.details && (
                      <p><b>Data:</b> {format(new Date((diag.details as Doc<"events">).date), "PPP", { locale: ptBR })}</p>
                    )}
                    {diag.type === 'bath' && diag.details && (
                      <p><b>Ingredientes:</b> {(diag.details as Doc<"bathRecipes">).ingredients}</p>
                    )}
                    {diag.type === 'ritual' && diag.details && (
                      <p>{(diag.details as Doc<"rituals">).description}</p>
                    )}
                  </div>
                  {diag.notes && <p className="text-sm mt-2 border-l-2 pl-3 italic"><b>Observação do Guia:</b> "{diag.notes}"</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Próximos Eventos Públicos</h2>
        <div className="space-y-4">
           {publicEvents.length === 0 ? (
             <p className="text-muted-foreground">Nenhum evento público agendado no momento.</p>
           ) : (
             publicEvents.map((event) => (
                <div key={event._id} className="border-l-4 border-primary pl-4 py-2">
                  <p className="font-semibold">{event.title}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {format(new Date(event.date), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
              ))
           )}
        </div>
      </section>
    </div>
  );
}
