
import { NextResponse } from 'next/server';
import { getClients, getTelegramToken, getRecipients, updateClient, getLastSummaryDate, updateLastSummaryDate } from '@/lib/api';
import { addHours, subMinutes, addMinutes, parseISO, isWithinInterval, format, parse, isValid, subHours, isSameDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('[Cron] Verificação de rotina iniciada.');

  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    console.error('[Cron] ERRO: Variável CRON_SECRET não encontrada.');
    return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 });
  }

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const clients = await getClients();
    const botToken = await getTelegramToken();
    const recipients = await getRecipients();
    
    const adminRecipients = recipients.filter(r => 
      !['SYSTEM_TOKEN', 'SUMMARY_STATE', 'MAIN_API_URL', 'WEBHOOK_STATE'].includes(r.nome) && r.chatID
    );

    const nowUTC = new Date();
    const nowBrasilia = subHours(nowUTC, 3);
    const todayStr = format(nowBrasilia, 'yyyy-MM-dd');
    const currentHour = nowBrasilia.getHours();

    if (!botToken || adminRecipients.length === 0) {
      return NextResponse.json({ message: 'Configurações incompletas' });
    }

    // --- LÓGICA 1: RESUMO DIÁRIO DAS 8H ---
    if (currentHour === 8) {
      const lastSentDate = await getLastSummaryDate();
      
      if (lastSentDate !== todayStr) {
        const todayAppointments = clients.filter(client => {
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
              const appDate = app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date());
              const status = app.confirmado === false ? "⏳ <b>(Pendente)</b>" : "✅ <b>(Confirmado)</b>";
              return `${status}\n⏰ <b>${format(appDate, 'HH:mm')}</b> - ${app.nome}\n🎨 ${app.servico}`;
            }).join('\n\n') +
            `\n\n🚀 <i>Tenha um ótimo dia de trabalho!</i>`;
        } else {
          summaryMessage = `✨ <b>Bom dia!</b> ✨\n\nVocê não tem agendamentos para hoje.\n💖 <i>Que tal aproveitar para organizar o studio?</i>`;
        }

        for (const admin of adminRecipients) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: admin.chatID, text: summaryMessage, parse_mode: 'HTML' }),
          });
        }
        
        await updateLastSummaryDate(todayStr);
      }
    }

    // --- LÓGICA 2: LEMBRETES DE 2 HORAS ---
    const targetTime = addHours(nowBrasilia, 2);
    const windowStart = subMinutes(targetTime, 10);
    const windowEnd = addMinutes(targetTime, 10);

    const upcoming = clients.filter(c => {
      // Lembretes apenas para confirmados
      if (c.confirmado === false || c.reminderSent === true) return false;
      try {
        const appDate = c.data.includes('T') ? parseISO(c.data) : parse(c.data, 'dd/MM/yyyy HH:mm', new Date());
        return isValid(appDate) && isWithinInterval(appDate, { start: windowStart, end: windowEnd });
      } catch { return false; }
    });

    for (const app of upcoming) {
      const appDate = app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date());
      const msg = `⏰ <b>Lembrete VIP I Lash Studio</b>\n\n👤 <b>Cliente:</b> ${app.nome}\n🎨 <b>Serviço:</b> ${app.servico}\n⏰ <b>Horário:</b> ${format(appDate, 'HH:mm')}\n\n🚀 <i>Sua cliente chega em breve!</i>`;

      let sent = false;
      for (const admin of adminRecipients) {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: admin.chatID, text: msg, parse_mode: 'HTML' }),
        });
        if (res.ok) sent = true;
      }
      if (sent) await updateClient(app.id, { reminderSent: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Cron] ERRO:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
