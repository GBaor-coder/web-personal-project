// Dữ liệu ban đầu rỗng (Empty Initial Data) - Toàn bộ dữ liệu sẽ được đọc trực tiếp từ Supabase
export const INITIAL_PROJECTS = []

export const INITIAL_LINKS = []

export const INITIAL_BLOGS = []

export const INITIAL_SKILLS = [
  {
    category: 'Kỹ Thuật Giao Diện',
    categoryEn: 'FRONTEND ENGINEERING',
    items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'],
  },
  {
    category: 'Cơ Sở Dữ Liệu & Đám Mây',
    categoryEn: 'BACKEND & CLOUD DATABASE',
    items: ['Supabase', 'PostgreSQL RLS', 'Node.js', 'REST APIs', 'Edge Functions'],
  },
  {
    category: 'Bảo Mật & Kiến Trúc Hệ Thống',
    categoryEn: 'SECURITY & ARCHITECTURE',
    items: ['OAuth 2.0 / JWT', 'Row Level Security', 'Data Sanitization', 'Zod Validation'],
  },
  {
    category: 'Hạ Tầng & Vận Hành',
    categoryEn: 'INFRASTRUCTURE & DEPLOY',
    items: ['Git', 'Vercel / Cloudflare', 'Docker', 'CI/CD Pipelines'],
  },
]

export const INITIAL_EDUCATION = [
  {
    degree: 'Cử Nhân Khoa Học Máy Tính / Công Nghệ Thông Tin',
    degreeEn: 'B.S. in Computer Science / Information Technology',
    institution: 'Đại Học / Học Viện Công Nghệ',
    period: '2020 — 2024',
    status: 'Tốt nghiệp // Graduated',
    gpa: '3.8 / 4.0',
    coursework: [
      'Cơ Sở Dữ Liệu Nâng Cao // Advanced Database Systems',
      'An Toàn & Bảo Mật Hệ Thống // System Security',
      'Kiến Trúc Phần Mềm // Software Architecture',
      'Lập Trình Web Phân Tán // Distributed Web Systems',
    ],
  },
]
