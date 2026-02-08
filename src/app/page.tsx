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
  isSameMonth,
  setHours,
  setMinutes
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDay } from "@/components/agenda/CalendarDay"
import { EventModal } from "@/components/agenda/EventModal"
import { SettingsModal } from "@/components/agenda/SettingsModal"
import { AppointmentForm } from "@/components/agenda/AppointmentForm"
import { AppointmentsList } from "@/components/agenda/AppointmentsList"
import { ClientsManager } from "@/components/agenda/ClientsManager"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Loader2, Settings, Plus, Calendar as CalendarIcon, Users, Crown } from "lucide-react"
import { Client } from "@/lib/api"
import { Toaster } from "@/components/ui/toaster"

export default function AgendaPage() {
  const { 
    clients,
    loading, 
    currentMonth, 
    nextMonth, 
    prevMonth, 
    getDayEvents, 
    getDayBirthdays,
    upcomingAppointments,
    activeTheme,
    applyTheme,
    refresh,
    addAppointment,
    editAppointment,
    removeAppointment
  } = useAgenda()

  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [modalEvents, setModalEvents] = useState<Client[]>([])
  const [modalBirthdays, setModalBirthdays] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  const handleDayClick = (day: Date, events: Client[], birthdays: Client[]) => {
    setSelectedDay(day)
    setModalEvents(events)
    setModalBirthdays(birthdays)
    setIsModalOpen(true)
  }

  const handleOpenAddModal = (date?: Date) => {
    if (date) {
      const now = new Date()
      const dateWithTime = setMinutes(setHours(date, now.getHours()), now.getMinutes())
      setPrefilledDate(dateWithTime.toISOString().slice(0, 16))
    } else {
      setPrefilledDate(undefined)
    }
    setIsAddModalOpen(true)
  }

  const handleAddSubmit = async (data: any) => {
    await addAppointment(data)
    setIsAddModalOpen(false)
  }

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 font-body transition-colors duration-700 bg-background text-foreground">
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full w-12 h-12 border-primary/40 bg-background/50 backdrop-blur-md hover:bg-primary/10"
        >
          <Settings className="h-6 w-6 text-primary" />
        </Button>
      </div>
      
      <Button
        onClick={() => handleOpenAddModal()}
        className="fixed bottom-10 right-8 z-50 rounded-full w-16 h-16 shadow-[0_0_20px_rgba(var(--primary),0.5)] bg-gold-gradient text-primary-foreground hover:scale-110 transition-transform duration-300"
      >
        <Plus size={32} />
      </Button>

      <Toaster />

      <div className="w-full max-w-7xl mx-auto space-y-10">
        
        <header className="text-center space-y-2 mb-12 animate-in fade-in duration-1000">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="text-primary animate-bounce" size={24} />
          </div>
          <h1 className="text-5xl md:text-8xl font-headline text-gold-gradient drop-shadow-2xl py-8">
            I Lash Studio
          </h1>
          <p className="text-primary/70 text-sm md:text-base font-medium tracking-[0.3em] uppercase">
            Exclusive Client Experience
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-xl text-primary font-light tracking-widest">Aguarde um instante...</p>
          </div>
        ) : (
          <Tabs defaultValue="agenda" className="w-full space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-muted border border-border p-1.5 rounded-[2rem] h-16 w-full max-w-md shadow-2xl">
                <TabsTrigger value="agenda" className="flex-1 rounded-[1.5rem] gap-2 data-[state=active]:bg-gold-gradient data-[state=active]:text-primary-foreground h-full transition-all text-base font-semibold">
                  <CalendarIcon size={20} /> Agenda
                </TabsTrigger>
                <TabsTrigger value="clientes" className="flex-1 rounded-[1.5rem] gap-2 data-[state=active]:bg-gold-gradient data-[state=active]:text-primary-foreground h-full transition-all text-base font-semibold">
                  <Users size={20} /> Clientes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="agenda" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="rounded-[2.5rem] border-border shadow-2xl bg-card backdrop-blur-2xl">
                    <CardHeader className="flex flex-row items-center justify-between px-8 py-10">
                      <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-primary/10 text-primary">
                        <ChevronLeft size={36} />
                      </Button>
                      <CardTitle className="text-3xl md:text-4xl font-headline text-gold-gradient text-center">
                        {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-primary/10 text-primary">
                        <ChevronRight size={36} />
                      </Button>
                    </CardHeader>
                    <CardContent className="px-6 pb-10">
                      <div className="grid grid-cols-7 mb-6">
                        {weekdays.map(day => (
                          <div key={day} className="text-center font-bold text-primary/40 text-xs uppercase tracking-widest">
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
                            birthdays={getDayBirthdays(day)}
                            isCurrentMonth={isSameMonth(day, monthStart)}
                            onClick={(d, evts, bdays) => handleDayClick(d, evts, bdays)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-1">
                  <AppointmentsList appointments={upcomingAppointments} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clientes" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <ClientsManager 
                clients={clients} 
                onEdit={editAppointment} 
                onDelete={removeAppointment} 
              />
            </TabsContent>
          </Tabs>
        )}

        <footer className="text-center pt-20 pb-10 text-primary/20 text-xs font-light tracking-[0.2em] uppercase">
          <p>&copy; {new Date().getFullYear()} I Lash Studio</p>
        </footer>
      </div>

      <EventModal
        day={selectedDay}
        events={modalEvents}
        birthdays={modalBirthdays}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddNew={(date) => {
          setIsModalOpen(false)
          handleOpenAddModal(date)
        }}
        onEdit={async (id, data) => {
          await editAppointment(id, data)
          setIsModalOpen(false)
        }}
        onDelete={async (id) => {
          await removeAppointment(id)
          setIsModalOpen(false)
        }}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[550px] rounded-[2rem] md:rounded-[2.5rem] bg-background border-border p-4 md:p-8 max-h-[95vh] overflow-y-auto text-foreground">
          <DialogHeader>
            <DialogTitle className="text-3xl md:text-4xl font-headline text-gold-gradient">Novo Agendamento</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm md:text-base">
              Personalize a experiência para sua cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 md:mt-6">
            <AppointmentForm 
              clients={clients}
              prefilledDate={prefilledDate}
              onSubmit={handleAddSubmit} 
              onCancel={() => setIsAddModalOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={refresh}
        currentTheme={activeTheme}
        onThemeChange={applyTheme}
      />
    </div>
  )
}