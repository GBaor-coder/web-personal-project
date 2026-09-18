import { z } from 'zod'

// Helper to strip dangerous HTML tags
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>?/gm, '').trim()
}

// Project Schema with Bilingual Validation Messages
export const projectSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự (Title must be >= 3 chars)').max(120).transform(sanitizeString),
  category: z.string().min(2, 'Danh mục là bắt buộc (Category is required)').max(60).transform(sanitizeString),
  description: z.string().min(10, 'Mô tả tóm tắt phải từ 10 ký tự (Description >= 10 chars)').max(1000).transform(sanitizeString),
  problem: z.string().min(10, 'Vui lòng nêu rõ vấn đề / bài toán (Problem statement >= 10 chars)').transform(sanitizeString),
  solution: z.string().min(10, 'Vui lòng nêu rõ giải pháp kiến trúc (Solution statement >= 10 chars)').transform(sanitizeString),
  tech_stack: z.array(z.string()).min(1, 'Chọn ít nhất 1 công nghệ (Select at least 1 tech item)'),
  live_url: z.string().url('Đường dẫn Live URL không hợp lệ (Invalid URL)').optional().or(z.literal('')),
  github_url: z.string().url('Đường dẫn GitHub không hợp lệ (Invalid GitHub URL)').optional().or(z.literal('')),
  image_url: z.string().url('Đường dẫn ảnh không hợp lệ (Invalid Image URL)').optional().or(z.literal('')),
  featured: z.boolean().default(false),
})

// Bio / Affiliate Link Schema
export const linkSchema = z.object({
  title: z.string().min(2, 'Tiêu đề liên kết là bắt buộc (Title is required)').max(100).transform(sanitizeString),
  category: z.enum(['affiliate', 'social', 'gear', 'course', 'resource']).default('affiliate'),
  url: z.string().url('Đường dẫn đích không hợp lệ (Invalid destination URL)'),
  description: z.string().max(250).optional().transform(sanitizeString),
  icon_name: z.string().default('ExternalLink').transform(sanitizeString),
  badge_text: z.string().max(40).optional().transform(sanitizeString),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
})

// Blog Schema
export const blogSchema = z.object({
  title: z.string().min(5, 'Tiêu đề bài viết phải từ 5 ký tự (Title >= 5 chars)').max(160).transform(sanitizeString),
  slug: z.string().min(3, 'Slug là bắt buộc (Slug required)').max(160).regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường không dấu và dấu gạch ngang (lowercase alphanumeric & hyphens)'),
  summary: z.string().min(10, 'Tóm tắt bài viết là bắt buộc (Summary required)').max(400).transform(sanitizeString),
  content: z.string().min(20, 'Nội dung bài viết là bắt buộc (Content required)'),
  read_time: z.string().default('5 phút đọc // 5 min read').transform(sanitizeString),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
})

// Contact Form Schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự (Name >= 2 chars)').max(80).transform(sanitizeString),
  email: z.string().email('Địa chỉ email không hợp lệ (Invalid email address)'),
  subject: z.string().min(3, 'Tiêu đề tối thiểu 3 ký tự (Subject >= 3 chars)').max(120).transform(sanitizeString),
  message: z.string().min(10, 'Nội dung tin nhắn tối thiểu 10 ký tự (Message >= 10 chars)').max(3000).transform(sanitizeString),
})
