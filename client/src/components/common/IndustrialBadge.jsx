import React from 'react'

export const IndustrialBadge = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    neutral: 'bg-[#e0e5ec] text-[#2d3436] shadow-[inset_1px_1px_2px_#babecc,inset_-1px_-1px_2px_#ffffff]',
    tape: 'industrial-label text-[#2b2b2b]',
    orange: 'bg-[#ff4757]/15 text-[#ff4757] border border-[#ff4757]/30 shadow-[0_0_8px_rgba(255,71,87,0.2)]',
    green: 'bg-[#2ed573]/15 text-[#2ed573] border border-[#2ed573]/30 shadow-[0_0_8px_rgba(46,213,115,0.2)]',
    recessed: 'neu-recessed text-[#4a5568]',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium uppercase tracking-wider ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
