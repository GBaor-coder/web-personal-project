import React from 'react'

export const LedIndicator = ({ color = 'green', label, active = true, pulse = false, className = '' }) => {
  const colorClass = !active 
    ? 'led-off' 
    : color === 'orange' 
      ? 'led-orange' 
      : color === 'amber' 
        ? 'led-amber' 
        : 'led-green'

  return (
    <div className={`inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase ${className}`}>
      <div className="relative flex items-center justify-center p-1 rounded-full bg-[#d1d9e6] shadow-[inset_1px_1px_2px_#babecc,inset_-1px_-1px_2px_#ffffff]">
        <div className={`led-indicator ${colorClass} ${pulse && active ? 'animate-pulse' : ''}`} />
      </div>
      {label && <span className="text-[#4a5568] font-semibold text-[11px] select-none">{label}</span>}
    </div>
  )
}
