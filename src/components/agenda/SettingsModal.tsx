"use client"

import { useState, useEffect } from "react"
import { Settings, Globe } from "lucide-react"
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

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  onSave
}: SettingsModalProps) {
  const [apiUrl, setApiUrl] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem("mock_api_url") || ""
      setApiUrl(savedUrl)
    }
  }, [isOpen])

  const handleSave = () => {
    localStorage.setItem("mock_api_url", apiUrl.trim())
    
    toast({
      title: "Configurações Salvas",
      description: "URL da API atualizada com sucesso.",
    })
    onSave()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[550px] rounded-[2rem] bg-background border-border p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline text-gold-gradient flex items-center gap-3">
            <Settings className="text-primary" size={28} />
            Configurações
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure o banco de dados do I Lash Studio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
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
            onClick={onClose} 
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
