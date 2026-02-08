export const DEFAULT_API_URL = 'https://683d14e6199a0039e9e427bd.mockapi.io/Dados';

export interface ServicoAdicional {
  nome: string;
  valor: string;
}

export interface Anamnese {
  alergias?: string;
  problemasOculares?: string;
  cirurgiaRecente?: boolean;
  sensibilidadeLuz?: boolean;
  gestanteLactante?: boolean;
  disturbioHormonal?: boolean;
  usaLentes?: boolean;
  dormeDeLado?: 'Direito' | 'Esquerdo' | 'Ambos' | 'Costas';
  maquiagemDiaria?: boolean;
  observacoesSaude?: string;
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
}

function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mock_api_url') || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

export async function getClients(): Promise<Client[]> {
  try {
    const res = await fetch(getApiUrl());
    if (!res.ok) throw new Error('Falha ao buscar dados');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
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
