import React, { useState, useRef, useCallback } from 'react'
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

/**
 * ImageUpload — Supabase Storage uploader
 * Props:
 *   folder: 'projects' | 'blogs' (maps to media/projects/ or media/blogs/)
 *   value: current image URL (for preview)
 *   onChange: (url: string) => void — called with public URL after upload
 *   label: string — label text
 */
export const ImageUpload = ({ folder = 'projects', value, onChange, label = 'HÌNH ẢNH THU NHỎ // THUMBNAIL' }) => {
  const [status, setStatus] = useState('idle') // 'idle' | 'uploading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const uploadFile = useCallback(async (file) => {
    if (!file) return

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Định dạng không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF, SVG.')
      setStatus('error')
      return
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File quá lớn. Tối đa 10MB.')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setErrorMsg('')

    // Generate unique path
    const ext = file.name.split('.').pop()
    const timestamp = Date.now()
    const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
    const path = `${folder}/${timestamp}-${sanitized}`

    if (!isSupabaseConfigured) {
      // Simulation mode: use local object URL
      await new Promise((r) => setTimeout(r, 1200))
      const mockUrl = URL.createObjectURL(file)
      onChange(mockUrl)
      setStatus('success')
      return
    }

    try {
      const { data, error } = await supabase.storage
        .from('media')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path)

      onChange(publicUrl)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi upload. Vui lòng thử lại.')
      setStatus('error')
    }
  }, [folder, onChange])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleClear = () => {
    onChange('')
    setStatus('idle')
    setErrorMsg('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="text-[10px] font-mono uppercase tracking-widest text-[#4a5568] font-bold">
        {label}
      </label>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed transition-all cursor-pointer
          ${dragOver
            ? 'border-[#ff4757] bg-[#ff4757]/5 scale-[1.01]'
            : 'border-[#babecc] bg-[#d1d9e6]'
          }
          ${status === 'uploading' ? 'cursor-not-allowed' : 'hover:border-[#ff4757]/60'}
          neu-recessed overflow-hidden
        `}
        style={{ minHeight: '120px' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
          disabled={status === 'uploading'}
        />

        {/* Preview if URL exists */}
        {value && status !== 'uploading' ? (
          <div className="relative group">
            <img
              src={value}
              alt="Thumbnail preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                title="Thay ảnh"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear() }}
                className="p-2 rounded-lg bg-[#ff4757]/70 text-white hover:bg-[#ff4757] backdrop-blur-sm"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Upload placeholder */
          <div className="flex flex-col items-center justify-center py-6 px-4 gap-2">
            {status === 'uploading' ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-[#ff4757]" />
                <p className="text-xs font-mono text-[#4a5568]">ĐANG UPLOAD VÀO SUPABASE STORAGE...</p>
                <div className="w-32 h-1 bg-[#babecc] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff4757] rounded-full animate-pulse w-2/3" />
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl neu-button">
                  <ImageIcon className="w-6 h-6 text-[#4a5568]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono text-[#2d3436] font-bold">
                    KÉO THẢ HOẶC CLICK ĐỂ CHỌN ẢNH
                  </p>
                  <p className="text-[10px] font-mono text-[#8892a4] mt-0.5">
                    JPG, PNG, WEBP, GIF, SVG · TỐI ĐA 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Status badges */}
        {status === 'success' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#2ed573] text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            UPLOADED
          </div>
        )}
      </div>

      {/* Error message */}
      {status === 'error' && errorMsg && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#ff4757]/10 border border-[#ff4757]/30">
          <AlertTriangle className="w-3 h-3 text-[#ff4757] shrink-0" />
          <p className="text-[10px] font-mono text-[#c0392b]">{errorMsg}</p>
        </div>
      )}

      {/* Current URL display (for manual URL fallback) */}
      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full text-[10px] font-mono px-2 py-1.5 rounded-lg neu-recessed text-[#4a5568] outline-none focus:ring-1 focus:ring-[#ff4757]/40"
        />
      )}
    </div>
  )
}
