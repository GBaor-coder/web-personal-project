import React, { useState, useEffect } from 'react'
import { Plus, Save, X, Loader2 } from 'lucide-react'
import { RecessedInput } from '../common/RecessedInput'
import { MechanicalButton } from '../common/MechanicalButton'
import { ImageUpload } from './ImageUpload'
import { linkSchema } from '../../lib/validations'

const LINK_CATEGORIES = [
  { value: 'gear', label: 'Thiết Bị Công Nghệ (Tech Gear)' },
  { value: 'course', label: 'Khóa Học (Courses)' },
  { value: 'affiliate', label: 'Phần Cứng / Vật Phẩm (Hardware)' },
  { value: 'social', label: 'Kênh Mạng Xã Hội (Social)' },
  { value: 'resource', label: 'Tài Nguyên (Resources)' },
]

const COMMON_ICONS = [
  'ShoppingBag', 'ExternalLink', 'Github', 'Twitter', 'Linkedin',
  'Youtube', 'Instagram', 'BookOpen', 'Code2', 'Cpu', 'Monitor',
  'Headphones', 'Camera', 'Keyboard', 'Mouse', 'Server', 'Database',
]

const EMPTY_FORM = {
  title: '',
  category: 'affiliate',
  url: '',
  description: '',
  icon_name: 'ExternalLink',
  badge_text: '',
  is_active: true,
  sort_order: 0,
  image_url: '',
}

/**
 * LinkForm — Handles both Create and Edit (inline) for Bio/Affiliate Links.
 */
export const LinkForm = ({ editingItem, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title || '',
        category: editingItem.category || 'affiliate',
        url: editingItem.url || '',
        description: editingItem.description || '',
        icon_name: editingItem.icon_name || 'ExternalLink',
        badge_text: editingItem.badge_text || '',
        is_active: editingItem.is_active ?? true,
        sort_order: editingItem.sort_order ?? 0,
        image_url: editingItem.image_url || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [editingItem])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  /**
   * Build a clean PostgREST payload.
   * - Normalizes image_url: '' → null (PostgREST rejects empty strings on nullable TEXT columns)
   * - Strips any UI-only / non-table fields so only real `links` columns are sent
   */
  const buildLinkPayload = (data) => {
    const { title, category, url, description, icon_name, badge_text, is_active, sort_order, image_url } = data
    const payload = {
      title,
      category,
      url,
      description: description || null,
      icon_name: icon_name || 'ExternalLink',
      badge_text: badge_text || null,
      is_active: is_active ?? true,
      sort_order: Number(sort_order) || 0,
      image_url: image_url === '' ? null : image_url,
    }
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const result = linkSchema.safeParse({
      ...form,
      sort_order: Number(form.sort_order) || 0,
    })

    if (!result.success) {
      const fieldErrors = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0]
        if (key) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    // Sanitize payload before passing to parent — no undefined / empty strings
    const payload = buildLinkPayload(result.data)
    await onSave(payload, Boolean(editingItem))
    if (!editingItem) setForm(EMPTY_FORM)
  }

  const isEditing = Boolean(editingItem)

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Mode indicator */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff4757] font-bold">
          {isEditing ? `✏ ĐANG SỬA: ${editingItem.title?.slice(0, 24)}...` : '+ THÊM KHE LIÊN KẾT MỚI'}
        </span>
        {isEditing && (
          <button type="button" onClick={onCancel}
            className="p-1 rounded-lg neu-button text-[#4a5568] hover:text-[#ff4757]">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Title */}
      <RecessedInput
        label="TIÊU ĐỀ LIÊN KẾT // LINK TITLE *"
        placeholder="Bàn Phím Cơ Tùy Biến 65%"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        required
      />
      {errors.title && <p className="text-[10px] text-[#ff4757] font-mono">{errors.title}</p>}

      {/* Category */}
      <RecessedInput
        as="select"
        label="DANH MỤC // CATEGORY"
        value={form.category}
        onChange={(e) => set('category', e.target.value)}
      >
        {LINK_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </RecessedInput>

      {/* URL */}
      <RecessedInput
        label="ĐƯỜNG DẪN ĐÍCH // DESTINATION URL *"
        placeholder="https://amazon.com/dp/...?tag=mycreator-20"
        value={form.url}
        onChange={(e) => set('url', e.target.value)}
        required
      />
      {errors.url && <p className="text-[10px] text-[#ff4757] font-mono">{errors.url}</p>}

      {/* Description */}
      <RecessedInput
        as="textarea"
        rows={2}
        label="MÔ TẢ THÔNG SỐ // SPECS"
        placeholder="Vỏ nhôm CNC nguyên khối, Gateron Oil Kings..."
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
      />

      {/* Icon + Badge in 2 columns */}
      <div className="grid grid-cols-2 gap-2">
        {/* Icon picker */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-[#4a5568] font-bold block mb-1">
            ICON (LUCIDE-REACT)
          </label>
          <select
            value={form.icon_name}
            onChange={(e) => set('icon_name', e.target.value)}
            className="w-full text-xs font-mono px-2 py-2 rounded-xl neu-recessed text-[#2d3436] outline-none focus:ring-1 focus:ring-[#ff4757]/40 bg-[#d1d9e6]"
          >
            {COMMON_ICONS.map((icon) => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Hoặc nhập tên icon..."
            value={form.icon_name}
            onChange={(e) => set('icon_name', e.target.value)}
            className="mt-1 w-full text-[10px] font-mono px-2 py-1 rounded-lg neu-recessed text-[#4a5568] outline-none focus:ring-1 focus:ring-[#ff4757]/40"
          />
        </div>

        {/* Badge text */}
        <div>
          <RecessedInput
            label="NHÃN NỔI BẬT // BADGE"
            placeholder="PRO // 15% OFF"
            value={form.badge_text}
            onChange={(e) => set('badge_text', e.target.value)}
          />
        </div>
      </div>

      {/* Sort order */}
      <RecessedInput
        label="THỨ TỰ HIỂN THỊ // SORT ORDER"
        type="number"
        placeholder="0"
        value={form.sort_order}
        onChange={(e) => set('sort_order', e.target.value)}
      />

      {/* Image upload (CRT thumbnail) */}
      <ImageUpload
        folder="links"
        value={form.image_url}
        onChange={(url) => set('image_url', url)}
        label="HÌNH ẢNH MÀN HÌNH CRT // CRT SCREEN IMAGE"
      />

      {/* Active toggle */}
      <label className="flex items-center gap-3 p-2 rounded-lg neu-recessed cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => set('is_active', e.target.checked)}
          className="w-4 h-4 accent-[#ff4757]"
        />
        <div>
          <span className="text-xs font-mono text-[#2d3436] uppercase tracking-wider">
            HOẠT ĐỘNG (IS_ACTIVE)
          </span>
          <p className="text-[9px] font-mono text-[#8892a4]">
            Bỏ chọn để tạm ẩn liên kết này trên trang /links
          </p>
        </div>
      </label>

      {/* Submit */}
      <MechanicalButton
        type="submit"
        variant="accent"
        size="md"
        icon={saving ? Loader2 : isEditing ? Save : Plus}
        className="w-full"
        disabled={saving}
      >
        {saving
          ? 'ĐANG LƯU LIÊN KẾT...'
          : isEditing
            ? 'CẬP NHẬT LIÊN KẾT [UPDATE]'
            : 'LƯU KHE LIÊN KẾT [INSERT]'}
      </MechanicalButton>
    </form>
  )
}
