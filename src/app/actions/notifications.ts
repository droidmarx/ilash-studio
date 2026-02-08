'use server';

/**
 * Server Action para enviar notificações de novos agendamentos.
 * Utiliza a API do Telegram por ser gratuita e instantânea.
 */

export async function notifyNewBooking(bookingData: {
  nome: string;
  whatsapp: string;
  servico: string;
  data: string;
  hora: string;
}) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Se não houver configuração, apenas ignora para não quebrar o fluxo do cliente
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram Bot não configurado. Adicione TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID nas variáveis de ambiente.');
    return;
  }

  const message = `✨ *Novo Agendamento no I Lash Studio!* ✨\n\n` +
    `👤 *Cliente:* ${bookingData.nome}\n` +
    `📱 *WhatsApp:* ${bookingData.whatsapp}\n` +
    `🎨 *Serviço:* ${bookingData.servico}\n` +
    `📅 *Data:* ${bookingData.data}\n` +
    `⏰ *Horário:* ${bookingData.hora}\n\n` +
    `🚀 _Agendado via link do Instagram_`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Erro ao enviar notificação para o Telegram:', error);
  }
}
