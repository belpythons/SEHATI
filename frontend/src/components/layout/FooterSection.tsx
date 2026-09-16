import React from 'react'
import { Link } from 'react-router-dom'
import { FavouriteIcon } from 'hugeicons-react'

export const FooterSection: React.FC = () => {
  return (
    <footer className="relative bg-[#0b1121] text-slate-300 py-24 md:py-32 overflow-hidden border-t border-slate-800">
      {/* Subtle Background Icon */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 translate-x-1/4 translate-y-1/4">
        <FavouriteIcon className="w-[400px] h-[400px] text-white" strokeWidth={0.5} />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
          
          {/* Brand Statement (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <img
              src="/icons/sehati-simbol-navbar.png"
              alt="SEHATI Logo"
              className="w-12 h-12 mb-8"
            />
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white mb-6 leading-[1.15] tracking-tight max-w-lg">
              Menjaga pertumbuhan hari ini, <br />
              untuk masa depan yang <span className="text-teal-400">lebih sehat.</span>
            </h2>
            
            <div className="mt-4 text-slate-400 font-light">
              <p className="text-xl font-medium text-white mb-1 tracking-wide uppercase font-sans">SEHATI</p>
              <p className="text-base tracking-wide">Sistem Edukasi & Deteksi Stunting Terintegrasi.</p>
            </div>
          </div>

          {/* Navigation (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 sm:gap-10">
            {/* Nav Group 1 */}
            <div className="space-y-4">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-6">Produk</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-300">
                <li><Link to="/questionnaire" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">Skrining</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">Dashboard Analitik</Link></li>
                <li><Link to="/#edukasi-gizi" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">Edukasi Gizi</Link></li>
              </ul>
            </div>
            
            {/* Nav Group 2 */}
            <div className="space-y-4">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-6">Tentang</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-300">
                <li><Link to="/tentang" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">Tentang SEHATI</Link></li>
                <li><Link to="/misi-tujuan" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">Misi & Tujuan</Link></li>
                <li><Link to="/kota-bontang" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">Kota Bontang</Link></li>
              </ul>
            </div>
            
            {/* Nav Group 3 */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-6">Bantuan</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-300">
                <li><Link to="/panduan" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">Panduan Pengguna</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">FAQ</Link></li>
                <li><Link to="/kontak" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white">Hubungi Kami</Link></li>
              </ul>
            </div>
          </div>
          
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/80 pt-8 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          
          {/* Trust Information */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-1">WHO 2006</span>
              <span className="text-sm font-medium text-slate-300">Standar antropometri</span>
            </div>
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-1">Offline-ready</span>
              <span className="text-sm font-medium text-slate-300">Dapat digunakan tanpa koneksi</span>
            </div>
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-1">Bontang</span>
              <span className="text-sm font-medium text-slate-300">Kalimantan Timur</span>
            </div>
          </div>

          {/* Footer Ending */}
          <div className="text-left md:text-right">
            <p className="text-sm font-medium text-slate-400 mb-1">
              © 2026 SEHATI Bontang.
            </p>
            <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">
              Sistem Edukasi & Deteksi Stunting Terintegrasi.
            </p>
          </div>
          
        </div>

      </div>
    </footer>
  )
}
