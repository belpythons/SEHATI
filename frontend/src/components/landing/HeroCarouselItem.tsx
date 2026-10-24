import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HeroSlide } from '@/data/heroCarouselData';

// Backgrounds derived from SEHATI design tokens (--color-navy / --color-teal / --color-sage)
// Navy  (hue 250): dark authoritative slate — primary CTA slide
// Teal  (hue 195): cool blue-cyan — echoes chart/data accent in ProductIntelligence & WhyEarlyScreening
// Sage  (hue 125): warm yellow-green — echoes organic/nutrition feel in NutritionEducation
// All `to-` stops ≤ 45% lightness → white text contrast ≥ 4.5:1 (WCAG AA)
const backgroundStyles: Record<HeroSlide['background'], string> = {
  navy: 'bg-gradient-to-br from-[oklch(30%_0.05_250)] via-[oklch(24%_0.04_250)] to-[oklch(18%_0.03_250)]',
  teal: 'bg-gradient-to-br from-[oklch(52%_0.09_195)] via-[oklch(42%_0.07_198)] to-[oklch(32%_0.05_200)]',
  sage: 'bg-gradient-to-br from-[oklch(52%_0.08_125)] via-[oklch(42%_0.07_128)] to-[oklch(32%_0.05_130)]',
};

interface HeroCarouselItemProps {
  slide: HeroSlide;
  index: number;
  total: number;
}

export function HeroCarouselItem({ slide, index, total }: HeroCarouselItemProps) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} dari ${total}`}
      className={cn(
        'flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl p-7 text-[oklch(98%_0.005_250)] select-none md:p-9',
        backgroundStyles[slide.background]
      )}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/70">
        {slide.eyebrow}
      </span>

      <div className="space-y-3">
        <h3 className="font-display text-[28px] leading-[1.15] md:text-[34px]">
          {slide.title}
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-white/80 md:text-[15px]">
          {slide.description}
        </p>
      </div>

      {slide.ctaLabel && (
        <motion.a
          href={slide.ctaHref}
          draggable={false}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#1e293b] transition-colors hover:bg-white/90"
        >
          {slide.ctaLabel}
          <span aria-hidden="true">→</span>
        </motion.a>
      )}
    </div>
  );
}
