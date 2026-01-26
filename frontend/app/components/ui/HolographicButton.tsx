'use client'

import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { ReactNode } from 'react'

interface HolographicButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export const HolographicButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false
}: HolographicButtonProps) => {
  const baseStyles = cn(
    'relative font-orbitron font-bold uppercase tracking-wider',
    'border backdrop-blur-sm transition-all duration-300',
    'transform-gpu hover:scale-105 active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'overflow-hidden group'
  )

  const variants = {
    primary: cn(
      'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10',
      'text-white hover:border-green-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]',
      'before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500/0 before:via-green-500/20 before:to-green-500/0',
      'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000'
    ),
    secondary: cn(
      'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
      'text-white hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
    ),
    ghost: cn(
      'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
    )
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {/* Holographic shine effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-linear-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </motion.button>
  )
}