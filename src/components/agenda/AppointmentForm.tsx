
"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Client } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Clock, User, Phone, ClipboardList, DollarSign, Cake, Search } from "lucide-react"
import { hapticFeedback } from "@/lib/utils"
import { format, parseISO, isValid } from "date-fns"

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Hora é obrigatória"),
  servico: z.string().min(1, "Serviço é obrigatório"),
  tipo: z.enum(["Aplicação", "Manutenção", "Remoção"]),
  valor: z.string().optional(),
  whatsapp: z.string().optional(),
  aniversario: z.string().optional(),
  observacoes: z.string().optional(),
})

interface AppointmentFormProps {
  initialData?: Client
  clients?: Client[]
  prefilledDate?: string
  onSubmit: (data: any) => void
  onCancel: () => void
}

const TECHNIQUES = ["Brasileiro", "Egípcio", "4D", "5D", "Fio-a-Fio", "Fox"]

export function AppointmentForm({ initialData, clients = [], prefilledDate, onSubmit, onCancel }: AppointmentFormProps) {
  const [nameSearch, setNameSearch] = useState("")
  
  const getInitialDateTime = () => {
    const source = initialData?.data || prefilledDate || new Date().toISOString();
    let d;
    try {
      d = source.includes('T') ? parseISO(source) : new Date(source);
      if (!isValid(d)) d = new Date();
    } catch {
      d = new Date();
    }
    return d;
  }

  const initialD = getInitialDateTime();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      date: format(initialD, "yyyy-MM-dd"),
      time: format(initialD, "HH:mm"),
      servico: initialData?.servico || "",
      tipo: (initialData?.tipo as any) || "Aplicação",
      valor: initialData?.valor || "",
      whatsapp: initialData?.whatsapp || "",
      aniversario: initialData?.aniversario || "",
      observacoes: initialData?.observacoes || "",
    },
  })

  const uniqueClients = useMemo(() => {
    const map = new Map<string, Client>()
    clients.forEach(c => {
      if (!map.has(c.nome)) map.set(c.nome, c)
    })
    return Array.from(map.values())
  }, [clients])

  const suggestions = useMemo(() => {
    if (nameSearch.length < 2) return []
    return uniqueClients.filter(c => 
      c.nome.toLowerCase().includes(nameSearch.toLowerCase())
    ).slice(0, 5)
  }, [nameSearch, uniqueClients])

  const handleSelectClient = (client: Client) => {
    hapticFeedback(10)
    form.setValue("nome", client.nome)
    if (client.whatsapp) form.setValue("whatsapp", client.whatsapp)
    if (client.aniversario) form.setValue("aniversario", client.aniversario)
    setNameSearch("")
  }

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    hapticFeedback([20, 50, 20])
    const { date, time, ...rest } = values;
    // Combinamos os campos separados de volta para o formato esperado pela API
    onSubmit({ ...rest, data: `${date}T${time}` })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 px-4 md:px-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel className="text-primary/60 font-semibold flex items-center gap-2 px-1">
                <User size={18} /> Nome da Cliente
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Ex: Maria Oliveira" 
                    {...field} 
                    className="rounded-2xl h-14 bg-muted/50 border-border text-foreground focus:border-primary text-lg" 
                    autoComplete="off"
                    onChange={(e) => {
                      field.onChange(e)
                      setNameSearch(e.target.value)
                    }}
                  />
                  <Search size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
                </div>
              </FormControl>
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-card border border-primary/20 rounded-2xl mt-2 shadow-2xl overflow-hidden backdrop-blur-3xl">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-6 py-4 hover:bg-primary/10 transition-colors flex flex-col gap-1 border-b border-border last:border-none"
                      onClick={() => handleSelectClient(s)}
                    >
                      <span className="font-bold text-foreground text-lg">{s.nome}</span>
                      {s.whatsapp && <span className="text-xs text-primary/60">{s.whatsapp}</span>}
                    </button>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><CalendarIcon size={18} /> Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="rounded-2xl h-12 bg-muted/50 border-border text-foreground" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Clock size={18} /> Hora</FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="rounded-2xl h-12 bg-muted/50 border-border text-foreground" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="aniversario"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Cake size={18} /> Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="rounded-2xl h-12 bg-muted/50 border-border text-foreground" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><ClipboardList size={18} /> Tipo</FormLabel>
                <Select onValueChange={(val) => { hapticFeedback(5); field.onChange(val); }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-2xl h-12 bg-muted/50 border-border text-foreground">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-2xl bg-card border-border text-foreground">
                    <SelectItem value="Aplicação">Aplicação</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Remoção">Remoção</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="servico"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Clock size={18} /> Técnica</FormLabel>
                <Select onValueChange={(val) => { hapticFeedback(5); field.onChange(val); }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-2xl h-12 bg-muted/50 border-border text-foreground">
                      <SelectValue placeholder="Escolha a técnica" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-2xl bg-card border-border text-foreground">
                    {TECHNIQUES.map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Phone size={18} /> WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="5511999999999" {...field} className="rounded-2xl h-12 bg-muted/50 border-border text-foreground" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><DollarSign size={18} /> Valor (R$)</FormLabel>
              <FormControl>
                <Input placeholder="100,00" {...field} className="rounded-2xl h-12 bg-muted/50 border-border text-foreground" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-6 pb-2">
          <Button type="button" variant="ghost" onClick={() => { hapticFeedback(10); onCancel(); }} className="flex-1 rounded-2xl h-14 text-muted-foreground hover:text-foreground hover:bg-muted">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 rounded-2xl h-14 bg-gold-gradient text-primary-foreground font-bold text-lg hover:scale-[1.02] transition-transform">
            {initialData ? "Salvar" : "Confirmar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
