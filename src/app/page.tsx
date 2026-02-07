"use client"

import { useState } from "react"
import { useAgenda } from "@/hooks/use-agenda"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ThemeToggle } from "@/components/agenda/ThemeToggle"
import { WhatsAppFAB } from "@/components/agenda/WhatsAppFAB"
import { CalendarDay } from "@/components/agenda/CalendarDay"
import { EventModal } from "@/components/agenda/EventModal"
import { SettingsModal } from "@/components/agenda/SettingsModal"
import { AppointmentForm } from "@/components/agenda/AppointmentForm"
import { AppointmentsList } from "@/components/agenda/AppointmentsList"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Sparkles, Loader2, Settings, Plus } from "lucide-react"
import { Client } from "@/lib/api"
import { Toaster } from "@/components/ui/toaster"

export default function AgendaPage() {
  const { 
    loading, 
    currentMonth, 
    theme, 
    toggleTheme, 
    nextMonth, 
    prevMonth, 
    getDayEvents, 
    upcomingAppointments,
    refresh,
    addAppointment,
    editAppointment,
    removeAppointment
  } = useAgenda()

  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [modalEvents, setModalEvents] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  const handleDayClick = (day: Date, events: Client[]) => {
    setSelectedDay(day)
    setModalEvents(events)
    setIsModalOpen(true)
  }

  const handleAddSubmit = async (data: any) => {
    await addAppointment(data)
    setIsAddModalOpen(false)
  }

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center py-12 px-4 md:px-8">
      {/* Background with animated gradient */}
      <div className="fixed inset-0 animated-gradient z-[-1] opacity-90 transition-opacity duration-1000" />
      
      {/* Top Controls */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full w-12 h-12 shadow-lg bg-background/80 backdrop-blur-sm"
        >
          <Settings className="h-6 w-6 text-primary" />
        </Button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      
      {/* Floating Action Button for New Appointment */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-8 z-50 rounded-full w-16 h-16 shadow-2xl bg-primary hover:scale-110 transition-transform duration-300"
      >
        <Plus size={32} />
      </Button>

      <WhatsAppFAB />
      <Toaster />

      <div className="w-full max-w-7xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-6xl md:text-8xl font-headline text-white drop-shadow-lg flex items-center justify-center gap-4">
            <Sparkles className="text-yellow-400" size={48} />
            Studio Lash Agenda
            <Sparkles className="text-yellow-400" size={48} />
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light tracking-widest uppercase">
            Gestão de Agendamentos e Clientes
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-xl animate-pulse">Carregando dados da agenda...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Calendar Column */}
            <div className="lg:col-span-2">
              <Card className="rounded-3xl border-none shadow-2xl bg-card/80 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-8">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-primary/20">
                    <ChevronLeft size={32} />
                  </Button>
                  <CardTitle className="text-3xl md:text-4xl font-headline text-primary text-center">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-primary/20">
                    <ChevronRight size={32} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 mb-4">
                    {weekdays.map(day => (
                      <div key={day} className="text-center font-bold text-muted-foreground text-xs uppercase tracking-widest pb-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {calendarDays.map((day, idx) => (
                      <CalendarDay
                        key={idx}
                        day={day}
                        events={getDayEvents(day)}
                        isCurrentMonth={isSameMonth(day, monthStart)}
                        onClick={handleDayClick}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* List Column */}
            <div className="lg:col-span-1">
              <AppointmentsList appointments={upcomingAppointments} />
            </div>
          </div>
        )}

        <footer className="text-center pt-12 pb-6 text-white/60 text-sm font-light">
          <p>&copy; {new Date().getFullYear()} Studio Lash Design. Todos os direitos reservados.</p>
        </footer>
      </div>

      {/* View/Edit Event Modal */}
      <EventModal
        day={selectedDay}
        events={getDayEvents(selectedDay || new Date())}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={async (id, data) => {
          await editAppointment(id, data)
          setIsModalOpen(false)
        }}
        onDelete={async (id) => {
          await removeAppointment(id)
          setIsModalOpen(false)
        }}
      />

      {/* Add New Appointment Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline text-primary">Novo Agendamento</DialogTitle>
            <DialogDescription>Preencha os dados da cliente para agendar um novo serviço.</DialogDescription>
          </DialogHeader>
          <AppointmentForm onSubmit={handleAddSubmit} onCancel={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={refresh}
      />
    </div>
  )
}
