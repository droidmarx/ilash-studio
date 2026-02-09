import { NextResponse } from 'next/server';
import { getClients, getTelegramToken, getRecipients, updateClient, getLastSummaryDate, updateLastSummaryDate } from '@/lib/api';
import { addHours, subMinutes, addMinutes, parseISO, isWithinInterval, format, parse, isValid, subHours, isSameDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    console.error('[Cron] Erro: CRON_SECRET não configurado na Vercel');
    return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 });
  }

  if (authHeader !== expectedToken) {
    console.warn('[Cron] Acesso negado: Token de autorização inválido');
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const clients = await getClients();
    const botToken = await getTelegramToken();
    const recipients = await getRecipients();
    
    // Filtra apenas administradores reais (ignora chaves de sistema)
    const systemKeys = ['SYSTEM_TOKEN', 'SUMMARY_STATE', 'MAIN_API_URL', 'WEBHOOK_STATE'];
    const adminRecipients = recipients.filter(r => !systemKeys.includes(r.nome) && r.chatID);

    console.log(`[Cron] Verificação iniciada. Total de clientes: ${clients.length}. Administradores: ${adminRecipients.length}`);

    if (!botToken || adminRecipients.length === 0) {
      console.warn('[Cron] Configurações de Telegram incompletas (Bot Token ou Admins ausentes)');
      return NextResponse.json({ message: 'Configurações de Telegram incompletas no MockAPI' });
    }

    // Ajuste de Fuso Horário (Vercel UTC -> Brasília UTC-3)
    const nowUTC = new Date();
    const nowBrasilia = subHours(nowUTC, 3);
    const todayStr = format(nowBrasilia, 'yyyy-MM-dd');
    const currentHour = nowBrasilia.getHours();

    const logs = [];

    // --- LÓGICA 1: RESUMO DIÁRIO DAS 8H ---
    // Executa entre 8:00 e 8:59 de Brasília
    if (currentHour === 8) {
      const lastSentDate = await getLastSummaryDate();
      console.log(`[Cron] Verificando resumo das 8h. Hoje: ${todayStr}, Último enviado: ${lastSentDate}`);
      
      if (lastSentDate !== todayStr) {
        const todayAppointments = clients.filter(client => {
          // No resumo das 8h, mostramos apenas os confirmados
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
              const time = format(appDate, 'HH:mm');
              return `⏰ <b>${time}</b> - ${app.nome}\n🎨 ${app.servico} (${app.tipo})`;
            }).join('\n\n') +
            `\n\n🚀 <i>Tenha um ótimo dia de trabalho!</i>`;
        } else {
          summaryMessage = `✨ <b>Bom dia!</b> ✨\n\nVocê ainda não tem agendamentos confirmados para hoje.\n💖 <i>Que tal aproveitar para organizar o studio?</i>`;
        }

        console.log(`[Cron] Enviando resumo diário para ${adminRecipients.length} admins.`);

        for (const admin of adminRecipients) {
          try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                chat_id: admin.chatID, 
                text: summaryMessage, 
                parse_mode: 'HTML' 
              }),
            });
          } catch (e) {
            console.error(`[Cron] Erro ao enviar para admin ${admin.nome}:`, e);
          }
        }
        
        await updateLastSummaryDate(todayStr);
        logs.push({ type: 'summary', status: 'sent', count: todayAppointments.length });
      } else {
        console.log('[Cron] Resumo diário já enviado hoje. Ignorando.');
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
      const appDate = app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date());
      const appTime = format(appDate, 'HH:mm');
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
          body: JSON.stringify({ 
            chat_id: admin.chatID, 
            text: reminderMessage, 
            parse_mode: 'HTML' 
          }),
        });
        if (res.ok) sentSuccessfully = true;
      }
      if (sentSuccessfully) {
        await updateClient(app.id, { reminderSent: true });
        console.log(`[Cron] Lembrete de 2h enviado para: ${app.nome}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      time: format(nowBrasilia, 'HH:mm:ss'),
      summarySent: logs.some(l => l.type === 'summary'),
      remindersSent: upcomingAppointments.length
    });

  } catch (error) {
    console.error('[Cron] Erro fatal:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
