"use client"

import { format, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Client } from "@/lib/api"
import { cn } from "@/lib/utils"

interface CalendarDayProps {
  day: Date
  events: Client[]
  isCurrentMonth: boolean
  onClick: (day: Date, events: Client[]) => void
}

export function CalendarDay({ day, events, isCurrentMonth, onClick }: CalendarDayProps) {
  const isTodayDate = isToday(day)
  const hasEvents = events.length > 0

  return (
    <div
      onClick={() => isCurrentMonth && onClick(day, events)}
      className={cn(
        "calendar-day",
        !isCurrentMonth && "not-current-month",
        isTodayDate && "today",
        hasEvents && "has-event",
        isCurrentMonth && "group"
      )}
    >
      <span className="text-sm font-medium mb-1">
        {format(day, 'd')}
      </span>
      
      {hasEvents && isCurrentMonth && (
        <div className="flex flex-col items-center gap-1">
          <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {events.length}
          </span>
          <div className="flex -space-x-1 overflow-hidden mt-1">
            {events.slice(0, 3).map((e, idx) => (
              <div 
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full border border-background shadow-sm",
                  e.tipo === 'Aplicação' ? "bg-yellow-500" : "bg-purple-500"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
