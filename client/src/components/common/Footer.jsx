import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Cpu, HardDrive, Terminal } from 'lucide-react'
import { ScrewHead } from './ScrewHead'
import { VentSlots } from './VentSlots'
import { LedIndicator } from './LedIndicator'

export const Footer = () => {
  return (
    <footer className="max-w-6xl mx-auto px-4 mt-20 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="relative rounded-2xl neu-panel p-6 shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]">
        <ScrewHead className="absolute top-3 left-3" />
        <ScrewHead className="absolute top-3 right-3 cross" />
        <ScrewHead className="absolute bottom-3 left-3 cross" />
        <ScrewHead className="absolute bottom-3 right-3" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Hardware Spec Info */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#2d3436]">
                THÔNG SỐ KHUNG MÁY // CHASSIS SPEC M-2026
              </span>
              <LedIndicator color="green" label="ỔN ĐỊNH // STABLE" />
            </div>
            <p className="text-xs text-[#4a5568] leading-relaxed">
              Hệ sinh thái Portfolio xúc giác kết hợp Trung tâm Tiếp thị Liên kết. Xây dựng trên nền tảng React 19, kiến trúc bảo mật Supabase PostgreSQL RLS và chuyển động vật lý lò xo Framer Motion.
            </p>
          </div>

          {/* Diagnostics / Status */}
          <div className="p-3.5 rounded-xl neu-recessed font-mono text-[11px] text-[#4a5568] flex flex-col gap-1">
            <div className="flex justify-between">
              <span>BẢO MẬT RLS:</span>
              <span className="text-[#2ed573] font-semibold">KÍCH HOẠT // ENFORCED</span>
            </div>
            <div className="flex justify-between">
              <span>CHUẨN XÁC THỰC:</span>
              <span className="text-[#2d3436] font-semibold">JWT SHA-256</span>
            </div>
            <div className="flex justify-between">
              <span>ĐỘ TRỄ ĐIỀU HƯỚNG:</span>
              <span className="text-[#ff4757] font-semibold">&lt; 18MS (SUB-TICK)</span>
            </div>
          </div>

          {/* Vents & Hidden Access */}
          <div className="flex flex-col items-center md:items-end justify-between gap-3">
            <VentSlots count={6} />
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[#8892a4]">MÃ ĐỊNH DANH: #99A5-F2FE-2026</span>
              <Link 
                to="/admin-portal" 
                className="opacity-20 hover:opacity-100 transition-opacity p-1.5 rounded neu-recessed text-xs text-[#4a5568]"
                title="Cổng Điều Khiển Quản Trị // Admin Portal"
              >
                <Terminal className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
