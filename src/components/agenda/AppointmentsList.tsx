
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
    <Card className="rounded-[2.5rem] border-white/10 shadow-2xl bg-white/5 backdrop-blur-md overflow-hidden animate-in slide-in-from-right duration-700">
      <CardHeader className="bg-gold-gradient py-8">
        <CardTitle className="flex items-center gap-3 font-headline text-4xl text-black">
          <Star className="fill-black" size={24} />
          Agenda Vip
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          {appointments.length > 0 ? (
            appointments.slice(0, 8).map((app, idx) => {
              const date = getEventDate(app.data);
              const isFirst = idx === 0;
              const isBday = isBirthdayMonth(app);

              return (
                <div 
                  key={app.id} 
                  className={cn(
                    "group flex items-center justify-between p-5 rounded-3xl transition-all duration-500",
                    isFirst ? "bg-primary/10 ring-2 ring-primary/40 shadow-[0_0_20px_rgba(179,135,40,0.15)]" : "hover:bg-white/5"
                  )}
                >
                  <div className="flex gap-5 items-center flex-1">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-2xl transition-transform group-hover:scale-110",
                      isFirst ? "bg-gold-gradient text-black" : "bg-zinc-800 text-primary"
                    )}>
                      <span className="text-[10px] uppercase tracking-tighter">{format(date, 'MMM', { locale: ptBR })}</span>
                      <span className="text-xl leading-none">{format(date, 'dd')}</span>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xl leading-none text-white/90 group-hover:text-primary transition-colors">
                          {app.nome}
                        </h4>
                        {isBday && (
                          <div className="bg-primary/20 text-primary border border-primary/30 p-1 rounded-full">
                            <Cake size={12} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-primary/40 flex items-center gap-2">
                        <Clock size={14} />
                        {app.servico}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {app.whatsapp && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl border-primary/20 text-primary hover:bg-primary/10"
                        onClick={() => handleSendReminder(app)}
                      >
                        <Send size={18} />
                      </Button>
                    )}
                    <span className={cn(
                      "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-[0.1em]",
                      app.tipo === 'Aplicação' ? "bg-primary text-black" : "border border-white/20 text-white/50"
                    )}>
                      {app.tipo}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <Sparkles className="mx-auto mb-4 text-primary/20" size={48} />
              <p className="text-primary/30 text-lg font-light italic">Sua agenda está disponível.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
