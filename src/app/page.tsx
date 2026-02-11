
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { ThemeToggle } from "@/components/agenda/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Loader2, Settings, Plus, Calendar as CalendarIcon, Users, Crown, LogOut } from "lucide-react"
import { Client } from "@/lib/api"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"

export default function AgendaPage() {
  const router = useRouter()
  const { 
    clients,
    loading, 
    currentMonth, 
    nextMonth, 
    prevMonth, 
    getDayEvents, 
    getDayBirthdays,
    upcomingAppointments,
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Verificação de Login
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    // Configuração de Tema
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      document.documentElement.classList.add('dark')
    }

    // Timer do Splash
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [router])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/login")
  }

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
      const dateWithTime = setHours(setMinutes(date, now.getMinutes()), now.getHours())
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

  if (!isAuthorized) return null

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
        <div className="relative flex flex-col items-center gap-6 animate-luxury-zoom">
          <div className="relative group animate-float-luxury">
            <Image 
              src="/logo.png" 
              alt="I Lash Studio Logo" 
              width={240} 
              height={120} 
              className="drop-shadow-[0_0_35px_rgba(var(--primary),0.6)]"
              priority
            />
            <div className="absolute inset-0 bg-primary/10 blur-[70px] rounded-full scale-150 -z-10 animate-pulse" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-6xl md:text-9xl font-headline text-gold-gradient py-2 drop-shadow-2xl tracking-tight">
              I Lash Studio
            </h1>
            <p className="text-primary/40 text-[10px] md:text-xs font-bold tracking-[0.6em] uppercase animate-pulse">
              The Art of Eyelash Design
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 font-body bg-background/50 backdrop-blur-[2px] text-foreground animate-in fade-in duration-1000">
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full w-12 h-12 border-primary/40 bg-background/50 backdrop-blur-md hover:bg-primary/10"
        >
          <Settings className="h-6 w-6 text-primary" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleLogout}
          className="rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-transform"
          title="Sair do Sistema"
        >
          <LogOut className="h-6 w-6" />
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
        
        <header className="text-center space-y-4 mb-12 animate-in fade-in duration-1000">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="text-primary animate-bounce" size={24} />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Image 
              src="/logo.png" 
              alt="I Lash Studio Logo" 
              width={260} 
              height={130} 
              className="drop-shadow-2xl animate-float-luxury"
              priority
            />
            <h1 className="text-5xl md:text-8xl font-headline text-gold-gradient drop-shadow-2xl py-2">
              I Lash Studio
            </h1>
          </div>
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
              <TabsList className="bg-muted/50 backdrop-blur-md border border-border p-1.5 rounded-[2rem] h-16 w-full max-w-md shadow-2xl">
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
                  <Card className="rounded-[2.5rem] border-border shadow-2xl bg-card/60 backdrop-blur-2xl">
                    <CardHeader className="flex flex-row items-center justify-between px-8 py-10">
                      <Button variant="ghost" size="icon" onClick={() => prevMonth()} className="hover:bg-primary/10 text-primary">
                        <ChevronLeft size={36} />
                      </Button>
                      <CardTitle className="text-3xl md:text-4xl font-headline text-gold-gradient text-center">
                        {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => nextMonth()} className="hover:bg-primary/10 text-primary">
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
                loading={loading}
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
        loading={loading}
        onClose={() => {
          setIsModalOpen(false);
        }}
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

      <Dialog open={isAddModalOpen} onOpenChange={(open) => { if (!open) { setIsAddModalOpen(false); } }}>
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
              onCancel={() => { setIsAddModalOpen(false); }} 
              loading={loading}
            />
          </div>
        </DialogContent>
      </Dialog>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => { setIsSettingsOpen(false); }}
        onSave={() => { refresh(); }}
      />
    </div>
  )
}
