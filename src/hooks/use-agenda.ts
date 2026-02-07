import { useState, useEffect, useCallback } from 'react';
import { getClients, Client } from '@/lib/api';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function useAgenda() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  }, []);

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

  const getDayEvents = (day: Date) => {
    return clients.filter(client => {
      try {
        // Handle various date formats from MockAPI
        let eventDate;
        if (client.data.includes('T')) {
          eventDate = parseISO(client.data);
        } else if (client.data.includes('/')) {
          eventDate = parse(client.data, 'dd/MM/yyyy', new Date());
        } else {
          eventDate = new Date(client.data);
        }
        return isSameDay(day, eventDate);
      } catch (e) {
        return false;
      }
    });
  };

  const upcomingAppointments = [...clients]
    .filter(client => {
      try {
         let eventDate;
         if (client.data.includes('T')) {
           eventDate = parseISO(client.data);
         } else if (client.data.includes('/')) {
           eventDate = parse(client.data, 'dd/MM/yyyy', new Date());
         } else {
           eventDate = new Date(client.data);
         }
         return eventDate >= new Date();
      } catch (e) { return false; }
    })
    .sort((a, b) => {
      const dateA = a.data.includes('T') ? parseISO(a.data).getTime() : parse(a.data, 'dd/MM/yyyy', new Date()).getTime();
      const dateB = b.data.includes('T') ? parseISO(b.data).getTime() : parse(b.data, 'dd/MM/yyyy', new Date()).getTime();
      return dateA - dateB;
    });

  return {
    clients,
    loading,
    currentMonth,
    theme,
    toggleTheme,
    nextMonth,
    prevMonth,
    getDayEvents,
    upcomingAppointments,
    refresh: fetchClients
  };
}
