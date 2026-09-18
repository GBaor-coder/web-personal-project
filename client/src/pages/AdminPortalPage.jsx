import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Lock, LogIn, LogOut, Database, Layers, Link2,
  BookOpen, Mail, Trash2, Edit3, Eye, EyeOff, RefreshCw,
  CheckCircle, AlertTriangle, Inbox, MailOpen
} from 'lucide-react'
import { BoltedCard } from '../components/common/BoltedCard'
import { MechanicalButton } from '../components/common/MechanicalButton'
import { RecessedInput } from '../components/common/RecessedInput'
import { LedIndicator } from '../components/common/LedIndicator'
import { IndustrialBadge } from '../components/common/IndustrialBadge'
import { ScrewHead } from '../components/common/ScrewHead'
import { VentSlots } from '../components/common/VentSlots'
import { AdminGuard } from '../components/admin/AdminGuard'
import { ProjectForm } from '../components/admin/ProjectForm'
import { BlogForm } from '../components/admin/BlogForm'
import { LinkForm } from '../components/admin/LinkForm'
import { ToastContainer, useToast } from '../components/admin/Toast'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ─── Tab definition ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'projects', label: 'DỰ ÁN', sublabel: 'PROJECTS', icon: Layers },
  { id: 'blogs', label: 'BÀI VIẾT', sublabel: 'BLOGS', icon: BookOpen },
  { id: 'links', label: 'LIÊN KẾT', sublabel: 'LINKS', icon: Link2 },
  { id: 'messages', label: 'TIN NHẮN', sublabel: 'MESSAGES', icon: Mail },
]

// ─── Confirm delete dialog ─────────────────────────────────────────────────────
const ConfirmDelete = ({ label, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-sm w-full p-6 rounded-2xl neu-floating space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#ff4757]/20 text-[#ff4757]">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold font-mono text-[#2d3436] uppercase tracking-wide">
            XÁC NHẬN XÓA // CONFIRM DELETE
          </p>
          <p className="text-xs text-[#4a5568]">{label}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <MechanicalButton variant="accent" size="sm" className="flex-1" onClick={onConfirm}>
          XÓA [DELETE]
        </MechanicalButton>
        <MechanicalButton variant="recessed" size="sm" className="flex-1" onClick={onCancel}>
          HỦY [CANCEL]
        </MechanicalButton>
      </div>
    </motion.div>
  </div>
)

// ─── Record card component ─────────────────────────────────────────────────────
const RecordCard = ({ children, onEdit, onDelete, editLabel = 'SỬA', deleteLabel = 'XÓA' }) => (
  <BoltedCard elevation="base" className="space-y-2">
    {children}
    <div className="flex gap-2 pt-1">
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-2 py-1 rounded-lg neu-button text-[10px] font-mono text-[#4a5568] hover:text-[#2d3436]"
        >
          <Edit3 className="w-3 h-3" />
          {editLabel}
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-2 py-1 rounded-lg neu-button text-[10px] font-mono text-[#ff4757] hover:bg-[#ff4757]/10"
        >
          <Trash2 className="w-3 h-3" />
          {deleteLabel}
        </button>
      )}
    </div>
  </BoltedCard>
)

// ─── Main AdminPortalPage ──────────────────────────────────────────────────────
export const AdminPortalPage = () => {
  const navigate = useNavigate()
  const { toasts, toast, dismissToast } = useToast()

  // Auth state
  const [session, setSession] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState('projects')
  const [confirmDelete, setConfirmDelete] = useState(null) // { type, id, label }
  const [saving, setSaving] = useState(false)

  // Data state
  const [projects, setProjects] = useState([])
  const [blogs, setBlogs] = useState([])
  const [links, setLinks] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  // Inline editing state
  const [editingProject, setEditingProject] = useState(null)
  const [editingBlog, setEditingBlog] = useState(null)
  const [editingLink, setEditingLink] = useState(null)

  // ── Auth lifecycle ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch all data when session is established ──────────────────────────────
  const fetchAllData = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setLoading(true)
    try {
      const [pRes, bRes, lRes, mRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('blogs').select('*').order('created_at', { ascending: false }),
        supabase.from('links').select('*').order('sort_order', { ascending: true }),
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
      ])
      if (!pRes.error && pRes.data) setProjects(pRes.data)
      if (!bRes.error && bRes.data) setBlogs(bRes.data)
      if (!lRes.error && lRes.data) setLinks(lRes.data)
      if (!mRes.error && mRes.data) setMessages(mRes.data)
    } catch (err) {
      toast.error(`Lỗi tải dữ liệu: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) fetchAllData()
  }, [session, fetchAllData])

  // ── Auth handlers ───────────────────────────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    if (!isSupabaseConfigured) {
      // Simulation mode
      setSession({
        user: {
          email: authEmail || 'admin@security-core.dev',
          user_metadata: { full_name: 'Admin User' },
          app_metadata: { role: 'admin' },
        },
      })
      setAuthLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    // 1. Terminate the session on the backend
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        // Continue with local cleanup even if the backend call fails
        console.warn('Supabase signOut failed, proceeding with local wipe:', err.message)
      }
    }

    // 2. Storage wipe — purge all Supabase auth tokens, JWTs, and admin keys
    const wipeStorage = (storage) => {
      const keysToRemove = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (!key) continue
        // Match Supabase auth keys (sb-*, supabase-*, auth-*, jwt, token, session)
        if (
          key.startsWith('sb-') ||
          key.startsWith('supabase') ||
          key.startsWith('auth-') ||
          /jwt|token|session/i.test(key)
        ) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((k) => storage.removeItem(k))
    }
    wipeStorage(localStorage)
    wipeStorage(sessionStorage)

    // 3. State reset — clear all in-memory admin session and data
    setSession(null)
    setAuthEmail('')
    setAuthPassword('')
    setAuthError('')
    setProjects([])
    setBlogs([])
    setLinks([])
    setMessages([])
    setEditingProject(null)
    setEditingBlog(null)
    setEditingLink(null)
    setConfirmDelete(null)
    setActiveTab('projects')

    // 4. Redirect with replace: true to block back-navigation to cached admin view
    navigate('/', { replace: true })
  }

  // ── Generic delete handler ──────────────────────────────────────────────────
  const handleDelete = async (table, id, onSuccess) => {
    setSaving(true)
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from(table).delete().eq('id', id)
        if (error) throw error
      }
      onSuccess()
      toast.success(`Đã xóa bản ghi thành công.`)
    } catch (err) {
      toast.error(`Lỗi xóa: ${err.message}`)
    } finally {
      setSaving(false)
      setConfirmDelete(null)
    }
  }

  // ── PROJECT CRUD ────────────────────────────────────────────────────────────
  const handleSaveProject = async (data, isEdit) => {
    setSaving(true)
    try {
      if (isSupabaseConfigured) {
        if (isEdit) {
          const { data: updated, error } = await supabase
            .from('projects').update(data).eq('id', editingProject.id).select()
          if (error) throw error
          setProjects((p) => p.map((x) => x.id === editingProject.id ? updated[0] : x))
        } else {
          const { data: inserted, error } = await supabase
            .from('projects').insert([data]).select()
          if (error) throw error
          setProjects((p) => [inserted[0], ...p])
        }
      } else {
        if (isEdit) {
          setProjects((p) => p.map((x) => x.id === editingProject.id ? { ...x, ...data } : x))
        } else {
          setProjects((p) => [{ ...data, id: `proj-${Date.now()}` }, ...p])
        }
      }
      toast.success(isEdit ? 'Đã cập nhật dự án thành công.' : 'Đã lưu dự án vào PostgreSQL.')
      setEditingProject(null)
    } catch (err) {
      toast.error(`Lỗi lưu dự án: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ── BLOG CRUD ───────────────────────────────────────────────────────────────
  const handleSaveBlog = async (data, isEdit) => {
    setSaving(true)
    try {
      if (isSupabaseConfigured) {
        if (isEdit) {
          const { data: updated, error } = await supabase
            .from('blogs').update(data).eq('id', editingBlog.id).select()
          if (error) throw error
          setBlogs((b) => b.map((x) => x.id === editingBlog.id ? updated[0] : x))
        } else {
          const { data: inserted, error } = await supabase
            .from('blogs').insert([data]).select()
          if (error) throw error
          setBlogs((b) => [inserted[0], ...b])
        }
      } else {
        if (isEdit) {
          setBlogs((b) => b.map((x) => x.id === editingBlog.id ? { ...x, ...data } : x))
        } else {
          setBlogs((b) => [{ ...data, id: `blog-${Date.now()}` }, ...b])
        }
      }
      toast.success(isEdit ? 'Đã cập nhật bài viết thành công.' : 'Đã xuất bản bài viết.')
      setEditingBlog(null)
    } catch (err) {
      toast.error(`Lỗi lưu blog: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ── LINK CRUD ───────────────────────────────────────────────────────────────
  const handleSaveLink = async (data, isEdit) => {
    setSaving(true)
    try {
      // Final safety-net: ensure image_url is null not '' before hitting PostgREST
      const payload = {
        ...data,
        image_url: data.image_url === '' ? null : data.image_url,
      }
      console.log('Supabase PATCH Payload:', payload)

      if (isSupabaseConfigured) {
        if (isEdit) {
          const { data: updated, error } = await supabase
            .from('links').update(payload).eq('id', editingLink.id).select()
          if (error) throw error
          setLinks((l) => l.map((x) => x.id === editingLink.id ? updated[0] : x))
        } else {
          const { data: inserted, error } = await supabase
            .from('links').insert([payload]).select()
          if (error) throw error
          setLinks((l) => [...l, inserted[0]])
        }
      } else {
        if (isEdit) {
          setLinks((l) => l.map((x) => x.id === editingLink.id ? { ...x, ...payload } : x))
        } else {
          setLinks((l) => [...l, { ...payload, id: `link-${Date.now()}`, clicks: 0 }])
        }
      }
      toast.success(isEdit ? 'Đã cập nhật liên kết.' : 'Đã thiết lập khe liên kết tiếp thị.')
      setEditingLink(null)
    } catch (err) {
      toast.error(`Lỗi lưu liên kết: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ── MESSAGES: mark read + delete ────────────────────────────────────────────
  const handleMarkRead = async (msg) => {
    const newRead = !msg.read
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('messages').update({ read: newRead }).eq('id', msg.id)
        if (error) throw error
      }
      setMessages((m) => m.map((x) => x.id === msg.id ? { ...x, read: newRead } : x))
      toast.info(newRead ? 'Đã đánh dấu đã đọc.' : 'Đã đánh dấu chưa đọc.')
    } catch (err) {
      toast.error(`Lỗi: ${err.message}`)
    }
  }

  // ── Toggle link visibility shortcut ────────────────────────────────────────
  const handleToggleLinkActive = async (lnk) => {
    const newActive = !lnk.is_active
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('links').update({ is_active: newActive }).eq('id', lnk.id)
        if (error) throw error
      }
      setLinks((l) => l.map((x) => x.id === lnk.id ? { ...x, is_active: newActive } : x))
      toast.info(newActive ? `"${lnk.title}" đã được kích hoạt.` : `"${lnk.title}" đã bị ẩn.`)
    } catch (err) {
      toast.error(`Lỗi: ${err.message}`)
    }
  }

  // ── Toggle blog publish ─────────────────────────────────────────────────────
  const handleToggleBlogPublish = async (blog) => {
    const newPub = !blog.published
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('blogs').update({ published: newPub }).eq('id', blog.id)
        if (error) throw error
      }
      setBlogs((b) => b.map((x) => x.id === blog.id ? { ...x, published: newPub } : x))
      toast.info(newPub ? `"${blog.title}" đã được xuất bản.` : `"${blog.title}" chuyển về nháp.`)
    } catch (err) {
      toast.error(`Lỗi: ${err.message}`)
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{ background: 'var(--bg-chassis)' }}>

        {/* Decorative corner screws */}
        <div className="fixed top-4 left-4 opacity-40"><ScrewHead variant="cross" /></div>
        <div className="fixed top-4 right-4 opacity-40"><ScrewHead variant="cross" /></div>
        <div className="fixed bottom-4 left-4 opacity-40"><ScrewHead /></div>
        <div className="fixed bottom-4 right-4 opacity-40"><ScrewHead /></div>

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Security warning header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neu-recessed mb-3">
              <div className="led-indicator led-orange" />
              <span className="text-[10px] font-mono uppercase text-[#ff4757] tracking-widest font-bold">
                ĐƯỜNG DẪN ẨN // RESTRICTED ZONE
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-embossed">
              CỔNG QUẢN TRỊ BẢO MẬT
            </h1>
            <p className="text-xs font-mono text-[#8892a4] mt-1">
              ADMIN CONTROL CENTER · AUTHENTICATION REQUIRED
            </p>
          </div>

          <BoltedCard elevation="floating" showVents title="XÁC THỰC PHIÊN LÀM VIỆC" subtitle="SESSION AUTHENTICATION">
            <form onSubmit={handleEmailAuth} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl neu-recessed border border-[#2ed573]/30 flex items-start gap-2">
                <Lock className="w-4 h-4 text-[#2ed573] shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-[#4a5568] leading-relaxed">
                  Chỉ tài khoản Admin có JWT hợp lệ mới được phép vào khu vực này.
                  RLS PostgreSQL sẽ chặn tất cả thao tác trái phép.
                </p>
              </div>

              <RecessedInput
                label="THƯ ĐIỆN TỬ QUẢN TRỊ // ADMIN EMAIL"
                type="email"
                placeholder="admin@security-core.dev"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />

              <RecessedInput
                label="MẬT KHẨU // PASSWORD"
                type="password"
                placeholder="••••••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />

              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#ff4757]/15 border border-[#ff4757]/40">
                  <AlertTriangle className="w-4 h-4 text-[#ff4757] shrink-0" />
                  <p className="text-xs font-mono text-[#c0392b]">{authError}</p>
                </div>
              )}

              <MechanicalButton
                type="submit"
                variant="accent"
                size="md"
                icon={authLoading ? RefreshCw : LogIn}
                className="w-full"
                disabled={authLoading}
              >
                {authLoading ? 'ĐANG XÁC THỰC...' : 'XÁC THỰC PHIÊN [AUTHENTICATE]'}
              </MechanicalButton>

              {!isSupabaseConfigured && (
                <p className="text-[10px] font-mono text-center text-[#8892a4]">
                  [CHẾ ĐỘ MÔ PHỎNG: Nhập bất kỳ email/mật khẩu để vào xem thử]
                </p>
              )}
            </form>
          </BoltedCard>
        </motion.div>

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: DASHBOARD (wrapped in AdminGuard)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <AdminGuard session={session}>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-chassis)' }}>

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 px-4 py-3 neu-panel border-b border-[#babecc]/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Identity */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl neu-recessed text-[#2ed573]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-[#8892a4] uppercase tracking-widest">
                  TRUNG TÂM ĐIỀU PHỐI DỮ LIỆU
                </p>
                <p className="text-xs font-bold font-mono text-[#2d3436]">
                  {session.user?.email}
                </p>
              </div>
              <LedIndicator color="green" label="AUTHENTICATED" pulse />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="p-2 rounded-lg neu-button text-[#4a5568] hover:text-[#2d3436] disabled:opacity-50"
                title="Tải lại dữ liệu"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <MechanicalButton variant="recessed" size="sm" icon={LogOut} onClick={handleSignOut}>
                ĐĂNG XUẤT
              </MechanicalButton>
            </div>
          </div>
        </header>

        {/* ── Tab Navigation ───────────────────────────────────────────────── */}
        <nav className="px-4 pt-4">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl neu-recessed">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const badge = tab.id === 'messages' && unreadCount > 0 ? unreadCount : null
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold
                      transition-all duration-150
                      ${isActive ? 'neu-button text-[#ff4757]' : 'text-[#4a5568] hover:text-[#2d3436]'}
                    `}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="hidden lg:inline text-[8px] text-[#8892a4]">// {tab.sublabel}</span>
                    {badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff4757] text-white text-[8px] font-bold flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 px-4 pb-8 pt-4">
          <div className="max-w-7xl mx-auto">

            {/* ════════════════ TAB: PROJECTS ════════════════ */}
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Form column */}
                <div className="xl:col-span-5">
                  <BoltedCard elevation="base" showVents
                    title={editingProject ? 'SỬA DỰ ÁN' : 'THÊM DỰ ÁN MỚI'}
                    subtitle={editingProject ? 'INLINE EDIT MODE' : 'ZOD-VALIDATED INSERT'}>
                    <div className="pt-2">
                      <ProjectForm
                        editingItem={editingProject}
                        onSave={handleSaveProject}
                        onCancel={() => setEditingProject(null)}
                        saving={saving}
                      />
                    </div>
                  </BoltedCard>
                </div>

                {/* List column */}
                <div className="xl:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#4a5568] font-bold tracking-wider">
                      BẢN GHI DỰ ÁN // ACTIVE RECORDS ({projects.length})
                    </span>
                    {loading && <RefreshCw className="w-3 h-3 animate-spin text-[#8892a4]" />}
                  </div>

                  {projects.length === 0 && !loading && (
                    <div className="text-center py-12 text-[#8892a4] text-xs font-mono">
                      KHÔNG CÓ DỰ ÁN NÀO // NO PROJECTS FOUND
                    </div>
                  )}

                  <AnimatePresence>
                    {projects.map((proj) => (
                      <motion.div key={proj.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <RecordCard
                          onEdit={() => { setEditingProject(proj); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          onDelete={() => setConfirmDelete({
                            type: 'projects', id: proj.id,
                            label: `"${proj.title}" sẽ bị xóa vĩnh viễn khỏi database.`
                          })}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <IndustrialBadge variant="tape">{proj.category}</IndustrialBadge>
                                {proj.featured && (
                                  <IndustrialBadge variant="orange">★ FEATURED</IndustrialBadge>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-[#2d3436] mt-1 leading-tight">{proj.title}</h4>
                              <p className="text-[10px] text-[#4a5568] mt-0.5 line-clamp-2">{proj.description}</p>
                            </div>
                            {proj.image_url && (
                              <img src={proj.image_url} alt=""
                                className="w-14 h-10 object-cover rounded-lg shrink-0 neu-recessed"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {proj.tech_stack?.slice(0, 5).map((t) => (
                              <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded neu-recessed text-[#2d3436]">{t}</span>
                            ))}
                            {proj.tech_stack?.length > 5 && (
                              <span className="text-[9px] font-mono text-[#8892a4]">+{proj.tech_stack.length - 5} more</span>
                            )}
                          </div>
                        </RecordCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ════════════════ TAB: BLOGS ════════════════ */}
            {activeTab === 'blogs' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Form column */}
                <div className="xl:col-span-5">
                  <BoltedCard elevation="base" showVents
                    title={editingBlog ? 'SỬA BÀI VIẾT' : 'VIẾT BÀI MỚI'}
                    subtitle={editingBlog ? 'INLINE EDIT MODE' : 'ZOD-VALIDATED INSERT'}>
                    <div className="pt-2">
                      <BlogForm
                        editingItem={editingBlog}
                        onSave={handleSaveBlog}
                        onCancel={() => setEditingBlog(null)}
                        saving={saving}
                      />
                    </div>
                  </BoltedCard>
                </div>

                {/* List column */}
                <div className="xl:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#4a5568] font-bold tracking-wider">
                      BÀI VIẾT // BLOG POSTS ({blogs.length})
                    </span>
                    {loading && <RefreshCw className="w-3 h-3 animate-spin text-[#8892a4]" />}
                  </div>

                  {blogs.length === 0 && !loading && (
                    <div className="text-center py-12 text-[#8892a4] text-xs font-mono">
                      CHƯA CÓ BÀI VIẾT NÀO // NO POSTS FOUND
                    </div>
                  )}

                  <AnimatePresence>
                    {blogs.map((blog) => (
                      <motion.div key={blog.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <RecordCard
                          onEdit={() => { setEditingBlog(blog); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          onDelete={() => setConfirmDelete({
                            type: 'blogs', id: blog.id,
                            label: `"${blog.title}" sẽ bị xóa vĩnh viễn.`
                          })}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                  blog.published
                                    ? 'bg-[#2ed573]/20 text-[#1e824c]'
                                    : 'bg-[#ffa502]/20 text-[#b7740a]'
                                }`}>
                                  {blog.published ? '● PUBLISHED' : '○ DRAFT'}
                                </span>
                                {blog.read_time && (
                                  <span className="text-[9px] font-mono text-[#8892a4]">{blog.read_time}</span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-[#2d3436] mt-1 leading-tight line-clamp-1">{blog.title}</h4>
                              <p className="text-[9px] font-mono text-[#8892a4]">/{blog.slug}</p>
                              <p className="text-[10px] text-[#4a5568] mt-0.5 line-clamp-2">{blog.summary}</p>
                            </div>
                            {blog.thumbnail_url && (
                              <img src={blog.thumbnail_url} alt=""
                                className="w-14 h-10 object-cover rounded-lg shrink-0 neu-recessed"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {blog.tags?.slice(0, 4).map((t) => (
                              <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded neu-recessed text-[#2d3436]">{t}</span>
                            ))}
                          </div>
                          {/* Quick publish toggle */}
                          <button
                            onClick={() => handleToggleBlogPublish(blog)}
                            className={`flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full transition-all ${
                              blog.published
                                ? 'text-[#b7740a] hover:bg-[#ffa502]/20'
                                : 'text-[#1e824c] hover:bg-[#2ed573]/20'
                            }`}
                          >
                            {blog.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {blog.published ? 'Chuyển về Nháp' : 'Xuất Bản Ngay'}
                          </button>
                        </RecordCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ════════════════ TAB: LINKS ════════════════ */}
            {activeTab === 'links' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Form column */}
                <div className="xl:col-span-5">
                  <BoltedCard elevation="base" showVents
                    title={editingLink ? 'SỬA LIÊN KẾT' : 'THÊM KHE LIÊN KẾT MỚI'}
                    subtitle={editingLink ? 'INLINE EDIT MODE' : 'AFFILIATE PROVISIONING'}>
                    <div className="pt-2">
                      <LinkForm
                        editingItem={editingLink}
                        onSave={handleSaveLink}
                        onCancel={() => setEditingLink(null)}
                        saving={saving}
                      />
                    </div>
                  </BoltedCard>
                </div>

                {/* List column */}
                <div className="xl:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#4a5568] font-bold tracking-wider">
                      CÁC KHE LIÊN KẾT // LINK SLOTS ({links.length})
                    </span>
                    {loading && <RefreshCw className="w-3 h-3 animate-spin text-[#8892a4]" />}
                  </div>

                  {links.length === 0 && !loading && (
                    <div className="text-center py-12 text-[#8892a4] text-xs font-mono">
                      CHƯA CÓ LIÊN KẾT NÀO // NO LINKS CONFIGURED
                    </div>
                  )}

                  <AnimatePresence>
                    {links.map((lnk) => (
                      <motion.div key={lnk.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <RecordCard
                          onEdit={() => { setEditingLink(lnk); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          onDelete={() => setConfirmDelete({
                            type: 'links', id: lnk.id,
                            label: `Khe liên kết "${lnk.title}" sẽ bị xóa.`
                          })}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-[#2d3436] truncate">{lnk.title}</h4>
                                {lnk.badge_text && (
                                  <IndustrialBadge variant="orange" className="text-[8px]">
                                    {lnk.badge_text}
                                  </IndustrialBadge>
                                )}
                              </div>
                              <p className="text-[9px] font-mono text-[#8892a4] truncate mt-0.5">{lnk.url}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[9px] font-mono text-[#ff4757]">{lnk.clicks || 0} CLICKS</span>
                                <span className="text-[9px] font-mono text-[#4a5568] uppercase">{lnk.category}</span>
                                <span className="text-[9px] font-mono text-[#4a5568]">icon: {lnk.icon_name}</span>
                              </div>
                            </div>
                            {/* Quick active toggle */}
                            <button
                              onClick={() => handleToggleLinkActive(lnk)}
                              className={`p-1.5 rounded-lg neu-button transition-all ${
                                lnk.is_active ? 'text-[#2ed573]' : 'text-[#8892a4]'
                              }`}
                              title={lnk.is_active ? 'Đang hiển thị — Click để ẩn' : 'Đang ẩn — Click để hiển thị'}
                            >
                              {lnk.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </RecordCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ════════════════ TAB: MESSAGES ════════════════ */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase text-[#4a5568] font-bold tracking-wider">
                      TIN NHẮN LIÊN HỆ // CONTACT MESSAGES ({messages.length})
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#ff4757] text-white text-[9px] font-mono font-bold">
                        {unreadCount} CHƯA ĐỌC
                      </span>
                    )}
                  </div>
                  {loading && <RefreshCw className="w-3 h-3 animate-spin text-[#8892a4]" />}
                </div>

                {messages.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <Inbox className="w-10 h-10 text-[#babecc] mx-auto mb-3" />
                    <p className="text-[#8892a4] text-xs font-mono">CHƯA CÓ TIN NHẮN NÀO // INBOX EMPTY</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div key={msg.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <BoltedCard elevation="base" className={`space-y-3 transition-all ${
                          !msg.read ? 'border border-[#ff4757]/30' : 'opacity-80'
                        }`}>
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                {!msg.read
                                  ? <div className="w-2 h-2 rounded-full bg-[#ff4757] shrink-0" />
                                  : <div className="w-2 h-2 rounded-full bg-[#babecc] shrink-0" />
                                }
                                <h4 className="text-sm font-bold text-[#2d3436]">{msg.name}</h4>
                              </div>
                              <p className="text-[10px] font-mono text-[#8892a4] ml-4">{msg.email}</p>
                            </div>
                            <span className="text-[9px] font-mono text-[#8892a4] shrink-0">
                              {new Date(msg.created_at).toLocaleDateString('vi-VN', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Subject */}
                          <div className="px-2 py-1.5 rounded-lg neu-recessed">
                            <p className="text-[10px] font-mono text-[#4a5568] uppercase tracking-wide font-bold">
                              CHỦ ĐỀ: {msg.subject}
                            </p>
                          </div>

                          {/* Message body */}
                          <p className="text-xs text-[#4a5568] leading-relaxed line-clamp-4">
                            {msg.message}
                          </p>

                          {/* Actions */}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleMarkRead(msg)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg neu-button text-[10px] font-mono ${
                                msg.read ? 'text-[#4a5568]' : 'text-[#2ed573]'
                              }`}
                            >
                              {msg.read
                                ? <><MailOpen className="w-3 h-3" /> ĐÁNH DẤU CHƯA ĐỌC</>
                                : <><CheckCircle className="w-3 h-3" /> ĐÁNH DẤU ĐÃ ĐỌC</>
                              }
                            </button>
                            <button
                              onClick={() => setConfirmDelete({
                                type: 'messages', id: msg.id,
                                label: `Tin nhắn từ "${msg.name}" sẽ bị xóa vĩnh viễn.`
                              })}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg neu-button text-[10px] font-mono text-[#ff4757]"
                            >
                              <Trash2 className="w-3 h-3" /> XÓA
                            </button>
                          </div>
                        </BoltedCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* ── Status bar ───────────────────────────────────────────────────── */}
        <footer className="px-4 py-2 border-t border-[#babecc]/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VentSlots count={4} />
              <span className="text-[9px] font-mono text-[#8892a4] uppercase tracking-widest">
                ADMIN CONTROL CENTER v2.0 · SUPABASE RLS ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="led-indicator led-green" />
              <span className="text-[9px] font-mono text-[#8892a4]">
                DB: {isSupabaseConfigured ? 'CONNECTED' : 'SIMULATION'}
              </span>
            </div>
          </div>
        </footer>

        {/* ── Confirm Delete Modal ─────────────────────────────────────────── */}
        <AnimatePresence>
          {confirmDelete && (
            <ConfirmDelete
              label={confirmDelete.label}
              onConfirm={() => {
                const handlers = {
                  projects: () => handleDelete('projects', confirmDelete.id, () =>
                    setProjects((p) => p.filter((x) => x.id !== confirmDelete.id))
                  ),
                  blogs: () => handleDelete('blogs', confirmDelete.id, () =>
                    setBlogs((b) => b.filter((x) => x.id !== confirmDelete.id))
                  ),
                  links: () => handleDelete('links', confirmDelete.id, () =>
                    setLinks((l) => l.filter((x) => x.id !== confirmDelete.id))
                  ),
                  messages: () => handleDelete('messages', confirmDelete.id, () =>
                    setMessages((m) => m.filter((x) => x.id !== confirmDelete.id))
                  ),
                }
                handlers[confirmDelete.type]?.()
              }}
              onCancel={() => setConfirmDelete(null)}
            />
          )}
        </AnimatePresence>

        {/* ── Toast notifications ──────────────────────────────────────────── */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </AdminGuard>
  )
}
