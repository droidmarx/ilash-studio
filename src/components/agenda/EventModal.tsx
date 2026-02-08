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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, MessageSquare, Info, Trash2, Edit2, Send, Cake, RotateCw, PartyPopper, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppointmentForm } from "./AppointmentForm"
import { cn } from "@/lib/utils"

interface EventModalProps {
  day: Date | null
  events: Client[]
  birthdays: Client[]
  isOpen: boolean
  onClose: () => void
  onAddNew?: (date: Date) => void
  onEdit: (id: string, data: any) => void
  onDelete: (id: string) => void
}

export function EventModal({ day, events, birthdays, isOpen, onClose, onAddNew, onEdit, onDelete }: EventModalProps) {
  const [editingEvent, setEditingEvent] = useState<Client | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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

  const handleSendBirthdayGreeting = (client: Client) => {
    if (!client.whatsapp) return;
    const message = `🎈*Feliz Aniversário, ${client.nome.trim()}!* 🎈

✨ Que seu dia seja tão radiante quanto seu olhar! Desejamos muitas felicidades, saúde e sucesso.

Para celebrar seu mês especial, temos mimos exclusivos esperando por você no Studio Lash! 💖

Aproveite muito seu dia! 💕`;
    const cleanPhone = client.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  const handleDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onClose()
          setEditingEvent(null)
        }
      }}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-[2rem] md:rounded-3xl overflow-hidden p-0 max-h-[95vh] overflow-y-auto bg-background text-foreground border-border">
          <DialogHeader className="p-6 md:p-8 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl md:text-2xl font-headline text-gold-gradient flex items-center gap-2">
                  <Calendar className="text-primary" size={20} />
                  {editingEvent 
                    ? `Editando Agendamento` 
                    : `Agenda de ${format(day, "dd/MM", { locale: ptBR })}`}
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-muted-foreground">
                  {editingEvent 
                    ? "Atualize as informações do agendamento." 
                    : "Compromissos e aniversariantes."}
                </DialogDescription>
              </div>
              {!editingEvent && onAddNew && (
                <Button 
                  onClick={() => onAddNew(day)}
                  className="rounded-full gap-2 shadow-lg bg-gold-gradient text-primary-foreground font-bold h-10 w-fit"
                  size="sm"
                >
                  <PlusCircle size={18} />
                  Agendar
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <div className="p-6 md:p-8 pt-4 space-y-6">
            {editingEvent ? (
              <AppointmentForm 
                initialData={editingEvent} 
                onSubmit={handleEditSubmit} 
                onCancel={() => setEditingEvent(null)} 
              />
            ) : (
              <div className="space-y-6">
                {birthdays.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-primary font-bold text-sm flex items-center gap-2 px-1">
                      <PartyPopper size={18} />
                      Aniversariantes 🎈
                    </h3>
                    {birthdays.map((bday) => (
                      <div key={`bday-${bday.id}`} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Cake size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{bday.nome}</p>
                            <p className="text-[10px] text-primary/60">Aniversário hoje! ✨</p>
                          </div>
                        </div>
                        {bday.whatsapp && (
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="rounded-full border-primary/20 text-primary h-8 w-8"
                            onClick={() => handleSendBirthdayGreeting(bday)}
                          >
                            <Send size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-primary/40 font-bold text-xs uppercase tracking-widest px-1">
                    Agendamentos
                  </h3>
                  {events.length > 0 ? (
                    events.map((event) => {
                      const bdayMonth = isBirthdayMonth(event);
                      return (
                        <div 
                          key={event.id} 
                          className={cn(
                            "group p-4 rounded-2xl border bg-card hover:bg-foreground/5 transition-all shadow-sm relative",
                            bdayMonth && "border-primary/40 bg-primary/5"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                              <h4 className="font-bold text-base md:text-lg flex items-center gap-2 text-foreground">
                                <User size={16} className="text-primary/60" />
                                {event.nome}
                              </h4>
                              {bdayMonth && (
                                <div className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase">
                                  <Cake size={12} /> Mês de Aniversário! ✨
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary uppercase">
                              {event.tipo}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground mt-3">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-primary/40" />
                              <span>{event.servico} - R$ {event.valor || '0,00'}</span>
                            </div>
                            {event.whatsapp && (
                              <div className="flex items-center gap-2">
                                <MessageSquare size={14} className="text-primary/40" />
                                <span className="truncate">{event.whatsapp}</span>
                              </div>
                            )}
                          </div>
                          
                          {event.observacoes && (
                            <div className="mt-3 text-[11px] flex items-start gap-2 bg-muted/50 p-2 rounded-lg text-muted-foreground">
                              <Info size={12} className="mt-0.5" />
                              <span>{event.observacoes}</span>
                            </div>
                          )}

                          <div className="mt-4 border-t border-border pt-4 space-y-4">
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-bold text-primary/40 uppercase flex items-center gap-1">
                                <RotateCw size={12} /> Remarcar:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 rounded-full border border-border hover:bg-primary/10" onClick={() => handleQuickReschedule(event, 15)}>+15d</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 rounded-full border border-border hover:bg-primary/10" onClick={() => handleQuickReschedule(event, 20)}>+20d</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 rounded-full border border-border hover:bg-primary/10" onClick={() => handleQuickReschedule(event, 30)}>+30d</Button>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              {event.whatsapp && (
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => handleSendReminder(event)}
                                  className="h-9 w-9 rounded-full border-green-500/20 text-green-500 hover:bg-green-500/10"
                                  title="Enviar Lembrete"
                                >
                                  <Send size={16} />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => setEditingEvent(event)}
                                className="h-9 w-9 rounded-full border-primary/20 text-primary hover:bg-primary/10"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => setDeleteConfirmId(event.id)}
                                className="h-9 w-9 rounded-full border-destructive/20 text-destructive hover:bg-destructive/10"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-primary/20 italic border-dashed border-2 border-border rounded-2xl gap-4">
                      <p className="text-sm">Nenhum agendamento.</p>
                      {onAddNew && (
                        <Button 
                          variant="ghost" 
                          onClick={() => onAddNew(day)}
                          className="rounded-full gap-2 border border-primary/20 text-primary hover:bg-primary/5"
                        >
                          <PlusCircle size={18} />
                          Agendar Cliente
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-border bg-background p-8 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline text-gold-gradient">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação é irreversível. Todas as informações deste agendamento serão removidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="flex-1 rounded-xl border-border bg-transparent text-foreground hover:bg-muted">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}