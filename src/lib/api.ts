export const DEFAULT_API_URL = 'https://683d14e6199a0039e9e427bd.mockapi.io/Dados';

export interface Client {
  id: string;
  nome: string;
  data: string; // Expecting ISO or DD/MM/YYYY format
  servico: string;
  tipo: 'Aplicação' | 'Manutenção' | string;
  whatsapp?: string;
  observacoes?: string;
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

export async function updateClient(id: string, data: Partial<Client>): Promise<void> {
  await fetch(`${getApiUrl()}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await fetch(`${getApiUrl()}/${id}`, {
    method: 'DELETE',
  });
}
