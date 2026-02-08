"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Client } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Clock, User, Phone, ClipboardList, DollarSign, Cake, Search, Sparkles, Zap, RotateCw, Trash2 } from "lucide-react"
import { format, parseISO, isValid } from "date-fns"

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Hora é obrigatória"),
  servico: z.string().min(1, "Serviço é obrigatório"),
  tipo: z.enum(["Aplicação", "Manutenção", "Remoção"]),
  valor: z.string().optional(),
  valorAplicacao: z.string().optional(),
  valorManutencao: z.string().optional(),
  valorRemocao: z.string().optional(),
  whatsapp: z.string().optional(),
  aniversario: z.string().optional(),
  observacoes: z.string().optional(),
  isUnifiedValue: z.boolean().default(false),
  unifiedValue: z.string().optional(),
  servicosAdicionais: z.array(z.object({
    nome: z.string(),
    valor: z.string(),
    selected: z.boolean().default(false)
  })).optional()
})

interface AppointmentFormProps {
  initialData?: Client
  clients?: Client[]
  prefilledDate?: string
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

const TECHNIQUES = ["Brasileiro", "Egípcio", "4D", "5D", "Fio-a-Fio", "Fox"]
const OPTIONAL_SERVICES = ["Sobrancelha", "Buço", "Tintura na Sobrancelha"]

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
  
  const defaultAdicionais = OPTIONAL_SERVICES.map(name => {
    const existing = initialData?.servicosAdicionais?.find(a => a.nome === name);
    return {
      nome: name,
      valor: existing?.valor || "0,00",
      selected: !!existing
    };
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      date: format(initialD, "yyyy-MM-dd"),
      time: format(initialD, "HH:mm"),
      servico: initialData?.servico || "",
      tipo: (initialData?.tipo as any) || "Aplicação",
      valor: initialData?.valor || "",
      valorAplicacao: initialData?.valorAplicacao || "",
      valorManutencao: initialData?.valorManutencao || "",
      valorRemocao: initialData?.valorRemocao || "",
      whatsapp: initialData?.whatsapp || "",
      aniversario: initialData?.aniversario || "",
      observacoes: initialData?.observacoes || "",
      isUnifiedValue: initialData?.isUnifiedValue || false,
      unifiedValue: initialData?.unifiedValue || "",
      servicosAdicionais: defaultAdicionais
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "servicosAdicionais"
  });

  const watchedTipo = form.watch("tipo");
  const watchedValores = form.watch(["valorAplicacao", "valorManutencao", "valorRemocao"]);
  const watchedAdicionais = form.watch("servicosAdicionais");
  const isUnifiedValue = form.watch("isUnifiedValue");
  const unifiedValue = form.watch("unifiedValue");

  const parseCurrency = (val?: string) => {
    if (!val) return 0;
    const clean = val.replace(/[^\d,.-]/g, "").replace(",", ".");
    return parseFloat(clean) || 0;
  };

  const calculatedTotal = useMemo(() => {
    let base = 0;
    if (watchedTipo === "Aplicação") base = parseCurrency(watchedValores[0]);
    else if (watchedTipo === "Manutenção") base = parseCurrency(watchedValores[1]);
    else if (watchedTipo === "Remoção") base = parseCurrency(watchedValores[2]);

    let additionalTotal = 0;
    if (isUnifiedValue) {
      additionalTotal = parseCurrency(unifiedValue);
    } else {
      additionalTotal = (watchedAdicionais || [])
        .filter(a => a.selected)
        .reduce((acc, curr) => acc + parseCurrency(curr.valor), 0);
    }

    return (base + additionalTotal).toFixed(2).replace(".", ",");
  }, [watchedTipo, watchedValores, watchedAdicionais, isUnifiedValue, unifiedValue]);

  useEffect(() => {
    form.setValue("valor", calculatedTotal);
  }, [calculatedTotal, form]);

  const selectedAdicionaisCount = watchedAdicionais?.filter(a => a.selected).length || 0;

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
    if (client.valorAplicacao) form.setValue("valorAplicacao", client.valorAplicacao)
    if (client.valorManutencao) form.setValue("valorManutencao", client.valorManutencao)
    if (client.valorRemocao) form.setValue("valorRemocao", client.valorRemocao)
    
    if (client.isUnifiedValue !== undefined) {
      form.setValue("isUnifiedValue", client.isUnifiedValue)
      form.setValue("unifiedValue", client.unifiedValue || "")
    }
    
    setNameSearch("")
  }

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    const { date, time, servicosAdicionais, ...rest } = values;
    
    let selectedAdicionais = (servicosAdicionais || []).filter(a => a.selected);

    // Se unificado, o primeiro serviço carrega o valor unificado para o banco, e os outros 0
    if (values.isUnifiedValue && selectedAdicionais.length > 0) {
      selectedAdicionais = selectedAdicionais.map((a, i) => ({
        nome: a.nome,
        valor: i === 0 ? (values.unifiedValue || "0,00") : "0,00"
      }));
    } else {
      selectedAdicionais = selectedAdicionais.map(a => ({ nome: a.nome, valor: a.valor }));
    }

    await onSubmit({ 
      ...rest, 
      data: `${date}T${time}`,
      servicosAdicionais: selectedAdicionais
    });
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
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground text-lg">{s.nome}</span>
                        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">CLIENTE SALVA</Badge>
                      </div>
                      {s.whatsapp && <span className="text-xs text-primary/60">{s.whatsapp}</span>}
                    </button>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 rounded-2xl border border-primary/10 bg-primary/5">
          <FormLabel className="text-primary font-bold flex items-center gap-2 mb-2">
            <DollarSign size={18} /> Valores por Procedimento
          </FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="valorAplicacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] text-primary/60 flex items-center gap-1 uppercase tracking-wider"><Zap size={12}/> Aplicação</FormLabel>
                  <FormControl>
                    <Input placeholder="150,00" {...field} className="h-10 rounded-xl bg-background border-border text-xs" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valorManutencao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] text-primary/60 flex items-center gap-1 uppercase tracking-wider"><RotateCw size={12}/> Manutenção</FormLabel>
                  <FormControl>
                    <Input placeholder="100,00" {...field} className="h-10 rounded-xl bg-background border-border text-xs" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valorRemocao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] text-primary/60 flex items-center gap-1 uppercase tracking-wider"><Trash2 size={12}/> Remoção</FormLabel>
                  <FormControl>
                    <Input placeholder="50,00" {...field} className="h-10 rounded-xl bg-background border-border text-xs" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

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
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><ClipboardList size={18} /> Tipo do Agendamento</FormLabel>
                <Select onValueChange={(val) => { field.onChange(val); }} defaultValue={field.value}>
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

          <FormField
            control={form.control}
            name="servico"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Sparkles size={18} /> Técnica</FormLabel>
                <Select onValueChange={(val) => { field.onChange(val); }} defaultValue={field.value}>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <FormField
            control={form.control}
            name="aniversario"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary/60 flex items-center gap-2 px-1"><Cake size={18} /> Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="rounded-2xl h-12 bg-muted/50 border-border text-foreground" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <FormLabel className="text-primary font-bold flex items-center gap-2">
              <Sparkles size={18} /> Serviços Adicionais
            </FormLabel>
            
            {selectedAdicionaisCount > 1 && (
              <FormField
                control={form.control}
                name="isUnifiedValue"
                render={({ field }) => (
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <Checkbox 
                      id="unified" 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="rounded-sm border-primary"
                    />
                    <label htmlFor="unified" className="text-[10px] font-black uppercase text-primary cursor-pointer">Valor Único</label>
                  </div>
                )}
              />
            )}
          </div>

          <div className="space-y-3">
            {isUnifiedValue && selectedAdicionaisCount > 1 ? (
              <div className="bg-muted/30 p-4 rounded-2xl border border-primary/30 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {fields.map((field, index) => {
                    const isSelected = form.watch(`servicosAdicionais.${index}.selected`);
                    if (!isSelected) return null;
                    return (
                      <Badge key={field.id} variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        {field.nome}
                      </Badge>
                    );
                  })}
                </div>
                <FormField
                  control={form.control}
                  name="unifiedValue"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel className="text-xs text-primary/60 flex items-center gap-1"><DollarSign size={14} /> Valor Total dos Adicionais</FormLabel>
                      <Input 
                        placeholder="Ex: 50,00" 
                        {...field}
                        className="h-12 rounded-xl bg-background border-primary/40 text-lg font-bold"
                      />
                    </div>
                  )}
                />
              </div>
            ) : (
              fields.map((field, index) => (
                <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-3 flex-1">
                    <FormField
                      control={form.control}
                      name={`servicosAdicionais.${index}.selected`}
                      render={({ field: selectField }) => (
                        <Checkbox
                          id={`service-${index}`}
                          checked={selectField.value}
                          onCheckedChange={selectField.onChange}
                          className="rounded-md border-primary"
                        />
                      )}
                    />
                    <label htmlFor={`service-${index}`} className="text-sm font-semibold text-foreground cursor-pointer">
                      {field.nome}
                    </label>
                  </div>
                  
                  <div className="w-full sm:w-32 flex items-center gap-2">
                    <DollarSign size={14} className="text-primary/40 shrink-0" />
                    <FormField
                      control={form.control}
                      name={`servicosAdicionais.${index}.valor`}
                      render={({ field: valueField }) => (
                        <Input
                          placeholder="0,00"
                          {...valueField}
                          className="h-10 rounded-xl bg-background border-border text-right"
                        />
                      )}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem className="pt-4">
              <FormLabel className="text-primary font-bold flex items-center gap-2 px-1">
                <DollarSign size={18} /> Valor Total do Procedimento
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    {...field} 
                    readOnly 
                    className="rounded-2xl h-16 bg-primary/10 border-primary/40 text-primary font-black text-2xl px-6" 
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 font-bold">R$</span>
                </div>
              </FormControl>
              <p className="text-[10px] text-muted-foreground px-1 uppercase tracking-tighter">Cálculo automático: Procedimento base + Adicionais</p>
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-6 pb-2">
          <Button type="button" variant="ghost" onClick={() => { onCancel(); }} className="flex-1 rounded-2xl h-14 text-muted-foreground hover:text-foreground hover:bg-muted">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 rounded-2xl h-14 bg-gold-gradient text-primary-foreground font-bold text-lg hover:scale-[1.02] transition-transform">
            {initialData ? "Salvar" : "Confirmar Agendamento"}
          </Button>
        </div>
      </form>
    </Form>
  )
}