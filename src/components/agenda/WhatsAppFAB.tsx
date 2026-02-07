"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppFAB() {
  const phoneNumber = "5511999999999" // Placeholder
  const message = encodeURIComponent("Olá! Gostaria de agendar um serviço.")
  const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 animate-bounce"
      aria-label="WhatsApp"
    >
      <MessageCircle size={32} />
    </a>
  )
}
