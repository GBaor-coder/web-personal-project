import React from 'react'
import { motion } from 'framer-motion'
import { ScrewHead } from './ScrewHead'
import { VentSlots } from './VentSlots'

export const BoltedCard = ({
  children,
  title,
  subtitle,
  badge,
  icon: Icon,
  showScrews = true,
  showVents = false,
  elevation = 'base', // 'base', 'floating', 'recessed'
  className = '',
  headerAction,
  ...props
}) => {
  const elevationStyles = {
    base: 'neu-base border border-white/60',
    floating: 'neu-floating border border-white/80',
    recessed: 'neu-recessed border border-white/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
      className={`relative rounded-2xl p-6 transition-all duration-200 ${elevationStyles[elevation]} ${className}`}
      {...props}
    >
      {/* Corner Screws */}
      {showScrews && (
        <>
          <ScrewHead className="absolute top-1 left-4" />
          <ScrewHead className="absolute top-1 right-4" cross />
          <ScrewHead className="absolute bottom-4 left-4" cross />
          <ScrewHead className="absolute bottom-4 right-4" />
        </>
      )}

      {/* Card Header if title provided */}
      {(title || subtitle || Icon || headerAction || showVents) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#babecc]/40">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 rounded-xl neu-recessed text-[#ff4757]">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && (
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-[#2d3436] tracking-tight text-embossed">{title}</h3>
                  {badge}
                </div>
              )}
              {subtitle && <p className="text-xs font-mono uppercase text-[#4a5568] tracking-wider">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showVents && <VentSlots count={5} />}
            {headerAction}
          </div>
        </div>
      )}

      {/* Body Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
