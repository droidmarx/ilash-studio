"use client"

import { Client } from "@/lib/api"
import { format, parseISO, parse, isValid, getMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { List, Clock, Send, Cake } from "lucide-react"
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
    <Card className="rounded-3xl border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="flex items-center gap-2 font-headline text-3xl">
          <List />
          Próximos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.slice(0, 10).map((app, idx) => {
              const date = getEventDate(app.data);
              const isFirst = idx === 0;
              const isBday = isBirthdayMonth(app);

              return (
                <div 
                  key={app.id} 
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                    isFirst ? "bg-primary/10 ring-2 ring-primary/20 scale-[1.02] shadow-md" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex gap-4 items-center flex-1">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex flex-col items-center justify-center text-[10px] font-bold shadow-sm transition-transform group-hover:scale-110",
                      isFirst ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <span>{format(date, 'MMM', { locale: ptBR }).toUpperCase()}</span>
                      <span className="text-base leading-none">{format(date, 'dd')}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg leading-none group-hover:text-primary transition-colors">
                          {app.nome}
                        </h4>
                        {isBday && (
                          <span className="flex items-center gap-1 bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase">
                            <Cake size={10} /> Niver
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {app.servico}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1">
                      {app.whatsapp && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:bg-green-50"
                          onClick={() => handleSendReminder(app)}
                        >
                          <Send size={16} />
                        </Button>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      app.tipo === 'Aplicação' ? "bg-yellow-500/20 text-yellow-700" : "bg-purple-500/20 text-purple-700"
                    )}>
                      {app.tipo}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground italic">Nenhum agendamento futuro.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
