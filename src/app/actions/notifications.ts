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

  if (!recipients || recipients.length === 0) {
    console.warn('Nenhum destinatário encontrado no MockAPI para notificação.');
    return;
  }

  // Usando HTML para evitar problemas de parsing com caracteres especiais nos nomes
  const message = `✨ <b>Novo Agendamento no I Lash Studio!</b> ✨\n\n` +
    `👤 <b>Cliente:</b> ${bookingData.nome}\n` +
    `📱 <b>WhatsApp:</b> ${bookingData.whatsapp}\n` +
    `🎨 <b>Serviço:</b> ${bookingData.servico}\n` +
    `📅 <b>Data:</b> ${bookingData.data}\n` +
    `⏰ <b>Horário:</b> ${bookingData.hora}\n\n` +
    `🚀 <i>Agendado via link do Instagram</i>`;

  console.log(`Iniciando envio para ${recipients.length} destinatários...`);

  // Envia para cada destinatário
  for (const recipient of recipients) {
    if (!recipient.chatID) {
      console.warn(`Pulando destinatário ${recipient.nome} pois não possui Chat ID.`);
      continue;
    }
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: recipient.chatID,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Erro na API do Telegram para ${recipient.nome}:`, errorData);
      } else {
        console.log(`Notificação enviada com sucesso para ${recipient.nome}`);
      }
    } catch (error) {
      console.error(`Erro de conexão ao notificar ${recipient.nome}:`, error);
    }
  }
}