'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Trophy,
  Clock,
  Brain
} from 'lucide-react'
import { GradientText } from '../ui/GradientText'
import { HolographicButton } from '../ui/HolographicButton'
import { CyberBorder } from '../ui/CyberBorder'
import { MCQ } from '../../../types'
import { cn } from '../../../lib/utils'

interface QuizInterfaceProps {
  mcqs: MCQ[]
  onAnswer: (isCorrect: boolean) => void
  onBack: () => void
  language?: string
}

export const QuizInterface = ({ mcqs, onAnswer, onBack,language='English' }: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const currentQuestion = mcqs[currentQuestionIndex]
  const selectedAnswer = selectedAnswers[currentQuestionIndex]
  const isAnswered = selectedAnswer !== undefined
  const isCorrect = isAnswered && selectedAnswer === currentQuestion.answer

  // Timer: track elapsed seconds (unlimited). Stop when quizCompleted is true.
  useEffect(() => {
    // Start timer if not already running
    if (!timerRef.current && !quizCompleted) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // Stop timer when quiz completes
  useEffect(() => {
    if (quizCompleted && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [quizCompleted])

  const handleAnswerSelect = (option: string) => {
    if (isAnswered || quizCompleted) return
    
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }))
    setShowExplanation(true)
    
    const correct = option === currentQuestion.answer
    if (correct) {
      setScore(prev => prev + 1)
    }
    
    onAnswer(correct)
  }

  const handleNext = () => {
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowExplanation(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (quizCompleted) {
    const percentage = (score / mcqs.length) * 100
    
    return (
      <div className="container mx-auto px-4 py-12">
        <CyberBorder className="max-w-4xl mx-auto">
          <div className="p-8 lg:p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
            </motion.div>
            
            <h2 className="text-4xl font-bold mb-4">
              <GradientText text="QUIZ COMPLETE!" gradient="cyber" />
            </h2>
            
            <p className="text-white/70 text-lg mb-8">
              Assessment finished. Results analyzed.
            </p>
            
            {/* Score Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="holographic-card p-6 rounded-2xl">
                <div className="text-5xl font-bold text-green-400 mb-2">{score}/{mcqs.length}</div>
                <div className="text-white/60">Correct Answers</div>
              </div>
              
              <div className="holographic-card p-6 rounded-2xl">
                <div className="text-5xl font-bold text-emerald-400 mb-2">{percentage.toFixed(1)}%</div>
                <div className="text-white/60">Accuracy</div>
              </div>
              
              <div className="holographic-card p-6 rounded-2xl">
                <div className="text-5xl font-bold text-pink-400 mb-2">{formatTime(elapsedSeconds)}</div>
                <div className="text-white/60">Time Taken</div>
              </div>
            </div>
            
            {/* Performance Message */}
            <div className="mb-8">
              {percentage >= 80 ? (
                <div className="text-green-400 text-xl font-bold">
                  EXCEPTIONAL! Knowledge mastery achieved!
                </div>
              ) : percentage >= 60 ? (
                <div className="text-yellow-400 text-xl font-bold">
                  GOOD! Core concepts understood. Keep improving!
                </div>
              ) : (
                <div className="text-red-400 text-xl font-bold">
                  REVIEW NEEDED. Practice more to improve.
                </div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center">
              <HolographicButton onClick={onBack} variant="secondary">
                <ChevronLeft className="w-5 h-5" />
                <span>New Document</span>
              </HolographicButton>
              
              <HolographicButton onClick={() => {
                // Reset review state locally then navigate to Flashcards view
                setCurrentQuestionIndex(0)
                setShowExplanation(false)
                try {
                  window.dispatchEvent(new CustomEvent('navigation', { detail: { view: 'flashcards' } }))
                } catch (e) {
                  // ignore if dispatch fails
                }
              }}>
                <span>Review Questions</span>
              </HolographicButton>
            </div>
          </div>
        </CyberBorder>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CyberBorder className="max-w-6xl mx-auto">
        <div className="p-6 lg:p-8">
          {/* Quiz Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                <GradientText text="QUIZ" gradient="cyber" />
              </h2>
              <p className="text-green-400/70">Test your knowledge with AI-generated questions</p>
            </div>
            <div className="flex items-center gap-2 mb-2">
      <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
        {language}
      </div>
    </div>
            
            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 border border-green-500/30">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="font-mono text-lg font-bold text-green-300">{formatTime(elapsedSeconds)}</span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 border border-emerald-500/30">
                <Brain className="w-5 h-5 text-emerald-400" />
                <span className="font-mono text-lg font-bold text-emerald-300">{score}/{mcqs.length}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-green-400">Question {currentQuestionIndex + 1} of {mcqs.length}</span>
              <span className="text-white/70">{Math.round(((currentQuestionIndex + 1) / mcqs.length) * 100)}% Complete</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((currentQuestionIndex + 1) / mcqs.length) * 100}%` }}
                className="h-full bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full"
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="holographic-card p-8 rounded-2xl mb-8"
          >
            {/* Question Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(currentQuestion.difficulty)} border ${currentQuestion.difficulty === 'easy' ? 'border-green-500/30' : currentQuestion.difficulty === 'medium' ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                  <span className="text-white/50 text-sm">#{currentQuestion.id?.slice(0, 8)}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>
              
              <div className="text-right">
                <div className="text-4xl font-bold text-green-400 font-mono">
                  {String(currentQuestionIndex + 1).padStart(2, '0')}
                </div>
                <div className="text-white/30 text-sm">ID</div>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option
                const isCorrectOption = option === currentQuestion.answer
                const showCorrect = isAnswered && isCorrectOption
                const showIncorrect = isAnswered && isSelected && !isCorrectOption
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                    className={cn(
                      'relative p-6 rounded-xl text-left transition-all duration-300 border-2',
                      'transform-gpu hover:scale-105 active:scale-95',
                      showCorrect
                        ? 'border-green-500 bg-green-500/10'
                        : showIncorrect
                        ? 'border-red-500 bg-red-500/10'
                        : isSelected
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/10 bg-white/5 hover:border-green-500/50 hover:bg-green-500/5',
                      isAnswered ? 'cursor-default' : 'cursor-pointer'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
                          showCorrect
                            ? 'bg-green-500 text-white'
                            : showIncorrect
                            ? 'bg-red-500 text-white'
                            : isSelected
                            ? 'bg-green-500 text-black'
                            : 'bg-black/50 text-white/70 border border-white/10'
                        )}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg text-white font-medium">{option}</span>
                      </div>
                      
                      {showCorrect && (
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                      )}
                      {showIncorrect && (
                        <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 rounded-xl bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      )}>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <XCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">
                          {isCorrect ? 'Correct! 🎉' : 'Incorrect ❌'}
                        </h4>
                        <p className="text-white/70">
                          {isCorrect 
                            ? 'Great job! Your answer is correct.'
                            : `The correct answer is: `}
                          {!isCorrect && (
                            <span className="font-bold text-green-300">{currentQuestion.answer}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-20">
            <HolographicButton
              onClick={onBack}
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </HolographicButton>
            
            <HolographicButton
              onClick={handlePrevious}
              size="md"
              disabled={currentQuestionIndex === 0}
              variant="secondary"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </HolographicButton>
            
            {/* Question Dots */}
            <div className="flex gap-2">
              {mcqs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index)
                    setShowExplanation(false)
                  }}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all',
                    index === currentQuestionIndex
                      ? 'bg-green-500 scale-125 shadow-[0_0_10px_#22c55e]'
                      : selectedAnswers[index]
                      ? currentQuestion.answer === selectedAnswers[index]
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : 'bg-white/20'
                  )}
                />
              ))}
            </div>
            
            <HolographicButton
              onClick={handleNext}
              size="md"
              disabled={!isAnswered && currentQuestionIndex === mcqs.length - 1}
            >
              {currentQuestionIndex === mcqs.length - 1 ? (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Complete</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </HolographicButton>
          </div>
        </div>
      </CyberBorder>
    </div>
  )
}