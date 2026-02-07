export const API_CLIENTS = 'https://683d14e6199a0039e9e427bd.mockapi.io/Dados';

export interface Client {
  id: string;
  nome: string;
  data: string; // Expecting ISO or DD/MM/YYYY format
  servico: string;
  tipo: 'Aplicação' | 'Manutenção' | string;
  whatsapp?: string;
  observacoes?: string;
}

export async function getClients(): Promise<Client[]> {
  try {
    const res = await fetch(API_CLIENTS);
    if (!res.ok) throw new Error('Falha ao buscar dados');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateClient(id: string, data: Partial<Client>): Promise<void> {
  await fetch(`${API_CLIENTS}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await fetch(`${API_CLIENTS}/${id}`, {
    method: 'DELETE',
  });
}
