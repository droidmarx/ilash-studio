import { NextResponse } from 'next/server';
import { getClients, getTelegramToken, getRecipients, updateClient } from '@/lib/api';
import { addHours, subMinutes, addMinutes, parseISO, isWithinInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para disparar lembretes de agendamento.
 * Verifica clientes que possuem agendamento em ~2 horas.
 */
export async function GET(request: Request) {
  // Verificação de Segurança (Opcional mas recomendado)
  const authHeader = request.headers.get('authorization');
  // Se você configurar CRON_SECRET no GitHub e na Vercel, descomente a linha abaixo
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Não autorizado', { status: 401 });
  // }

  try {
    const clients = await getClients();
    const botToken = await getTelegramToken();
    const recipients = await getRecipients();
    
    const adminRecipients = recipients.filter(r => r.nome !== 'SYSTEM_TOKEN' && r.chatID);

    if (!botToken || adminRecipients.length === 0) {
      return NextResponse.json({ message: 'Configurações de Telegram não encontradas' });
    }

    const now = new Date();
    const targetTime = addHours(now, 2);
    
    // Janela de 16 minutos para garantir que o cron de 15 min capture o evento
    const windowStart = subMinutes(targetTime, 8);
    const windowEnd = addMinutes(targetTime, 8);

    const upcomingAppointments = clients.filter(client => {
      // Ignora se já foi enviado ou se não está confirmado
      if (client.confirmado === false) return false;
      
      const appDate = parseISO(client.data);
      return isWithinInterval(appDate, { start: windowStart, end: windowEnd });
    });

    console.log(`Cron: Verificando lembretes. Encontrados: ${upcomingAppointments.length}`);

    for (const app of upcomingAppointments) {
      const message = `⏰ <b>Lembrete de Atendimento VIP</b>\n\n` +
        `👤 <b>Cliente:</b> ${app.nome}\n` +
        `🎨 <b>Serviço:</b> ${app.servico}\n` +
        `⏰ <b>Horário:</b> ${format(parseISO(app.data), "HH:mm'h'", { locale: ptBR })}\n\n` +
        `🚀 <i>Sua cliente chega em aproximadamente 2 horas!</i>`;

      for (const admin of adminRecipients) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: admin.chatID,
            text: message,
            parse_mode: 'HTML',
          }),
        });
      }
      
      // Opcional: Marcar como lembrete enviado para não repetir
      // await updateClient(app.id, { ...app, observacoes: (app.observacoes || '') + ' [Lembrete Enviado]' });
    }

    return NextResponse.json({ 
      success: true, 
      processed: upcomingAppointments.length 
    });

  } catch (error) {
    console.error('Erro no Cron de Lembretes:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
