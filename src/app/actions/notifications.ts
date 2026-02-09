'use server';

import { getRecipients, getTelegramToken } from '@/lib/api';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Server Action para notificar mudanças na agenda (Criação ou Edição).
 */
export async function notifyAppointmentChange(
  bookingData: any,
  changeType: 'Novo' | 'Alterado'
) {
  const botToken = await getTelegramToken();

  if (!botToken) {
    console.warn('Telegram Bot Token não encontrado.');
    return;
  }
  
  const allRecipients = await getRecipients();
  const recipients = allRecipients.filter(r => 
    !['SYSTEM_TOKEN', 'SUMMARY_STATE', 'MAIN_API_URL', 'WEBHOOK_STATE'].includes(r.nome) && r.chatID
  );

  if (recipients.length === 0) return;

  // Tenta parsear a data para um formato amigável
  let dateStr = bookingData.data || '';
  let timeStr = '';

  try {
    const dateObj = bookingData.data?.includes('T') ? parseISO(bookingData.data) : new Date();
    if (isValid(dateObj)) {
      dateStr = format(dateObj, "dd/MM/yyyy", { locale: ptBR });
      timeStr = format(dateObj, "HH:mm");
    }
  } catch (e) {
    console.error('Erro ao formatar data para notificação', e);
  }

  const statusEmoji = changeType === 'Novo' ? '✨' : '🔄';

  const message = `${statusEmoji} <b>Agendamento ${changeType}!</b> ${statusEmoji}\n\n` +
    `👤 <b>Cliente:</b> ${bookingData.nome}\n` +
    `📱 <b>WhatsApp:</b> ${bookingData.whatsapp || 'Não informado'}\n` +
    `🎨 <b>Serviço:</b> ${bookingData.servico || 'Não informado'}\n` +
    `🛠️ <b>Tipo:</b> ${bookingData.tipo || 'Não informado'}\n` +
    `📅 <b>Data:</b> ${dateStr}\n` +
    `⏰ <b>Hora:</b> ${timeStr}\n\n` +
    `💰 <b>Valor:</b> R$ ${bookingData.valor || '0,00'}\n` +
    `🚀 <i>Gerenciado via I Lash Studio</i>`;

  for (const recipient of recipients) {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: recipient.chatID,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    } catch (error) {
      console.error(`Erro ao notificar admin ${recipient.nome}:`, error);
    }
  }
}
