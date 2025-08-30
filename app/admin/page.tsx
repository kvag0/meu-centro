"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";

// Importando componentes do Shadcn/UI
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Componente principal que lida com o estado de autenticação
export default function AdminPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <div className="container mx-auto p-4">Verificando autenticação...</div>;
  }
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }
  return <AdminDashboard />;
}

// Componente que busca os dados do admin, só renderiza se autenticado
function AdminDashboard() {
  const currentUser = useQuery(api.admin.getCurrentUserWithAdminRole);

  if (currentUser === undefined) {
    return <div className="container mx-auto p-4">Carregando dados do usuário...</div>;
  }
  if (!currentUser.isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
        <p>Você não tem permissão de administrador.</p>
      </div>
    );
  }
  // Renderiza ambos os painéis
  return (
    <div className="container mx-auto p-4 space-y-12">
      <UserManagementPanel />
      <EventManagementPanel />
    </div>
  );
}

// Painel de gerenciamento de usuários (sem alterações)
function UserManagementPanel() {
  const users = useQuery(api.admin.getUsers);
  const terreiros = useQuery(api.admin.getTerreiros);
  const assignUserToTerreiro = useMutation(api.admin.assignUserToTerreiro);
  const updateUserRole = useMutation(api.admin.updateUserRole);

  if (!users || !terreiros) {
    return <div>Carregando usuários e terreiros...</div>;
  }

  const getTerreiroName = (terreiroId: Id<"terreiros"> | undefined) => {
    if (!terreiroId) return "Nenhum";
    return terreiros.find((t) => t._id === terreiroId)?.name ?? "Desconhecido";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
      <h2 className="text-2xl font-semibold mb-4">Gerenciamento de Usuários</h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Papel (Role)</TableHead>
              <TableHead>Terreiro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{getTerreiroName(user.terreiroId)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">Mudar Papel</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => updateUserRole({ userId: user._id, role: "admin" })}>
                        Tornar Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUserRole({ userId: user._id, role: "member" })}>
                        Tornar Membro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Select
                    onValueChange={(terreiroId) => assignUserToTerreiro({ userId: user._id, terreiroId: terreiroId as Id<"terreiros"> })}
                    defaultValue={user.terreiroId}
                  >
                    <SelectTrigger className="w-[180px] inline-flex"><SelectValue placeholder="Associar Terreiro" /></SelectTrigger>
                    <SelectContent>
                      {terreiros.map((terreiro) => (
                        <SelectItem key={terreiro._id} value={terreiro._id}>{terreiro.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// NOVO: Painel de gerenciamento de eventos
function EventManagementPanel() {
  const events = useQuery(api.events.get);
  const deleteEvent = useMutation(api.events.deleteEvent);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gerenciamento de Eventos</h2>
        <CreateEventDialog />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Visibilidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events?.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm")}</TableCell>
                <TableCell>
                  <Badge variant={event.isPublic ? "outline" : "secondary"}>
                    {event.isPublic ? "Público" : "Membros"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => deleteEvent({ eventId: event._id })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// NOVO: Componente de diálogo para criar um novo evento
function CreateEventDialog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = React.useState<Date>();
  const [isPublic, setIsPublic] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const createEvent = useMutation(api.events.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title) return;

    await createEvent({
      title,
      description,
      date: date.toISOString(), // Envia a data no formato ISO
      isPublic,
    });

    // Limpa o formulário e fecha o diálogo
    setTitle("");
    setDescription("");
    setDate(undefined);
    setIsPublic(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Criar Novo Evento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Data e Hora</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(Boolean(checked))} />
            <Label htmlFor="isPublic">Evento público para visitantes?</Label>
          </div>
          <Button type="submit">Salvar Evento</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
