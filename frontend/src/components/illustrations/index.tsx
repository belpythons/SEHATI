import { motion, useReducedMotion } from 'framer-motion'

/**
 * Hand-built SVG motifs (Hallmark Tier B).
 *
 * All strokes use `currentColor` — tint comes from the parent's `text-*` class,
 * so a motif is automatically on-token wherever it lands. Decorative by default
 * (`aria-hidden`); pass `label` to promote one to `role="img"`.
 */

type MotifProps = {
  className?: string
  /** Accessible name. Omit for decoration. */
  label?: string
}

const a11y = (label?: string) =>
  label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** WHO growth percentiles (+2SD / median / -2SD) with a plotted measurement. */
export function GrowthCurve({
  className,
  label,
  animated = false,
}: MotifProps & {
  /**
   * Breathing loop on the plot point. Landing hero only — the canon allows one
   * idle loop per page (hero-enrichment E6), and work pages stay still.
   */
  animated?: boolean
}) {
  const reduced = useReducedMotion()

  return (
    <svg viewBox="0 0 120 90" className={className} {...a11y(label)}>
      <g {...stroke} strokeWidth={1.5} opacity={0.45}>
        <path d="M6 6 V84 H116" />
      </g>
      <g {...stroke} strokeWidth={2}>
        <path d="M6 72 C 32 56, 62 40, 116 18" opacity={0.55} />
        <path d="M6 78 C 32 66, 62 54, 116 34" />
        <path d="M6 84 C 32 76, 62 68, 116 52" opacity={0.55} />
      </g>
      <motion.circle
        cx={72}
        cy={50}
        r={4.5}
        fill="currentColor"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={
          animated && !reduced
            ? { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }
            : undefined
        }
        transition={{ duration: 4, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  )
}

/** Ikan bawis + daun kelor — local Bontang food sources. */
export function FishSprig({ className, label }: MotifProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...a11y(label)}>
      <g {...stroke} strokeWidth={2}>
        <path d="M10 44 C 24 26, 54 26, 70 44 C 54 62, 24 62, 10 44 Z" />
        <path d="M70 44 L88 32 L84 44 L88 56 Z" />
        <path d="M34 30 C 38 36, 38 52, 34 58" opacity={0.55} />
        <path d="M34 78 L90 60" />
        <path d="M44 74 C 42 68, 47 65, 51 70 Z" />
        <path d="M58 69 C 56 63, 61 60, 65 65 Z" />
        <path d="M72 64 C 70 58, 75 55, 79 60 Z" />
      </g>
      <circle cx={22} cy={40} r={2.2} fill="currentColor" />
    </svg>
  )
}

/** 1000 HPK timeline — conception, birth, two years. */
export function FirstDaysArc({ className, label }: MotifProps) {
  return (
    <svg viewBox="0 0 100 60" className={className} {...a11y(label)}>
      <g {...stroke} strokeWidth={2}>
        <path d="M8 50 A 42 42 0 0 1 92 50" />
      </g>
      <g fill="currentColor">
        <circle cx={8} cy={50} r={3.5} opacity={0.5} />
        <circle cx={50} cy={8} r={5} />
        <circle cx={92} cy={50} r={3.5} opacity={0.5} />
      </g>
    </svg>
  )
}

/** Parent and toddler — the screening persona. */
export function PersonaMark({ className, label }: MotifProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...a11y(label)}>
      <g {...stroke} strokeWidth={2}>
        <circle cx={34} cy={22} r={10} />
        <path d="M34 32 V62 M34 42 L20 54 M34 42 L52 52 M34 62 L26 88 M34 62 L44 88" />
        <circle cx={70} cy={50} r={7} />
        <path d="M70 57 V72 M70 62 L61 68 M70 62 L79 68 M70 72 L64 90 M70 72 L77 90" />
      </g>
    </svg>
  )
}

/** Home and clean water — the sanitation questions. */
export function HomeWaterMark({ className, label }: MotifProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...a11y(label)}>
      <g {...stroke} strokeWidth={2}>
        <path d="M10 48 L42 20 L74 48" />
        <path d="M18 44 V80 H66 V44" />
        <path d="M34 80 V60 H50 V80" />
        <path d="M84 50 C 93 62, 93 71, 84 71 C 75 71, 75 62, 84 50 Z" />
      </g>
    </svg>
  )
}

/** Bontang coastline and its kelurahan markers. */
export function BontangCoast({ className, label }: MotifProps) {
  return (
    <svg viewBox="0 0 400 80" preserveAspectRatio="none" className={className} {...a11y(label)}>
      <g {...stroke} strokeWidth={1.5}>
        <path d="M0 52 C 44 40, 84 58, 126 47 C 168 36, 208 56, 254 45 C 300 34, 348 52, 400 43" />
        <path
          d="M0 66 C 44 56, 84 72, 126 62 C 168 52, 208 70, 254 60 C 300 50, 348 66, 400 58"
          opacity={0.45}
        />
        <path d="M0 24 C 60 16, 120 30, 180 22 C 240 14, 320 28, 400 20" opacity={0.25} />
      </g>
      <g fill="currentColor">
        <circle cx={96} cy={52} r={3} />
        <circle cx={204} cy={53} r={3} />
        <circle cx={318} cy={45} r={3} />
      </g>
    </svg>
  )
}
