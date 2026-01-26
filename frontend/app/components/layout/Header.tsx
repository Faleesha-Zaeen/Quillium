'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Zap, Upload, Brain, Layers, BarChart3, Home, LeafIcon, LeafyGreen, Clapperboard } from 'lucide-react'
import { GradientText } from '../ui/GradientText'
import { cn } from '../../../lib/utils'

type View = 'hero' | 'upload' | 'quiz' | 'flashcards' | 'progress' | 'shorts'

interface HeaderProps {
  currentView?: View
  onNavigate?: (view: View) => void
  hasData?: boolean
}

export const Header = ({ currentView = 'hero', onNavigate = () => {}, hasData = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems: Array<{ id: View; icon: typeof Home; label: string; disabled?: boolean }> = [
    { id: 'hero', icon: Home, label: 'Home' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'quiz', icon: Brain, label: 'Quiz', disabled: !hasData },
    { id: 'flashcards', icon: Layers, label: 'Cards', disabled: !hasData },
    { id: 'progress', icon: BarChart3, label: 'Stats' },
    { id: 'shorts', icon: Clapperboard, label: 'Quillium Shorts' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <LeafyGreen className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 animate-pulse" />
            </div>
            <GradientText 
              text="Quillium" 
              gradient="cyber"
              className="text-2xl font-bold tracking-wider"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && onNavigate(item.id)}
                  disabled={item.disabled}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm uppercase tracking-wider',
                    isActive
                      ? 'bg-linear-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
                      : item.disabled
                      ? 'opacity-30 cursor-not-allowed text-gray-500'
                      : 'text-white/70 hover:text-green-400 hover:border hover:border-green-500/30'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-2 right-2 h-0.5 bg-green-400 rounded-full"
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-white/10 hover:border-green-500/50 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 space-y-2 border-t border-white/10 pt-4"
          >
            {navItems.map((item) => {
              const isActive = currentView === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    !item.disabled && onNavigate(item.id)
                    setIsMenuOpen(false)
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium',
                    isActive
                      ? 'bg-linear-to-r from-green-500/20 to-emerald-500/20 text-green-300'
                      : item.disabled
                      ? 'opacity-30 cursor-not-allowed text-gray-500'
                      : 'text-white/70 hover:text-green-400'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </div>
    </header>
  )
}