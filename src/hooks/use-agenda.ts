import { useState, useEffect, useCallback } from 'react';
import { getClients, createClient, updateClient, deleteClient, Client } from '@/lib/api';
import { format, parseISO, addMonths, subMonths, isSameDay, parse, isValid, getMonth, getDate } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function useAgenda() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados da agenda.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClients();
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, [fetchClients]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const safeParseDate = (dataStr: string) => {
    if (!dataStr) return new Date();
    try {
      if (dataStr.includes('T')) return parseISO(dataStr);
      if (dataStr.includes('/')) return parse(dataStr, 'dd/MM/yyyy', new Date());
      const d = new Date(dataStr);
      return isValid(d) ? d : new Date();
    } catch (e) {
      return new Date();
    }
  };

  const getDayEvents = (day: Date) => {
    return clients.filter(client => isSameDay(day, safeParseDate(client.data)));
  };

  const getDayBirthdays = (day: Date) => {
    // Filtra clientes que fazem aniversário hoje (mesmo dia e mês)
    // Usamos um Set para evitar nomes duplicados caso a mesma cliente tenha vários agendamentos
    const seen = new Set();
    return clients.filter(client => {
      if (!client.aniversario) return false;
      try {
        const birthDate = parseISO(client.aniversario);
        const isBday = getMonth(day) === getMonth(birthDate) && getDate(day) === getDate(birthDate);
        if (isBday && !seen.has(client.nome)) {
          seen.add(client.nome);
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    });
  };

  const upcomingAppointments = [...clients]
    .filter(client => safeParseDate(client.data) >= new Date())
    .sort((a, b) => safeParseDate(a.data).getTime() - safeParseDate(b.data).getTime());

  const addAppointment = async (data: Omit<Client, 'id'>) => {
    try {
      await createClient(data);
      toast({ title: "Sucesso", description: "Agendamento criado com sucesso!" });
      await fetchClients();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao criar agendamento." });
    }
  };

  const editAppointment = async (id: string, data: Partial<Client>) => {
    try {
      await updateClient(id, data);
      toast({ title: "Sucesso", description: "Agendamento atualizado com sucesso!" });
      await fetchClients();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao atualizar agendamento." });
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      await deleteClient(id);
      toast({ title: "Sucesso", description: "Agendamento excluído com sucesso!" });
      await fetchClients();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao excluir agendamento." });
    }
  };

  return {
    clients,
    loading,
    currentMonth,
    theme,
    toggleTheme,
    nextMonth,
    prevMonth,
    getDayEvents,
    getDayBirthdays,
    upcomingAppointments,
    addAppointment,
    editAppointment,
    removeAppointment,
    refresh: fetchClients
  };
}
