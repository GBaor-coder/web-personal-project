import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink, Copy, Check, Share2, ArrowUpRight, ArrowDown, ShoppingBag, Terminal,
  Cpu, Database, Monitor, ShieldCheck, GitBranch, Video, MessageSquare,
  BookOpen, Code2, Headphones, Camera, Keyboard, Mouse, Server,
} from 'lucide-react'
import { IndustrialBadge } from '../components/common/IndustrialBadge'
import { ScrewHead } from '../components/common/ScrewHead'
import { LedIndicator } from '../components/common/LedIndicator'
import { VentSlots } from '../components/common/VentSlots'
import profileImg from '../assets/images/profile.jpg'
import { INITIAL_LINKS } from '../data/mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ─── Page-level profile config (bio page owner) ───────────────────────────────
const PROFILE = {
  name: 'DEV_CORE — KỸ SƯ HỆ THỐNG',
  handle: '@devcore.vn',
  // "Chuẩn bio": 1-2 câu miêu tả giá trị rõ ràng, hướng tới người mua
  bio: 'Kiểm định & chọn lọc thiết bị công nghệ, khóa học chuyên sâu và đồ nghề kỹ sư đáng giá. Mọi link affiliate minh bạch 100% chi phí — không phát sinh thêm phí cho bạn.',
  cta: 'XEM DANH MỤC LIÊN KẾT // BROWSE LINKS',
}

const SEO_TITLE = 'DEV_CORE // LINK HUB — Thiết bị công nghệ & khóa học đã kiểm định'
const SEO_DESC =
  'Danh mục thiết bị công nghệ, khóa học chuyên sâu và đồ nghề kỹ sư do DEV_CORE kiểm định. Mã giảm giá độc quyền, minh bạch chi phí affiliate.'

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
  BookOpen,
  Code2,
  Headphones,
  Camera,
  Keyboard,
  Mouse,
  Server,
}

const CATEGORIES = [
  { id: 'all', label: 'TẤT CẢ LIÊN KẾT', sub: 'ALL LINKS' },
  { id: 'gear', label: 'THIẾT BỊ CÔNG NGHỆ', sub: 'TECH GEAR' },
  { id: 'course', label: 'KHÓA HỌC CHUYÊN SÂU', sub: 'COURSES' },
  { id: 'affiliate', label: 'PHẦN CỨNG & GIAO CỤ', sub: 'HARDWARE' },
  { id: 'social', label: 'MẠNG XÃ HỘI', sub: 'CHANNELS' },
]

const cardMotion = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.2 },
}

const SkeletonHeader = () => (
  <div className="flex items-center gap-3 px-4 py-4">
    <div className="w-16 h-16 rounded-md bg-[#c8d1df] animate-pulse" />
    <div className="flex-1 space-y-2.5">
      <div className="h-4 w-2/3 rounded bg-[#c8d1df] animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-[#c8d1df] animate-pulse" />
    </div>
    <div className="w-11 h-11 rounded-xl bg-[#c8d1df] animate-pulse" />
  </div>
)

const SkeletonList = () => (
  <>
    {[0, 1, 2].map((i) => (
      <li key={i} aria-hidden="true" className="rounded-2xl neu-panel border border-white/80">
        <SkeletonHeader />
      </li>
    ))}
  </>
)

export const BioLinkPage = () => {
  const [links, setLinks] = useState(INITIAL_LINKS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [copiedId, setCopiedId] = useState(null)
  const [copiedBio, setCopiedBio] = useState(false)
  const [loading, setLoading] = useState(true)

  // ─── Per-route SEO: <title>, description, Open Graph, JSON-LD ProfilePage ───
  useEffect(() => {
    const head = document.head
    const prevTitle = document.title
    const descEl = head.querySelector('meta[name="description"]')
    const prevDesc = descEl?.getAttribute('content') ?? null
    const created = []

    const upsert = (attr, key, content) => {
      const selector = `meta[${attr}="${key}"]`
      let el = head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        head.appendChild(el)
        created.push(selector)
      }
      el.setAttribute('content', content)
    }

    document.title = SEO_TITLE
    upsert('name', 'description', SEO_DESC)
    upsert('property', 'og:title', SEO_TITLE)
    upsert('property', 'og:description', SEO_DESC)
    upsert('property', 'og:type', 'website')

    const ldId = 'bio-profile-jsonld'
    let ld = document.getElementById(ldId)
    if (!ld) {
      ld = document.createElement('script')
      ld.type = 'application/ld+json'
      ld.id = ldId
      head.appendChild(ld)
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: PROFILE.name,
        alternateName: PROFILE.handle,
        description: PROFILE.bio,
        url: `https://${window.location.host}${window.location.pathname}${window.location.hash}`,
      },
    })

    return () => {
      document.title = prevTitle
      if (prevDesc != null && descEl) descEl.setAttribute('content', prevDesc)
      created.forEach((sel) => head.querySelector(sel)?.remove())
      document.getElementById(ldId)?.remove()
    }
  }, [])

  // ─── Data ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    if (isSupabaseConfigured) {
      supabase
        .from('links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .then(({ data, error }) => {
          if (cancelled) return
          if (!error && data && data.length > 0) {
            setLinks(data)
          }
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
    return () => {
      cancelled = true
    }
  }, [])

  const filteredLinks = useMemo(
    () => (selectedCategory === 'all' ? links : links.filter((l) => l.category === selectedCategory)),
    [links, selectedCategory]
  )

  const handleLinkClick = (id) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, clicks: (l.clicks || 0) + 1 } : l))
    )
  }

  const handleCopyLink = async (e, id, url) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* clipboard unavailable — still show the brief "copied" feedback */
    }
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleShareBio = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      /* noop */
    }
    setCopiedBio(true)
    setTimeout(() => setCopiedBio(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto px-4 pb-[max(4rem,env(safe-area-inset-bottom))] space-y-5">
      {/* ═══ Header — chuẩn bio: avatar → h1 tên → handle → bio → badge → CTA ═══ */}
      <motion.header
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="relative rounded-2xl neu-floating border border-white/80 p-5 sm:p-6 text-center"
      >
        <ScrewHead className="absolute top-2.5 left-2.5 pointer-events-none" />
        <ScrewHead className="absolute top-2.5 right-2.5 cross pointer-events-none" />

        {/* Status + share */}
        <div className="flex items-center justify-between pb-3">
          <LedIndicator color="green" label="HOẠT ĐỘNG // LIVE" pulse />
          <button
            type="button"
            onClick={handleShareBio}
            title="Chia sẻ trang liên kết"
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl neu-button text-[#4a5568] hover:text-[#2d3436] min-h-[44px] min-w-[44px]"
          >
            {copiedBio ? <Check className="w-4 h-4 text-[#2ed573]" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs font-mono">
              {copiedBio ? 'ĐÃ SAO CHÉP' : 'CHIA SẺ // SHARE'}
            </span>
          </button>
        </div>

        {/* Avatar */}
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 rounded-2xl neu-recessed p-1.5 border-2 border-white/80 mx-auto overflow-hidden">
            <img
              src={profileImg}
              alt={`Ảnh hồ sơ ${PROFILE.name}`}
              width={320}
              height={320}
              className="w-full h-full object-cover rounded-xl filter grayscale contrast-125"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 p-1 rounded-lg neu-panel border border-white/70">
            <Terminal className="w-4 h-4 text-[#ff4757]" />
          </div>
        </div>

        {/* Name — duy nhất một h1 trên trang */}
        <h1 className="text-xl sm:text-2xl font-black text-[#2d3436] text-embossed tracking-tight text-balance">
          {PROFILE.name}
        </h1>
        <p className="font-mono text-xs text-[#5a6270] tracking-wider mt-1">{PROFILE.handle}</p>

        <p className="text-sm leading-relaxed text-[#4a5568] max-w-md mx-auto mt-3">{PROFILE.bio}</p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <IndustrialBadge variant="orange">CHUYÊN GIA KIỂM ĐỊNH // VERIFIED</IndustrialBadge>
          <IndustrialBadge variant="tape">MÃ GIẢM GIÁ ĐỘC QUYỀN</IndustrialBadge>
        </div>

        {/* Primary CTA hướng khách mua */}
        <a
          href="#links-list"
          className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2.5 neu-button-accent px-6 py-3 rounded-xl text-sm font-bold"
        >
          {PROFILE.cta}
          <ArrowDown className="w-4 h-4" />
        </a>

        <VentSlots count={4} className="absolute bottom-2.5 right-2.5 opacity-40" />
      </motion.header>

      {/* ═══ Category filter ═══ */}
      <nav aria-label="Bộ lọc danh mục liên kết">
        <div className="flex items-stretch gap-2 -mx-1 px-1 pb-2 overflow-x-auto scrollbar-none snap-x sm:flex-wrap sm:justify-center sm:overflow-visible sm:snap-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  snap-start shrink-0 flex flex-col items-center justify-center px-4 min-h-[48px] rounded-xl font-mono transition-all duration-150
                  ${active
                    ? 'neu-button text-[#ff4757]'
                    : 'neu-recessed text-[#4a5568] hover:text-[#2d3436]'}
                `}
              >
                <span className="text-xs font-bold tracking-wide whitespace-nowrap">{cat.label}</span>
                <span className={`text-[9px] uppercase tracking-widest ${active ? 'text-[#ff4757]/80' : 'text-[#5a6270]'}`}>
                  {cat.sub}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ═══ Links list ═══ */}
      <section id="links-list" aria-labelledby="links-heading" className="scroll-mt-28">
        <h2 id="links-heading" className="sr-only">Danh sách liên kết</h2>
        <ul className="space-y-4">
          {loading ? (
            <SkeletonList />
          ) : filteredLinks.length === 0 ? (
            <li>
              <div className="relative rounded-2xl neu-panel border border-white/80 text-center py-10">
                <ScrewHead className="absolute top-2.5 left-2.5 pointer-events-none" />
                <ScrewHead className="absolute top-2.5 right-2.5 cross pointer-events-none" />
                <div className="max-w-sm mx-auto space-y-2">
                  <div className="p-3 rounded-2xl neu-recessed inline-block text-[#5a6270]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-[#2d3436] font-mono uppercase">
                    CHƯA CÓ LIÊN KẾT // NO ACTIVE LINKS
                  </h3>
                  <p className="text-sm text-[#4a5568]">
                    Chưa có liên kết tiếp thị hoặc sản phẩm nào được thiết lập trong danh mục này.
                  </p>
                </div>
              </div>
            </li>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredLinks.map((link) => {
                const IconComponent = ICON_MAP[link.icon_name] || ExternalLink
                const isCopied = copiedId === link.id

                return (
                  <motion.li key={link.id} {...cardMotion}>
                    <div className="group relative rounded-2xl neu-panel border border-white/80 hover:border-white active:translate-y-[2px] transition-all">
                      <ScrewHead className="absolute top-2.5 left-2.5 pointer-events-none" />
                      <ScrewHead className="absolute bottom-2.5 right-2.5 cross pointer-events-none" />

                      {/* Toàn bộ card là link; rel nofollow sponsored đúng chuẩn SEO affiliate */}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        onClick={() => handleLinkClick(link.id)}
                        className="relative flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 pr-16 sm:pr-4 rounded-2xl"
                      >
                        {/* Thumbnail / icon */}
                        {link.image_url ? (
                          <div className="shrink-0 self-start sm:self-center">
                            <div
                              className="relative overflow-hidden rounded-md"
                              style={{
                                background: '#121010',
                                boxShadow: 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
                                border: '1px solid #babecc',
                                width: '60px',
                                height: '60px',
                              }}
                            >
                              <img
                                src={link.image_url}
                                alt={link.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                              />
                              <span
                                className="absolute inset-0 pointer-events-none"
                                aria-hidden="true"
                                style={{
                                  background:
                                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
                                  mixBlendMode: 'multiply',
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl neu-recessed text-[#ff4757] shrink-0 self-start sm:self-center">
                            <IconComponent className="w-6 h-6" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap pr-1">
                            <h3 className="text-[15px] font-bold text-[#2d3436] line-clamp-1">
                              {link.title}
                            </h3>
                            {link.badge_text && (
                              <IndustrialBadge variant="orange" className="text-[9px] py-0 px-1.5">
                                {link.badge_text}
                              </IndustrialBadge>
                            )}
                          </div>

                          {(link.subtitle || link.description) && (
                            <div className="rounded-lg px-3 py-2.5 bg-[#d1d9e6] shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff]">
                              {link.subtitle && (
                                <p className="text-xs font-bold text-[#2d3436] mb-1">{link.subtitle}</p>
                              )}
                              {link.description && (
                                <p className="text-[13px] leading-relaxed text-[#4a5568]">
                                  {link.description}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Meta + CTA affordance */}
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] font-mono">
                            <span className="text-[#ff4757] font-semibold whitespace-nowrap">
                              {link.clicks || 0} LƯỢT TRUY CẬP // CLICKS
                            </span>
                            <span className="text-[#5a6270]" aria-hidden="true">•</span>
                            <span className="uppercase text-[#2d3436] font-bold">{link.category}</span>
                            <span
                              className="ml-auto inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ff4757] text-white text-[10px] font-bold shadow-[0_0_10px_rgba(255,71,87,0.35)]"
                              aria-hidden="true"
                            >
                              MỞ // OPEN
                              <ArrowUpRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </a>

                      {/* Copy — sibling của link để HTML hợp lệ */}
                      <div className="absolute inset-y-0 right-3 z-10 flex items-center pointer-events-none">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(e, link.id, link.url)}
                          aria-label={isCopied ? `Đã sao chép liên kết của ${link.title}` : `Sao chép liên kết của ${link.title}`}
                          title="Sao chép liên kết"
                          className="pointer-events-auto p-3 rounded-xl neu-button text-[#4a5568] hover:text-[#2d3436] min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-[#2ed573]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          )}
        </ul>
      </section>

      {/* ═══ Footnote ═══ */}
      <footer className="text-center pt-4 text-[11px] font-mono text-[#5a6270] space-y-1">
        <p>MINH BẠCH // DISCLOSURE: MỘT SỐ LIÊN KẾT CHỨA MÃ ĐỐI TÁC TIẾP THỊ VÀ KHÔNG PHÁT SINH THÊM CHI PHÍ NÀO CHO BẠN.</p>
        <p>ĐƯỢC BẢO VỆ TUYỆT ĐỐI BỞI KIẾN TRÚC SUPABASE POSTGRESQL RLS.</p>
      </footer>
    </div>
  )
}