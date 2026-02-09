export const DEFAULT_API_URL = 'https://6987bee8780e8375a686ec39.mockapi.io/Clientes/Clientes';
export const SETTINGS_API_URL = 'https://6987bee8780e8375a686ec39.mockapi.io/Clientes/config';

export interface ServicoAdicional {
  nome: string;
  valor: string;
}

export interface Recipient {
  id: string;
  nome: string;
  chatID: string;
}

export interface Anamnese {
  cpf?: string;
  rg?: string;
  profissao?: string;
  dataNascimento?: string;
  procedimentoRecenteOlhos?: boolean;
  alergiaCosmeticos?: boolean;
  problemaTireoide?: boolean;
  problemaOcular?: boolean;
  tratamentoOncologico?: boolean;
  dormeDeLado?: 'Não' | 'Sim, Lado Direito' | 'Sim, Lado Esquerdo' | 'Sim, Ambos os lados';
  gestanteLactante?: boolean;
  observacoesGerais?: string;
  autorizaImagem?: boolean;
  assinatura?: string;
}

export interface Client {
  id: string;
  nome: string;
  data: string;
  servico: string;
  tipo: 'Aplicação' | 'Manutenção' | 'Remoção' | string;
  valor?: string;
  valorAplicacao?: string;
  valorManutencao?: string;
  valorRemocao?: string;
  whatsapp?: string;
  observacoes?: string;
  aniversario?: string;
  servicosAdicionais?: ServicoAdicional[];
  anamnese?: Anamnese;
  isUnifiedValue?: boolean;
  unifiedValue?: string;
  confirmado?: boolean;
  reminderSent?: boolean;
}

/**
 * Retorna a URL da API. No servidor, tenta buscar a URL salva na config.
 */
export async function getEffectiveApiUrl(): Promise<string> {
  // No cliente, usa o localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mock_api_url') || DEFAULT_API_URL;
  }
  
  // No servidor, tenta descobrir a URL salva na config global
  try {
    const recipients = await getRecipients();
    const config = recipients.find(r => r.nome === 'MAIN_API_URL');
    return config ? config.chatID : DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

function getSettingsUrl(): string {
  // A URL de config sempre aponta para o projeto raiz configurado no código
  // para que o servidor saiba onde encontrar as chaves iniciais.
  return SETTINGS_API_URL;
}

export async function getRecipients(): Promise<Recipient[]> {
  try {
    const res = await fetch(getSettingsUrl(), { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function getTelegramToken(): Promise<string | null> {
  try {
    const recipients = await getRecipients();
    const config = recipients.find(r => r.nome === 'SYSTEM_TOKEN');
    return config ? config.chatID : null;
  } catch (error) {
    return null;
  }
}

export async function updateTelegramToken(token: string): Promise<void> {
  const recipients = await getRecipients();
  const config = recipients.find(r => r.nome === 'SYSTEM_TOKEN');
  
  if (config) {
    await updateRecipient({ ...config, chatID: token });
  } else {
    await createRecipient({ nome: 'SYSTEM_TOKEN', chatID: token });
  }
}

export async function updateMainApiUrl(url: string): Promise<void> {
  const recipients = await getRecipients();
  const config = recipients.find(r => r.nome === 'MAIN_API_URL');
  
  if (config) {
    await updateRecipient({ ...config, chatID: url });
  } else {
    await createRecipient({ nome: 'MAIN_API_URL', chatID: url });
  }
}

export async function getWebhookStatus(): Promise<boolean> {
  try {
    const recipients = await getRecipients();
    const config = recipients.find(r => r.nome === 'WEBHOOK_STATE');
    return config ? config.chatID === 'ACTIVE' : false;
  } catch {
    return false;
  }
}

export async function updateWebhookStatus(active: boolean): Promise<void> {
  const recipients = await getRecipients();
  const config = recipients.find(r => r.nome === 'WEBHOOK_STATE');
  const value = active ? 'ACTIVE' : 'INACTIVE';
  
  if (config) {
    await updateRecipient({ ...config, chatID: value });
  } else {
    await createRecipient({ nome: 'WEBHOOK_STATE', chatID: value });
  }
}

export async function updateRecipient(recipient: Recipient): Promise<void> {
  const url = `${getSettingsUrl()}/${recipient.id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: recipient.nome, chatID: recipient.chatID }),
  });
  if (!res.ok) throw new Error('Falha ao atualizar destinatário');
}

export async function createRecipient(recipient: Omit<Recipient, 'id'>): Promise<void> {
  const res = await fetch(getSettingsUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipient),
  });
  if (!res.ok) throw new Error('Falha ao criar destinatário');
}

export async function deleteRecipient(id: string): Promise<void> {
  const res = await fetch(`${getSettingsUrl()}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Falha ao excluir destinatário');
}

export async function getClients(): Promise<Client[]> {
  try {
    const apiUrl = await getEffectiveApiUrl();
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error('Falha ao buscar dados');
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function getClient(id: string): Promise<Client> {
  const apiUrl = await getEffectiveApiUrl();
  const res = await fetch(`${apiUrl}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar cliente');
  return await res.json();
}

export async function createClient(data: Omit<Client, 'id'>): Promise<Client> {
  const apiUrl = await getEffectiveApiUrl();
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao criar agendamento');
  return await res.json();
}

export async function updateClient(id: string, data: Partial<Client>): Promise<void> {
  const apiUrl = await getEffectiveApiUrl();
  const res = await fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao atualizar agendamento');
}

export async function deleteClient(id: string): Promise<void> {
  const apiUrl = await getEffectiveApiUrl();
  const res = await fetch(`${apiUrl}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Falha ao excluir agendamento');
}

export async function getLastSummaryDate(): Promise<string | null> {
  const recipients = await getRecipients();
  const config = recipients.find(r => r.nome === 'SUMMARY_STATE');
  return config ? config.chatID : null;
}

export async function updateLastSummaryDate(dateStr: string): Promise<void> {
  const recipients = await getRecipients();
  const config = recipients.find(r => r.nome === 'SUMMARY_STATE');
  if (config) {
    await updateRecipient({ ...config, chatID: dateStr });
  } else {
    await createRecipient({ nome: 'SUMMARY_STATE', chatID: dateStr });
  }
}

export async function setTelegramWebhook(token: string, url: string): Promise<boolean> {
  try {
    const finalUrl = url ? `${url}/api/telegram/webhook` : "";
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: finalUrl }),
    });
    const result = await response.json();
    console.log('[Webhook Registration]', result);
    return result.ok;
  } catch (error) {
    console.error('[Webhook Error]', error);
    return false;
  }
}