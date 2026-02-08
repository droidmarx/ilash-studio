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
      const intensity = localStorage.getItem('vibration-intensity') || 'medium';
      
      if (intensity === 'none') return;

      let multiplier = 1;
      if (intensity === 'weak') multiplier = 0.5;
      if (intensity === 'strong') multiplier = 2;
      
      const adjust = (v: number) => Math.max(1, Math.round(v * multiplier));

      const adjustedPattern = Array.isArray(pattern) 
        ? pattern.map(adjust) 
        : adjust(pattern);

      navigator.vibrate(adjustedPattern);
    } catch (e) {
      // Silenciosamente falha se o navegador bloquear vibração
    }
  }
}
