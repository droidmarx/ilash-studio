"use client"

import { format, isToday } from "date-fns"
import { Client } from "@/lib/api"
import { cn, hapticFeedback } from "@/lib/utils"
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
      onClick={() => {
        if (isCurrentMonth) {
          hapticFeedback(10);
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
            {events.slice(0, 3).map((e, idx) => (
              <div 
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full border border-background shadow-sm transition-transform group-hover:scale-110",
                  e.tipo === 'Aplicação' ? "bg-primary" : "bg-primary/40"
                )}
              />
            ))}
            {events.length > 3 && (
              <span className="text-[8px] font-black text-primary ml-1 leading-none">
                +{events.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
