"use client"

import { Client } from "@/lib/api"
import { format, parseISO, parse, isValid, getMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { List, Clock, Send, Cake, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AppointmentsListProps {
  appointments: Client[]
}

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  const getEventDate = (dataStr: string) => {
    try {
      if (dataStr.includes('T')) return parseISO(dataStr);
      return parse(dataStr, 'dd/MM/yyyy', new Date());
    } catch (e) { return new Date(); }
  };

  const isBirthdayMonth = (client: Client) => {
    if (!client.aniversario) return false;
    const appDate = getEventDate(client.data);
    const birthDate = parseISO(client.aniversario);
    return getMonth(appDate) === getMonth(birthDate);
  }

  const handleSendReminder = (event: Client) => {
    if (!event.whatsapp) return;

    let dateObj = getEventDate(event.data);
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
    <Card className="rounded-[2.5rem] border-border shadow-2xl bg-card backdrop-blur-md overflow-hidden animate-in slide-in-from-right duration-700">
      <CardHeader className="bg-gold-gradient py-8">
        <CardTitle className="flex items-center gap-3 font-headline text-4xl text-primary-foreground">
          <Star className="fill-primary-foreground" size={24} />
          Agenda Vip
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-8">
        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.slice(0, 8).map((app, idx) => {
              const date = getEventDate(app.data);
              const isFirst = idx === 0;
              const isBday = isBirthdayMonth(app);

              return (
                <div 
                  key={app.id} 
                  className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-3xl transition-all duration-500 border border-border/50",
                    isFirst ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "hover:bg-foreground/5"
                  )}
                >
                  {/* Bloco de Data */}
                  <div className={cn(
                    "flex flex-col items-center justify-center min-w-[56px] h-[56px] rounded-2xl font-bold transition-transform group-hover:scale-105",
                    isFirst ? "bg-gold-gradient text-primary-foreground" : "bg-muted text-primary border border-primary/20"
                  )}>
                    <span className="text-[10px] uppercase font-black leading-none">{format(date, 'MMM', { locale: ptBR })}</span>
                    <span className="text-xl leading-none">{format(date, 'dd')}</span>
                  </div>
                  
                  {/* Informações Centrais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="font-bold text-base md:text-lg text-foreground truncate group-hover:text-primary transition-colors">
                        {app.nome}
                      </h4>
                      {isBday && (
                        <Cake size={14} className="text-primary animate-pulse shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} className="shrink-0" />
                        {app.servico}
                      </span>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                        app.tipo === 'Aplicação' ? "bg-primary/20 border-primary/40 text-primary" : "bg-muted border-border text-muted-foreground"
                      )}>
                        {app.tipo}
                      </span>
                    </div>
                  </div>

                  {/* Ações Integradas */}
                  <div className="flex items-center shrink-0">
                    {app.whatsapp && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-full text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => handleSendReminder(app)}
                        title="Enviar Lembrete"
                      >
                        <Send size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <Star className="mx-auto mb-4 text-primary/20" size={48} />
              <p className="text-primary/30 text-lg font-light italic">Sua agenda Vip está pronta.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}