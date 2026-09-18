import React from 'react'
import { motion } from 'framer-motion'

export const MechanicalButton = ({
  children,
  onClick,
  variant = 'default', // 'default', 'accent', 'recessed', 'panel'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon,
  disabled = false,
  type = 'button',
  className = '',
  href,
  target,
  rel,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-5 py-2.5 text-sm min-h-[44px]',
    lg: 'px-7 py-3.5 text-base min-h-[52px]',
  }

  const variantStyles = {
    default: 'neu-button text-[#2d3436] font-semibold border border-white/60 hover:border-white active:bg-[#d8dfe8]',
    accent: 'neu-button-accent font-bold tracking-wide active:translate-y-[2px]',
    recessed: 'neu-recessed text-[#4a5568] font-medium active:shadow-[inset_6px_6px_12px_#babecc,inset_-6px_-6px_12px_#ffffff]',
    panel: 'neu-panel text-[#2d3436] font-semibold hover:bg-white/80',
  }

  const commonClasses = `
    inline-flex items-center justify-center gap-2.5 rounded-xl select-none cursor-pointer 
    transition-all duration-150 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
    ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}
  `

  const MotionComponent = href ? motion.a : motion.button

  return (
    <MotionComponent
      type={href ? undefined : type}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.98, y: 2 } : undefined}
      className={commonClasses}
      {...props}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />}
      <span>{children}</span>
    </MotionComponent>
  )
}
