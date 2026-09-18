import React, { useState, useEffect } from 'react'
import { Plus, Save, X, Loader2 } from 'lucide-react'
import { RecessedInput } from '../common/RecessedInput'
import { MechanicalButton } from '../common/MechanicalButton'
import { ImageUpload } from './ImageUpload'
import { RichTextEditor } from './RichTextEditor'
import { projectSchema } from '../../lib/validations'

const EMPTY_FORM = {
  title: '',
  category: 'Full-Stack',
  description: '',
  problem: '',
  solution: '',
  tech_stack: '',
  live_url: '',
  github_url: '',
  image_url: '',
  content: '',
  featured: false,
}

/**
 * ProjectForm — Handles both Create and Edit (inline) for Projects.
 * Props:
 *   editingItem: project object to edit (null = create mode)
 *   onSave: async (payload, isEdit) => void
 *   onCancel: () => void — called when cancelling edit
 *   saving: boolean
 */
export const ProjectForm = ({ editingItem, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  // When editingItem changes, populate or reset the form
  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title || '',
        category: editingItem.category || 'Full-Stack',
        description: editingItem.description || '',
        problem: editingItem.problem || '',
        solution: editingItem.solution || '',
        tech_stack: Array.isArray(editingItem.tech_stack)
          ? editingItem.tech_stack.join(', ')
          : editingItem.tech_stack || '',
        live_url: editingItem.live_url || '',
        github_url: editingItem.github_url || '',
        image_url: editingItem.image_url || '',
        content: editingItem.content || '',
        featured: editingItem.featured || false,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [editingItem])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const techArray = form.tech_stack
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload = { ...form, tech_stack: techArray, featured: form.featured }
    const result = projectSchema.safeParse(payload)

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
    if (!editingItem) setForm(EMPTY_FORM)
  }

  const isEditing = Boolean(editingItem)

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Mode indicator */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff4757] font-bold">
          {isEditing ? `✏ ĐANG SỬA: ${editingItem.title?.slice(0, 24)}...` : '+ TẠO DỰ ÁN MỚI'}
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
        folder="projects"
        value={form.image_url}
        onChange={(url) => set('image_url', url)}
        label="THUMBNAIL // SUPABASE STORAGE"
      />
      {errors.image_url && <p className="text-[10px] text-[#ff4757] font-mono">{errors.image_url}</p>}

      {/* Basic fields */}
      <RecessedInput
        label="TIÊU ĐỀ DỰ ÁN // TITLE *"
        placeholder="Distributed Telemetry & Sensor Mesh"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        required
      />
      {errors.title && <p className="text-[10px] text-[#ff4757] font-mono">{errors.title}</p>}

      <RecessedInput
        label="DANH MỤC // CATEGORY *"
        placeholder="Full-Stack / IoT"
        value={form.category}
        onChange={(e) => set('category', e.target.value)}
        required
      />
      {errors.category && <p className="text-[10px] text-[#ff4757] font-mono">{errors.category}</p>}

      <RecessedInput
        as="textarea"
        rows={2}
        label="MÔ TẢ TÓM TẮT // BRIEF DESCRIPTION *"
        placeholder="High-throughput time-series aggregation pipeline..."
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        required
      />
      {errors.description && <p className="text-[10px] text-[#ff4757] font-mono">{errors.description}</p>}

      <RecessedInput
        as="textarea"
        rows={2}
        label="BÀI TOÁN & ĐIỂM NGHẼN // PROBLEM *"
        placeholder="Legacy SCADA infrastructure suffered 12-second delays..."
        value={form.problem}
        onChange={(e) => set('problem', e.target.value)}
        required
      />
      {errors.problem && <p className="text-[10px] text-[#ff4757] font-mono">{errors.problem}</p>}

      <RecessedInput
        as="textarea"
        rows={2}
        label="GIẢI PHÁP KIẾN TRÚC // SOLUTION *"
        placeholder="Engineered an event-driven Go and Supabase CDC engine..."
        value={form.solution}
        onChange={(e) => set('solution', e.target.value)}
        required
      />
      {errors.solution && <p className="text-[10px] text-[#ff4757] font-mono">{errors.solution}</p>}

      <RecessedInput
        label="TECH STACK (CÁCH NHAU BẰNG DẤU PHẨY) *"
        placeholder="React, Supabase, Go, PostgreSQL"
        value={form.tech_stack}
        onChange={(e) => set('tech_stack', e.target.value)}
        required
      />
      {errors.tech_stack && <p className="text-[10px] text-[#ff4757] font-mono">{errors.tech_stack}</p>}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <RecessedInput
            label="LIVE DEMO URL"
            placeholder="https://demo.example.com"
            value={form.live_url}
            onChange={(e) => set('live_url', e.target.value)}
          />
          {errors.live_url && <p className="text-[10px] text-[#ff4757] font-mono">{errors.live_url}</p>}
        </div>
        <div>
          <RecessedInput
            label="GITHUB REPO URL"
            placeholder="https://github.com/..."
            value={form.github_url}
            onChange={(e) => set('github_url', e.target.value)}
          />
          {errors.github_url && <p className="text-[10px] text-[#ff4757] font-mono">{errors.github_url}</p>}
        </div>
      </div>

      {/* Featured toggle */}
      <label className="flex items-center gap-3 p-2 rounded-lg neu-recessed cursor-pointer">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set('featured', e.target.checked)}
          className="w-4 h-4 accent-[#ff4757]"
        />
        <span className="text-xs font-mono text-[#2d3436] uppercase tracking-wider">
          FEATURED PROJECT (Nổi bật trên trang chủ)
        </span>
      </label>

      {/* Rich text content */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-widest text-[#4a5568] font-bold mb-2 block">
          NỘI DUNG CHI TIẾT // RICH CONTENT (TIPTAP)
        </label>
        <RichTextEditor
          content={form.content}
          onChange={(html) => set('content', html)}
          placeholder="Mô tả chi tiết kiến trúc, thách thức kỹ thuật và bài học rút ra..."
          minHeight="180px"
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
          ? 'ĐANG LƯU VÀO POSTGRESQL...'
          : isEditing
            ? 'CẬP NHẬT DỰ ÁN [UPDATE]'
            : 'LƯU DỰ ÁN [INSERT]'}
      </MechanicalButton>
    </form>
  )
}
