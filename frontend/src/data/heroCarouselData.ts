export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  /** brand color identifier used to style the slide background — no images needed */
  background: 'navy' | 'teal' | 'sage';
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'deteksi-dini-stunting',
    eyebrow: 'Deteksi Dini Stunting',
    title: 'Deteksi dini, tumbuh lebih pasti.',
    description:
      'Sistem edukasi holistik dan deteksi stunting terintegrasi. Pendekatan klinis berbasis standar WHO 2006 untuk masa depan anak Indonesia.',
    ctaLabel: 'Mulai Skrining',
    ctaHref: '/skrining',
    background: 'navy',
  },
  {
    id: 'standar-who-2006',
    eyebrow: 'Standar WHO 2006',
    title: 'Setiap ukuran punya makna.',
    description:
      'Z-Score dibaca secara klinis dan akurat mengikuti kurva pertumbuhan WHO 2006, membantu orang tua memahami status gizi anak sejak dini.',
    ctaLabel: 'Mulai Skrining',
    ctaHref: '/skrining',
    background: 'teal',
  },
  {
    id: 'pangan-lokal-bontang',
    eyebrow: 'Pangan Lokal Bontang',
    title: 'Gizi seimbang dari dapur sendiri.',
    description:
      'Rekomendasi pangan lokal Bontang yang terjangkau dan mudah didapat, untuk mendukung tumbuh kembang optimal anak sehari-hari.',
    ctaLabel: 'Lihat Cara Kerja',
    ctaHref: '#cara-kerja',
    background: 'sage',
  },
];
