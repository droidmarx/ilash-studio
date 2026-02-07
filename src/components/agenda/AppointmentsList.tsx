"use client"

import { Client } from "@/lib/api"
import { format, parseISO, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { List, Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

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

              return (
                <div 
                  key={app.id} 
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                    isFirst ? "bg-primary/10 ring-2 ring-primary/20 scale-[1.02] shadow-md" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex gap-4 items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex flex-col items-center justify-center text-[10px] font-bold shadow-sm transition-transform group-hover:scale-110",
                      isFirst ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <span>{format(date, 'MMM', { locale: ptBR }).toUpperCase()}</span>
                      <span className="text-base leading-none">{format(date, 'dd')}</span>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-lg leading-none mb-1 group-hover:text-primary transition-colors">
                        {app.nome}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {app.servico}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-2",
                      app.tipo === 'Aplicação' ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" : "bg-purple-500/20 text-purple-700 dark:text-purple-400"
                    )}>
                      {app.tipo}
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
