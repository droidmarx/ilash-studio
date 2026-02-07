
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
import { AppointmentForm } from "./AppointmentForm"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ClientsManagerProps {
  clients: Client[]
  onEdit: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ClientsManager({ clients, onEdit, onDelete }: ClientsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingClient, setEditingClient] = useState<Client | null>(null)

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
    if (!event.whatsapp) return;

    let dateObj = event.data.includes('T') ? parseISO(event.data) : new Date(event.data);
    if (!isValid(dateObj)) dateObj = new Date();

    const formattedDate = format(dateObj, "dd/MM/yyyy", { locale: ptBR });
    const formattedTime = format(dateObj, "HH:mm");
    
    const message = `💖 *Lembrete de agendamento*

Olá *${event.nome}*, tudo bem?

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

  return (
    <Card className="rounded-[2rem] md:rounded-3xl border-none shadow-2xl bg-white/5 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-500">
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
            className="pl-10 rounded-xl bg-black/50 border-white/10 h-12"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-8">
        <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10">
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
                    <TableRow key={client.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-bold text-white/90">{client.nome}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm text-white/70">{client.servico}</span>
                          <span className="text-xs text-primary/50">R$ {client.valor || '0,00'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Cake size={14} className="text-primary/40" />
                          {client.aniversario ? format(parseISO(client.aniversario), "dd/MM", { locale: ptBR }) : "--/--"}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] leading-tight text-white/40">{safeFormatDate(client.data)}</TableCell>
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
                            onClick={() => setEditingClient(client)}
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onDelete(client.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
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

      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[2rem] bg-zinc-950 border-white/10 p-4 md:p-8 max-h-[95vh] overflow-y-auto">
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
    </Card>
  )
}
