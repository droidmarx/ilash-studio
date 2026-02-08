"use client"

import { useState, useEffect } from "react"
import { Client, Anamnese } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Save, AlertTriangle, Send, Check, User, Camera, PenLine, Sparkles, HeartPulse } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface AnamneseModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, anamnese: Anamnese) => Promise<void>
}

export function AnamneseModal({ client, isOpen, onClose, onSave }: AnamneseModalProps) {
  const [formData, setFormData] = useState<Anamnese>({})
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (client) {
      setFormData(client.anamnese || { autorizaImagem: true, dormeDeLado: 'Não' })
    }
  }, [client, isOpen])

  const handleSave = async () => {
    if (client) {
      await onSave(client.id, formData)
      onClose()
    }
  }

  const handleShareWhatsApp = () => {
    if (!client) return
    const baseUrl = window.location.origin
    const link = `${baseUrl}/anamnese/${client.id}`
    
    const message = `Olá *${client.nome.trim()}*! ✨\n\nPara garantir sua segurança e o melhor resultado no seu procedimento, por favor preencha sua ficha de anamnese digital no link abaixo:\n\n🔗 ${link}\n\nEstamos ansiosas para ver você no *i Lash Studio*! 💖`
    
    const cleanPhone = client.whatsapp?.replace(/\D/g, "") || ""
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    
    window.open(url, "_blank")
    
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast({
      title: "Link enviado!",
      description: "WhatsApp aberto e link copiado para área de transferência.",
    })
    setTimeout(() => setCopied(false), 3000)
  }

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[750px] rounded-[2rem] bg-background border-border p-6 md:p-8 max-h-[90vh] overflow-y-auto text-foreground">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <DialogTitle className="text-3xl font-headline text-gold-gradient flex items-center gap-3">
              <ClipboardList className="text-primary" size={28} />
              Ficha de Anamnese
            </DialogTitle>
            <p className="text-primary/60 font-bold uppercase text-[10px] tracking-widest">{client.nome}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShareWhatsApp}
            className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/10"
          >
            {copied ? <Check size={16} /> : <Send size={16} />}
            <span className="hidden sm:inline">{copied ? "Link Copiado" : "Link p/ Cliente"}</span>
          </Button>
        </DialogHeader>

        <div className="space-y-10 py-6">
          {/* Dados Cadastrais */}
          <div className="space-y-4">
            <h3 className="text-primary flex items-center gap-2 font-bold text-sm border-b border-primary/10 pb-1">
              <User size={18} /> Dados Cadastrais
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">CPF</Label>
                <Input value={formData.cpf || ""} onChange={(e) => setFormData({...formData, cpf: e.target.value})} className="h-9 rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">RG</Label>
                <Input value={formData.rg || ""} onChange={(e) => setFormData({...formData, rg: e.target.value})} className="h-9 rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Profissão</Label>
                <Input value={formData.profissao || ""} onChange={(e) => setFormData({...formData, profissao: e.target.value})} className="h-9 rounded-xl text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Data Nasc.</Label>
                <Input type="date" value={formData.dataNascimento || ""} onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})} className="h-9 rounded-xl text-xs" />
              </div>
            </div>
          </div>

          {/* Saúde */}
          <div className="space-y-4">
            <h3 className="text-primary flex items-center gap-2 font-bold text-sm border-b border-primary/10 pb-1">
              <HeartPulse size={18} /> Saúde e Histórico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: 'Proc. Olhos Recente', field: 'procedimentoRecenteOlhos' },
                { label: 'Alergia Cosméticos', field: 'alergiaCosmeticos' },
                { label: 'Prob. Tireóide', field: 'problemaTireoide' },
                { label: 'Prob. Oculares', field: 'problemaOcular' },
                { label: 'Trat. Oncológico', field: 'tratamentoOncologico' },
                { label: 'Gestante/Lactante', field: 'gestanteLactante' }
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <span className="text-[11px] font-medium">{item.label}</span>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <Checkbox 
                        checked={!!(formData as any)[item.field]} 
                        onCheckedChange={() => setFormData({...formData, [item.field]: true})} 
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="text-[10px] text-primary">Sim</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Checkbox 
                        checked={!(formData as any)[item.field]} 
                        onCheckedChange={() => setFormData({...formData, [item.field]: false})} 
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="text-[10px] text-muted-foreground">Não</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Sparkles size={10}/> Dorme de lado?</Label>
                <Select value={formData.dormeDeLado || 'Não'} onValueChange={(v: any) => setFormData({...formData, dormeDeLado: v})}>
                  <SelectTrigger className="h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Sim, Lado Direito">Lado Direito</SelectItem>
                    <SelectItem value="Sim, Lado Esquerdo">Lado Esquerdo</SelectItem>
                    <SelectItem value="Sim, Ambos os lados">Ambos os lados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Observações Adicionais</Label>
                <Textarea 
                  value={formData.observacoesGerais || ""} 
                  onChange={(e) => setFormData({...formData, observacoesGerais: e.target.value})}
                  className="rounded-xl h-20 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Autorização e Assinatura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
            <div className="space-y-4">
              <h3 className="text-primary flex items-center gap-2 font-bold text-sm">
                <Camera size={18} /> Uso de Imagem
              </h3>
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                <Checkbox id="auth-img" checked={formData.autorizaImagem} onCheckedChange={(c) => setFormData({...formData, autorizaImagem: !!c})} />
                <Label htmlFor="auth-img" className="text-xs font-bold text-primary">Autoriza fotos/vídeos?</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-primary flex items-center gap-2 font-bold text-sm">
                <PenLine size={18} /> Assinatura Digital
              </h3>
              {formData.assinatura ? (
                <div className="border rounded-xl bg-white p-2">
                  <img src={formData.assinatura} alt="Assinatura" className="max-h-[100px] mx-auto" />
                </div>
              ) : (
                <div className="border border-dashed rounded-xl h-[100px] flex items-center justify-center text-[10px] text-muted-foreground italic">
                  Aguardando assinatura da cliente...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl">Fechar</Button>
          <Button onClick={handleSave} className="flex-1 rounded-xl h-12 bg-gold-gradient text-primary-foreground font-bold">
            <Save size={20} className="mr-2" /> Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
