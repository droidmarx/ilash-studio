"use client"

import { useState } from "react"
import { createClient } from "@/lib/api"
import { notifyAppointmentChange } from "@/app/actions/notifications"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Crown, 
  User, 
  Phone, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2
} from "lucide-react"
import { format, addDays, eachDayOfInterval, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"

const TECHNIQUES = ["Brasileiro", "Egípcio", "4D", "5D", "Fio-a-Fio", "Fox"]

export default function ClientBookingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    servico: "",
    tipo: "Aplicação",
    data: "",
    hora: ""
  })

  const times = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"]
  
  const days = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 14)
  })

  const handleNext = () => setStep(prev => prev + 1)
  const handlePrev = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const dateTime = `${formData.data}T${formData.hora}`
      
      const payload = {
        nome: formData.nome,
        whatsapp: formData.whatsapp,
        servico: formData.servico,
        tipo: formData.tipo,
        data: dateTime,
        observacoes: "Agendamento realizado via link Instagram",
        confirmado: false
      };

      await createClient(payload)
      await notifyAppointmentChange(payload, 'Novo')
      setSuccess(true)
    } catch (error) {
      console.error("Erro ao agendar", error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background/50 backdrop-blur-md">
        <div className="bg-card/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-primary/30 shadow-2xl space-y-6 max-w-md w-full animate-in zoom-in duration-500">
          <div className="flex justify-center">
            <CheckCircle2 className="text-green-500" size={64} />
          </div>
          <h1 className="text-4xl font-headline text-gold-gradient">Agendamento Realizado!</h1>
          <p className="text-muted-foreground">
            Obrigada, {formData.nome.split(' ')[0]}! Seu horário foi reservado no <strong>I Lash Studio</strong>.
          </p>
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <p className="text-xs text-primary/60 font-bold uppercase tracking-widest">
              {format(new Date(formData.data), "dd 'de' MMMM", { locale: ptBR })} às {formData.hora}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">Em breve entraremos em contato via WhatsApp para confirmar.</p>
          <div className="pt-4">
            <Crown className="text-primary mx-auto opacity-40" size={32} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-background/50 backdrop-blur-[2px]">
      <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <header className="text-center space-y-4">
          <div className="flex justify-center mb-2 animate-float-luxury">
             {/* Logo Luxuoso da Intro conforme solicitado */}
             <svg 
              width="200" 
              height="100" 
              viewBox="0 0 100 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary drop-shadow-[0_0_25px_rgba(var(--primary),0.6)] rotate-180"
            >
              <path 
                d="M10 30C25 15 75 15 90 30" 
                stroke="currentColor" 
                strokeWidth="0.8" 
                strokeLinecap="round" 
                className="opacity-40"
              />
              <path d="M15 22L12 8" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M25 18L22 4" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M35 15L34 1" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M50 14V0" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M65 15L66 1" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M75 18L78 4" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M85 22L88 8" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-5xl font-headline text-gold-gradient">I Lash Studio</h1>
          <p className="text-primary/70 text-[10px] font-bold tracking-[0.4em] uppercase">Agendamento Online</p>
        </header>

        <Card className="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] border-border shadow-2xl overflow-hidden">
          <CardContent className="p-8 space-y-8">
            
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <User size={14} /> Como podemos te chamar?
                  </Label>
                  <Input 
                    placeholder="Seu nome completo" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="h-14 rounded-2xl bg-muted/30 border-border focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Phone size={14} /> Seu WhatsApp
                  </Label>
                  <Input 
                    placeholder="Ex: 11999999999" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="h-14 rounded-2xl bg-muted/30 border-border focus:ring-primary/20"
                  />
                </div>
                <Button 
                  disabled={!formData.nome || !formData.whatsapp || loading}
                  onClick={handleNext}
                  className="w-full h-14 rounded-3xl bg-gold-gradient text-primary-foreground font-black text-lg gap-2 shadow-xl"
                >
                  Próximo <ArrowRight size={20} />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles size={14} /> Qual técnica você deseja?
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {TECHNIQUES.map((tech) => (
                      <button
                        key={tech}
                        onClick={() => setFormData({...formData, servico: tech})}
                        className={`h-16 px-6 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          formData.servico === tech 
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-inner" 
                          : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        {tech}
                        {formData.servico === tech && <CheckCircle2 size={18} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={handlePrev} className="h-14 rounded-3xl gap-2 flex-1">
                    <ArrowLeft size={18} /> Voltar
                  </Button>
                  <Button 
                    disabled={!formData.servico || loading}
                    onClick={handleNext}
                    className="h-14 rounded-3xl bg-gold-gradient text-primary-foreground font-black text-lg gap-2 flex-1 shadow-xl"
                  >
                    Próximo <ArrowRight size={20} />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <CalendarIcon size={14} /> Escolha o dia
                  </Label>
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {days.map((day) => {
                      const dayStr = format(day, "yyyy-MM-dd")
                      const isSelected = formData.data === dayStr
                      return (
                        <button
                          key={dayStr}
                          onClick={() => setFormData({...formData, data: dayStr})}
                          className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl border transition-all ${
                            isSelected 
                            ? "bg-gold-gradient text-primary-foreground border-transparent shadow-lg scale-105" 
                            : "bg-muted/20 border-border text-muted-foreground"
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold">{format(day, "EEE", { locale: ptBR })}</span>
                          <span className="text-xl font-black">{format(day, "dd")}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Clock size={14} /> Escolha o horário
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {times.map((time) => {
                      const isSelected = formData.hora === time
                      return (
                        <button
                          key={time}
                          onClick={() => setFormData({...formData, hora: time})}
                          className={`h-12 rounded-xl border text-sm font-bold transition-all ${
                            isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                            : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={handlePrev} className="h-14 rounded-3xl gap-2 flex-1">
                    <ArrowLeft size={18} /> Voltar
                  </Button>
                  <Button 
                    disabled={!formData.data || !formData.hora || loading}
                    onClick={handleSubmit}
                    className="h-14 rounded-3xl bg-gold-gradient text-primary-foreground font-black text-lg gap-2 flex-1 shadow-xl"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Finalizar"}
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        <footer className="text-center text-primary/30 text-[10px] font-light tracking-[0.2em] uppercase py-4">
          <p>&copy; {new Date().getFullYear()} I Lash Studio • Luxury Experience</p>
        </footer>
      </div>
    </div>
  )
}
