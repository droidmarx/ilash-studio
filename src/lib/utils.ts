import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Client } from "./api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gera a mensagem de lembrete personalizada para o WhatsApp
 */
export function generateWhatsAppMessage(event: Client, tipoOverride?: string) {
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

  const tipo = tipoOverride || event.tipo;
  
  let valorBaseStr = event.valor || '0,00';
  if (tipo === 'Aplicação' && event.valorAplicacao) valorBaseStr = event.valorAplicacao;
  if (tipo === 'Manutenção' && event.valorManutencao) valorBaseStr = event.valorManutencao;
  if (tipo === 'Remoção' && event.valorRemocao) valorBaseStr = event.valorRemocao;

  const valorBase = parseCurrency(valorBaseStr);
  const adicionais = event.servicosAdicionais || [];
  
  let valorAdicionais = 0;
  let msgAdicionais = "";

  if (event.isUnifiedValue) {
    valorAdicionais = parseCurrency(event.unifiedValue);
    if (adicionais.length > 0) {
      const nomesUnificados = adicionais.map(a => a.nome).join("+");
      msgAdicionais = `\n✨ *Adicionais (Valor Único):* ${nomesUnificados}: R$ ${event.unifiedValue || '0,00'}`;
    }
  } else {
    valorAdicionais = adicionais.reduce((acc, curr) => acc + parseCurrency(curr.valor), 0);
    if (adicionais.length > 0) {
      const listaAdicionais = adicionais.map(a => `${a.nome} (R$ ${a.valor})`).join(", ");
      msgAdicionais = `\n✨ *Adicionais:* ${listaAdicionais}`;
    }
  }

  const total = valorBase + valorAdicionais;

  const message = `💖*Lembrete de agendamento*

Olá *${event.nome.trim()}*, tudo bem?

✨ Sua *${tipo.toLowerCase()}* de cílios está agendada para *${formattedDate}*.

Confira os detalhes abaixo:

⏰ Horário: ${formattedTime}
💸 Procedimento: R$ ${valorBaseStr}${msgAdicionais}
💰 *Total: R$ ${total.toFixed(2).replace(".", ",")}*

📌 Em caso de atraso, por favor avise com pelo menos 2 horas de antecedência.

📌 Se houver necessidade de remarcar, peço que avise com no mínimo 1 dia de antecedência.

Em caso de dúvidas ou imprevistos, é só me chamar! 💬
Agradeço pela confiança 💕`;

  return message;
}