import { NextResponse } from 'next/server';
import { getClients, getTelegramToken, getRecipients, updateClient } from '@/lib/api';
import { addHours, subMinutes, addMinutes, parseISO, isWithinInterval, format, parse, isValid, subHours } from 'date-fns';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para disparar lembretes de agendamento via GitHub Actions.
 * Ajustado para o fuso horário de Brasília (UTC-3).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 });
  }

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const clients = await getClients();
    const botToken = await getTelegramToken();
    const recipients = await getRecipients();
    
    const adminRecipients = recipients.filter(r => r.nome !== 'SYSTEM_TOKEN' && r.chatID);

    if (!botToken || adminRecipients.length === 0) {
      return NextResponse.json({ message: 'Configurações de Telegram ausentes no MockAPI' });
    }

    // Ajuste de Fuso Horário (Vercel UTC -> Brasília UTC-3)
    const nowUTC = new Date();
    const nowBrasilia = subHours(nowUTC, 3);
    
    // Procuramos quem agendou para daqui a 2 horas (com janela de 20 minutos)
    const targetTime = addHours(nowBrasilia, 2);
    const windowStart = subMinutes(targetTime, 10);
    const windowEnd = addMinutes(targetTime, 10);

    const upcomingAppointments = clients.filter(client => {
      // Regra 1: Apenas agendamentos confirmados e que ainda não receberam lembrete
      if (client.confirmado === false || client.reminderSent === true) return false;
      
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

    const results = [];

    for (const app of upcomingAppointments) {
      const message = `⏰ <b>Lembrete VIP I Lash Studio</b>\n\n` +
        `👤 <b>Cliente:</b> ${app.nome}\n` +
        `🎨 <b>Serviço:</b> ${app.servico}\n` +
        `⏰ <b>Horário:</b> ${format(parseISO(app.data), 'HH:mm')}\n\n` +
        `🚀 <i>Prepare o studio, sua cliente chega em breve!</i>`;

      let sentSuccessfully = false;

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
          if (res.ok) sentSuccessfully = true;
          results.push({ client: app.nome, admin: admin.nome, success: res.ok });
        } catch (err) {
          results.push({ client: app.nome, admin: admin.nome, success: false, error: String(err) });
        }
      }

      // Se conseguimos enviar o lembrete para pelo menos um administrador, marcamos como enviado
      if (sentSuccessfully) {
        await updateClient(app.id, { reminderSent: true });
      }
    }

    return NextResponse.json({ 
      success: true, 
      brasiliaTime: format(nowBrasilia, 'HH:mm'),
      processed: upcomingAppointments.length,
      details: results
    });

  } catch (error) {
    console.error('[Cron] Erro fatal:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
