
import { NextResponse } from 'next/server';
import { getClients, getTelegramToken } from '@/lib/api';
import { 
  parseISO, 
  parse, 
  isValid, 
  isSameDay, 
  subHours, 
  format, 
  isSameMonth, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval,
  addMonths,
  startOfToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

    const clients = await getClients();
    
    // Ajuste de Fuso Horário (Vercel UTC -> Brasília UTC-3)
    const nowBrasilia = subHours(new Date(), 3);

    let responseMessage = "";

    const parseValue = (val?: string) => {
      if (!val) return 0;
      return parseFloat(val.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".")) || 0;
    };

    // LÓGICA 1: /command1 (Agenda de HOJE)
    if (text.startsWith('/command1') || text.startsWith('/start')) {
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

      if (todayAppointments.length > 0) {
        const total = todayAppointments.reduce((acc, curr) => acc + parseValue(curr.valor), 0);
        responseMessage = `✨ <b>Agenda VIP - Hoje (${format(nowBrasilia, 'dd/MM')})</b> ✨\n\n` +
          todayAppointments.map(app => {
            const time = format(app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date()), 'HH:mm');
            return `⏰ <b>${time}</b> - ${app.nome}\n🎨 ${app.servico}\n💰 R$ ${app.valor || '0,00'}`;
          }).join('\n\n') +
          `\n\n━━━━━━━━━━━━━━━\n💰 <b>TOTAL HOJE: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>`;
      } else {
        responseMessage = `✨ <b>Olá!</b> ✨\n\nVocê ainda não tem agendamentos confirmados para hoje (${format(nowBrasilia, 'dd/MM')}).`;
      }
    } 
    // LÓGICA 2: /command2 (Agenda do MÊS ATUAL)
    else if (text.startsWith('/command2')) {
      const monthAppointments = clients.filter(client => {
        if (client.confirmado === false) return false;
        try {
          const appDate = client.data.includes('T') ? parseISO(client.data) : parse(client.data, 'dd/MM/yyyy HH:mm', new Date());
          return isValid(appDate) && isSameMonth(appDate, nowBrasilia);
        } catch { return false; }
      }).sort((a, b) => {
        const da = a.data.includes('T') ? parseISO(a.data) : parse(a.data, 'dd/MM/yyyy HH:mm', new Date());
        const db = b.data.includes('T') ? parseISO(b.data) : parse(b.data, 'dd/MM/yyyy HH:mm', new Date());
        return da.getTime() - db.getTime();
      });

      if (monthAppointments.length > 0) {
        const total = monthAppointments.reduce((acc, curr) => acc + parseValue(curr.valor), 0);
        const monthName = format(nowBrasilia, 'MMMM', { locale: ptBR });
        responseMessage = `✨ <b>Agenda VIP - ${monthName}</b> ✨\n\n` +
          monthAppointments.map(app => {
            const date = app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date());
            const dateStr = format(date, 'dd/MM (EEE)', { locale: ptBR });
            const time = format(date, 'HH:mm');
            return `📅 <b>${dateStr} às ${time}</b>\n👤 ${app.nome}\n🎨 ${app.servico}\n💰 R$ ${app.valor || '0,00'}`;
          }).join('\n\n') +
          `\n\n━━━━━━━━━━━━━━━\n💰 <b>TOTAL MÊS: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>`;
      } else {
        responseMessage = `✨ <b>Olá!</b> ✨\n\nNão há agendamentos confirmados para o mês de ${format(nowBrasilia, 'MMMM', { locale: ptBR })}.`;
      }
    }
    // LÓGICA 3: /command3 (Agenda da SEMANA VIGENTE - Domingo a Sábado)
    else if (text.startsWith('/command3')) {
      const weekStart = startOfWeek(nowBrasilia, { weekStartsOn: 0 }); // Domingo
      const weekEnd = endOfWeek(nowBrasilia, { weekStartsOn: 0 }); // Sábado
      
      const weekAppointments = clients.filter(client => {
        if (client.confirmado === false) return false;
        try {
          const appDate = client.data.includes('T') ? parseISO(client.data) : parse(client.data, 'dd/MM/yyyy HH:mm', new Date());
          return isValid(appDate) && isWithinInterval(appDate, { start: weekStart, end: weekEnd });
        } catch { return false; }
      }).sort((a, b) => {
        const da = a.data.includes('T') ? parseISO(a.data) : parse(a.data, 'dd/MM/yyyy HH:mm', new Date());
        const db = b.data.includes('T') ? parseISO(b.data) : parse(b.data, 'dd/MM/yyyy HH:mm', new Date());
        return da.getTime() - db.getTime();
      });

      if (weekAppointments.length > 0) {
        const total = weekAppointments.reduce((acc, curr) => acc + parseValue(curr.valor), 0);
        responseMessage = `✨ <b>Agenda VIP - Esta Semana</b> ✨\n\n` +
          weekAppointments.map(app => {
            const date = app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date());
            const dateStr = format(date, 'dd/MM (EEE)', { locale: ptBR });
            const time = format(date, 'HH:mm');
            return `📅 <b>${dateStr} às ${time}</b>\n👤 ${app.nome}\n🎨 ${app.servico}\n💰 R$ ${app.valor || '0,00'}`;
          }).join('\n\n') +
          `\n\n━━━━━━━━━━━━━━━\n💰 <b>TOTAL SEMANA: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>`;
      } else {
        responseMessage = `✨ <b>Olá!</b> ✨\n\nNão há agendamentos confirmados para esta semana (domingo a sábado).`;
      }
    }
    // LÓGICA 4: /command4 (Agenda do PRÓXIMO MÊS)
    else if (text.startsWith('/command4')) {
      const nextMonth = addMonths(nowBrasilia, 1);
      const nextMonthAppointments = clients.filter(client => {
        if (client.confirmado === false) return false;
        try {
          const appDate = client.data.includes('T') ? parseISO(client.data) : parse(client.data, 'dd/MM/yyyy HH:mm', new Date());
          return isValid(appDate) && isSameMonth(appDate, nextMonth);
        } catch { return false; }
      }).sort((a, b) => {
        const da = a.data.includes('T') ? parseISO(a.data) : parse(a.data, 'dd/MM/yyyy HH:mm', new Date());
        const db = b.data.includes('T') ? parseISO(b.data) : parse(b.data, 'dd/MM/yyyy HH:mm', new Date());
        return da.getTime() - db.getTime();
      });

      if (nextMonthAppointments.length > 0) {
        const total = nextMonthAppointments.reduce((acc, curr) => acc + parseValue(curr.valor), 0);
        const monthName = format(nextMonth, 'MMMM', { locale: ptBR });
        responseMessage = `✨ <b>Agenda VIP - ${monthName} (Próx. Mês)</b> ✨\n\n` +
          nextMonthAppointments.map(app => {
            const date = app.data.includes('T') ? parseISO(app.data) : parse(app.data, 'dd/MM/yyyy HH:mm', new Date());
            const dateStr = format(date, 'dd/MM (EEE)', { locale: ptBR });
            const time = format(date, 'HH:mm');
            return `📅 <b>${dateStr} às ${time}</b>\n👤 ${app.nome}\n🎨 ${app.servico}\n💰 R$ ${app.valor || '0,00'}`;
          }).join('\n\n') +
          `\n\n━━━━━━━━━━━━━━━\n💰 <b>TOTAL PREVISTO: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>`;
      } else {
        responseMessage = `✨ <b>Olá!</b> ✨\n\nNão há agendamentos confirmados para o próximo mês (${format(nextMonth, 'MMMM', { locale: ptBR })}).`;
      }
    }

    if (responseMessage) {
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
