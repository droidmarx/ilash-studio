import { NextResponse } from 'next/server';
import { getClients, getTelegramToken } from '@/lib/api';
import { parseISO, parse, isValid, isSameDay, subHours, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Telegram Webhook] Recebido:', JSON.stringify(body));

    const botToken = await getTelegramToken();

    if (!botToken || !body.message || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.toLowerCase();

    // Aceita /agendamentos, /start ou variações com o nome do bot
    if (text.startsWith('/agendamentos') || text.startsWith('/start')) {
      const clients = await getClients();
      
      // Ajuste de Fuso Horário (Vercel UTC -> Brasília UTC-3)
      const nowBrasilia = subHours(new Date(), 3);
      const todayStr = format(nowBrasilia, 'yyyy-MM-dd');

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

      let responseMessage = "";
      if (todayAppointments.length > 0) {
        responseMessage = `✨ <b>Agenda VIP - Hoje (${format(nowBrasilia, 'dd/MM')})</b> ✨\n\n` +
          todayAppointments.map(app => {
            const time = format(app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date()), 'HH:mm');
            return `⏰ <b>${time}</b> - ${app.nome}\n🎨 ${app.servico}`;
          }).join('\n\n');
      } else {
        responseMessage = `✨ <b>Olá!</b> ✨\n\nVocê ainda não tem agendamentos confirmados para hoje (${format(nowBrasilia, 'dd/MM')}).`;
      }

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseMessage,
          parse_mode: 'HTML',
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Erro fatal:', error);
    return NextResponse.json({ ok: true });
  }
}