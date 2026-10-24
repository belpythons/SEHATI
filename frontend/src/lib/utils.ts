import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Accent classes as literals. Tailwind scans source text statically, so
 * `bg-${color}/10` never compiles -- index them through this map instead.
 */
export const accent = {
  teal: { chip: 'bg-teal/10', text: 'text-teal' },
  sage: { chip: 'bg-sage/10', text: 'text-sage' },
  navy: { chip: 'bg-navy/10', text: 'text-navy' },
} as const

export type AccentName = keyof typeof accent
