'use client'

import { ReactNode } from 'react'
import { cn } from '../../../lib/utils'

interface CyberBorderProps {
  children: ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export const CyberBorder = ({ 
  children, 
  className,
  intensity = 'medium' 
}: CyberBorderProps) => {
  const intensityMap = {
    low: 'opacity-30',
    medium: 'opacity-50',
    high: 'opacity-70'
  }

  return (
    <div className={cn('relative', className)}>
      {/* Outer glow */}
      <div className={cn(
        'absolute -inset-1 bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl blur',
        intensityMap[intensity],
        'animate-pulse'
      )} />
      
      {/* Inner border */}
      <div className="relative rounded-xl bg-black/80 backdrop-blur-sm border border-green-500/30">
        {children}
      </div>
    </div>
  )
}