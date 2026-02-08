
"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { getClient, updateClient, Client, Anamnese } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Save, HeartPulse, Eye, AlertTriangle, Loader2, Crown, CheckCircle2, User, Camera, Eraser, PenLine } from "lucide-react"

export default function ClientAnamnesePage() {
  const { id } = useParams()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<Anamnese>({})
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    async function loadClient() {
      if (typeof id !== 'string') return
      try {
        const data = await getClient(id)
        setClient(data)
        setFormData(data.anamnese || { autorizaImagem: true })
      } catch (error) {
        console.error("Erro ao carregar cliente", error)
      } finally {
        setLoading(false)
      }
    }
    loadClient()
  }, [id])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setFormData(prev => ({ ...prev, assinatura: canvas.toDataURL() }))
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#b76e79'

    if (!isDrawing) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      setFormData(prev => ({ ...prev, assinatura: undefined }))
    }
  }

  const handleSave = async () => {
    if (!client || typeof id !== 'string') return
    setSaving(true)
    try {
      // Sync dataNascimento with aniversario field
      await updateClient(id, { 
        anamnese: formData,
        aniversario: formData.dataNascimento 
      })
      setSuccess(true)
    } catch (error) {
      console.error("Erro ao salvar", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-xl text-primary font-light tracking-widest">Carregando ficha exclusiva...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
        <h1 className="text-3xl font-headline text-gold-gradient mb-4">Link Expirado ou Inválido</h1>
        <p className="text-muted-foreground">Por favor, solicite um novo link ao i Lash Studio.</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background animate-in fade-in duration-1000">
        <div className="bg-card/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-primary/30 shadow-2xl space-y-6 max-w-md w-full">
          <div className="flex justify-center">
            <CheckCircle2 className="text-green-500" size={64} />
          </div>
          <h1 className="text-4xl font-headline text-gold-gradient">Obrigada, {client.nome.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Sua ficha foi enviada com sucesso ao i Lash Studio. Estamos ansiosas para cuidar do seu olhar!</p>
          <div className="pt-4">
            <Crown className="text-primary mx-auto opacity-40" size={32} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-background/50 backdrop-blur-[2px]">
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Crown className="text-primary" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-headline text-gold-gradient py-2">i Lash Studio</h1>
          <div className="space-y-1">
            <p className="text-primary/70 text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">Ficha de Anamnese Digital</p>
            <h2 className="text-2xl font-bold text-foreground">Olá, {client.nome}!</h2>
            <p className="text-sm text-muted-foreground">Complete seus dados para um atendimento seguro e personalizado.</p>
          </div>
        </header>

        <div className="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] border border-border p-6 md:p-10 shadow-2xl space-y-10">
          
          <div className="space-y-6">
            <h3 className="text-primary flex items-center gap-3 font-bold text-lg border-b border-primary/10 pb-2">
              <User size={24} /> Dados Cadastrais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider">CPF</Label>
                <input 
                  value={formData.cpf || ""} 
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  className="w-full px-4 rounded-2xl h-12 bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider">RG</Label>
                <input 
                  value={formData.rg || ""} 
                  onChange={(e) => setFormData({...formData, rg: e.target.value})}
                  className="w-full px-4 rounded-2xl h-12 bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="00.000.000-0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider">Profissão</Label>
                <input 
                  value={formData.profissao || ""} 
                  onChange={(e) => setFormData({...formData, profissao: e.target.value})}
                  className="w-full px-4 rounded-2xl h-12 bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Sua profissão"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider">Data de Nascimento</Label>
                <input 
                  type="date"
                  value={formData.dataNascimento || ""} 
                  onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                  className="w-full px-4 rounded-2xl h-12 bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-primary flex items-center gap-3 font-bold text-lg border-b border-primary/10 pb-2">
              <AlertTriangle size={24} /> Saúde e Alergias
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Possui alergia a cosméticos ou cianoacrilato?</Label>
                <input 
                  value={formData.alergias || ""} 
                  onChange={(e) => setFormData({...formData, alergias: e.target.value})}
                  className="w-full px-4 rounded-2xl h-12 bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Descreva se houver..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <Checkbox 
                    id="cirurgia" 
                    checked={formData.cirurgiaRecente} 
                    onCheckedChange={(c) => setFormData({...formData, cirurgiaRecente: !!c})}
                  />
                  <Label htmlFor="cirurgia" className="text-sm cursor-pointer">Cirurgia ocular recente?</Label>
                </div>
                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <Checkbox 
                    id="gestante" 
                    checked={formData.gestanteLactante} 
                    onCheckedChange={(c) => setFormData({...formData, gestanteLactante: !!c})}
                  />
                  <Label htmlFor="gestante" className="text-sm cursor-pointer">Gestante ou Lactante?</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-primary flex items-center gap-3 font-bold text-lg border-b border-primary/10 pb-2">
              <Camera size={24} /> Autorização de Imagem
            </h3>
            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/20 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Autorizo o <strong>i Lash Studio</strong> a utilizar fotos e vídeos dos meus olhos/rosto obtidos durante o procedimento para fins de portfólio, redes sociais e material informativo.
              </p>
              <div className="flex items-center gap-4">
                <Checkbox 
                  id="autoriza" 
                  checked={formData.autorizaImagem} 
                  onCheckedChange={(c) => setFormData({...formData, autorizaImagem: !!c})}
                  className="h-6 w-6"
                />
                <Label htmlFor="autoriza" className="font-bold text-primary cursor-pointer">Sim, eu autorizo o uso da imagem</Label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-primary flex items-center gap-3 font-bold text-lg border-b border-primary/10 pb-2">
              <PenLine size={24} /> Assinatura Digital
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Assine com o dedo ou caneta touch no campo abaixo:</p>
              <div className="relative border-2 border-dashed border-primary/30 rounded-3xl bg-white overflow-hidden">
                <canvas 
                  ref={canvasRef}
                  width={600}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseMove={draw}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                  onTouchMove={draw}
                  className="w-full h-[200px] cursor-crosshair touch-none"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearSignature}
                  className="absolute bottom-4 right-4 text-primary hover:bg-primary/10 rounded-full"
                >
                  <Eraser size={20} />
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving || !formData.assinatura}
            className="w-full rounded-3xl h-16 bg-gold-gradient text-primary-foreground font-black text-xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-3"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
            {saving ? "Salvando ficha..." : "Finalizar e Enviar"}
          </Button>
        </div>

        <footer className="text-center text-primary/30 text-[10px] font-light tracking-[0.2em] uppercase py-8">
          <p>&copy; {new Date().getFullYear()} i Lash Studio • Luxury Experience</p>
        </footer>
      </div>
    </div>
  )
}
