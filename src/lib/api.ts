export const DEFAULT_API_URL = 'https://6987bee8780e8375a686ec39.mockapi.io/Clientes/Clientes';

export interface ServicoAdicional {
  nome: string;
  valor: string;
}

export interface Anamnese {
  // Campos Pessoais
  cpf?: string;
  rg?: string;
  profissao?: string;
  dataNascimento?: string;
  
  // Saúde e Estilo de Vida
  procedimentoRecenteOlhos?: boolean;
  alergiaCosmeticos?: boolean;
  problemaTireoide?: boolean;
  problemaOcular?: boolean;
  tratamentoOncologico?: boolean;
  dormeDeLado?: 'Não' | 'Sim, Lado Direito' | 'Sim, Lado Esquerdo' | 'Sim, Ambos os lados';
  gestanteLactante?: boolean;
  observacoesGerais?: string;
  
  // Legado / Compatibilidade
  alergias?: string;
  problemasOculares?: string;
  cirurgiaRecente?: boolean;
  sensibilidadeLuz?: boolean;
  disturbioHormonal?: boolean;
  usaLentes?: boolean;
  maquiagemDiaria?: boolean;
  observacoesSaude?: string;
  
  // Termos e Assinatura
  autorizaImagem?: boolean;
  assinatura?: string; // Data URI da assinatura
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

export async function getClient(id: string): Promise<Client> {
  const res = await fetch(`${getApiUrl()}/${id}`);
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
