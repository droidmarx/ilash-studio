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
import { ClipboardList, Save, HeartPulse, Eye, AlertTriangle } from "lucide-react"

interface AnamneseModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, anamnese: Anamnese) => Promise<void>
}

export function AnamneseModal({ client, isOpen, onClose, onSave }: AnamneseModalProps) {
  const [formData, setFormData] = useState<Anamnese>({})

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

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-[2rem] bg-background border-border p-6 md:p-8 max-h-[90vh] overflow-y-auto text-foreground">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline text-gold-gradient flex items-center gap-3">
            <ClipboardList className="text-primary" size={28} />
            Ficha de Anamnese
          </DialogTitle>
          <p className="text-primary/60 font-bold uppercase text-[10px] tracking-widest">{client.nome}</p>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="space-y-4">
            <h3 className="text-primary flex items-center gap-2 font-bold text-sm">
              <AlertTriangle size={18} /> Alergias e Sensibilidades
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Alergia a cosméticos, esmaltes ou cianoacrilato?</Label>
                <Input 
                  value={formData.alergias || ""} 
                  onChange={(e) => setFormData({...formData, alergias: e.target.value})}
                  className="rounded-xl bg-muted/30 border-border"
                  placeholder="Descreva aqui..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-primary flex items-center gap-2 font-bold text-sm">
              <Eye size={18} /> Saúde Ocular
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                <Checkbox 
                  id="cirurgia" 
                  checked={formData.cirurgiaRecente} 
                  onCheckedChange={(c) => setFormData({...formData, cirurgiaRecente: !!c})}
                />
                <Label htmlFor="cirurgia" className="text-xs cursor-pointer">Cirurgia ocular recente?</Label>
              </div>
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                <Checkbox 
                  id="sensibilidade" 
                  checked={formData.sensibilidadeLuz} 
                  onCheckedChange={(c) => setFormData({...formData, sensibilidadeLuz: !!c})}
                />
                <Label htmlFor="sensibilidade" className="text-xs cursor-pointer">Sensibilidade à luz?</Label>
              </div>
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                <Checkbox 
                  id="lentes" 
                  checked={formData.usaLentes} 
                  onCheckedChange={(c) => setFormData({...formData, usaLentes: !!c})}
                />
                <Label htmlFor="lentes" className="text-xs cursor-pointer">Usa lentes de contato?</Label>
              </div>
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                <Checkbox 
                  id="maquiagem" 
                  checked={formData.maquiagemDiaria} 
                  onCheckedChange={(c) => setFormData({...formData, maquiagemDiaria: !!c})}
                />
                <Label htmlFor="maquiagem" className="text-xs cursor-pointer">Maquiagem diária nos olhos?</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Problemas oculares (Glaucoma, Conjuntivite, Terçol)?</Label>
              <Input 
                value={formData.problemasOculares || ""} 
                onChange={(e) => setFormData({...formData, problemasOculares: e.target.value})}
                className="rounded-xl bg-muted/30 border-border"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-primary flex items-center gap-2 font-bold text-sm">
              <HeartPulse size={18} /> Condição Geral
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                <Checkbox 
                  id="gestante" 
                  checked={formData.gestanteLactante} 
                  onCheckedChange={(c) => setFormData({...formData, gestanteLactante: !!c})}
                />
                <Label htmlFor="gestante" className="text-xs cursor-pointer">Gestante ou Lactante?</Label>
              </div>
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                <Checkbox 
                  id="hormonal" 
                  checked={formData.disturbioHormonal} 
                  onCheckedChange={(c) => setFormData({...formData, disturbioHormonal: !!c})}
                />
                <Label htmlFor="hormonal" className="text-xs cursor-pointer">Distúrbio hormonal/Tireoide?</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Lado que prefere dormir?</Label>
              <Select 
                value={formData.dormeDeLado} 
                onValueChange={(v: any) => setFormData({...formData, dormeDeLado: v})}
              >
                <SelectTrigger className="rounded-xl bg-muted/30 border-border">
                  <SelectValue placeholder="Selecione o lado" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="Direito">Direito</SelectItem>
                  <SelectItem value="Esquerdo">Esquerdo</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                  <SelectItem value="Costas">Costas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Outras observações importantes</Label>
            <Textarea 
              value={formData.observacoesSaude || ""} 
              onChange={(e) => setFormData({...formData, observacoesSaude: e.target.value})}
              className="rounded-xl bg-muted/30 border-border min-h-[100px]"
              placeholder="Histórico médico relevante..."
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 rounded-xl h-12 bg-gold-gradient text-primary-foreground font-bold flex items-center gap-2">
            <Save size={20} /> Salvar Ficha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
