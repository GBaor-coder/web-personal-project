import React from 'react'

export const RecessedInput = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  rows,
  as = 'input',
  ...props
}) => {
  const Component = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input'

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[#4a5568] flex items-center justify-between">
          <span>{label}</span>
          {error && <span className="text-[#ff4757] text-[10px] normal-case font-mono">{error}</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#4a5568] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <Component
          type={as === 'input' ? type : undefined}
          rows={rows || (as === 'textarea' ? 4 : undefined)}
          className={`
            w-full rounded-xl neu-recessed text-[#2d3436] font-mono text-sm
            py-2.5 px-4 ${Icon ? 'pl-10' : ''}
            border border-transparent outline-none transition-all duration-150
            placeholder:text-[#8892a4] placeholder:font-sans
            focus:border-[#ff4757]/40 focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_8px_rgba(255,71,87,0.25)]
            ${error ? 'border-[#ff4757] shadow-[inset_4px_4px_8px_#ff4757/20]' : ''}
          `}
          {...props}
        />
      </div>
    </div>
  )
}
