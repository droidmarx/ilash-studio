"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Client } from "@/lib/api"
import { generateWhatsAppMessage } from "@/lib/utils"
import { MessageSquare, Zap, RotateCw, Trash2 } from "lucide-react"

interface ReminderDialogProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
}

export function ReminderDialog({ client, isOpen, onClose }: ReminderDialogProps) {
  if (!client) return null

  const handleSend = (tipo: string) => {
    const message = generateWhatsAppMessage(client, tipo);
    const cleanPhone = client.whatsapp?.replace(/\D/g, "") || "";
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90vw] sm:max-w-[400px] rounded-[2rem] bg-card border-border p-6 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-gold-gradient flex items-center gap-2">
            <MessageSquare className="text-primary" size={24} />
            Escolher Lembrete
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs uppercase tracking-widest font-bold pt-2">
            Qual tipo de procedimento para {client.nome}?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-6">
          <Button 
            onClick={() => handleSend("Aplicação")}
            className="h-14 rounded-2xl bg-muted/50 hover:bg-primary/20 border border-primary/20 flex items-center justify-start gap-4 text-foreground transition-all group"
          >
            <Zap className="text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-bold">Lembrete de Aplicação</p>
              <p className="text-[10px] text-muted-foreground">Mensagem para novo conjunto</p>
            </div>
          </Button>

          <Button 
            onClick={() => handleSend("Manutenção")}
            className="h-14 rounded-2xl bg-muted/50 hover:bg-primary/20 border border-primary/20 flex items-center justify-start gap-4 text-foreground transition-all group"
          >
            <RotateCw className="text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-bold">Lembrete de Manutenção</p>
              <p className="text-[10px] text-muted-foreground">Mensagem para reposição</p>
            </div>
          </Button>

          <Button 
            onClick={() => handleSend("Remoção")}
            className="h-14 rounded-2xl bg-muted/50 hover:bg-destructive/20 border border-destructive/20 flex items-center justify-start gap-4 text-foreground transition-all group"
          >
            <Trash2 className="text-destructive group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-bold">Lembrete de Remoção</p>
              <p className="text-[10px] text-muted-foreground">Mensagem para retirada total</p>
            </div>
          </Button>
        </div>

        <Button variant="ghost" onClick={onClose} className="w-full rounded-xl text-muted-foreground">
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  )
}
