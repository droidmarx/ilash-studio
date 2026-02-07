"use client"

import { useState, useEffect } from "react"
import { Settings, Save, Globe, Info } from "lucide-react"
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

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
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
      description: "A URL do banco de dados foi atualizada com sucesso.",
    })
    onSave()
    onClose()
  }

  const handleReset = () => {
    setApiUrl(DEFAULT_API_URL)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Settings className="text-primary" />
            Configurações do Banco de Dados
          </DialogTitle>
          <DialogDescription>
            Configure o link do seu MockAPI para gerenciar seus próprios dados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-url" className="text-sm font-bold flex items-center gap-2">
              <Globe size={16} />
              URL do MockAPI
            </Label>
            <Input
              id="api-url"
              placeholder="https://mockapi.io/projects/..."
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="rounded-xl border-primary/20 focus:border-primary"
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-2xl flex gap-3 text-xs text-muted-foreground">
            <Info size={18} className="shrink-0 text-primary" />
            <p>
              Ao alterar esta URL, o sistema tentará buscar os dados de agendamento diretamente do seu endpoint. Certifique-se de que o formato dos dados seja compatível com a interface Client.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleReset} className="sm:mr-auto">
            Restaurar Padrão
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="rounded-xl gap-2">
            <Save size={18} />
            Salvar Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
