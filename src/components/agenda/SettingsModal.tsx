"use client"

import { useState, useEffect } from "react"
import { Settings, Globe, Send, MessageSquare, Info, User, Trash2, PlusCircle, Loader2, Key, Bot, CheckCircle } from "lucide-react"
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
import { Recipient, getRecipients, createRecipient, updateRecipient, deleteRecipient, updateTelegramToken, setTelegramWebhook, updateMainApiUrl, DEFAULT_API_URL } from "@/lib/api"

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
  const [botToken, setBotToken] = useState("")
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setApiUrl(localStorage.getItem("mock_api_url") || DEFAULT_API_URL)
      loadRecipients()
    }
  }, [isOpen])

  const loadRecipients = async () => {
    setLoading(true)
    try {
      const data = await getRecipients()
      // Filtra entradas de sistema
      const persons = data.filter(r => 
        r.nome !== 'SYSTEM_TOKEN' && 
        r.nome !== 'SUMMARY_STATE' && 
        r.nome !== 'MAIN_API_URL'
      )
      setRecipients(persons.slice(0, 3))
      
      const tokenConfig = data.find(r => r.nome === 'SYSTEM_TOKEN')
      if (tokenConfig) setBotToken(tokenConfig.chatID)
    } catch (error) {
      console.error("Erro ao carregar destinatários", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecipient = () => {
    if (recipients.length >= 3) return
    setRecipients([...recipients, { id: 'temp-' + Date.now(), nome: "", chatID: "" }])
  }

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = [...recipients]
    newRecipients.splice(index, 1)
    setRecipients(newRecipients)
  }

  const handleUpdateRecipientField = (index: number, field: 'nome' | 'chatID', value: string) => {
    const newRecipients = [...recipients]
    newRecipients[index] = { ...newRecipients[index], [field]: value }
    setRecipients(newRecipients)
  }

  const handleActivateWebhook = async () => {
    if (!botToken) {
      toast({ variant: "destructive", title: "Erro", description: "Salve o Token do Bot antes de ativar." })
      return
    }
    setWebhookLoading(true)
    try {
      const currentUrl = window.location.origin
      const success = await setTelegramWebhook(botToken.trim(), currentUrl)
      if (success) {
        toast({ title: "Bot Ativado!", description: "Agora seu robô responderá aos comandos /command1 e /command2." })
      } else {
        throw new Error()
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Falha na Ativação", description: "Verifique seu Token e tente novamente." })
    } finally {
      setWebhookLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const normalizedUrl = apiUrl.trim()
    localStorage.setItem("mock_api_url", normalizedUrl)
    
    try {
      // Sincroniza URL da API e Token no servidor (MockAPI global config)
      await updateMainApiUrl(normalizedUrl);
      
      if (botToken) {
        await updateTelegramToken(botToken.trim());
      }

      const remoteRecipients = await getRecipients()
      
      // Remove admins que não estão mais na lista local
      for (const remote of remoteRecipients) {
        const isSystemKey = ['SYSTEM_TOKEN', 'SUMMARY_STATE', 'MAIN_API_URL'].includes(remote.nome);
        if (!isSystemKey && !recipients.find(r => r.id === remote.id)) {
          await deleteRecipient(remote.id)
        }
      }

      // Cria ou atualiza admins
      for (const local of recipients) {
        if (local.id.startsWith('temp-')) {
          await createRecipient({ nome: local.nome, chatID: local.chatID })
        } else {
          await updateRecipient(local)
        }
      }

      toast({ title: "Configurações Salvas", description: "Configurações sincronizadas com sucesso." })
      onSave()
      onClose()
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: "Falha ao sincronizar dados." })
    } finally {
      setSaving(false)
    }
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
            Gerencie o robô de notificações e os administradores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="space-y-4">
            <Label htmlFor="api-url" className="text-lg font-bold flex items-center gap-2 text-primary">
              <Globe size={20} />
              URL Base do MockAPI
            </Label>
            <Input
              id="api-url"
              placeholder="Ex: https://mockapi.io/projects/..."
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="rounded-xl h-12 bg-muted/50 border-border focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground">Essa URL é usada para salvar agendamentos e clientes.</p>
          </div>

          <Separator className="bg-primary/10" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="bot-token" className="text-lg font-bold flex items-center gap-2 text-primary">
                <Key size={20} />
                Telegram Bot Token
              </Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleActivateWebhook}
                disabled={webhookLoading || !botToken}
                className="rounded-full border-primary/20 text-primary hover:bg-primary/10 gap-2 h-8"
              >
                {webhookLoading ? <Loader2 className="animate-spin" size={14} /> : <Bot size={14} />}
                Ativar Bot Interativo
              </Button>
            </div>
            <Input
              id="bot-token"
              placeholder="Cole aqui o Token do @BotFather"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="rounded-xl h-12 bg-muted/50 border-border focus:border-primary font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">O bot responde aos comandos <b>/command1</b> (Hoje) e <b>/command2</b> (Mês).</p>
          </div>

          <Separator className="bg-primary/10" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold flex items-center gap-2 text-primary">
                <Send size={20} />
                Destinatários de Alerta (Máx. 3)
              </Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleAddRecipient}
                disabled={recipients.length >= 3 || loading}
                className="text-primary hover:bg-primary/10 gap-2"
              >
                <PlusCircle size={16} /> Adicionar
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : recipients.map((r, index) => (
                <div key={r.id} className="bg-muted/30 p-4 rounded-2xl border border-border space-y-3 relative group">
                  <button 
                    onClick={() => handleRemoveRecipient(index)}
                    className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <User size={10} /> Nome do Admin
                      </Label>
                      <Input
                        placeholder="Ex: Maria"
                        value={r.nome}
                        onChange={(e) => handleUpdateRecipientField(index, 'nome', e.target.value)}
                        className="rounded-lg h-10 bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <MessageSquare size={10} /> Chat ID
                      </Label>
                      <Input
                        placeholder="Ex: 5759760387"
                        value={r.chatID}
                        onChange={(e) => handleUpdateRecipientField(index, 'chatID', e.target.value)}
                        className="rounded-lg h-10 bg-background border-border"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button variant="ghost" onClick={onClose} disabled={saving} className="rounded-xl">Cancelar</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex-1 rounded-xl h-12 bg-gold-gradient text-primary-foreground font-bold text-lg hover:scale-[1.02] transition-transform"
          >
            {saving ? <Loader2 className="animate-spin" /> : "Salvar Configurações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
