"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getClient, updateClient, Client, Anamnese } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Save, HeartPulse, Eye, AlertTriangle, Loader2, Crown, CheckCircle2 } from "lucide-react"

export default function ClientAnamnesePage() {
  const { id } = useParams()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<Anamnese>({})

  useEffect(() => {
    async function loadClient() {
      if (typeof id !== 'string') return
      try {
        const data = await getClient(id)
        setClient(data)
        setFormData(data.anamnese || {})
      } catch (error) {
        console.error("Erro ao carregar cliente", error)
      } finally {
        setLoading(false)
      }
    }
    loadClient()
  }, [id])

  const handleSave = async () => {
    if (!client || typeof id !== 'string') return
    setSaving(true)
    try {
      await updateClient(id, { anamnese: formData })
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
        <p className="text-muted-foreground">Por favor, solicite um novo link ao I Lash Studio.</p>
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
          <p className="text-muted-foreground">Sua ficha de anamnese foi enviada com sucesso ao nosso sistema. Estamos ansiosas para deixar seu olhar ainda mais radiante!</p>
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
          <h1 className="text-5xl md:text-6xl font-headline text-gold-gradient py-2">I Lash Studio</h1>
          <div className="space-y-1">
            <p className="text-primary/70 text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">Ficha de Anamnese Personalizada</p>
            <h2 className="text-2xl font-bold text-foreground">Olá, {client.nome}!</h2>
            <p className="text-sm text-muted-foreground">Sua saúde e segurança são nossa prioridade. Por favor, preencha os detalhes abaixo.</p>
          </div>
        </header>

        <div className="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] border border-border p-6 md:p-10 shadow-2xl space-y-10">
          
          <div className="space-y-6">
            <h3 className="text-primary flex items-center gap-3 font-bold text-lg border-b border-primary/10 pb-2">
              <AlertTriangle size={24} /> Alergias e Sensibilidades
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Você possui alergia a cosméticos, esmaltes ou cianoacrilato?</Label>
                <Input 
                  value={formData.alergias || ""} 
                  onChange={(e) => setFormData({...formData, alergias: e.target.value})}
                  className="rounded-2xl h-14 bg-muted/30 border-border focus:border-primary text-lg"
                  placeholder="Ex: Alergia a esmalte, ou nenhuma."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-primary flex items-center gap-3 font-bold text-lg border-b border-primary/10 pb-2">
              <Eye size={24} /> Saúde Ocular
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "cirurgia", label: "Cirurgia ocular recente?", key: "cirurgiaRecente" },
                { id: "sensibilidade", label: "Sensibilidade à luz?", key: "sensibilidadeLuz" },
                { id: "lentes", label: "Usa lentes de contato?", key: "usaLentes" },
                { id: "maquiagem", label: "Usa maquiagem diária?", key: "maquiagemDiaria" },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <Checkbox 
                    id={item.id} 
                    checked={(formData as any)[item.key]} 
                    onCheckedChange={(c) => setFormData({...formData, [item.key]: !!c})}
                    className="h-6 w-6 rounded-md border-primary"
                  />
                  <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors">{item.label}</Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Possui algum problema ocular (Glaucoma, Conjuntivite, Terçol)?</Label>
              <Input 
                value={formData.problemasOculares || ""} 
                onChange={(e) => setFormData({...formData, problemasOculares: e.target.value})}
                className="rounded-2xl h-14 bg-muted/30 border-border focus:border-primary"
                placeholder="Descreva se houver..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-primary flex items-center gap-3 font-bold text-lg border-b border-primary/10 pb-2">
              <HeartPulse size={24} /> Condição Geral
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
                <Checkbox 
                  id="gestante" 
                  checked={formData.gestanteLactante} 
                  onCheckedChange={(c) => setFormData({...formData, gestanteLactante: !!c})}
                  className="h-6 w-6 rounded-md border-primary"
                />
                <Label htmlFor="gestante" className="text-sm font-medium">Gestante ou Lactante?</Label>
              </div>
              <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
                <Checkbox 
                  id="hormonal" 
                  checked={formData.disturbioHormonal} 
                  onCheckedChange={(c) => setFormData({...formData, disturbioHormonal: !!c})}
                  className="h-6 w-6 rounded-md border-primary"
                />
                <Label htmlFor="hormonal" className="text-sm font-medium">Distúrbio hormonal ou Tireoide?</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Lado que você prefere dormir?</Label>
              <Select 
                value={formData.dormeDeLado} 
                onValueChange={(v: any) => setFormData({...formData, dormeDeLado: v})}
              >
                <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-border text-lg">
                  <SelectValue placeholder="Selecione o lado" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border rounded-2xl">
                  <SelectItem value="Direito">Direito</SelectItem>
                  <SelectItem value="Esquerdo">Esquerdo</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                  <SelectItem value="Costas">Costas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Outras observações importantes de saúde</Label>
            <Textarea 
              value={formData.observacoesSaude || ""} 
              onChange={(e) => setFormData({...formData, observacoesSaude: e.target.value})}
              className="rounded-2xl bg-muted/30 border-border min-h-[120px] focus:border-primary p-4"
              placeholder="Histórico médico relevante ou qualquer outra informação que gostaria de compartilhar..."
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full rounded-3xl h-16 bg-gold-gradient text-primary-foreground font-black text-xl shadow-[0_10px_30px_rgba(var(--primary),0.3)] hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-3"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
            {saving ? "Salvando informações..." : "Enviar Ficha de Saúde"}
          </Button>
        </div>

        <footer className="text-center text-primary/30 text-xs font-light tracking-[0.2em] uppercase py-8">
          <p>&copy; {new Date().getFullYear()} I Lash Studio • Luxury Experience</p>
        </footer>
      </div>
    </div>
  )
}
