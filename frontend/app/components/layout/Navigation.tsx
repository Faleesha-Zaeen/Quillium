'use client'

import { motion } from 'framer-motion'
import { Upload, Brain, Layers, BarChart3, Home, Clapperboard } from 'lucide-react'
import { HolographicButton } from '../ui/HolographicButton'
import { cn } from '../../../lib/utils'

type View = 'hero' | 'upload' | 'quiz' | 'flashcards' | 'progress' | 'shorts'

interface NavigationProps {
  currentView: View
  onNavigate: (view: View) => void
  hasData: boolean
}

export const Navigation = ({ currentView, onNavigate, hasData }: NavigationProps) => {
  const navItems: Array<{ id: View; icon: typeof Home; label: string; disabled?: boolean }> = [
    { id: 'hero', icon: Home, label: 'Home' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'quiz', icon: Brain, label: 'Quiz', disabled: !hasData },
    { id: 'flashcards', icon: Layers, label: 'Cards', disabled: !hasData },
    { id: 'progress', icon: BarChart3, label: 'Stats' },
    { id: 'shorts', icon: Clapperboard, label: 'Quillium Shorts' },
  ]

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-2 p-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        {navItems.map((item) => {
          const isActive = currentView === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && onNavigate(item.id)}
              disabled={item.disabled}
              className={cn(
                'relative flex flex-col items-center p-3 rounded-xl transition-all duration-300',
                'min-w-20',
                isActive
                  ? 'bg-linear-to-br from-cyan-500/20 to-purple-500/20 text-cyan-300'
                  : item.disabled
                  ? 'opacity-30 cursor-not-allowed text-gray-500'
                  : 'hover:bg-white/5 text-white/60 hover:text-white'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -top-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00ffff]"
                />
              )}

              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>

              {/* Hover glow */}
              {!isActive && !item.disabled && (
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}