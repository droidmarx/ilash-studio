
"use client"

import { useState, useEffect } from "react"
import { Settings, Globe, Send, MessageSquare, Info, ExternalLink } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [telegramToken, setTelegramToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setApiUrl(localStorage.getItem("mock_api_url") || "")
      setTelegramToken(localStorage.getItem("telegram_bot_token") || "")
      setTelegramChatId(localStorage.getItem("telegram_chat_id") || "")
    }
  }, [isOpen])

  const handleSave = () => {
    localStorage.setItem("mock_api_url", apiUrl.trim())
    localStorage.setItem("telegram_bot_token", telegramToken.trim())
    localStorage.setItem("telegram_chat_id", telegramChatId.trim())
    
    toast({
      title: "Configurações Salvas",
      description: "As informações do sistema e notificações foram atualizadas.",
    })
    onSave()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-[2rem] bg-background border-border p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline text-gold-gradient flex items-center gap-3">
            <Settings className="text-primary" size={28} />
            Configurações do Studio
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gerencie o banco de dados e as notificações de agendamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Seção Banco de Dados */}
          <div className="space-y-4">
            <Label htmlFor="api-url" className="text-lg font-bold flex items-center gap-2 text-primary">
              <Globe size={20} />
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

          <Separator className="bg-primary/10" />

          {/* Seção Telegram */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold flex items-center gap-2 text-primary">
                <Send size={20} />
                Notificações Telegram
              </Label>
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">BOT ATIVO</Badge>
            </div>

            <Alert className="bg-primary/5 border-primary/20 rounded-2xl">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                As notificações são enviadas instantaneamente para o seu Telegram quando uma cliente agenda pelo link do Instagram.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="tg-token" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Token do Bot (HTTP API)</Label>
                <Input
                  id="tg-token"
                  placeholder="Ex: 123456:ABC-DEF..."
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="rounded-xl h-12 bg-muted/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tg-chat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seu Chat ID</Label>
                <Input
                  id="tg-chat"
                  placeholder="Ex: 5759760387"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="rounded-xl h-12 bg-muted/50 border-border"
                />
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-4">
              <h4 className="text-xs font-black uppercase text-primary flex items-center gap-2">
                <MessageSquare size={14} /> Como configurar?
              </h4>
              <ul className="text-[11px] space-y-3 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">1</span>
                  <span>Fale com o <strong>@BotFather</strong> no Telegram para criar seu bot e receber o <strong>Token</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">2</span>
                  <span>Fale com o <strong>@userinfobot</strong> para descobrir o seu <strong>Chat ID</strong> pessoal.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">3</span>
                  <span>Copie e cole os códigos acima e clique em "Salvar Alterações".</span>
                </li>
              </ul>
              <div className="pt-2">
                <Button variant="link" className="text-[10px] h-auto p-0 text-primary gap-1" asChild>
                  <a href="https://t.me/BotFather" target="_blank" rel="noreferrer">
                    Abrir @BotFather <ExternalLink size={10} />
                  </a>
                </Button>
              </div>
            </div>
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

import { Badge } from "@/components/ui/badge"
