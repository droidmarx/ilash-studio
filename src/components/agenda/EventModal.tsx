"use client"

import { useState } from "react"
import { format, parseISO, isValid, addDays, getMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Client } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, MessageSquare, Info, Trash2, Edit2, Send, Cake, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppointmentForm } from "./AppointmentForm"

interface EventModalProps {
  day: Date | null
  events: Client[]
  isOpen: boolean
  onClose: () => void
  onEdit: (id: string, data: any) => void
  onDelete: (id: string) => void
}

export function EventModal({ day, events, isOpen, onClose, onEdit, onDelete }: EventModalProps) {
  const [editingEvent, setEditingEvent] = useState<Client | null>(null)

  if (!day) return null

  const handleEditSubmit = (data: any) => {
    if (editingEvent) {
      onEdit(editingEvent.id, data)
      setEditingEvent(null)
    }
  }

  const handleQuickReschedule = (event: Client, daysToAdd: number) => {
    const currentAppDate = event.data.includes('T') ? parseISO(event.data) : new Date(event.data);
    const newDate = addDays(currentAppDate, daysToAdd);
    onEdit(event.id, {
      ...event,
      data: newDate.toISOString().slice(0, 16)
    });
  }

  const isBirthdayMonth = (client: Client) => {
    if (!client.aniversario || !day) return false;
    const birthDate = parseISO(client.aniversario);
    return getMonth(day) === getMonth(birthDate);
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
        setEditingEvent(null)
      }
    }}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Calendar className="text-primary" />
            {editingEvent 
              ? `Editando Agendamento` 
              : `Agenda para ${format(day, "dd 'de' MMMM", { locale: ptBR })}`}
          </DialogTitle>
          <DialogDescription>
            {editingEvent 
              ? "Atualize as informações do agendamento abaixo." 
              : events.length > 0 
                ? `Existem ${events.length} agendamento(s) para este dia.`
                : "Não há compromissos agendados."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-6">
          {editingEvent ? (
            <AppointmentForm 
              initialData={editingEvent} 
              onSubmit={handleEditSubmit} 
              onCancel={() => setEditingEvent(null)} 
            />
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => {
                const bday = isBirthdayMonth(event);
                return (
                  <div 
                    key={event.id} 
                    className={cn(
                      "group p-4 rounded-2xl border bg-card/50 hover:bg-card transition-all shadow-sm relative",
                      bday && "border-pink-300 bg-pink-50/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <User size={18} className="text-muted-foreground" />
                          {event.nome}
                        </h4>
                        {bday && (
                          <div className="flex items-center gap-1 text-pink-600 font-bold text-[10px] uppercase">
                            <Cake size={12} /> Mês de Aniversário! ✨
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={event.tipo === 'Aplicação' ? 'event-badge-aplicacao' : 'event-badge-manutencao'}>
                          {event.tipo}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{event.servico} - R$ {event.valor || '0,00'}</span>
                      </div>
                      {event.whatsapp && (
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} />
                          <span className="truncate">{event.whatsapp}</span>
                        </div>
                      )}
                    </div>
                    
                    {event.observacoes && (
                      <div className="mt-3 text-xs flex items-start gap-2 bg-muted/30 p-2 rounded-lg">
                        <Info size={14} />
                        <span>{event.observacoes}</span>
                      </div>
                    )}

                    <div className="mt-4 border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <RotateCw size={12} /> Remarcar rápido:
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-full" onClick={() => handleQuickReschedule(event, 15)}>+15 dias</Button>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-full" onClick={() => handleQuickReschedule(event, 20)}>+20 dias</Button>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-full" onClick={() => handleQuickReschedule(event, 30)}>+30 dias</Button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        {event.whatsapp && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleSendReminder(event)}
                            className="h-8 rounded-full bg-green-600 hover:bg-green-700 gap-2"
                          >
                            <Send size={14} /> Lembrete
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingEvent(event)}
                          className="h-8 rounded-full text-primary hover:bg-primary/10"
                        >
                          <Edit2 size={14} className="mr-2" /> Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(event.id)}
                          className="h-8 rounded-full text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={14} className="mr-2" /> Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground italic">
              Nenhum agendamento para este dia.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
