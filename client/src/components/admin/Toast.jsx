import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

// Individual Toast item
const ToastItem = ({ id, type, message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 3000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  const config = {
    success: {
      icon: CheckCircle,
      border: 'border-[#2ed573]/50',
      bg: 'bg-[#f0fef4]',
      text: 'text-[#1e824c]',
      led: 'led-green',
    },
    error: {
      icon: AlertTriangle,
      border: 'border-[#ff4757]/50',
      bg: 'bg-[#fff5f5]',
      text: 'text-[#c0392b]',
      led: 'led-orange',
    },
    info: {
      icon: Info,
      border: 'border-[#ffa502]/50',
      bg: 'bg-[#fffbf0]',
      text: 'text-[#b7740a]',
      led: 'led-amber',
    },
  }

  const { icon: Icon, border, bg, text, led } = config[type] || config.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`
        flex items-start gap-3 p-3 pr-4 rounded-xl border ${border} ${bg}
        shadow-[4px_4px_10px_#babecc,-4px_-4px_10px_#ffffff]
        max-w-xs w-full pointer-events-auto
      `}
    >
      {/* LED indicator */}
      <div className="mt-0.5 shrink-0">
        <div className={`led-indicator ${led}`} />
      </div>

      {/* Icon + message */}
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${text}`} />
        <p className={`text-xs font-mono leading-relaxed ${text} break-words`}>
          {message}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        className={`shrink-0 p-0.5 rounded neu-button hover:opacity-80 ${text}`}
        aria-label="Đóng thông báo"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  )
}

// Toast container (fixed bottom-right)
export const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence mode="popLayout">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  </div>
)

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    info: (msg) => addToast('info', msg),
  }

  return { toasts, toast, dismissToast }
}
