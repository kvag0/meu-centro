"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
// CORREÇÃO: useConvexAuth vem de "convex/react"
import { useConvexAuth } from "convex/react";
import { useClerk } from "@clerk/clerk-react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Trash2, BookOpen, Utensils, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// NOVO: Definir as categorias num local central
const articleCategories = [
  "Entidades",
  "Orixás",
  "Rituais e Cerimônias",
  "Ervas e Banhos",
  "Conceitos e Termos",
  "História da Umbanda",
];

// Componente principal da Página de Administração
export default function AdminPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getMe);

  if (isLoading || currentUser === undefined) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!isAuthenticated) {
    return <div className="text-center py-10"><h1>Acesso Negado</h1><p>Você precisa estar logado para acessar esta página.</p></div>;
  }

  if (currentUser === null || currentUser.role !== 'admin') {
    return <div className="text-center py-10"><h1>Acesso Restrito</h1><p>Esta página é acessível apenas para administradores.</p></div>;
  }

  return <AdminDashboard user={currentUser} />;
}

// O painel de controle do administrador
function AdminDashboard({ user }: { user: any }) {
  if (!user.terreiroId) {
    return <div className="text-center py-10"><h1>Configuração Necessária</h1><p>Sua conta de administrador precisa estar associada a um terreiro.</p></div>;
  }

  return (
    <div className="space-y-8 py-8">
      <h1 className="text-3xl font-bold">Painel do Administrador</h1>
      <p className="text-muted-foreground">Bem-vindo, {user.name}. Gerencie seu terreiro aqui.</p>

      <UserManagementPanel terreiroId={user.terreiroId} />
      <DiagnoseMemberPanel terreiroId={user.terreiroId} />
      <EventManagementPanel terreiroId={user.terreiroId} />
      <BathManagementPanel terreiroId={user.terreiroId} />
      <RitualManagementPanel terreiroId={user.terreiroId} />
      <ArticleManagementPanel terreiroId={user.terreiroId} />
    </div>
  );
}

// PAINÉIS DE GERENCIAMENTO (Os componentes existentes permanecem os mesmos)
// ... UserManagementPanel, DiagnoseMemberPanel, EventManagementPanel, etc.
// Apenas adicione o novo ArticleManagementPanel no final.

function UserManagementPanel({ terreiroId }: { terreiroId: Id<"terreiros"> }) {
    const users = useQuery(api.admin.getUsers, { terreiroId });
    const terreiros = useQuery(api.admin.getTerreiros);
    const updateUserTerreiro = useMutation(api.admin.updateUserTerreiro);
    const updateUserRole = useMutation(api.admin.updateUserRole);
  
    const handleRoleChange = (userId: Id<"users">, role: "admin" | "member") => {
      updateUserRole({ userId, role });
    };
  
    const handleTerreiroChange = (userId: Id<"users">, terreiroId: Id<"terreiros">) => {
      updateUserTerreiro({ userId, terreiroId });
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>Associe usuários ao seu terreiro e defina seus papéis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Terreiro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleRoleChange(user._id, value as any)} defaultValue={user.role}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Definir papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleTerreiroChange(user._id, value as any)} defaultValue={user.terreiroId}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Associar terreiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {terreiros?.map((t: any) => (
                          <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}

function DiagnoseMemberPanel({ terreiroId }: { terreiroId: Id<"terreiros"> }) {
    const members = useQuery(api.admin.getUsers, terreiroId ? { terreiroId, role: "member" } : "skip");
    const events = useQuery(api.events.get, terreiroId ? { terreiroId } : "skip");
    const baths = useQuery(api.baths.get, terreiroId ? { terreiroId } : "skip");
    const rituals = useQuery(api.rituals.get, terreiroId ? { terreiroId } : "skip");
    const createDiagnosis = useMutation(api.diagnoses.createDiagnosis);
    const [selectedMember, setSelectedMember] = useState<any>(null);
  
    const { register, handleSubmit, watch, setValue, reset } = useForm();
    const diagnosisType = watch("type");
  
    const onSubmit = (data: any) => {
      createDiagnosis({
        memberId: selectedMember._id,
        type: data.type,
        referenceId: data.referenceId,
        notes: data.notes,
      });
      setSelectedMember(null);
      reset();
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnosticar Membros</CardTitle>
          <CardDescription>Atribua tarefas, banhos ou rituais para os membros do seu terreiro.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedMember(null)}>
                      <DialogTrigger asChild><Button onClick={() => setSelectedMember(member)}>Diagnosticar</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Diagnóstico para {selectedMember?.name}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div>
                            <Label>Tipo de Diagnóstico</Label>
                            <Select onValueChange={(value) => setValue("type", value)}>
                              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="event">Evento</SelectItem>
                                <SelectItem value="bath">Banho</SelectItem>
                                <SelectItem value="ritual">Ritual</SelectItem>
                              </SelectContent>
                            </Select>
                            <input type="hidden" {...register("type")} />
                          </div>
  
                          {diagnosisType && (
                            <div>
                              <Label>Item Específico</Label>
                              <Select onValueChange={(value) => setValue("referenceId", value)}>
                                <SelectTrigger><SelectValue placeholder={`Selecione o ${diagnosisType}`} /></SelectTrigger>
                                <SelectContent>
                                  {diagnosisType === "event" && events?.map((item: any) => <SelectItem key={item._id} value={item._id}>{item.title}</SelectItem>)}
                                  {diagnosisType === "bath" && baths?.map((item: any) => <SelectItem key={item._id} value={item._id}>{item.title}</SelectItem>)}
                                  {diagnosisType === "ritual" && rituals?.map((item: any) => <SelectItem key={item._id} value={item._id}>{item.title}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <input type="hidden" {...register("referenceId")} />
                            </div>
                          )}
  
                          <div><Label htmlFor="notes">Notas (Opcional)</Label><Textarea id="notes" {...register("notes")} /></div>
                          <DialogFooter><Button type="submit">Salvar Diagnóstico</Button></DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}

function EventManagementPanel({ terreiroId }: { terreiroId: Id<"terreiros"> }) {
    const events = useQuery(api.events.get, { terreiroId });
    const createEvent = useMutation(api.events.create);
    const deleteEvent = useMutation(api.events.deleteEvent);
    const { register, handleSubmit, reset } = useForm();
    const [date, setDate] = useState<Date>();
  
    const onSubmit = (data: any) => {
      createEvent({ ...data, date: date?.getTime() });
      reset();
      setDate(undefined);
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Eventos</CardTitle>
          <CardDescription>Crie e remova os eventos do seu terreiro.</CardDescription>
        </CardHeader>
        <CardContent>
           <Dialog>
             <DialogTrigger asChild><Button>Novo Evento</Button></DialogTrigger>
             <DialogContent>
                <DialogHeader><DialogTitle>Criar Novo Evento</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div><Label htmlFor="title">Título</Label><Input id="title" {...register("title", { required: true })} /></div>
                  <div><Label htmlFor="description">Descrição</Label><Textarea id="description" {...register("description")} /></div>
                  <div>
                    <Label>Data</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="outline" className="w-full justify-start text-left font-normal">
                             <CalendarIcon className="mr-2 h-4 w-4" />
                             {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                     </Popover>
                  </div>
                  <div className="flex items-center space-x-2"><input type="checkbox" id="isPublic" {...register("isPublic")} /><Label htmlFor="isPublic">Evento Público?</Label></div>
                  <DialogFooter><Button type="submit">Criar Evento</Button></DialogFooter>
                </form>
             </DialogContent>
           </Dialog>
           <Table className="mt-4">
             <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Data</TableHead><TableHead>Público</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
             <TableBody>
                {events?.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell><Badge variant={event.isPublic ? "default" : "secondary"}>{event.isPublic ? "Sim" : "Não"}</Badge></TableCell>
                    <TableCell>
                      <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá deletar permanentemente o evento.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteEvent({ eventId: event._id })}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
             </TableBody>
           </Table>
        </CardContent>
      </Card>
    );
}
  
function BathManagementPanel({ terreiroId }: { terreiroId: Id<"terreiros"> }) {
    const baths = useQuery(api.baths.get, { terreiroId });
    const createBath = useMutation(api.baths.create);
    const deleteBath = useMutation(api.baths.deleteBath);
    const { register, handleSubmit, reset } = useForm();
  
    const onSubmit = (data: any) => {
        createBath(data);
        reset();
    };
  
    return (
      <Card>
        <CardHeader><CardTitle>Gerenciar Banhos</CardTitle><CardDescription>Adicione e remova receitas de banhos.</CardDescription></CardHeader>
        <CardContent>
          <Dialog>
             <DialogTrigger asChild><Button>Nova Receita de Banho</Button></DialogTrigger>
             <DialogContent>
                <DialogHeader><DialogTitle>Nova Receita de Banho</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div><Label htmlFor="title-bath">Título</Label><Input id="title-bath" {...register("title", { required: true })} /></div>
                  <div><Label htmlFor="ingredients-bath">Ingredientes</Label><Textarea id="ingredients-bath" {...register("ingredients")} /></div>
                  <div><Label htmlFor="description-bath">Modo de Preparo / Descrição</Label><Textarea id="description-bath" {...register("description")} /></div>
                  <DialogFooter><Button type="submit">Salvar Receita</Button></DialogFooter>
                </form>
             </DialogContent>
           </Dialog>
          <Table className="mt-4">
            <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
            <TableBody>
              {baths?.map((bath) => (
                <TableRow key={bath._id}>
                  <TableCell>{bath.title}</TableCell>
                  <TableCell>
                      <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá deletar permanentemente a receita de banho.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteBath({ bathId: bath._id })}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}

function RitualManagementPanel({ terreiroId }: { terreiroId: Id<"terreiros"> }) {
    const rituals = useQuery(api.rituals.get, { terreiroId });
    const createRitual = useMutation(api.rituals.create);
    const deleteRitual = useMutation(api.rituals.deleteRitual);
    const { register, handleSubmit, reset } = useForm();
  
    const onSubmit = (data: any) => {
        createRitual(data);
        reset();
    };
  
    return (
      <Card>
        <CardHeader><CardTitle>Gerenciar Rituais</CardTitle><CardDescription>Adicione e remova rituais e suas descrições.</CardDescription></CardHeader>
        <CardContent>
          <Dialog>
             <DialogTrigger asChild><Button>Novo Ritual</Button></DialogTrigger>
             <DialogContent>
                <DialogHeader><DialogTitle>Novo Ritual</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div><Label htmlFor="title-ritual">Título</Label><Input id="title-ritual" {...register("title", { required: true })} /></div>
                  <div><Label htmlFor="description-ritual">Descrição</Label><Textarea id="description-ritual" {...register("description")} /></div>
                  <DialogFooter><Button type="submit">Salvar Ritual</Button></DialogFooter>
                </form>
             </DialogContent>
           </Dialog>
          <Table className="mt-4">
            <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
            <TableBody>
              {rituals?.map((ritual) => (
                <TableRow key={ritual._id}>
                  <TableCell>{ritual.title}</TableCell>
                  <TableCell>
                      <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá deletar permanentemente o ritual.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRitual({ ritualId: ritual._id })}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}

// Painel de gerenciamento de Artigos
function ArticleManagementPanel({ terreiroId }: { terreiroId: Id<"terreiros"> }) {
  const articles = useQuery(api.articles.getForTerreiro, { terreiroId });
  const createArticle = useMutation(api.articles.create);
  const deleteArticle = useMutation(api.articles.deleteArticle);
  // NOVO: Usar setValue do react-hook-form para o Select
  const { register, handleSubmit, reset, setValue } = useForm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = (data: any) => {
      createArticle(data);
      reset();
      setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Biblioteca de Axé</CardTitle><CardDescription>Crie e gerencie os artigos informativos.</CardDescription></CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild><Button>Novo Artigo</Button></DialogTrigger>
           <DialogContent className="sm:max-w-[625px]">
              <DialogHeader><DialogTitle>Novo Artigo</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div><Label htmlFor="title-article">Título</Label><Input id="title-article" {...register("title", { required: true })} /></div>
                
                {/* NOVO: Select para Categoria */}
                <div>
                  <Label>Categoria</Label>
                  <Select onValueChange={(value) => setValue("category", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {articleCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div><Label htmlFor="content-article">Conteúdo (Markdown)</Label><Textarea id="content-article" {...register("content")} rows={10} /></div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button type="submit">Publicar Artigo</Button>
                </DialogFooter>
              </form>
           </DialogContent>
         </Dialog>
        <Table className="mt-4">
          <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
          <TableBody>
            {articles?.map((article) => (
              <TableRow key={article._id}>
                <TableCell>{article.title}</TableCell>
                {/* NOVO: Exibir a categoria na tabela */}
                <TableCell><Badge variant="outline">{article.category}</Badge></TableCell>
                <TableCell>
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá deletar permanentemente o artigo.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteArticle({ articleId: article._id })}>Deletar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

