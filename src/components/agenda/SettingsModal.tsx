"use client"

import { useState, useEffect } from "react"
import { Settings, Globe, Send, MessageSquare, Info, ExternalLink, User, Trash2, PlusCircle, Loader2, Key } from "lucide-react"
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
import { Recipient, getRecipients, createRecipient, updateRecipient, deleteRecipient, updateTelegramToken } from "@/lib/api"

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
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setApiUrl(localStorage.getItem("mock_api_url") || "")
      loadRecipients()
    }
  }, [isOpen])

  const loadRecipients = async () => {
    setLoading(true)
    try {
      const data = await getRecipients()
      
      // Filtra o token do sistema da lista de pessoas
      const persons = data.filter(r => r.nome !== 'SYSTEM_TOKEN')
      setRecipients(persons.slice(0, 3))
      
      // Carrega o token
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

  const handleSave = async () => {
    setSaving(true)
    localStorage.setItem("mock_api_url", apiUrl.trim())
    
    try {
      // 1. Salva o Token do Telegram
      if (botToken) {
        await updateTelegramToken(botToken.trim());
      }

      // 2. Pega os destinatários atuais do banco para saber o que excluir
      const remoteRecipients = await getRecipients()
      
      // 3. Exclui os que não estão mais na lista local (ignorando o SYSTEM_TOKEN)
      for (const remote of remoteRecipients) {
        if (remote.nome !== 'SYSTEM_TOKEN' && !recipients.find(r => r.id === remote.id)) {
          await deleteRecipient(remote.id)
        }
      }

      // 4. Salva/Cria os locais
      for (const local of recipients) {
        if (local.id.startsWith('temp-')) {
          await createRecipient({ nome: local.nome, chatID: local.chatID })
        } else {
          await updateRecipient(local)
        }
      }

      toast({
        title: "Configurações Salvas",
        description: "Token e administradores atualizados com sucesso.",
      })
      onSave()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível sincronizar com o MockAPI.",
      })
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
          {/* Seção Banco de Dados */}
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
          </div>

          <Separator className="bg-primary/10" />

          {/* Seção Token do Telegram */}
          <div className="space-y-4">
            <Label htmlFor="bot-token" className="text-lg font-bold flex items-center gap-2 text-primary">
              <Key size={20} />
              Telegram Bot Token
            </Label>
            <Input
              id="bot-token"
              placeholder="Cole aqui o Token do @BotFather"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="rounded-xl h-12 bg-muted/50 border-border focus:border-primary font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground italic">Este token permite que o Studio envie mensagens via Telegram.</p>
          </div>

          <Separator className="bg-primary/10" />

          {/* Seção Destinatários */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold flex items-center gap-2 text-primary">
                <Send size={20} />
                Destinatários (Máx. 3)
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

            <Alert className="bg-primary/5 border-primary/20 rounded-2xl">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                As notificações serão enviadas para todos os Chat IDs cadastrados abaixo.
              </AlertDescription>
            </Alert>

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

            {/* Instruções */}
            <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-4">
              <h4 className="text-xs font-black uppercase text-primary flex items-center gap-2">
                <MessageSquare size={14} /> Como conseguir os dados?
              </h4>
              <ul className="text-[11px] space-y-3 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">1</span>
                  <span>Crie um bot no <strong>@BotFather</strong> para obter o <strong>Token</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">2</span>
                  <span>Use o <strong>@userinfobot</strong> para descobrir seu <strong>Chat ID</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">3</span>
                  <span>Certifique-se de dar <strong>/start</strong> no seu bot recém-criado.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={saving}
            className="rounded-xl"
          >
            Cancelar
          </Button>
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