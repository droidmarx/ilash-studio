import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Client } from "./api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fornece feedback tátil (vibração) em dispositivos compatíveis.
 * @param pattern Duração em ms ou padrão de vibração.
 */
export function hapticFeedback(pattern: number | number[] = 10) {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      const intensity = localStorage.getItem('vibration-intensity') || 'medium';
      
      if (intensity === 'none') return;

      let multiplier = 1;
      if (intensity === 'weak') multiplier = 0.5;
      if (intensity === 'strong') multiplier = 2;
      
      const adjust = (v: number) => Math.max(1, Math.round(v * multiplier));

      const adjustedPattern = Array.isArray(pattern) 
        ? pattern.map(adjust) 
        : adjust(pattern);

      navigator.vibrate(adjustedPattern);
    } catch (e) {
      // Silenciosamente falha se o navegador bloquear vibração
    }
  }
}

/**
 * Gera a mensagem de lembrete personalizada para o WhatsApp
 */
export function generateWhatsAppMessage(event: Client) {
  const getEventDate = (dataStr: string) => {
    try {
      if (dataStr.includes('T')) return parseISO(dataStr);
      return parse(dataStr, 'dd/MM/yyyy', new Date());
    } catch (e) { return new Date(); }
  };

  let dateObj = getEventDate(event.data);
  if (!isValid(dateObj)) dateObj = new Date();

  const formattedDate = format(dateObj, "dd/MM/yyyy", { locale: ptBR });
  const formattedTime = format(dateObj, "HH:mm");
  
  const parseCurrency = (val?: string) => {
    if (!val) return 0;
    const clean = val.replace(/[^\d,.-]/g, "").replace(",", ".");
    return parseFloat(clean) || 0;
  };

  const valorBase = parseCurrency(event.valor);
  const adicionais = event.servicosAdicionais || [];
  const valorAdicionais = adicionais.reduce((acc, curr) => acc + parseCurrency(curr.valor), 0);
  const total = valorBase + valorAdicionais;

  let msgAdicionais = "";
  if (adicionais.length > 0) {
    msgAdicionais = "\n✨ *Adicionais:*\n" + adicionais.map(a => `- ${a.nome}: R$ ${a.valor || '0,00'}`).join("\n");
  }

  const message = `💖*Lembrete de agendamento*

Olá *${event.nome.trim()}*, tudo bem?

✨ Sua ${event.tipo.toLowerCase()} de cílios está agendada para *${formattedDate}*.

Confira os detalhes abaixo:

⏰ Horário: ${formattedTime}
💸 Procedimento: R$ ${event.valor || '0,00'}${msgAdicionais}
💰 *Total: R$ ${total.toFixed(2).replace(".", ",")}*

📌 Em caso de atraso, por favor avise com pelo menos 2 horas de antecedência.

📌 Se houver necessidade de remarcar, peço que avise com no mínimo 1 dia de antecedência.

Em caso de dúvidas ou imprevistos, é só me chamar! 💬
Agradeço pela confiança 💕`;

  return message;
}
