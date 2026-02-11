
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn === "true") {
      router.push("/")
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simulação de delay para feeling de sistema real
    setTimeout(() => {
      if (username === "Tayna" && password === "12124800") {
        localStorage.setItem("isLoggedIn", "true")
        router.push("/")
      } else {
        setError("Usuário ou senha incorretos.")
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Decorativo Herdado do Layout */}
      <div className="absolute inset-0 -z-10 bg-background/50 backdrop-blur-sm" />
      
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-3xl border-border shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-700">
        <CardHeader className="pt-12 pb-6 text-center space-y-6">
          <div className="flex flex-col items-center justify-center gap-4 animate-float-luxury">
             <div className="p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(183,110,121,0.2)]">
                <Image 
                  src="/logo.png" 
                  alt="I Lash Studio Logo" 
                  width={150} 
                  height={75} 
                  className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  priority
                />
             </div>
            <h1 className="text-3xl font-headline text-gold-gradient">I Lash Studio</h1>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold uppercase tracking-widest text-primary/80">Acesso Restrito</CardTitle>
            <CardDescription className="text-primary/60 font-bold uppercase text-[10px] tracking-widest">
              Exclusive Management System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-12">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <User size={14} /> Usuário
                </Label>
                <Input 
                  placeholder="Seu usuário" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-2xl bg-muted/30 border-border focus:ring-primary/20 text-base"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Lock size={14} /> Senha
                </Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl bg-muted/30 border-border focus:ring-primary/20 text-base pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs font-black text-destructive text-center uppercase tracking-tight italic animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              disabled={loading || !username || !password}
              className="w-full h-14 rounded-3xl bg-gold-gradient text-primary-foreground font-black text-lg gap-2 shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Entrar na Agenda"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <footer className="fixed bottom-8 text-center w-full text-primary/20 text-[10px] font-light tracking-[0.2em] uppercase">
        <p>&copy; {new Date().getFullYear()} I Lash Studio • Luxury Experience</p>
      </footer>
    </div>
  )
}
