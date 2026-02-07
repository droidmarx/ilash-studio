
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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Clock, User, Phone, ClipboardList, DollarSign, Cake, Search } from "lucide-react"

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  data: z.string().min(1, "Data/Hora é obrigatória"),
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
  onSubmit: (data: z.infer<typeof formSchema>) => void
  onCancel: () => void
}

const TECHNIQUES = ["Brasileiro", "Egípcio", "4D", "5D", "Fio-a-Fio", "Fox"]

export function AppointmentForm({ initialData, clients = [], prefilledDate, onSubmit, onCancel }: AppointmentFormProps) {
  const [nameSearch, setNameSearch] = useState("")
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      data: initialData?.data || prefilledDate || new Date().toISOString().slice(0, 16),
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
    form.setValue("nome", client.nome)
    if (client.whatsapp) form.setValue("whatsapp", client.whatsapp)
    if (client.aniversario) form.setValue("aniversario", client.aniversario)
    setNameSearch("")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4 md:px-6">
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
                    className="rounded-2xl h-14 bg-white/5 border-white/10 text-white focus:border-primary text-lg" 
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
                <div className="absolute z-50 w-full bg-zinc-900 border border-primary/20 rounded-2xl mt-2 shadow-2xl overflow-hidden backdrop-blur-3xl">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-6 py-4 hover:bg-primary/10 transition-colors flex flex-col gap-1 border-b border-white/5 last:border-none"
                      onClick={() => handleSelectClient(s)}
                    >
                      <span className="font-bold text-white text-lg">{s.nome}</span>
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
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><CalendarIcon size={18} /> Data e Hora</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} className="rounded-2xl h-12 bg-white/5 border-white/10 text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aniversario"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Cake size={18} /> Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="rounded-2xl h-12 bg-white/5 border-white/10 text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><ClipboardList size={18} /> Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-2xl h-12 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-2xl bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="Aplicação">Aplicação</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Remoção">Remoção</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servico"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Clock size={18} /> Técnica</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-2xl h-12 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Escolha a técnica" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-2xl bg-zinc-900 border-white/10 text-white">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Phone size={18} /> WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="5511999999999" {...field} className="rounded-2xl h-12 bg-white/5 border-white/10 text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><DollarSign size={18} /> Valor (R$)</FormLabel>
                <FormControl>
                  <Input placeholder="100,00" {...field} className="rounded-2xl h-12 bg-white/5 border-white/10 text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 pt-6 pb-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 rounded-2xl h-14 text-white/50 hover:text-white hover:bg-white/5">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 rounded-2xl h-14 bg-gold-gradient text-black font-bold text-lg hover:scale-[1.02] transition-transform">
            {initialData ? "Salvar" : "Confirmar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
