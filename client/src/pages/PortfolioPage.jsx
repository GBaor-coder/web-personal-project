import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Terminal, ShieldCheck, Cpu, Database, Server, Code2, Globe, GitBranch, 
  ExternalLink, ArrowUpRight, Send, CheckCircle2, GraduationCap, 
  BookOpen, Sparkles, Download, Mail, Copy, Check, Layers 
} from 'lucide-react'
import { BoltedCard } from '../components/common/BoltedCard'
import { MechanicalButton } from '../components/common/MechanicalButton'
import { RecessedInput } from '../components/common/RecessedInput'
import { LedIndicator } from '../components/common/LedIndicator'
import { IndustrialBadge } from '../components/common/IndustrialBadge'
import { VentSlots } from '../components/common/VentSlots'
import { INITIAL_PROJECTS, INITIAL_SKILLS, INITIAL_EDUCATION, INITIAL_BLOGS } from '../data/mockData'
import { contactSchema } from '../lib/validations'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const PortfolioPage = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [blogs, setBlogs] = useState(INITIAL_BLOGS)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [formErrors, setFormErrors] = useState({})
  const [formStatus, setFormStatus] = useState({ state: 'idle', message: '' })

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Fetch live projects from Supabase
      supabase.from('projects').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setProjects(data)
        }
      })
      // Fetch live blogs from Supabase
      supabase.from('blogs').select('*').eq('published', true).order('created_at', { ascending: false }).then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setBlogs(data)
        }
      })
    }
  }, [])

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('engineer@system-core.dev')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFormErrors({})

    const validation = contactSchema.safeParse(formData)
    if (!validation.success) {
      const errors = {}
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message
      })
      setFormErrors(errors)
      return
    }

    setFormStatus({ state: 'submitting', message: 'ĐANG MÃ HÓA & TRUYỀN DỮ LIỆU ĐO LƯỜNG...' })

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('messages').insert([validation.data])
        if (error) throw error
      } else {
        // Fallback simulation for offline/preview
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      setFormStatus({ 
        state: 'success', 
        message: 'TÍN HIỆU ĐÃ ĐƯỢC GỬI AN TOÀN TỚI MÁY CHỦ // TRANSMISSION SUCCESSFUL' 
      })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setFormStatus({ 
        state: 'error', 
        message: err.message || 'LỖI TRUYỀN TẢI. VUI LÒNG GỬI TRỰC TIẾP QUA EMAIL // DISPATCH FAILED' 
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-4">
        <BoltedCard elevation="floating" showVents className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Bio Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <LedIndicator color="orange" label="SẴN SÀNG NHẬN DỰ ÁN // READY FOR HIRE" pulse />
                <IndustrialBadge variant="tape">KHU VỰC // UTC+7 / REMOTE</IndustrialBadge>
                <IndustrialBadge variant="orange">CHUYÊN SÂU BẢO MẬT // SECURITY</IndustrialBadge>
              </div>

              <div>
                <div className="text-xs font-mono text-[#ff4757] font-bold tracking-widest uppercase mb-1">
                  KỸ SƯ FULL-STACK & KIẾN TRÚC SƯ HỆ THỐNG
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#2d3436] text-embossed leading-[1.15]">
                  FULL-STACK <span className="text-[#ff4757]">ENGINEER</span> & SYSTEM ARCHITECT
                </h1>
                <p className="mt-4 text-base sm:text-lg text-[#4a5568] leading-relaxed">
                  Thiết kế & phát triển các ứng dụng web trọng yếu với bảo mật zero-trust trên nền tảng Supabase, đường ống dữ liệu PostgreSQL hiệu năng cao và trải nghiệm giao diện xúc giác công nghiệp (Industrial Skeuomorphism).
                </p>
              </div>

              {/* Hardware Spec Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl neu-recessed flex flex-col">
                  <span className="text-[10px] font-mono text-[#8892a4] uppercase">KINH NGHIỆM // EXP</span>
                  <span className="text-base font-bold text-[#2d3436] font-mono">4+ NĂM</span>
                </div>
                <div className="p-3 rounded-xl neu-recessed flex flex-col">
                  <span className="text-[10px] font-mono text-[#8892a4] uppercase">CÔNG NGHỆ LÕI // STACK</span>
                  <span className="text-base font-bold text-[#ff4757] font-mono">REACT + SUPABASE</span>
                </div>
                <div className="p-3 rounded-xl neu-recessed flex flex-col col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-[#8892a4] uppercase">BẢO MẬT // SECURITY</span>
                  <span className="text-base font-bold text-[#2ed573] font-mono">STRICT RLS</span>
                </div>
              </div>

              {/* CTA Action Deck */}
              <div className="flex flex-wrap gap-4 pt-2">
                <MechanicalButton 
                  variant="accent" 
                  size="lg" 
                  icon={ArrowUpRight}
                  onClick={() => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  XEM DỰ ÁN TIÊU BIỂU [CASE STUDIES]
                </MechanicalButton>
                <MechanicalButton 
                  variant="default" 
                  size="lg" 
                  icon={Download}
                  onClick={() => alert('Đã tải xuống hồ sơ năng lực chi tiết (CV Spec Sheet PDF).')}
                >
                  TẢI HỒ SƠ CV [PDF]
                </MechanicalButton>
              </div>
            </div>

            {/* Right Interactive Chassis Terminal */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl neu-recessed p-5 border border-white/40 scanlines-overlay">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#babecc]/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff4757] shadow-[0_0_6px_#ff4757]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffa502]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2ed573]" />
                    <span className="ml-2 font-mono text-xs font-bold text-[#2d3436]">BẢNG ĐO LƯỜNG TỪ XA // TELEMETRY</span>
                  </div>
                  <VentSlots count={3} />
                </div>

                {/* Simulated Real-time Status Stream */}
                <div className="font-mono text-xs space-y-2 text-[#4a5568] bg-[#c8d1df] p-4 rounded-xl shadow-[inset_3px_3px_6px_#b0bac9,inset_-3px_-3px_6px_#ffffff]">
                  <div className="text-[#2d3436] font-semibold">$ systemctl status architecture</div>
                  <div className="text-[#2ed573]">● auth-engine.service - Supabase JWT (Đang hoạt động)</div>
                  <div className="text-[#2d3436]">● rls-enforcer.service - Strict Public Policies (Đã khóa)</div>
                  <div className="text-[#ff4757]">● client-crypto.service - AES-GCM-256 (Mã hóa RAM)</div>
                  <div className="text-[#4a5568] pt-2 border-t border-[#babecc]/60">
                    TRẠNG THÁI: TẤT CẢ PHÂN HỆ ỔN ĐỊNH<br />
                    ĐỘ TRỄ ĐIỀU HƯỚNG: 18ms TỚI CLUSTER BIÊN
                  </div>
                </div>

                {/* Email quick copy */}
                <div className="mt-4 flex items-center justify-between p-2.5 rounded-xl neu-panel">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#2d3436]">
                    <Mail className="w-4 h-4 text-[#ff4757]" />
                    <span>engineer@system-core.dev</span>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-lg neu-button text-xs font-mono flex items-center gap-1 text-[#4a5568] hover:text-[#2d3436]"
                    title="Sao chép email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#2ed573]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </BoltedCard>
      </section>

      {/* 2. PROJECTS SECTION */}
      <section id="projects-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#ff4757] font-bold tracking-wider">[PHÂN HỆ 01 // MODULE 01]</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3436] text-embossed">DỰ ÁN KỸ THUẬT TIÊU BIỂU</h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#4a5568] mt-1">
              BÀI TOÁN THỰC TẾ & GIẢI PHÁP KIẾN TRÚC // CASE STUDIES & SOLUTIONS
            </p>
          </div>
          <VentSlots count={6} className="hidden sm:flex" />
        </div>

        {projects.length === 0 ? (
          <BoltedCard elevation="base" showVents className="text-center py-12">
            <div className="max-w-md mx-auto space-y-3">
              <div className="p-3 rounded-2xl neu-recessed inline-block text-[#8892a4]">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#2d3436] font-mono uppercase">
                CHƯA CÓ BẢN GHI DỰ ÁN // NO PROJECT RECORDS
              </h3>
              <p className="text-xs text-[#4a5568]">
                Hệ thống cơ sở dữ liệu Supabase chưa có bản ghi dự án nào. Bạn có thể thêm dự án mới thông qua Cổng Quản Trị Bảo Mật.
              </p>
              <div className="pt-2">
                <MechanicalButton 
                  variant="panel" 
                  size="sm" 
                  icon={ArrowUpRight}
                  href="/admin-portal"
                >
                  TRUY CẬP ADMIN PORTAL ĐỂ THÊM DỰ ÁN
                </MechanicalButton>
              </div>
            </div>
          </BoltedCard>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {projects.map((proj, idx) => (
              <BoltedCard key={proj.id} elevation="base" showVents>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual Preview Device Frame */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div className="relative rounded-xl overflow-hidden neu-recessed p-2 border border-white/60 group">
                    <img 
                      src={proj.image_url} 
                      alt={proj.title}
                      className="w-full h-56 object-cover rounded-lg filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <IndustrialBadge variant="tape">{proj.category}</IndustrialBadge>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {proj.tech_stack.map((t) => (
                      <IndustrialBadge key={t} variant="neutral">{t}</IndustrialBadge>
                    ))}
                  </div>
                </div>

                {/* Problem & Solution Specs */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-[#8892a4]">MÃ ĐỊNH DANH // UNIT #{String(idx + 1).padStart(2, '0')}</span>
                      <h3 className="text-xl font-bold text-[#2d3436] text-embossed">{proj.title}</h3>
                      {proj.subtitle && (
                        <p className="text-xs font-mono uppercase text-[#ff4757] font-semibold tracking-wider mt-0.5">
                          {proj.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#4a5568] leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Problem & Solution Hardware Slots */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl neu-recessed border-l-4 border-[#ff4757]">
                      <span className="text-[11px] font-mono font-bold uppercase text-[#ff4757] block mb-1">
                        BÀI TOÁN & ĐIỂM NGHẼN HỆ THỐNG // IDENTIFIED BOTTLENECK
                      </span>
                      <p className="text-xs text-[#2d3436] leading-normal font-sans">
                        {proj.problem}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl neu-recessed border-l-4 border-[#2ed573]">
                      <span className="text-[11px] font-mono font-bold uppercase text-[#2ed573] block mb-1">
                        GIẢI PHÁP KIẾN TRÚC & KẾT QUẢ // ARCHITECTURAL SOLUTION
                      </span>
                      <p className="text-xs text-[#2d3436] leading-normal font-sans">
                        {proj.solution}
                      </p>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {proj.live_url && (
                      <MechanicalButton 
                        variant="accent" 
                        size="sm" 
                        icon={ExternalLink}
                        href={proj.live_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        TRẢI NGHIỆM TRỰC TIẾP [LIVE DEMO]
                      </MechanicalButton>
                    )}
                    {proj.github_url && (
                      <MechanicalButton 
                        variant="default" 
                        size="sm" 
                        icon={GitBranch}
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        MÃ NGUỒN [GITHUB]
                      </MechanicalButton>
                    )}
                  </div>
                </div>
              </div>
            </BoltedCard>
          ))}
        </div>
        )}
      </section>

      {/* 3. SKILLS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#ff4757] font-bold tracking-wider">[PHÂN HỆ 02 // MODULE 02]</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3436] text-embossed">MA TRẬN NĂNG LỰC KỸ THUẬT</h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#4a5568] mt-1">
              CHUYÊN MÔN HÓA KIẾN TRÚC ĐỘ TRỄ THẤP & BẢO MẬT CHỦ ĐỘNG // SKILLS MATRIX
            </p>
          </div>
          <LedIndicator color="green" label="ĐÃ KIỂM ĐỊNH // CERTIFIED" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_SKILLS.map((skillGroup) => (
            <BoltedCard 
              key={skillGroup.category} 
              title={skillGroup.category} 
              subtitle={skillGroup.categoryEn}
              elevation="base"
            >
              <div className="flex flex-wrap gap-2 pt-2">
                {skillGroup.items.map((skill) => (
                  <span 
                    key={skill}
                    className="px-2.5 py-1.5 rounded-lg neu-recessed text-xs font-mono font-medium text-[#2d3436] shadow-[inset_2px_2px_4px_#babecc,inset_-2px_-2px_4px_#ffffff] hover:text-[#ff4757] transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </BoltedCard>
          ))}
        </div>
      </section>

      {/* 4. EDUCATION SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#ff4757] font-bold tracking-wider">[PHÂN HỆ 03 // MODULE 03]</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3436] text-embossed">NỀN TẢNG HỌC THUẬT & ĐÀO TẠO</h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#4a5568] mt-1">
              CHƯƠNG TRÌNH KHOA HỌC MÁY TÍNH CHÍNH QUY & AN TOÀN THÔNG TIN // ACADEMIC FOUNDATION
            </p>
          </div>
          <GraduationCap className="w-6 h-6 text-[#ff4757]" />
        </div>

        {INITIAL_EDUCATION.map((edu) => (
          <BoltedCard key={edu.institution} elevation="base" showVents>
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-[#babecc]/50 gap-2">
              <div>
                <h3 className="text-xl font-bold text-[#2d3436] text-embossed">{edu.degree}</h3>
                <p className="text-xs font-mono uppercase text-[#4a5568] font-semibold">{edu.degreeEn}</p>
                <p className="text-sm font-mono text-[#ff4757] mt-1">{edu.institution}</p>
              </div>
              <div className="flex items-center gap-3">
                <IndustrialBadge variant="orange">{edu.period}</IndustrialBadge>
                <IndustrialBadge variant="green">ĐIỂM GPA {edu.gpa}</IndustrialBadge>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-[#4a5568] font-bold tracking-wider block mb-2">
                CÁC HỌC PHẦN KỸ THUẬT & HƯỚNG NGHIÊN CỨU TRỌNG TÂM:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {edu.coursework.map((course) => (
                  <div key={course} className="p-2.5 rounded-lg neu-recessed flex items-center gap-2 text-xs font-mono text-[#2d3436]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff4757] shrink-0" />
                    <span>{course}</span>
                  </div>
                ))}
              </div>
            </div>
          </BoltedCard>
        ))}
      </section>

      {/* 5. BLOG / KNOWLEDGE SHARING SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#ff4757] font-bold tracking-wider">[PHÂN HỆ 04 // MODULE 04]</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3436] text-embossed">GHI CHÉP KỸ THUẬT & BÀI VIẾT</h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#4a5568] mt-1">
              CHIA SẺ KINH NGHIỆM BẢO MẬT RLS & THIẾT KẾ GIAO DIỆN XÚC GIÁC // ENGINEERING DISPATCHES
            </p>
          </div>
          <BookOpen className="w-6 h-6 text-[#ff4757]" />
        </div>

        {blogs.length === 0 ? (
          <BoltedCard elevation="base" showVents className="text-center py-10">
            <div className="max-w-md mx-auto space-y-2">
              <div className="p-3 rounded-2xl neu-recessed inline-block text-[#8892a4]">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#2d3436] font-mono uppercase">
                CHƯA CÓ BÀI VIẾT NÀO // NO ARTICLES PUBLISHED
              </h3>
              <p className="text-xs text-[#4a5568]">
                Các bài viết chia sẻ chuyên môn kỹ thuật đang được biên tập và sẽ sớm phát hành trên hệ thống.
              </p>
            </div>
          </BoltedCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <BoltedCard key={blog.id} elevation="base" showVents>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <IndustrialBadge variant="tape">{blog.read_time}</IndustrialBadge>
                    <span className="text-[11px] font-mono text-[#8892a4]">{blog.created_at}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#2d3436] hover:text-[#ff4757] transition-colors leading-snug">
                      {blog.title}
                    </h3>
                    {blog.titleEn && (
                      <p className="text-xs font-mono text-[#8892a4] mt-0.5">{blog.titleEn}</p>
                    )}
                  </div>

                  <p className="text-xs text-[#4a5568] leading-relaxed line-clamp-3">
                    {blog.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {blog.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded neu-recessed text-[#4a5568]">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#babecc]/40">
                    <MechanicalButton 
                      variant="panel" 
                      size="sm" 
                      icon={ArrowUpRight}
                      onClick={() => alert(`Bài viết đầy đủ: "${blog.title}" đang hiển thị trong kho kiến thức.`)}
                    >
                      ĐỌC BÀI VIẾT [READ ARTICLE]
                    </MechanicalButton>
                  </div>
                </div>
              </BoltedCard>
            ))}
          </div>
        )}
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#ff4757] font-bold tracking-wider">[PHÂN HỆ 05 // MODULE 05]</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3436] text-embossed">KÊNH TRUYỀN TẢI THÔNG ĐIỆP</h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#4a5568] mt-1">
              GỬI YÊU CẦU HỢP TÁC & TRAO ĐỔI DỰ ÁN // DIRECT TELEMETRY TRANSMISSION
            </p>
          </div>
          <LedIndicator color="orange" label="SẴN SÀNG NHẬN TÍN HIỆU" />
        </div>

        <BoltedCard elevation="floating" showVents>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xl font-bold text-[#2d3436] text-embossed">HỢP TÁC & PHÁT TRIỂN HỆ THỐNG</h3>
              <p className="text-sm text-[#4a5568] leading-relaxed">
                Sẵn sàng tiếp nhận các cơ hội việc làm Full-stack, tư vấn kiến trúc bảo mật ứng dụng và hợp tác xây dựng sản phẩm công nghệ chất lượng cao.
              </p>

              <div className="p-4 rounded-xl neu-recessed space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#2d3436]">
                  <Mail className="w-4 h-4 text-[#ff4757]" />
                  <span>engineer@system-core.dev</span>
                </div>
                <div className="flex items-center gap-2 text-[#2d3436]">
                  <Globe className="w-4 h-4 text-[#2ed573]" />
                  <span>Khu vực: Toàn cầu // Remote / Global</span>
                </div>
                <div className="flex items-center gap-2 text-[#2d3436]">
                  <ShieldCheck className="w-4 h-4 text-[#ffa502]" />
                  <span>Khóa xác thực GPG: 0x8F3A29B8</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RecessedInput
                  label="HỌ VÀ TÊN // OPERATOR NAME"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={formErrors.name}
                  required
                />
                <RecessedInput
                  label="ĐỊA CHỈ THƯ ĐIỆN TỬ // ELECTRONIC MAIL"
                  type="email"
                  placeholder="nguyenvana@congty.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={formErrors.email}
                  required
                />
              </div>

              <RecessedInput
                label="TIÊU ĐỀ THÔNG ĐIỆP // TRANSMISSION SUBJECT"
                placeholder="Trao đổi cơ hội hợp tác / Dự án phần mềm"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                error={formErrors.subject}
                required
              />

              <RecessedInput
                as="textarea"
                rows={4}
                label="NỘI DUNG YÊU CẦU // PAYLOAD MESSAGE"
                placeholder="Mô tả tóm tắt yêu cầu kỹ thuật hoặc thông tin công việc..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                error={formErrors.message}
                required
              />

              {formStatus.message && (
                <div className={`p-3 rounded-xl font-mono text-xs ${
                  formStatus.state === 'success' 
                    ? 'bg-[#2ed573]/20 text-[#1e824c] border border-[#2ed573]/40' 
                    : formStatus.state === 'error'
                      ? 'bg-[#ff4757]/20 text-[#c0392b] border border-[#ff4757]/40'
                      : 'neu-recessed text-[#4a5568]'
                }`}>
                  {formStatus.message}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <MechanicalButton
                  type="submit"
                  variant="accent"
                  size="lg"
                  icon={Send}
                  disabled={formStatus.state === 'submitting'}
                >
                  {formStatus.state === 'submitting' ? 'ĐANG GỬI // TRANSMITTING...' : 'PHÁT TÍN HIỆU [TRANSMIT]'}
                </MechanicalButton>
              </div>
            </form>
          </div>
        </BoltedCard>
      </section>
    </div>
  )
}
