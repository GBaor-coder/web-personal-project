import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

/**
 * AdminGuard — Double-layer authorization check:
 * Layer 1: session.user.email === VITE_ADMIN_EMAIL
 * Layer 2: session.user.app_metadata.role === 'admin'
 * Either condition grants access (OR logic, matching is_admin() SQL function)
 */
export const AdminGuard = ({ session, children }) => {
  const navigate = useNavigate()
  const [authStatus, setAuthStatus] = useState('checking') // 'checking' | 'authorized' | 'unauthorized'

  useEffect(() => {
    if (!session) {
      // No session — let parent show login UI
      setAuthStatus('authorized')
      return
    }

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
    const userEmail = session.user?.email
    const userRole = session.user?.app_metadata?.role

    // Double-layer check: email match OR admin role
    const isAuthorized =
      (adminEmail && userEmail === adminEmail) ||
      userRole === 'admin'

    if (isAuthorized) {
      setAuthStatus('authorized')
    } else {
      setAuthStatus('unauthorized')
      // Redirect to homepage after brief delay for UX
      setTimeout(() => navigate('/'), 1500)
    }
  }, [session, navigate])

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#e0e5ec' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff4757]" />
          <p className="text-xs font-mono text-[#4a5568] uppercase tracking-widest">
            ĐANG XÁC MINH PHIÊN // VERIFYING SESSION...
          </p>
        </div>
      </div>
    )
  }

  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#e0e5ec' }}>
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl neu-panel text-center max-w-sm">
          <div className="p-3 rounded-xl bg-[#ff4757]/20 text-[#ff4757]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold font-mono text-[#2d3436] uppercase tracking-wide">
              TRUY CẬP BỊ TỪ CHỐI // ACCESS DENIED
            </p>
            <p className="text-xs text-[#4a5568] mt-1">
              Tài khoản này không có quyền truy cập Admin Portal.
            </p>
          </div>
          <p className="text-[10px] font-mono text-[#8892a4]">
            Đang chuyển về trang chủ...
          </p>
        </div>
      </div>
    )
  }

  return children
}
