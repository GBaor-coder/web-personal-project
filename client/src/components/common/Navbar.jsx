import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Terminal, Link2, Shield, Layers, BookOpen, UserCheck } from 'lucide-react'
import { LedIndicator } from './LedIndicator'
import { ScrewHead } from './ScrewHead'
import { VentSlots } from './VentSlots'

export const Navbar = () => {
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'HỒ SƠ NĂNG LỰC', subLabel: 'PORTFOLIO', icon: Layers },
    { path: '/links', label: 'LIÊN KẾT & AFFILIATE', subLabel: 'BIO LINKS', icon: Link2 },
  ]

  return (
    <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 mb-8">
      <div className="relative rounded-2xl neu-panel p-3.5 flex items-center justify-between shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]">
        <ScrewHead className="absolute top-2.5 left-2.5" />
        <ScrewHead className="absolute top-2.5 right-2.5 cross" />

        {/* Brand / Status */}
        <div className="flex items-center gap-4 pl-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl neu-recessed text-[#ff4757] group-hover:shadow-[inset_2px_2px_4px_#babecc,inset_-2px_-2px_4px_#ffffff]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-[#2d3436] text-embossed">KIẾN TRÚC HỆ THỐNG // DEV_CORE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2ed573]/20 text-[#1e824c] border border-[#2ed573]/40">v2.4 VI-EN</span>
              </div>
              <p className="text-[10px] font-mono uppercase text-[#4a5568] tracking-widest">
                INDUSTRIAL HARDWARE SKEUOMORPHISM
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center pl-4 border-l border-[#babecc]/50">
            <LedIndicator color="green" label="NODE TRỰC TUYẾN // ONLINE" pulse />
          </div>
        </div>

        {/* Navigation Switchboard */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl neu-recessed mr-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex flex-col items-center px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-150
                    ${isActive 
                      ? 'neu-button text-[#ff4757] shadow-[2px_2px_5px_#babecc,-2px_-2px_5px_#ffffff]' 
                      : 'text-[#4a5568] hover:text-[#2d3436]'}
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </div>
                  <span className="text-[9px] opacity-70 tracking-wider uppercase font-normal">{link.subLabel}</span>
                </Link>
              )
            })}
          </div>

          <div className="hidden lg:block pr-2">
            <VentSlots count={4} />
          </div>

          {/* Quick link for mobile */}
          <Link
            to="/links"
            className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg neu-button text-xs font-mono font-bold text-[#ff4757]"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>BIO LINKS</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
