
"use client"

import { format, isToday } from "date-fns"
import { Client } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Cake, Sparkles } from "lucide-react"

interface CalendarDayProps {
  day: Date
  events: Client[]
  birthdays: Client[]
  isCurrentMonth: boolean
  onClick: (day: Date, events: Client[], birthdays: Client[]) => void
}

export function CalendarDay({ day, events, birthdays, isCurrentMonth, onClick }: CalendarDayProps) {
  const isTodayDate = isToday(day)
  const hasEvents = events.length > 0
  const hasBirthdays = birthdays.length > 0
  
  // Agendamentos Instagram pendentes (não confirmados)
  const pendingInstagramEvents = events.filter(e => 
    e.confirmado === false && e.observacoes?.toLowerCase().includes("instagram")
  )

  // Agendamentos confirmados ou manuais
  const confirmedEvents = events.filter(e => 
    e.confirmado !== false
  )

  return (
    <div
      onClick={() => {
        if (isCurrentMonth) {
          onClick(day, events, birthdays);
        }
      }}
      className={cn(
        "calendar-day",
        !isCurrentMonth && "not-current-month",
        isTodayDate && "today",
        (hasEvents || hasBirthdays) && "has-event",
        isCurrentMonth && "group"
      )}
    >
      <div className="h-6 flex items-center justify-center w-full">
        {hasBirthdays && isCurrentMonth && (
          <div className="relative animate-in fade-in zoom-in duration-500">
            <Cake size={16} className="text-primary animate-pulse" />
            <Sparkles size={10} className="absolute -top-1 -right-1 text-foreground animate-bounce" />
          </div>
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-center w-full">
        <span className={cn(
          "text-xl font-bold transition-all duration-300 leading-none",
          isTodayDate ? "text-primary scale-110" : "text-foreground group-hover:text-primary group-hover:scale-110"
        )}>
          {format(day, 'd')}
        </span>
      </div>
      
      <div className="h-6 flex items-center justify-center w-full">
        {hasEvents && isCurrentMonth && (
          <div className="flex -space-x-1 justify-center items-center">
            {/* Somente a bolinha pulsante se houver agendamento Instagram pendente */}
            {pendingInstagramEvents.length > 0 && (
              <div 
                className="w-2.5 h-2.5 rounded-full border border-background shadow-lg animate-instagram-pulse z-10 mr-1.5" 
                title="Novo Agendamento Instagram Pendente"
              />
            )}
            
            {/* Pontos com cores baseadas no tipo de procedimento */}
            {confirmedEvents.slice(0, 3).map((e, idx) => {
              let dotColor = "bg-primary/25"; // Padrão/Remoção
              if (e.tipo === 'Aplicação') dotColor = "bg-primary"; // Dourado Intenso
              if (e.tipo === 'Manutenção') dotColor = "bg-primary/60"; // Dourado Médio
              
              return (
                <div 
                  key={idx}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full border border-background shadow-sm transition-transform group-hover:scale-110",
                    dotColor
                  )}
                  title={e.tipo}
                />
              )
            })}
            
            {(confirmedEvents.length > 3) && (
              <span className="text-[8px] font-black text-primary ml-1 leading-none">
                +{confirmedEvents.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
