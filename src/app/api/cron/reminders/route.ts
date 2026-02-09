import { NextResponse } from 'next/server';
import { getClients, getTelegramToken, getRecipients, updateClient, getLastSummaryDate, updateLastSummaryDate } from '@/lib/api';
import { addHours, subMinutes, addMinutes, parseISO, isWithinInterval, format, parse, isValid, subHours, isSameDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // LOG DE ENTRADA: Se isso não aparecer no log da Vercel, o GitHub não está conseguindo chamar a URL.
  console.log('[Cron] Verificação de rotina iniciada.');

  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    console.error('[Cron] ERRO: Variável CRON_SECRET não encontrada na Vercel. Adicione-a nas Environment Variables.');
    return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 });
  }

  if (authHeader !== expectedToken) {
    console.warn('[Cron] AVISO: Tentativa de acesso com Token inválido ou Header ausente.');
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const clients = await getClients();
    const botToken = await getTelegramToken();
    const recipients = await getRecipients();
    
    const adminRecipients = recipients.filter(r => 
      !['SYSTEM_TOKEN', 'SUMMARY_STATE', 'MAIN_API_URL', 'WEBHOOK_STATE'].includes(r.nome) && r.chatID
    );

    // Ajuste de Fuso Horário (Vercel UTC -> Brasília UTC-3)
    const nowUTC = new Date();
    const nowBrasilia = subHours(nowUTC, 3);
    const todayStr = format(nowBrasilia, 'yyyy-MM-dd');
    const currentHour = nowBrasilia.getHours();

    console.log(`[Cron] Relógio: UTC ${format(nowUTC, 'HH:mm')} | Brasília ${format(nowBrasilia, 'HH:mm')}`);
    console.log(`[Cron] Admins encontrados: ${adminRecipients.length}`);

    if (!botToken || adminRecipients.length === 0) {
      console.error('[Cron] Erro: Token do Telegram ou Admins não configurados no Studio.');
      return NextResponse.json({ message: 'Configurações incompletas' });
    }

    const logs = [];

    // --- LÓGICA 1: RESUMO DIÁRIO DAS 8H ---
    if (currentHour === 8) {
      const lastSentDate = await getLastSummaryDate();
      console.log(`[Cron] Checando Resumo das 8h. Hoje: ${todayStr} | Último enviado: ${lastSentDate}`);
      
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
              const appDate = app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date());
              return `⏰ <b>${format(appDate, 'HH:mm')}</b> - ${app.nome}\n🎨 ${app.servico}`;
            }).join('\n\n') +
            `\n\n🚀 <i>Tenha um ótimo dia de trabalho!</i>`;
        } else {
          summaryMessage = `✨ <b>Bom dia!</b> ✨\n\nVocê ainda não tem agendamentos confirmados para hoje.\n💖 <i>Que tal aproveitar para organizar o studio?</i>`;
        }

        for (const admin of adminRecipients) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: admin.chatID, text: summaryMessage, parse_mode: 'HTML' }),
          });
        }
        
        await updateLastSummaryDate(todayStr);
        console.log('[Cron] Resumo das 8h enviado com sucesso.');
        logs.push({ type: 'summary', status: 'sent' });
      }
    }

    // --- LÓGICA 2: LEMBRETES DE 2 HORAS ---
    const targetTime = addHours(nowBrasilia, 2);
    const windowStart = subMinutes(targetTime, 10);
    const windowEnd = addMinutes(targetTime, 10);

    const upcoming = clients.filter(c => {
      if (c.confirmado === false || c.reminderSent === true) return false;
      try {
        const appDate = c.data.includes('T') ? parseISO(c.data) : parse(c.data, 'dd/MM/yyyy HH:mm', new Date());
        return isValid(appDate) && isWithinInterval(appDate, { start: windowStart, end: windowEnd });
      } catch { return false; }
    });

    console.log(`[Cron] Agendamentos para a próxima janela de 2h: ${upcoming.length}`);

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

    return NextResponse.json({ 
      success: true, 
      brasiliaTime: format(nowBrasilia, 'HH:mm'),
      summaryChecked: true,
      remindersFound: upcoming.length
    });

  } catch (error) {
    console.error('[Cron] ERRO FATAL:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
