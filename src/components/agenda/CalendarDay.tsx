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
  
  const pendingInstagramEvents = events.filter(e => 
    e.confirmado === false && e.observacoes?.toLowerCase().includes("instagram")
  )

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
          <div className="flex -space-x-1.5 justify-center items-center">
            {pendingInstagramEvents.length > 0 && (
              <div 
                className="w-3 h-3 rounded-full border-2 border-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-instagram-pulse z-10 mr-1.5" 
                title="Novo Agendamento Instagram Pendente"
              />
            )}
            
            {confirmedEvents.slice(0, 3).map((e, idx) => {
              let dotClass = "bg-muted border-border/50";
              if (e.tipo === 'Aplicação') dotClass = "bg-primary border-2 border-white shadow-[0_0_8px_rgba(255,255,255,0.7)] scale-110";
              if (e.tipo === 'Manutenção') dotClass = "bg-primary/70 border-2 border-primary shadow-[0_0_4px_rgba(var(--primary),0.3)]";
              if (e.tipo === 'Remoção') dotClass = "bg-primary/25 border-2 border-primary/20";
              
              return (
                <div 
                  key={idx}
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border shadow-md transition-transform group-hover:scale-110",
                    dotClass
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
