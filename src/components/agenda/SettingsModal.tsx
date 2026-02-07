"use client"

import { useState, useEffect } from "react"
import { Settings, Save, Globe, Info, Palette, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEFAULT_API_URL } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { AgendaTheme } from "@/hooks/use-agenda"
import { cn } from "@/lib/utils"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  currentTheme: AgendaTheme
  onThemeChange: (theme: AgendaTheme) => void
}

const THEMES: { id: AgendaTheme; name: string; class: string }[] = [
  { id: 'gold', name: 'Luxury Gold', class: 'bg-gradient-to-r from-[#BF953F] to-[#FCF6BA]' },
  { id: 'rose', name: 'Soft Rose', class: 'bg-gradient-to-r from-[#e29595] to-[#f8d7da]' },
  { id: 'emerald', name: 'Emerald Luxe', class: 'bg-gradient-to-r from-[#064e3b] to-[#10b981]' },
  { id: 'blue', name: 'Midnight Blue', class: 'bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa]' },
]

export function SettingsModal({ isOpen, onClose, onSave, currentTheme, onThemeChange }: SettingsModalProps) {
  const [apiUrl, setApiUrl] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem("mock_api_url") || DEFAULT_API_URL
      setApiUrl(savedUrl)
    }
  }, [isOpen])

  const handleSave = () => {
    if (!apiUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL Inválida",
        description: "Por favor, insira uma URL válida para o MockAPI.",
      })
      return
    }

    localStorage.setItem("mock_api_url", apiUrl.trim())
    toast({
      title: "Configurações Salvas",
      description: "As alterações foram aplicadas com sucesso.",
    })
    onSave()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[2rem] bg-zinc-950 border-white/10 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline text-gold-gradient flex items-center gap-3">
            <Settings className="text-primary" size={28} />
            Configurações
          </DialogTitle>
          <DialogDescription className="text-primary/50">
            Personalize a aparência e conexão da sua agenda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Seleção de Temas */}
          <div className="space-y-4">
            <Label className="text-lg font-bold flex items-center gap-2 text-white/80">
              <Palette size={20} className="text-primary" />
              Estilo da Agenda
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={cn(
                    "relative group flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300",
                    currentTheme === theme.id 
                      ? "border-primary bg-primary/10" 
                      : "border-white/5 bg-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn("w-full h-12 rounded-xl shadow-lg", theme.class)} />
                  <span className={cn(
                    "text-xs font-bold",
                    currentTheme === theme.id ? "text-primary" : "text-white/40"
                  )}>
                    {theme.name}
                  </span>
                  {currentTheme === theme.id && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* URL da API */}
          <div className="space-y-3">
            <Label htmlFor="api-url" className="text-lg font-bold flex items-center gap-2 text-white/80">
              <Globe size={20} className="text-primary" />
              Banco de Dados (MockAPI)
            </Label>
            <Input
              id="api-url"
              placeholder="https://mockapi.io/projects/..."
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="rounded-xl h-12 bg-white/5 border-white/10 text-white focus:border-primary"
            />
            <div className="bg-white/5 p-4 rounded-2xl flex gap-3 text-[11px] text-white/40 leading-relaxed">
              <Info size={18} className="shrink-0 text-primary" />
              <p>
                Ao alterar esta URL, o sistema buscará os dados diretamente do seu endpoint. Use o padrão "Client" compatível.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            variant="ghost" 
            onClick={() => setApiUrl(DEFAULT_API_URL)} 
            className="rounded-xl text-white/40 hover:text-white"
          >
            Restaurar Padrão
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 rounded-xl h-12 bg-gold-gradient text-black font-bold text-lg hover:scale-[1.02] transition-transform"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}