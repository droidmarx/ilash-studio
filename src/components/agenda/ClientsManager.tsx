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
import { Search, Edit2, Trash2, MessageSquare, User, Send } from "lucide-react"
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

Olá Diva, tudo bem?

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
    <Card className="rounded-3xl border-none shadow-2xl bg-card/80 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="space-y-4">
        <CardTitle className="text-3xl font-headline text-primary flex items-center gap-2">
          <User className="text-primary" />
          Gerenciamento de Clientes
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Pesquisar por nome ou serviço..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-background/50"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-background/30 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Serviço/Valor</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/30">
                    <TableCell className="font-bold">{client.nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{client.servico}</span>
                        <span className="text-xs text-muted-foreground">R$ {client.valor || '0,00'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{safeFormatDate(client.data)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        client.tipo === 'Aplicação' ? 'bg-yellow-500/20 text-yellow-700' : 
                        client.tipo === 'Remoção' ? 'bg-red-500/20 text-red-700' :
                        'bg-purple-500/20 text-purple-700'
                      }`}>
                        {client.tipo}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {client.whatsapp && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleSendReminder(client)}
                              title="Enviar Lembrete"
                              className="h-8 w-8 text-green-600 hover:bg-green-50"
                            >
                              <Send size={16} />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingClient(client)}
                          className="h-8 w-8 text-primary hover:bg-primary/5"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(client.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline text-primary">Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <AppointmentForm 
              initialData={editingClient} 
              onSubmit={async (data) => {
                await onEdit(editingClient.id, data)
                setEditingClient(null)
              }} 
              onCancel={() => setEditingClient(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
