'use client'

import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'

interface GradientTextProps {
  text: string
  gradient?: 'cyber' | 'neon' | 'matrix' | 'sunset'
  className?: string
  animate?: boolean
}

export const GradientText = ({ 
  text, 
  gradient = 'cyber', 
  className,
  animate = true 
}: GradientTextProps) => {
  const gradients = {
    cyber: 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500',
    neon: 'bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400',
    matrix: 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400',
    sunset: 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500'
  }

  // Remove the framer-motion animation props since we're using Tailwind animation
  // Just use Tailwind's animation class

  return (
    <span
      className={cn(
        'inline-block bg-clip-text text-transparent bg-size-[200%_auto]',
        gradients[gradient],
        animate && 'animate-gradient-shift',
        className
      )}
    >
      {text}
    </span>
  )
}