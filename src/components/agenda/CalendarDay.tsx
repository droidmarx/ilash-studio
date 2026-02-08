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

  return (
    <div
      onClick={() => isCurrentMonth && onClick(day, events, birthdays)}
      className={cn(
        "calendar-day",
        !isCurrentMonth && "not-current-month",
        isTodayDate && "today",
        (hasEvents || hasBirthdays) && "has-event",
        isCurrentMonth && "group"
      )}
    >
      <div className="flex flex-col items-center justify-start w-full">
        <span className={cn(
          "text-lg font-bold transition-colors leading-none mb-1",
          isTodayDate ? "text-primary" : "text-foreground group-hover:text-primary"
        )}>
          {format(day, 'd')}
        </span>
        {hasBirthdays && isCurrentMonth && (
          <div className="relative mt-0.5">
            <Cake size={18} className="text-primary animate-pulse" />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-foreground animate-bounce" />
          </div>
        )}
      </div>
      
      {hasEvents && isCurrentMonth && (
        <div className="flex flex-col items-center gap-2 mt-auto pb-1 w-full">
          <div className="flex -space-x-1.5 justify-center">
            {events.slice(0, 4).map((e, idx) => (
              <div 
                key={idx}
                className={cn(
                  "w-2.5 h-2.5 rounded-full border border-background shadow-lg",
                  e.tipo === 'Aplicação' ? "bg-primary" : "bg-primary/40"
                )}
              />
            ))}
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter text-primary/60">
            {events.length} {events.length === 1 ? 'Job' : 'Jobs'}
          </span>
        </div>
      )}
    </div>
  )
}
