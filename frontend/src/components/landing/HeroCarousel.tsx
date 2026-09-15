import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { heroSlides } from '@/data/heroCarouselData';
import { HeroCarouselItem } from './HeroCarouselItem';
import { useCarouselAutoplay } from '@/hooks/useCarouselAutoplay';

const SWIPE_THRESHOLD = 48;

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

export function HeroCarousel() {
  const total = heroSlides.length;
  const [[index, direction], setIndexState] = useState<[number, number]>([0, 0]);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (nextIndex: number, dir: number) => {
      setIndexState([((nextIndex % total) + total) % total, dir]);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  const { pause, resume } = useCarouselAutoplay({
    itemCount: total,
    onAdvance: next,
  });

  const handleDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) next();
    else if (info.offset.x > SWIPE_THRESHOLD) prev();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    }
  };

  const activeSlide = heroSlides[index];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Sorotan SEHATI"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={handleKeyDown}
      className="group relative h-[420px] w-full overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[oklch(65%_0.08_170)] focus-visible:ring-offset-2 md:h-[460px]"
    >
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={activeSlide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={
            prefersReducedMotion
              ? { duration: 0.15 }
              : { type: 'spring', damping: 20, stiffness: 200 }
          }
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <HeroCarouselItem slide={activeSlide} index={index} total={total} />
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next — desktop only */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-white group-hover:opacity-100 lg:flex"
      >
        <ChevronLeft className="h-4 w-4 text-[#1e293b]" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-white group-hover:opacity-100 lg:flex"
      >
        <ChevronRight className="h-4 w-4 text-[#1e293b]" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i, i > index ? 1 : -1)}
            aria-label={`Ke slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
            )}
          />
        ))}
      </div>

      {/* Screen-reader announcer */}
      <div className="sr-only" aria-live="polite">
        Slide {index + 1} dari {total}: {activeSlide.title}
      </div>
    </div>
  );
}
