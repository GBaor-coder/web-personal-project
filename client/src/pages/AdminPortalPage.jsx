import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, Lock, Key, LogIn, LogOut, Plus, Trash2, Edit3, 
  Save, AlertTriangle, CheckCircle, Database, Layers, Link2, 
  BookOpen, Terminal, RefreshCw, Eye
} from 'lucide-react'
import { BoltedCard } from '../components/common/BoltedCard'
import { MechanicalButton } from '../components/common/MechanicalButton'
import { RecessedInput } from '../components/common/RecessedInput'
import { LedIndicator } from '../components/common/LedIndicator'
import { IndustrialBadge } from '../components/common/IndustrialBadge'
import { VentSlots } from '../components/common/VentSlots'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { projectSchema, linkSchema, blogSchema } from '../lib/validations'
import { INITIAL_PROJECTS, INITIAL_LINKS, INITIAL_BLOGS } from '../data/mockData'

export const AdminPortalPage = () => {
  const [session, setSession] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('projects')
  
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [links, setLinks] = useState(INITIAL_LINKS)
  const [blogs, setBlogs] = useState(INITIAL_BLOGS)
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })

  const [newProject, setNewProject] = useState({
    title: '', category: 'Full-Stack', description: '', problem: '', solution: '',
    tech_stack: 'React, Supabase, PostgreSQL', live_url: '', github_url: '', image_url: '',
  })
  const [newLink, setNewLink] = useState({
    title: '', category: 'affiliate', url: '', description: '', badge_text: '', icon_name: 'ShoppingBag',
  })

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

      // Fetch active projects & links from Supabase
      supabase.from('projects').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
        if (!error && data) setProjects(data)
      })

      supabase.from('links').select('*').order('sort_order', { ascending: true }).then(({ data, error }) => {
        if (!error && data) setLinks(data)
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  const handleOAuthLogin = async (provider) => {
    setAuthError('')
    if (!isSupabaseConfigured) {
      setSession({
        user: { email: `admin-${provider}@security-core.dev`, user_metadata: { full_name: 'Lead Architect' } },
      })
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href },
    })
    if (error) setAuthError(error.message)
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    if (!isSupabaseConfigured) {
      setSession({
        user: { email: authEmail || 'admin@security-core.dev', user_metadata: { full_name: 'Admin User' } },
      })
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    })
    if (error) setAuthError(error.message)
  }

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setSession(null)
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    const techArray = newProject.tech_stack.split(',').map(s => s.trim()).filter(Boolean)
    const payload = { ...newProject, tech_stack: techArray }

    const validation = projectSchema.safeParse(payload)
    if (!validation.success) {
      setStatusMessage({ type: 'error', text: validation.error.errors[0]?.message || 'Dữ liệu dự án không hợp lệ' })
      return
    }

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('projects').insert([validation.data]).select()
        if (error) throw error
        setProjects([data[0], ...projects])
      } else {
        const simulated = { ...validation.data, id: `proj-${Date.now()}` }
        setProjects([simulated, ...projects])
      }

      setStatusMessage({ type: 'success', text: 'Đã triển khai thành công bản ghi dự án vào PostgreSQL Database.' })
      setNewProject({
        title: '', category: 'Full-Stack', description: '', problem: '', solution: '',
        tech_stack: 'React, Supabase, PostgreSQL', live_url: '', github_url: '', image_url: '',
      })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  const handleDeleteProject = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi phân hệ dự án này?')) return
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) throw error
      }
      setProjects(projects.filter(p => p.id !== id))
      setStatusMessage({ type: 'success', text: 'Đã xóa bản ghi phân hệ dự án.' })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  const handleAddLink = async (e) => {
    e.preventDefault()
    const validation = linkSchema.safeParse(newLink)
    if (!validation.success) {
      setStatusMessage({ type: 'error', text: validation.error.errors[0]?.message || 'Dữ liệu liên kết không hợp lệ' })
      return
    }

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('links').insert([validation.data]).select()
        if (error) throw error
        setLinks([data[0], ...links])
      } else {
        const simulated = { ...validation.data, id: `link-${Date.now()}`, clicks: 0 }
        setLinks([simulated, ...links])
      }

      setStatusMessage({ type: 'success', text: 'Đã thiết lập khe liên kết tiếp thị thành công.' })
      setNewLink({
        title: '', category: 'affiliate', url: '', description: '', badge_text: '', icon_name: 'ShoppingBag',
      })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  const handleDeleteLink = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên kết này?')) return
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('links').delete().eq('id', id)
        if (error) throw error
      }
      setLinks(links.filter(l => l.id !== id))
      setStatusMessage({ type: 'success', text: 'Đã xóa liên kết tiếp thị.' })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 space-y-8">
      {/* Hidden Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#babecc]/60">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#ff4757]" />
            <span className="text-xs font-mono uppercase text-[#ff4757] font-bold tracking-widest">
              ĐƯỜNG DẪN ẨN // RESTRICTED ADMIN PORTAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2d3436] text-embossed mt-1">
            TRUNG TÂM ĐIỀU PHỐI DỮ LIỆU & BẢO MẬT
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <LedIndicator 
            color={session ? 'green' : 'amber'} 
            label={session ? 'PHIÊN ĐÃ XÁC THỰC // AUTHENTICATED' : 'YÊU CẦU ĐĂNG NHẬP // AUTH REQUIRED'} 
            pulse={Boolean(session)}
          />
        </div>
      </div>

      {/* Security Layer Specs & RLS Protection Alert */}
      <div className="p-4 rounded-2xl neu-panel border border-[#2ed573]/30 flex flex-col sm:flex-row items-start gap-3 shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff]">
        <div className="p-2 rounded-xl neu-recessed text-[#2ed573] shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="text-xs text-[#4a5568] space-y-1">
          <p className="font-bold text-[#2d3436] font-mono uppercase tracking-wide">
            CƠ CHẾ PHÒNG THỦ RLS: TỐI ĐA (CHẶN TOÀN BỘ INSERT/UPDATE/DELETE TỪ ANON KEY)
          </p>
          <p>
            Ngay cả khi Supabase Anon Key bị lộ ra trên trình duyệt, chỉ tài khoản Admin có chữ ký JWT hợp lệ và khớp email quản trị mới có quyền thực thi <code className="bg-[#d1d9e6] px-1 py-0.5 rounded font-mono">INSERT</code>, <code className="bg-[#d1d9e6] px-1 py-0.5 rounded font-mono">UPDATE</code> hoặc <code className="bg-[#d1d9e6] px-1 py-0.5 rounded font-mono">DELETE</code>.
          </p>
        </div>
      </div>

      {/* LOGIN VIEW (If not logged in) */}
      {!session ? (
        <div className="max-w-md mx-auto">
          <BoltedCard elevation="floating" showVents title="CỔNG XÁC THỰC QUẢN TRỊ" subtitle="AUTHENTICATION GATEWAY">
            <form onSubmit={handleEmailAuth} className="space-y-4 pt-2">
              <RecessedInput
                label="THƯ ĐIỆN TỬ QUẢN TRỊ // ADMIN EMAIL"
                type="email"
                placeholder="admin@security-core.dev"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />

              <RecessedInput
                label="MÃ MẬT KHẨU HOẶC TOKEN // PASSWORD / TOKEN"
                type="password"
                placeholder="••••••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />

              {authError && (
                <div className="p-3 rounded-xl bg-[#ff4757]/20 text-[#c0392b] text-xs font-mono border border-[#ff4757]/40">
                  {authError}
                </div>
              )}

              <MechanicalButton
                type="submit"
                variant="accent"
                size="md"
                icon={LogIn}
                className="w-full"
              >
                XÁC THỰC PHIÊN LÀM VIỆC [AUTHENTICATE]
              </MechanicalButton>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#babecc]"></div>
                <span className="flex-shrink mx-4 text-[10px] font-mono uppercase text-[#8892a4]">HOẶC ĐĂNG NHẬP XÃ HỘI (OAUTH)</span>
                <div className="flex-grow border-t border-[#babecc]"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MechanicalButton
                  type="button"
                  variant="panel"
                  size="sm"
                  onClick={() => handleOAuthLogin('github')}
                >
                  GITHUB AUTH
                </MechanicalButton>
                <MechanicalButton
                  type="button"
                  variant="panel"
                  size="sm"
                  onClick={() => handleOAuthLogin('google')}
                >
                  GOOGLE AUTH
                </MechanicalButton>
              </div>

              {!isSupabaseConfigured && (
                <p className="text-[10px] font-mono text-center text-[#8892a4] pt-2">
                  [CHẾ ĐỘ MÔ PHỎNG: Bấm Xác thực để vào trang quản trị xem thử]
                </p>
              )}
            </form>
          </BoltedCard>
        </div>
      ) : (
        /* LOGGED IN DASHBOARD */
        <div className="space-y-6">
          {/* Operator Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl neu-panel shadow-[6px_6px_12px_#babecc,-6px_-6px_12px_#ffffff]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl neu-recessed text-[#2ed573]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-[#8892a4]">MÃ ĐỊNH DANH QUẢN TRỊ VIÊN // OPERATOR ID:</span>
                <p className="text-sm font-bold font-mono text-[#2d3436]">{session.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl neu-recessed">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeTab === 'projects' ? 'neu-button text-[#ff4757]' : 'text-[#4a5568]'
                  }`}
                >
                  DỰ ÁN // PROJECTS ({projects.length})
                </button>
                <button
                  onClick={() => setActiveTab('links')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeTab === 'links' ? 'neu-button text-[#ff4757]' : 'text-[#4a5568]'
                  }`}
                >
                  LIÊN KẾT // LINKS ({links.length})
                </button>
              </div>

              <MechanicalButton
                variant="recessed"
                size="sm"
                icon={LogOut}
                onClick={handleSignOut}
              >
                ĐĂNG XUẤT [LOG OUT]
              </MechanicalButton>
            </div>
          </div>

          {/* Alert Status Feedback */}
          {statusMessage.text && (
            <div className={`p-3 rounded-xl font-mono text-xs flex items-center justify-between ${
              statusMessage.type === 'success' 
                ? 'bg-[#2ed573]/20 text-[#1e824c] border border-[#2ed573]/40' 
                : 'bg-[#ff4757]/20 text-[#c0392b] border border-[#ff4757]/40'
            }`}>
              <span>{statusMessage.text}</span>
              <button onClick={() => setStatusMessage({ type: '', text: '' })} className="text-xs font-bold">✕</button>
            </div>
          )}

          {/* TAB 1: PROJECTS CRUD */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Add New Project Form */}
              <div className="lg:col-span-5">
                <BoltedCard elevation="base" showVents title="THÊM DỰ ÁN MỚI" subtitle="ZOD-VALIDATED ENTITY">
                  <form onSubmit={handleAddProject} className="space-y-3 pt-2">
                    <RecessedInput
                      label="TIÊU ĐỀ DỰ ÁN // TITLE"
                      placeholder="Ví dụ: Mạng Cảm Biến & Đo Lường Từ Xa"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      required
                    />
                    <RecessedInput
                      label="DANH MỤC // CATEGORY"
                      placeholder="Ví dụ: Full-Stack / IoT"
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      required
                    />
                    <RecessedInput
                      as="textarea"
                      rows={2}
                      label="MÔ TẢ TÓM TẮT // BRIEF SUMMARY"
                      placeholder="Đường ống tổng hợp chuỗi thời gian..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      required
                    />
                    <RecessedInput
                      as="textarea"
                      rows={2}
                      label="BÀI TOÁN & ĐIỂM NGHẼN // PROBLEM STATEMENT"
                      placeholder="Hạ tầng cũ chịu độ trễ 12 giây..."
                      value={newProject.problem}
                      onChange={(e) => setNewProject({ ...newProject, problem: e.target.value })}
                      required
                    />
                    <RecessedInput
                      as="textarea"
                      rows={2}
                      label="GIẢI PHÁP KIẾN TRÚC // ARCHITECTURAL SOLUTION"
                      placeholder="Phát triển động cơ CDC trên Go và Supabase..."
                      value={newProject.solution}
                      onChange={(e) => setNewProject({ ...newProject, solution: e.target.value })}
                      required
                    />
                    <RecessedInput
                      label="CÔNG NGHỆ (CÁCH NHAU BẰNG DẤU PHẨY) // TECH STACK"
                      placeholder="React, Supabase, Go, PostgreSQL"
                      value={newProject.tech_stack}
                      onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                      required
                    />
                    <RecessedInput
                      label="ĐƯỜNG DẪN LIVE DEMO URL"
                      placeholder="https://demo.example.com"
                      value={newProject.live_url}
                      onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                    />
                    <RecessedInput
                      label="ĐƯỜNG DẪN GITHUB REPOSITORY"
                      placeholder="https://github.com/example/repo"
                      value={newProject.github_url}
                      onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                    />

                    <div className="pt-2">
                      <MechanicalButton
                        type="submit"
                        variant="accent"
                        size="md"
                        icon={Plus}
                        className="w-full"
                      >
                        LƯU DỰ ÁN VÀO POSTGRESQL
                      </MechanicalButton>
                    </div>
                  </form>
                </BoltedCard>
              </div>

              {/* Existing Projects Inventory */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase text-[#4a5568] font-bold tracking-wider block">
                  CÁC BẢN GHI DỰ ÁN HIỆN CÓ // ACTIVE RECORDS ({projects.length})
                </span>

                {projects.map((proj) => (
                  <BoltedCard key={proj.id} elevation="base" className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <IndustrialBadge variant="tape">{proj.category}</IndustrialBadge>
                        <h4 className="text-base font-bold text-[#2d3436] mt-1">{proj.title}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 rounded-lg neu-button text-[#ff4757] hover:bg-[#ff4757]/10"
                        title="Xóa bản ghi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#4a5568] line-clamp-2">{proj.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {proj.tech_stack?.map((t) => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded neu-recessed text-[#2d3436]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </BoltedCard>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AFFILIATE LINKS CRUD */}
          {activeTab === 'links' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Add New Affiliate Link */}
              <div className="lg:col-span-5">
                <BoltedCard elevation="base" showVents title="THÊM KHE LIÊN KẾT MỚI" subtitle="AFFILIATE PROVISIONING">
                  <form onSubmit={handleAddLink} className="space-y-3 pt-2">
                    <RecessedInput
                      label="TIÊU ĐỀ LIÊN KẾT // LINK TITLE"
                      placeholder="Ví dụ: Bàn Phím Cơ Tùy Biến 65%"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      required
                    />
                    <RecessedInput
                      as="select"
                      label="DANH MỤC // CATEGORY"
                      value={newLink.category}
                      onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                    >
                      <option value="gear">Thiết Bị Công Nghệ (Tech Gear)</option>
                      <option value="course">Khóa Học (Courses)</option>
                      <option value="affiliate">Phần Cứng / Vật Phẩm (Hardware)</option>
                      <option value="social">Kênh Mạng Xã Hội (Social)</option>
                    </RecessedInput>
                    <RecessedInput
                      label="ĐƯỜNG DẪN ĐÍCH KÈM MÃ TIẾP THỊ // URL"
                      placeholder="https://amazon.com/dp/...?tag=mycreator-20"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      required
                    />
                    <RecessedInput
                      label="MÔ TẢ THÔNG SỐ // SPECS DESCRIPTION"
                      placeholder="Vỏ nhôm CNC nguyên khối, Gateron Oil Kings..."
                      value={newLink.description}
                      onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    />
                    <RecessedInput
                      label="NHÃN NỔI BẬT // BADGE TEXT"
                      placeholder="THIẾT BỊ PRO // 15% OFF"
                      value={newLink.badge_text}
                      onChange={(e) => setNewLink({ ...newLink, badge_text: e.target.value })}
                    />

                    <div className="pt-2">
                      <MechanicalButton
                        type="submit"
                        variant="accent"
                        size="md"
                        icon={Plus}
                        className="w-full"
                      >
                        LƯU KHE LIÊN KẾT
                      </MechanicalButton>
                    </div>
                  </form>
                </BoltedCard>
              </div>

              {/* Existing Links List */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase text-[#4a5568] font-bold tracking-wider block">
                  CÁC LIÊN KẾT ĐANG HOẠT ĐỘNG // ACTIVE SLOTS ({links.length})
                </span>

                {links.map((lnk) => (
                  <BoltedCard key={lnk.id} elevation="base">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#2d3436] truncate">{lnk.title}</h4>
                          {lnk.badge_text && (
                            <IndustrialBadge variant="orange" className="text-[9px] py-0">
                              {lnk.badge_text}
                            </IndustrialBadge>
                          )}
                        </div>
                        <p className="text-xs text-[#8892a4] truncate font-mono">{lnk.url}</p>
                        <span className="text-[10px] font-mono text-[#ff4757] uppercase">{lnk.clicks || 0} LƯỢT CLICK</span>
                      </div>

                      <button
                        onClick={() => handleDeleteLink(lnk.id)}
                        className="p-2 rounded-lg neu-button text-[#ff4757] hover:bg-[#ff4757]/10"
                        title="Xóa liên kết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </BoltedCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
