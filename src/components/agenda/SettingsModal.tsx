"use client"

import { useState, useEffect } from "react"
import { Settings, Globe, Palette, Check } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { AgendaTheme } from "@/hooks/use-agenda"
import { cn } from "@/lib/utils"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  currentTheme: AgendaTheme
  onThemeChange: (theme: AgendaTheme, persist?: boolean) => void
}

const THEMES: { id: AgendaTheme; name: string; class: string }[] = [
  { id: 'black', name: 'Black Luxury', class: 'bg-black border-primary' },
  { id: 'white', name: 'Pure White', class: 'bg-white border-zinc-200' },
]

export function SettingsModal({ isOpen, onClose, onSave, currentTheme, onThemeChange }: SettingsModalProps) {
  const [apiUrl, setApiUrl] = useState("")
  const [initialTheme, setInitialTheme] = useState<AgendaTheme>(currentTheme)
  const [selectedTheme, setSelectedTheme] = useState<AgendaTheme>(currentTheme)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem("mock_api_url") || ""
      setApiUrl(savedUrl)
      setInitialTheme(currentTheme)
      setSelectedTheme(currentTheme)
    }
  }, [isOpen, currentTheme])

  const handleThemePreview = (themeId: AgendaTheme) => {
    setSelectedTheme(themeId)
    onThemeChange(themeId, false)
  }

  const handleCancel = () => {
    onThemeChange(initialTheme, false)
    onClose()
  }

  const handleSave = () => {
    localStorage.setItem("mock_api_url", apiUrl.trim())
    onThemeChange(selectedTheme, true)
    
    toast({
      title: "Configurações Salvas",
      description: "As alterações foram aplicadas com sucesso.",
    })
    onSave()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[2rem] bg-background border-border p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline text-gold-gradient flex items-center gap-3">
            <Settings className="text-primary" size={28} />
            Configurações
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Personalize sua experiência no I Lash Studio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="space-y-4">
            <Label className="text-lg font-bold flex items-center gap-2">
              <Palette size={20} className="text-primary" />
              Estilo da Agenda
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemePreview(theme.id)}
                  className={cn(
                    "relative group flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300",
                    selectedTheme === theme.id 
                      ? "border-primary bg-primary/10 shadow-lg" 
                      : "border-border bg-card/50 hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-full h-12 rounded-xl shadow-md border", theme.class)} />
                  <span className={cn(
                    "text-xs font-bold",
                    selectedTheme === theme.id ? "text-primary" : "text-muted-foreground"
                  )}>
                    {theme.name}
                  </span>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="api-url" className="text-lg font-bold flex items-center gap-2">
              <Globe size={20} className="text-primary" />
              Banco de Dados (MockAPI)
            </Label>
            <Input
              id="api-url"
              placeholder="Ex: https://mockapi.io/..."
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="rounded-xl h-12 bg-muted/50 border-border focus:border-primary"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            variant="ghost" 
            onClick={handleCancel} 
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 rounded-xl h-12 bg-gold-gradient text-primary-foreground font-bold text-lg hover:scale-[1.02] transition-transform"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}