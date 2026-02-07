"use client"

import { useState } from "react"
import { format } from "date-fns"
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
import { Calendar, User, Clock, MessageSquare, Info, Trash2, Edit2 } from "lucide-react"
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
        setEditingEvent(null)
      }
    }}>
      <DialogContent className="sm:max-w-[550px] rounded-3xl overflow-hidden">
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
        
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
          {editingEvent ? (
            <AppointmentForm 
              initialData={editingEvent} 
              onSubmit={handleEditSubmit} 
              onCancel={() => setEditingEvent(null)} 
            />
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="group p-4 rounded-2xl border bg-card/50 hover:bg-card transition-all shadow-sm relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <User size={18} className="text-muted-foreground" />
                      {event.nome}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={event.tipo === 'Aplicação' ? 'event-badge-aplicacao' : 'event-badge-manutencao'}>
                        {event.tipo}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{event.servico}</span>
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
                      <Info size={14} className="mt-0.5" />
                      <span>{event.observacoes}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
              ))}
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
