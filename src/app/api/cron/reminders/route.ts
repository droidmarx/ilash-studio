import { NextResponse } from 'next/server';
import { getClients, getTelegramToken, getRecipients, updateClient, getLastSummaryDate, updateLastSummaryDate } from '@/lib/api';
import { addHours, subMinutes, addMinutes, parseISO, isWithinInterval, format, parse, isValid, subHours, isSameDay } from 'date-fns';

export const dynamic = 'force-dynamic';

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
    const adminRecipients = recipients.filter(r => r.nome !== 'SYSTEM_TOKEN' && r.nome !== 'SUMMARY_STATE' && r.chatID);

    if (!botToken || adminRecipients.length === 0) {
      return NextResponse.json({ message: 'Configurações de Telegram ausentes no MockAPI' });
    }

    // Ajuste de Fuso Horário (Vercel UTC -> Brasília UTC-3)
    const nowUTC = new Date();
    const nowBrasilia = subHours(nowUTC, 3);
    const todayStr = format(nowBrasilia, 'yyyy-MM-dd');
    const currentHour = nowBrasilia.getHours();

    const logs = [];

    // --- LÓGICA 1: RESUMO DIÁRIO DAS 8H ---
    if (currentHour === 8) {
      const lastSentDate = await getLastSummaryDate();
      
      if (lastSentDate !== todayStr) {
        const todayAppointments = clients.filter(client => {
          if (client.confirmado === false) return false;
          try {
            const appDate = client.data.includes('T') ? parseISO(client.data) : parse(client.data, 'dd/MM/yyyy HH:mm', new Date());
            return isValid(appDate) && isSameDay(appDate, nowBrasilia);
          } catch { return false; }
        }).sort((a, b) => {
          const da = a.data.includes('T') ? parseISO(a.data) : parse(a.data, 'dd/MM/yyyy HH:mm', new Date());
          const db = b.data.includes('T') ? parseISO(b.data) : parse(b.data, 'dd/MM/yyyy HH:mm', new Date());
          return da.getTime() - db.getTime();
        });

        let summaryMessage = "";
        if (todayAppointments.length > 0) {
          summaryMessage = `✨ <b>Bom dia! Agenda de Hoje</b> ✨\n\n` +
            todayAppointments.map(app => {
              const time = format(app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date()), 'HH:mm');
              return `⏰ <b>${time}</b> - ${app.nome}\n🎨 ${app.servico} (${app.tipo})`;
            }).join('\n\n') +
            `\n\n🚀 <i>Tenha um ótimo dia de trabalho!</i>`;
        } else {
          summaryMessage = `✨ <b>Bom dia!</b> ✨\n\nVocê ainda não tem agendamentos para hoje.\n💖 <i>Que tal aproveitar para organizar o studio?</i>`;
        }

        for (const admin of adminRecipients) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: admin.chatID, text: summaryMessage, parse_mode: 'HTML' }),
          });
        }
        await updateLastSummaryDate(todayStr);
        logs.push({ type: 'summary', status: 'sent', count: todayAppointments.length });
      }
    }

    // --- LÓGICA 2: LEMBRETES DE 2 HORAS ---
    const targetTime = addHours(nowBrasilia, 2);
    const windowStart = subMinutes(targetTime, 10);
    const windowEnd = addMinutes(targetTime, 10);

    const upcomingAppointments = clients.filter(client => {
      if (client.confirmado === false || client.reminderSent === true) return false;
      try {
        const appDate = client.data.includes('T') ? parseISO(client.data) : parse(client.data, 'dd/MM/yyyy HH:mm', new Date());
        if (!isValid(appDate)) return false;
        return isWithinInterval(appDate, { start: windowStart, end: windowEnd });
      } catch { return false; }
    });

    for (const app of upcomingAppointments) {
      const appTime = format(app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date()), 'HH:mm');
      const reminderMessage = `⏰ <b>Lembrete VIP I Lash Studio</b>\n\n` +
        `👤 <b>Cliente:</b> ${app.nome}\n` +
        `🎨 <b>Serviço:</b> ${app.servico}\n` +
        `⏰ <b>Horário:</b> ${appTime}\n\n` +
        `🚀 <i>Prepare o studio, sua cliente chega em breve!</i>`;

      let sentSuccessfully = false;
      for (const admin of adminRecipients) {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: admin.chatID, text: reminderMessage, parse_mode: 'HTML' }),
        });
        if (res.ok) sentSuccessfully = true;
      }
      if (sentSuccessfully) {
        await updateClient(app.id, { reminderSent: true });
      }
    }

    return NextResponse.json({ 
      success: true, 
      time: format(nowBrasilia, 'HH:mm'),
      summary: logs.find(l => l.type === 'summary')?.status || 'skipping',
      reminders: upcomingAppointments.length
    });

  } catch (error) {
    console.error('[Cron] Erro fatal:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
