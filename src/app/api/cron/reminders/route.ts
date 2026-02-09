import { NextResponse } from 'next/server';
import { getClients, getTelegramToken, getRecipients } from '@/lib/api';
import { addHours, subMinutes, addMinutes, parseISO, isWithinInterval, format, parse, isValid, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para disparar lembretes de agendamento via GitHub Actions.
 * Ajustado para o fuso horário de Brasília (UTC-3).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  // Verificação de Segurança
  if (!process.env.CRON_SECRET) {
    console.error('[Cron] CRON_SECRET não configurado na Vercel.');
    return NextResponse.json({ error: 'Configuração ausente no servidor' }, { status: 500 });
  }

  if (authHeader !== expectedToken) {
    console.warn('[Cron] Tentativa de acesso não autorizado.');
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const clients = await getClients();
    const botToken = await getTelegramToken();
    const recipients = await getRecipients();
    
    const adminRecipients = recipients.filter(r => r.nome !== 'SYSTEM_TOKEN' && r.chatID);

    if (!botToken || adminRecipients.length === 0) {
      return NextResponse.json({ message: 'Telegram não configurado no MockAPI' });
    }

    // A Vercel usa UTC. Brasília é UTC-3.
    // Para comparar com os horários salvos no navegador (que estão em horário local),
    // ajustamos o 'now' do servidor para o contexto de Brasília.
    const nowUTC = new Date();
    const nowBrasilia = subHours(nowUTC, 3);
    
    const targetTime = addHours(nowBrasilia, 2);
    const windowStart = subMinutes(targetTime, 10); // Janela um pouco maior para segurança
    const windowEnd = addMinutes(targetTime, 10);

    console.log(`[Cron] Agora em Brasília: ${format(nowBrasilia, 'HH:mm')}`);
    console.log(`[Cron] Buscando agendamentos entre: ${format(windowStart, 'HH:mm')} e ${format(windowEnd, 'HH:mm')}`);

    const upcomingAppointments = clients.filter(client => {
      // Regra 1: Apenas agendamentos confirmados
      if (client.confirmado === false) return false;
      
      try {
        let appDate;
        if (client.data.includes('T')) {
          appDate = parseISO(client.data);
        } else {
          appDate = parse(client.data, 'dd/MM/yyyy HH:mm', new Date());
        }

        if (!isValid(appDate)) return false;

        const isInWindow = isWithinInterval(appDate, { start: windowStart, end: windowEnd });
        
        if (isInWindow) {
          console.log(`[Cron] Match encontrado: ${client.nome} às ${format(appDate, 'HH:mm')}`);
        }
        
        return isInWindow;
      } catch (e) {
        return false;
      }
    });

    const results = [];

    for (const app of upcomingAppointments) {
      const message = `⏰ <b>Lembrete VIP I Lash Studio</b>\n\n` +
        `👤 <b>Cliente:</b> ${app.nome}\n` +
        `🎨 <b>Serviço:</b> ${app.servico}\n` +
        `⏰ <b>Chegada em:</b> aproximadamente 2 horas\n\n` +
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
          results.push({ client: app.nome, admin: admin.nome, success: false, error: String(err) });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      serverTimeUTC: format(nowUTC, 'HH:mm'),
      brasiliaTime: format(nowBrasilia, 'HH:mm'),
      processed: upcomingAppointments.length,
      details: results
    });

  } catch (error) {
    console.error('[Cron] Erro fatal:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
