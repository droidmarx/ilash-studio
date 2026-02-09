import { NextResponse } from 'next/server';
import { getClients, getTelegramToken, getRecipients } from '@/lib/api';
import { addHours, subMinutes, addMinutes, parseISO, isWithinInterval, format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para disparar lembretes de agendamento via GitHub Actions.
 * Verifica clientes que possuem agendamento em aproximadamente 2 horas.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  // Verificação de Segurança
  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET não configurado na Vercel.');
    return NextResponse.json({ error: 'Configuração ausente no servidor' }, { status: 500 });
  }

  if (authHeader !== expectedToken) {
    console.warn('Tentativa de acesso não autorizado ao Cron.');
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const clients = await getClients();
    const botToken = await getTelegramToken();
    const recipients = await getRecipients();
    
    const adminRecipients = recipients.filter(r => r.nome !== 'SYSTEM_TOKEN' && r.chatID);

    if (!botToken || adminRecipients.length === 0) {
      console.warn('Configurações de Telegram (Token ou Admins) não encontradas no MockAPI.');
      return NextResponse.json({ message: 'Telegram não configurado no MockAPI' });
    }

    const now = new Date();
    const targetTime = addHours(now, 2);
    
    // Janela de 16 minutos para garantir que o cron (que roda a cada 15 min) não perca o evento
    const windowStart = subMinutes(targetTime, 8);
    const windowEnd = addMinutes(targetTime, 8);

    const upcomingAppointments = clients.filter(client => {
      // Regra 1: Apenas agendamentos confirmados
      if (client.confirmado === false) return false;
      
      // Regra 2: Validar e comparar data
      try {
        let appDate;
        if (client.data.includes('T')) {
          appDate = parseISO(client.data);
        } else {
          appDate = parse(client.data, 'dd/MM/yyyy HH:mm', new Date());
        }

        if (!isValid(appDate)) return false;

        return isWithinInterval(appDate, { start: windowStart, end: windowEnd });
      } catch (e) {
        return false;
      }
    });

    console.log(`[Cron] Verificando: ${format(now, 'HH:mm')}. Janela alvo: ${format(windowStart, 'HH:mm')} até ${format(windowEnd, 'HH:mm')}`);
    console.log(`[Cron] Encontrados ${upcomingAppointments.length} lembretes para enviar.`);

    const results = [];

    for (const app of upcomingAppointments) {
      const message = `⏰ <b>Lembrete VIP I Lash Studio</b>\n\n` +
        `👤 <b>Cliente:</b> ${app.nome}\n` +
        `🎨 <b>Serviço:</b> ${app.servico}\n` +
        `⏰ <b>Chegada em:</b> 2 horas\n\n` +
        `🚀 <i>Prepare o studio, sua cliente está a caminho!</i>`;

      for (const admin of adminRecipients) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: admin.chatID,
              text: message,
              parse_mode: 'HTML',
            }),
          });
          results.push({ client: app.nome, admin: admin.nome, success: res.ok });
        } catch (err) {
          console.error(`Erro ao enviar para admin ${admin.nome}:`, err);
          results.push({ client: app.nome, admin: admin.nome, success: false, error: String(err) });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      timestamp: format(now, 'dd/MM/yyyy HH:mm:ss'),
      processed: upcomingAppointments.length,
      details: results
    });

  } catch (error) {
    console.error('Erro interno no Cron:', error);
    return NextResponse.json({ error: 'Erro interno ao processar lembretes' }, { status: 500 });
  }
}
