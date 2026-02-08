"use client"

import { useState } from "react"
import { Client } from "@/lib/api"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Edit2, Trash2, User, Send, Cake } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { AppointmentForm } from "./AppointmentForm"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { hapticFeedback } from "@/lib/utils"

interface ClientsManagerProps {
  clients: Client[]
  onEdit: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ClientsManager({ clients, onEdit, onDelete }: ClientsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.servico.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.id.localeCompare(a.id))

  const safeFormatDate = (dateStr: string) => {
    try {
      const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr)
      return isValid(date) ? format(date, "dd/MM/yyyy HH:mm", { locale: ptBR }) : dateStr
    } catch (e) {
      return dateStr
    }
  }

  const handleSendReminder = (event: Client) => {
    hapticFeedback(15)
    if (!event.whatsapp) return;

    let dateObj = event.data.includes('T') ? parseISO(event.data) : new Date(event.data);
    if (!isValid(dateObj)) dateObj = new Date();

    const formattedDate = format(dateObj, "dd/MM/yyyy", { locale: ptBR });
    const formattedTime = format(dateObj, "HH:mm");
    
    const message = `💖*Lembrete de agendamento*

Olá *${event.nome.trim()}*, tudo bem?

✨ Sua ${event.tipo.toLowerCase()} de cílios está agendada para *${formattedDate}*.

Confira os detalhes abaixo:

⏰ Horário: ${formattedTime}
💸 Valor: R$ ${event.valor || 'A combinar'}

📌 Em caso de atraso, por favor avise com pelo menos 2 horas de antecedência.

📌 Se houver necessidade de remarcar, peço que avise com no mínimo 1 dia de antecedência.

Em caso de dúvidas ou imprevistos, é só me chamar! 💬
Agradeço pela confiança 💕`;

    const cleanPhone = event.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  const handleDelete = async () => {
    hapticFeedback([30, 100, 30])
    if (deleteConfirmId) {
      await onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }

  return (
    <Card className="rounded-[2rem] md:rounded-3xl border-none shadow-2xl bg-card backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="p-4 md:p-8 space-y-4">
        <CardTitle className="text-2xl md:text-3xl font-headline text-gold-gradient flex items-center gap-2">
          <User className="text-primary" />
          Gerenciamento de Clientes
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
          <Input 
            placeholder="Pesquisar por nome ou serviço..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-background/50 border-border h-12"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-8">
        <div className="rounded-xl border border-border bg-background/30 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-foreground/5">
                <TableRow className="border-border">
                  <TableHead className="text-primary/60 font-bold">Nome</TableHead>
                  <TableHead className="text-primary/60 font-bold">Serviço</TableHead>
                  <TableHead className="text-primary/60 font-bold hidden md:table-cell">Aniversário</TableHead>
                  <TableHead className="text-primary/60 font-bold">Último</TableHead>
                  <TableHead className="text-right text-primary/60 font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-border hover:bg-foreground/5">
                      <TableCell className="font-bold text-foreground">{client.nome}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground/70">{client.servico}</span>
                          <span className="text-xs text-primary/50">R$ {client.valor || '0,00'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-xs text-foreground/60">
                          <Cake size={14} className="text-primary/40" />
                          {client.aniversario ? format(parseISO(client.aniversario), "dd/MM", { locale: ptBR }) : "--/--"}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] leading-tight text-foreground/40">{safeFormatDate(client.data)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          {client.whatsapp && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleSendReminder(client)}
                              title="Enviar Lembrete"
                              className="h-8 w-8 text-green-500 hover:bg-green-500/10"
                            >
                              <Send size={16} />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { hapticFeedback(10); setEditingClient(client); }}
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { hapticFeedback(15); setDeleteConfirmId(client.id); }}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-primary/20 italic">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!editingClient} onOpenChange={(open) => { if (!open) { hapticFeedback(10); setEditingClient(null); } }}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[2rem] bg-background border-border p-4 md:p-8 max-h-[95vh] overflow-y-auto text-foreground">
          <DialogHeader>
            <DialogTitle className="text-3xl md:text-4xl font-headline text-gold-gradient">Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <div className="mt-4 md:mt-6">
              <AppointmentForm 
                initialData={editingClient} 
                onSubmit={async (data) => {
                  await onEdit(editingClient.id, data)
                  setEditingClient(null)
                }} 
                onCancel={() => setEditingClient(null)} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-border bg-background p-8 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline text-gold-gradient">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação é irreversível. Todas as informações desta cliente e seus agendamentos serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="flex-1 rounded-xl border-border bg-transparent text-foreground hover:bg-muted" onClick={() => hapticFeedback(10)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
