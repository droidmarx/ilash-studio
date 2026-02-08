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
import { ClipboardList, Save, HeartPulse, Eye, AlertTriangle, Send, Check, User, Camera, PenLine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
      setFormData(client.anamnese || {})
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
    
    navigator.clipboard.text = link
    setCopied(true)
    toast({
      title: "Link enviado!",
      description: "WhatsApp aberto e link copiado.",
    })
    setTimeout(() => setCopied(false), 3000)
  }

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] rounded-[2rem] bg-background border-border p-6 md:p-8 max-h-[90vh] overflow-y-auto text-foreground">
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
            <span className="hidden sm:inline">{copied ? "Link Enviado" : "Link p/ Cliente"}</span>
          </Button>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Dados Cadastrais */}
          <div className="space-y-4">
            <h3 className="text-primary flex items-center gap-2 font-bold text-sm">
              <User size={18} /> Dados Cadastrais
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">CPF</Label>
                <Input value={formData.cpf || ""} onChange={(e) => setFormData({...formData, cpf: e.target.value})} className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">RG</Label>
                <Input value={formData.rg || ""} onChange={(e) => setFormData({...formData, rg: e.target.value})} className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Profissão</Label>
                <Input value={formData.profissao || ""} onChange={(e) => setFormData({...formData, profissao: e.target.value})} className="h-9 rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Data Nasc.</Label>
                <Input type="date" value={formData.dataNascimento || ""} onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})} className="h-9 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-primary flex items-center gap-2 font-bold text-sm">
              <AlertTriangle size={18} /> Alergias e Saúde
            </h3>
            <Input 
              value={formData.alergias || ""} 
              onChange={(e) => setFormData({...formData, alergias: e.target.value})}
              className="rounded-xl"
              placeholder="Alergias..."
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl">
                <Checkbox checked={formData.cirurgiaRecente} onCheckedChange={(c) => setFormData({...formData, cirurgiaRecente: !!c})} />
                <Label className="text-xs">Cirurgia ocular?</Label>
              </div>
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl">
                <Checkbox checked={formData.gestanteLactante} onCheckedChange={(c) => setFormData({...formData, gestanteLactante: !!c})} />
                <Label className="text-xs">Gestante/Lactante?</Label>
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
                <PenLine size={18} /> Assinatura
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
