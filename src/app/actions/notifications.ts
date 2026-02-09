'use server';

import { getRecipients, getTelegramToken } from '@/lib/api';

/**
 * Server Action para enviar notificações de novos agendamentos.
 * Notifica todos os administradores cadastrados no MockAPI usando o Token dinâmico.
 */

export async function notifyNewBooking(bookingData: {
  nome: string;
  whatsapp: string;
  servico: string;
  data: string;
  hora: string;
}) {
  // Busca o Token do Bot configurado no MockAPI
  const botToken = await getTelegramToken();

  if (!botToken) {
    console.warn('Telegram Bot Token não encontrado no MockAPI. Por favor, configure nas definições do Studio.');
    return;
  }
  
  // Busca todos os destinatários no MockAPI
  const allRecipients = await getRecipients();
  
  // Filtra apenas destinatários reais (ignora a chave de configuração do Token)
  const recipients = allRecipients.filter(r => r.nome !== 'SYSTEM_TOKEN' && r.chatID);

  if (!recipients || recipients.length === 0) {
    console.warn('Nenhum administrador encontrado no MockAPI para notificação.');
    return;
  }

  const message = `✨ <b>Novo Agendamento no I Lash Studio!</b> ✨\n\n` +
    `👤 <b>Cliente:</b> ${bookingData.nome}\n` +
    `📱 <b>WhatsApp:</b> ${bookingData.whatsapp}\n` +
    `🎨 <b>Serviço:</b> ${bookingData.servico}\n` +
    `📅 <b>Data:</b> ${bookingData.data}\n` +
    `⏰ <b>Horário:</b> ${bookingData.hora}\n\n` +
    `🚀 <i>Agendado via link do Instagram</i>`;

  console.log(`Iniciando envio para ${recipients.length} administradores...`);

  for (const recipient of recipients) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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