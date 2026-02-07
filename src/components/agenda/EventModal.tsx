"use client"

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
import { Calendar, User, Clock, MessageSquare, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface EventModalProps {
  day: Date | null
  events: Client[]
  isOpen: boolean
  onClose: () => void
}

export function EventModal({ day, events, isOpen, onClose }: EventModalProps) {
  if (!day) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Calendar className="text-primary" />
            Agenda para {format(day, "dd 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
          <DialogDescription>
            {events.length > 0 
              ? `Existem ${events.length} agendamento(s) para este dia.`
              : "Não há compromissos agendados."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {events.length > 0 ? (
            events.map((event) => (
              <div 
                key={event.id} 
                className="p-4 rounded-2xl border bg-card/50 hover:bg-card transition-colors shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <User size={18} className="text-muted-foreground" />
                    {event.nome}
                  </h4>
                  <Badge className={event.tipo === 'Aplicação' ? 'event-badge-aplicacao' : 'event-badge-manutencao'}>
                    {event.tipo}
                  </Badge>
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
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground italic">
              Nenhum evento encontrado.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
