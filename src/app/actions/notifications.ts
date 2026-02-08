'use server';

import { getRecipients } from '@/lib/api';

/**
 * Server Action para enviar notificações de novos agendamentos.
 * Notifica todos os administradores cadastrados no MockAPI.
 */

export async function notifyNewBooking(bookingData: {
  nome: string;
  whatsapp: string;
  servico: string;
  data: string;
  hora: string;
}) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8284313149:AAEQ9uiq8do8t6mxtINtyeT-tynURpP789s';
  
  // Busca todos os destinatários no MockAPI
  const recipients = await getRecipients();

  const message = `✨ *Novo Agendamento no I Lash Studio!* ✨\n\n` +
    `👤 *Cliente:* ${bookingData.nome}\n` +
    `📱 *WhatsApp:* ${bookingData.whatsapp}\n` +
    `🎨 *Serviço:* ${bookingData.servico}\n` +
    `📅 *Data:* ${bookingData.data}\n` +
    `⏰ *Horário:* ${bookingData.hora}\n\n` +
    `🚀 _Agendado via link do Instagram_`;

  // Envia para cada destinatário
  for (const recipient of recipients) {
    if (!recipient.chatID) continue;
    
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: recipient.chatID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error(`Erro ao notificar ${recipient.nome}:`, error);
    }
  }
}
