import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fornece feedback tátil (vibração) em dispositivos compatíveis.
 * @param pattern Duração em ms ou padrão de vibração.
 */
export function hapticFeedback(pattern: number | number[] = 10) {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Silenciosamente falha se o navegador bloquear vibração não iniciada pelo usuário
    }
  }
}
