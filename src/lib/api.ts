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
 * Retorna a URL da API. No servidor, prioriza a URL padrão para evitar erros de localStorage.
 */
function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mock_api_url') || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

function getSettingsUrl(): string {
  if (typeof window === 'undefined') return SETTINGS_API_URL;
  
  const currentApi = getApiUrl();
  if (currentApi === DEFAULT_API_URL) return SETTINGS_API_URL;
  
  const baseUrl = currentApi.replace(/\/Clientes$/, '').replace(/\/config$/, '');
  return `${baseUrl}/config`;
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
    const res = await fetch(getApiUrl(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Falha ao buscar dados');
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function getClient(id: string): Promise<Client> {
  const res = await fetch(`${getApiUrl()}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao buscar cliente');
  return await res.json();
}

export async function createClient(data: Omit<Client, 'id'>): Promise<Client> {
  const res = await fetch(getApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao criar agendamento');
  return await res.json();
}

export async function updateClient(id: string, data: Partial<Client>): Promise<void> {
  const res = await fetch(`${getApiUrl()}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao atualizar agendamento');
}

export async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Falha ao excluir agendamento');
}

// Novos helpers para o Cron
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
