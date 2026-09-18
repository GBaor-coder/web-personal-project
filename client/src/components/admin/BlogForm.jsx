import React, { useState, useEffect } from 'react'
import { Plus, Save, X, Loader2 } from 'lucide-react'
import { RecessedInput } from '../common/RecessedInput'
import { MechanicalButton } from '../common/MechanicalButton'
import { ImageUpload } from './ImageUpload'
import { RichTextEditor } from './RichTextEditor'
import { blogSchema } from '../../lib/validations'

const EMPTY_FORM = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  thumbnail_url: '',
  read_time: '5 phút đọc // 5 min read',
  tags: '',
  published: true,
}

// Utility: auto-generate URL-safe slug from a Vietnamese/English title
const generateSlug = (title) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 160)

/**
 * BlogForm — Handles both Create and Edit (inline) for Blog posts.
 */
export const BlogForm = ({ editingItem, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title || '',
        slug: editingItem.slug || '',
        summary: editingItem.summary || '',
        content: editingItem.content || '',
        thumbnail_url: editingItem.thumbnail_url || '',
        read_time: editingItem.read_time || '5 phút đọc // 5 min read',
        tags: Array.isArray(editingItem.tags)
          ? editingItem.tags.join(', ')
          : editingItem.tags || '',
        published: editingItem.published ?? true,
      })
      setSlugManuallyEdited(true) // Don't override slug when editing
    } else {
      setForm(EMPTY_FORM)
      setSlugManuallyEdited(false)
    }
    setErrors({})
  }, [editingItem])

  const set = (key, value) => {
    setForm((f) => {
      const updated = { ...f, [key]: value }
      // Auto-generate slug from title if not manually edited
      if (key === 'title' && !slugManuallyEdited) {
        updated.slug = generateSlug(value)
      }
      return updated
    })
  }

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true)
    setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = { ...form, tags: tagsArray, published: form.published }
    const result = blogSchema.safeParse(payload)

    if (!result.success) {
      const fieldErrors = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0]
        if (key) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    await onSave(result.data, Boolean(editingItem))
    if (!editingItem) {
      setForm(EMPTY_FORM)
      setSlugManuallyEdited(false)
    }
  }

  const isEditing = Boolean(editingItem)

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Mode indicator */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff4757] font-bold">
          {isEditing ? `✏ ĐANG SỬA: ${editingItem.title?.slice(0, 24)}...` : '+ TẠO BÀI VIẾT MỚI'}
        </span>
        {isEditing && (
          <button type="button" onClick={onCancel}
            className="p-1 rounded-lg neu-button text-[#4a5568] hover:text-[#ff4757]">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Thumbnail upload */}
      <ImageUpload
        folder="blogs"
        value={form.thumbnail_url}
        onChange={(url) => set('thumbnail_url', url)}
        label="THUMBNAIL BLOG // SUPABASE STORAGE"
      />

      {/* Title */}
      <RecessedInput
        label="TIÊU ĐỀ BÀI VIẾT // TITLE *"
        placeholder="Kiến Trúc Microservices với Go và Supabase"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        required
      />
      {errors.title && <p className="text-[10px] text-[#ff4757] font-mono">{errors.title}</p>}

      {/* Slug — auto-generated but editable */}
      <div>
        <RecessedInput
          label="SLUG URL *"
          placeholder="kien-truc-microservices-go-supabase"
          value={form.slug}
          onChange={handleSlugChange}
          required
        />
        <p className="text-[9px] font-mono text-[#8892a4] mt-0.5">
          → /blog/{form.slug || 'slug-tu-dong-tao'} · Tự tạo từ tiêu đề, có thể sửa
        </p>
        {errors.slug && <p className="text-[10px] text-[#ff4757] font-mono">{errors.slug}</p>}
      </div>

      {/* Summary */}
      <RecessedInput
        as="textarea"
        rows={2}
        label="TÓM TẮT // SUMMARY *"
        placeholder="Bài phân tích kiến trúc phân tán tối ưu hoá cho throughput cao..."
        value={form.summary}
        onChange={(e) => set('summary', e.target.value)}
        required
      />
      {errors.summary && <p className="text-[10px] text-[#ff4757] font-mono">{errors.summary}</p>}

      {/* Tags */}
      <RecessedInput
        label="TAGS (CÁCH NHAU BẰNG DẤU PHẨY)"
        placeholder="Go, Supabase, Microservices, PostgreSQL"
        value={form.tags}
        onChange={(e) => set('tags', e.target.value)}
      />

      {/* Read time */}
      <RecessedInput
        label="THỜI GIAN ĐỌC // READ TIME"
        placeholder="8 phút đọc // 8 min read"
        value={form.read_time}
        onChange={(e) => set('read_time', e.target.value)}
      />

      {/* Published toggle */}
      <label className="flex items-center gap-3 p-2 rounded-lg neu-recessed cursor-pointer">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => set('published', e.target.checked)}
          className="w-4 h-4 accent-[#ff4757]"
        />
        <div>
          <span className="text-xs font-mono text-[#2d3436] uppercase tracking-wider">
            XUẤT BẢN (PUBLISHED)
          </span>
          <p className="text-[9px] font-mono text-[#8892a4]">
            Bỏ chọn để lưu nháp (draft) — không hiện trên public
          </p>
        </div>
      </label>

      {/* Rich text content */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-widest text-[#4a5568] font-bold mb-2 block">
          NỘI DUNG BÀI VIẾT // FULL CONTENT (TIPTAP) *
        </label>
        <RichTextEditor
          content={form.content}
          onChange={(html) => set('content', html)}
          placeholder="Viết nội dung bài blog đầy đủ tại đây. Hỗ trợ heading, bold, list, code block..."
          minHeight="220px"
        />
        {errors.content && <p className="text-[10px] text-[#ff4757] font-mono mt-1">{errors.content}</p>}
      </div>

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
          ? 'ĐANG LƯU BÀI VIẾT...'
          : isEditing
            ? 'CẬP NHẬT BÀI VIẾT [UPDATE]'
            : 'XUẤT BẢN BÀI VIẾT [INSERT]'}
      </MechanicalButton>
    </form>
  )
}
