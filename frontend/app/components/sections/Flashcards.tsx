'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Zap, Layers, Star } from 'lucide-react'
import { GradientText } from '../ui/GradientText'
import { HolographicButton } from '../ui/HolographicButton'
import { CyberBorder } from '../ui/CyberBorder'
import { Flashcard } from '../../../types'
import { cn } from '../../../lib/utils'

interface FlashcardHoloProps {
  flashcards: Flashcard[]
  onStudy: () => void
  onBack: () => void
  language?: string
}

export const FlashcardHolo = ({ flashcards, onStudy, onBack, language='English' }: FlashcardHoloProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set())
  const [showHoloEffect, setShowHoloEffect] = useState(false)

  const currentCard = flashcards[currentIndex]

  const handleFlip = () => {
    if (!isFlipped) {
      onStudy()
      if (!studiedCards.has(currentIndex)) {
        setStudiedCards(prev => new Set([...prev, currentIndex]))
      }
    }
    setIsFlipped(!isFlipped)
    setShowHoloEffect(true)
    setTimeout(() => setShowHoloEffect(false), 1000)
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % flashcards.length)
    setIsFlipped(false)
  }

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length)
    setIsFlipped(false)
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
      case ' ':
      case 'Enter':
        handleFlip()
        break
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, isFlipped])

  if (!flashcards.length) {
    return (
      <div className="container mx-auto px-4 py-12">
        <CyberBorder>
          <div className="p-12 text-center">
            <Layers className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Flashcards Generated</h3>
            <p className="text-green-400/70 mb-6">Upload a document to create flashcards</p>
            <HolographicButton onClick={onBack}>
              Upload Document
            </HolographicButton>
          </div>
        </CyberBorder>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CyberBorder className="max-w-4xl mx-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                <GradientText text="STUDY CARDS" gradient="cyber" />
              </h2>
              <p className="text-green-400/70">Flip cards to reveal knowledge</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
      <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
        {language}
      </div>
    </div>
            
            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 border border-green-500/30">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-mono text-lg font-bold text-yellow-300">{studiedCards.size}/{flashcards.length}</span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 border border-emerald-500/30">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="font-mono text-lg font-bold text-emerald-300">{currentIndex + 1}/{flashcards.length}</span>
              </div>
            </div>
          </div>

          {/* Flashcard Container */}
          <div className="relative mb-8">
            {/* Holographic Effect */}
            {showHoloEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 2 }}
                className="absolute inset-0 bg-linear-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl -z-10"
              />
            )}

            {/* Flashcard */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div
                onClick={handleFlip}
                className="relative cursor-pointer group min-h-[400px]"
              >
                {/* Card Base */}
                <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-white/20 backdrop-blur-md" />
                
                {/* Card Content */}
                <div className="relative p-8 lg:p-12 min-h-[400px] flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div
                        key="question"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        className="text-center space-y-6"
                      >
                        <div className="mb-4">
                          <span className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
                            QUESTION
                          </span>
                        </div>
                        
                        <h3 className="text-2xl lg:text-3xl font-bold text-white leading-relaxed">
                          {currentCard.question}
                        </h3>
                        
                        <p className="text-green-400/70 text-sm mt-8">
                          Click card or press SPACE to reveal answer
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="answer"
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        className="text-center space-y-6"
                      >
                        <div className="mb-4">
                          <span className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
                            ANSWER
                          </span>
                        </div>
                        
                        <h3 className="text-2xl lg:text-3xl font-bold text-white leading-relaxed">
                          {currentCard.answer}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-2 text-green-400/70 text-sm mt-8">
                          <Zap className="w-4 h-4" />
                          <span>Well done! Keep learning</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-green-500/50 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-emerald-500/50 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-teal-500/50 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-green-500/50 rounded-br-lg" />

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-green-500/0 via-green-500/10 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>

           
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <HolographicButton
              onClick={onBack}
              variant="ghost"
              size="lg"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Upload</span>
            </HolographicButton>
            
            <div className="flex items-center gap-4">
              <HolographicButton
                onClick={handlePrevious}
                variant="secondary"
                size="lg"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </HolographicButton>
              
              <HolographicButton
                onClick={handleFlip}
                size="lg"
                className="min-w-[140px]"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
              </HolographicButton>
              
              <HolographicButton
                onClick={handleNext}
                variant="secondary"
                size="lg"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </HolographicButton>
            </div>
          </div>

          {/* Card Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {flashcards.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsFlipped(false)
                }}
                className={cn(
                  'relative w-3 h-3 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-cyan-500 scale-125 shadow-[0_0_10px_#00ffff]'
                    : studiedCards.has(index)
                    ? 'bg-green-500'
                    : 'bg-white/20'
                )}
              >
                {studiedCards.has(index) && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="text-center mt-8 pt-6 border-t border-white/10">
            <p className="text-white/50 text-sm mb-2">Keyboard Shortcuts</p>
            <div className="flex justify-center gap-4">
              {[
                { key: '← / →', action: 'Navigate cards' },
                { key: 'SPACE', action: 'Flip card' },
                { key: 'ENTER', action: 'Reveal answer' },
              ].map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="px-3 py-1 rounded-lg bg-black/50 border border-white/10 text-white/70 text-sm"
                >
                  <span className="font-mono text-cyan-400">{shortcut.key}</span>
                  <span className="mx-2">•</span>
                  <span>{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CyberBorder>
    </div>
  )
}