import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Heart, MapPin, ExternalLink } from 'lucide-react'
import mockData from '../../data/mockData'

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/icons/sehati-simbol-navbar.png"
                alt="SEHATI"
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                {mockData.meta.systemName}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {mockData.meta.systemFullName}. Platform digital ramah pengguna untuk pencegahan stunting balita berbasis standar WHO 2006, machine learning Naïve Bayes, dan pangan lokal Kota Bontang.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{mockData.meta.cityContext}</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/questionnaire" className="text-slate-400 hover:text-white transition-colors">
                  Kuesioner Skrining
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-slate-400 hover:text-white transition-colors">
                  Dashboard Analitik
                </Link>
              </li>
            </ul>
          </div>

          {/* Standard & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Standar & Keamanan
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Standar Baku WHO 2006 LMS</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero-Login Friction (Privasi Terjaga)</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Intervensi Pangan Lokal Bontang</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} SEHATI. Inisiatif Deteksi & Pencegahan Stunting Terintegrasi.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>untuk anak-anak sehat Kota Bontang</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
