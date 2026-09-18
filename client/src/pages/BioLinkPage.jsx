import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExternalLink, Copy, Check, Sparkles, Cpu, Database, 
  Monitor, ShieldCheck, GitBranch, Video, MessageSquare, Share2, 
  Layers, ShoppingBag, Terminal, Bookmark
} from 'lucide-react'
import { BoltedCard } from '../components/common/BoltedCard'
import { MechanicalButton } from '../components/common/MechanicalButton'
import { LedIndicator } from '../components/common/LedIndicator'
import { IndustrialBadge } from '../components/common/IndustrialBadge'
import { VentSlots } from '../components/common/VentSlots'
import { ScrewHead } from '../components/common/ScrewHead'
import { INITIAL_LINKS } from '../data/mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const ICON_MAP = {
  Cpu,
  Database,
  Monitor,
  ShieldCheck,
  GitBranch,
  Video,
  MessageSquare,
  ExternalLink,
  ShoppingBag,
}

export const BioLinkPage = () => {
  const [links, setLinks] = useState(INITIAL_LINKS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [copiedId, setCopiedId] = useState(null)
  const [copiedBio, setCopiedBio] = useState(false)

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.from('links').select('*').eq('is_active', true).order('sort_order', { ascending: true }).then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setLinks(data)
        }
      })
    }
  }, [])

  const categories = [
    { id: 'all', label: 'TẤT CẢ LIÊN KẾT', sub: 'ALL LINKS' },
    { id: 'gear', label: 'THIẾT BỊ CÔNG NGHỆ', sub: 'TECH GEAR' },
    { id: 'course', label: 'KHÓA HỌC CHUYÊN SÂU', sub: 'COURSES' },
    { id: 'affiliate', label: 'PHẦN CỨNG & GIAO CỤ', sub: 'HARDWARE' },
    { id: 'social', label: 'MẠNG XÃ HỘI', sub: 'CHANNELS' },
  ]

  const filteredLinks = selectedCategory === 'all' 
    ? links 
    : links.filter(l => l.category === selectedCategory)

  const handleLinkClick = (id, url) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, clicks: (l.clicks || 0) + 1 } : l))
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopyLink = (e, id, url) => {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleShareBio = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedBio(true)
    setTimeout(() => setCopiedBio(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto px-4 pb-16 space-y-6">
      {/* Bio Header Module */}
      <BoltedCard elevation="floating" showVents className="text-center">
        <div className="flex justify-between items-center pb-2">
          <LedIndicator color="green" label="HOẠT ĐỘNG // LIVE" pulse />
          <button
            onClick={handleShareBio}
            className="p-2 rounded-xl neu-button text-[#4a5568] hover:text-[#2d3436] flex items-center gap-1.5 text-xs font-mono"
            title="Chia sẻ trang liên kết"
          >
            {copiedBio ? <Check className="w-3.5 h-3.5 text-[#2ed573]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedBio ? 'ĐÃ SAO CHÉP' : 'CHIA SẺ // SHARE'}</span>
          </button>
        </div>

        {/* Profile Tactical Frame */}
        <div className="relative inline-block mt-2 mb-3">
          <div className="w-24 h-24 rounded-2xl neu-recessed p-1.5 border-2 border-white/80 mx-auto overflow-hidden">
<img 
              src="src/assets/images/profile.jpg" 
              alt="Operator Profile" 
              className="w-full h-full object-cover rounded-xl filter grayscale contrast-125"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 p-1 rounded-lg neu-panel border border-white/70">
            <Terminal className="w-4 h-4 text-[#ff4757]" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#2d3436] text-embossed tracking-tight">
          CỔNG LIÊN KẾT & TIẾP THỊ // BIO HUB
        </h1>
        <p className="text-xs font-mono uppercase text-[#4a5568] tracking-wider mt-1">
          DANH MỤC THIẾT BỊ CHỌN LỌC, KHÓA HỌC & ĐỒ NGHỀ KỸ SƯ
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <IndustrialBadge variant="orange">CHUYÊN GIA KIỂM ĐỊNH // VERIFIED</IndustrialBadge>
          <IndustrialBadge variant="tape">MÃ GIẢM GIÁ ĐỘC QUYỀN</IndustrialBadge>
        </div>
      </BoltedCard>

      {/* Category Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all duration-150 flex flex-col items-center
              ${selectedCategory === cat.id
                ? 'neu-button text-[#ff4757] shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]'
                : 'neu-recessed text-[#4a5568] hover:text-[#2d3436]'}
            `}
          >
            <span>{cat.label}</span>
            <span className="text-[9px] opacity-70 uppercase font-normal">{cat.sub}</span>
          </button>
        ))}
      </div>

      {/* Affiliate Link Feed */}
      <div className="space-y-4">
        {filteredLinks.length === 0 ? (
          <BoltedCard elevation="base" showVents className="text-center py-10">
            <div className="max-w-sm mx-auto space-y-2">
              <div className="p-3 rounded-2xl neu-recessed inline-block text-[#8892a4]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-[#2d3436] font-mono uppercase">
                CHƯA CÓ LIÊN KẾT // NO ACTIVE LINKS
              </h3>
              <p className="text-xs text-[#4a5568]">
                Chưa có liên kết tiếp thị hoặc sản phẩm nào được thiết lập trong danh mục này.
              </p>
            </div>
          </BoltedCard>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredLinks.map((link) => {
              const IconComponent = ICON_MAP[link.icon_name] || ExternalLink
              const isCopied = copiedId === link.id

              return (
                <motion.div
                key={link.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleLinkClick(link.id, link.url)}
                className="group relative rounded-2xl neu-panel p-3 sm:p-4 cursor-pointer border border-white/80 hover:border-white shadow-[6px_6px_14px_#babecc,-6px_-6px_14px_#ffffff] active:translate-y-[2px] transition-all"
              >
                <ScrewHead className="absolute top-2.5 left-2.5" />
                <ScrewHead className="absolute top-2.5 right-2.5 cross" />

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  {/* Left Icon / CRT Screen — static, no hover effects */}
                  {link.image_url ? (
                    /* Miniature CRT Screen — recessed into the chassis */
                    <div className="shrink-0">
                      <div
                        className="relative overflow-hidden rounded-md"
                        style={{
                          background: '#121010',
                          boxShadow: 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
                          border: '1px solid #babecc',
                          width: '64px',
                          height: '64px',
                        }}
                      >
                        <img
                          src={link.image_url}
                          alt={link.title}
                          className="w-full h-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        {/* Scanlines overlay — strictly on top of the image */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
                            mixBlendMode: 'multiply',
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Fallback: Lucide icon in mechanical slot */
                    <div className="p-3 rounded-xl neu-recessed text-[#ff4757] shrink-0">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  )}

                  {/* Middle Content — full product info in compact LCD readout */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#2d3436] line-clamp-1">
                        {link.title}
                      </h3>
                      {link.badge_text && (
                        <IndustrialBadge variant="orange" className="text-[9px] py-0 px-1.5">
                          {link.badge_text}
                        </IndustrialBadge>
                      )}
                    </div>

                    {/* Recessed LCD data readout — compact, scrollable specs */}
                    {(link.subtitle || link.description) && (
                      <div
                        className="rounded-md px-2 py-1.5 text-[11px] font-mono text-[#4a5568] leading-relaxed overflow-y-auto"
                        style={{
                          background: '#d1d9e6',
                          boxShadow: 'inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff',
                          maxHeight: '5rem',
                        }}
                      >
                        {link.subtitle && (
                          <p className="font-bold text-[#2d3436] line-clamp-1">{link.subtitle}</p>
                        )}
                        {link.description && (
                          <span className="line-clamp-3">{link.description}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#8892a4]">
                      <span className="text-[#ff4757] font-semibold">{link.clicks || 0} LƯỢT TRUY CẬP // CLICKS</span>
                      <span>•</span>
                      <span className="uppercase text-[#2d3436] font-bold">{link.category}</span>
                    </div>
                  </div>

                  {/* Right Actions — 48px min touch target on mobile */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleCopyLink(e, link.id, link.url)}
                      className="p-3 rounded-xl neu-button text-[#4a5568] hover:text-[#2d3436] min-h-[48px] min-w-[48px]"
                      title="Sao chép liên kết"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-[#2ed573]" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <div className="p-3 rounded-xl neu-button-accent text-white min-h-[48px] min-w-[48px] flex items-center justify-center">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        )}
      </div>

      {/* Mobile Spec Footnote */}
      <div className="text-center pt-6 text-[10px] font-mono text-[#8892a4] space-y-1">
        <p>MINH BẠCH // DISCLOSURE: MỘT SỐ LIÊN KẾT CHỨA MÃ ĐỐI TÁC TIẾP THỊ VÀ KHÔNG PHÁT SINH THÊM CHI PHÍ NÀO CHO BẠN.</p>
        <p>ĐƯỢC BẢO VỆ TUYỆT ĐỐI BỞI KIẾN TRÚC SUPABASE POSTGRESQL RLS.</p>
      </div>
    </div>
  )
}
