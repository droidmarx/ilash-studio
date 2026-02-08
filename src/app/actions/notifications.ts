
'use server';

/**
 * Server Action para enviar notificações de novos agendamentos.
 * Utiliza a API do Telegram para notificações instantâneas e gratuitas.
 */

export async function notifyNewBooking(bookingData: {
  nome: string;
  whatsapp: string;
  servico: string;
  data: string;
  hora: string;
}, config?: {
  token?: string;
  chatId?: string;
}) {
  // Prioridade: 1. Config passada na chamada, 2. Variável de ambiente, 3. Hardcoded (Fallback)
  const BOT_TOKEN = config?.token || process.env.TELEGRAM_BOT_TOKEN || '8284313149:AAEQ9uiq8do8t6mxtINtyeT-tynURpP789s';
  const CHAT_ID = config?.chatId || process.env.TELEGRAM_CHAT_ID || '5759760387';

  const message = `✨ *Novo Agendamento no I Lash Studio!* ✨\n\n` +
    `👤 *Cliente:* ${bookingData.nome}\n` +
    `📱 *WhatsApp:* ${bookingData.whatsapp}\n` +
    `🎨 *Serviço:* ${bookingData.servico}\n` +
    `📅 *Data:* ${bookingData.data}\n` +
    `⏰ *Horário:* ${bookingData.hora}\n\n` +
    `🚀 _Agendado via link do Instagram_`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na API do Telegram:', errorData);
    }
  } catch (error) {
    console.error('Erro ao enviar notificação para o Telegram:', error);
  }
}
