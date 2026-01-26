'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Hero } from './components/sections/Hero'
import { FileUploadZone } from './components/sections/FileUpload'
import { QuizInterface } from './components/sections/Quiz'
import { FlashcardHolo } from './components/sections/Flashcards'
import { ProgressDashboard } from './components/sections/Progress'
import { QuilliumShorts } from './components/sections/QuilliumShorts'
import { LanguageSelector } from './components/sections/Language'
import { LoadingOrb } from './components/ui/LoadingOrb'
import { StarField } from './components/effects/StarField'
import { uploadPDF } from '../lib/api/client'
import { MCQ, Flashcard, ProgressData } from '../types'

type View = 'hero' | 'upload' | 'quiz' | 'flashcards' | 'progress' | 'shorts'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('hero')
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processedData, setProcessedData] = useState<{
    text: string
    mcqs: MCQ[]
    flashcards: Flashcard[]
    pageCount: number
    language: string
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [progress, setProgress] = useState<ProgressData>({
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    quizzesTaken: 0,
    flashcardsStudied: 0,
  })

  useEffect(() => {
    // Check if we have data in localStorage
    try {
      const savedData = localStorage.getItem('quillium_data')
      const savedProgress = localStorage.getItem('quillium_progress')
      const savedLanguage = localStorage.getItem('quillium_language')
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        if (parsedData && typeof parsedData === 'object' && 'mcqs' in parsedData) {
          setProcessedData(parsedData)
        }
      }
      
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress)
        if (parsedProgress && typeof parsedProgress === 'object') {
          setProgress(parsedProgress)
        }
      }
      
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage)
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }

    // Listen for navigation events from Header
    const handleNavigation = (e: Event) => {
      const customEvent = e as CustomEvent<{ view: View }>
      setCurrentView(customEvent.detail.view)
    }

    window.addEventListener('navigation', handleNavigation)
    return () => window.removeEventListener('navigation', handleNavigation)
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setUploadProgress(0)
    setUploadedFile(file)
    
    try {
      // Show initial progress
      setUploadProgress(10)
      
      console.log(`📤 Uploading file with language: ${selectedLanguage}`)
      
      // Pass selected language to API
      const response = await uploadPDF(file, selectedLanguage, 20)
      
      setUploadProgress(80)
      
      // Handle API response
      const apiData = response.data || response
      
      console.log('📥 API Response received:', {
        language: selectedLanguage,
        mcqCount: apiData.mcqs?.length || 0,
        firstQuestion: apiData.mcqs?.[0]?.question || 'none'
      })
      
      const formattedData = {
        text: apiData.text || "Text extracted from PDF",
        mcqs: apiData.mcqs || [],
        flashcards: apiData.flashcards || [],
        pageCount: apiData.page_count || 1,
        language: selectedLanguage
      }
      
      // Check if translation happened
      if (selectedLanguage !== 'English' && apiData.mcqs?.length > 0) {
        const firstQuestion = apiData.mcqs[0].question
        // Check if text appears to be English (only ASCII alphanumeric, common punctuation)
        // If it contains non-ASCII chars, it's likely translated
        const isEnglishOnly = /^[A-Za-z0-9\s.,!?'"()\-]*$/.test(firstQuestion)
        const hasNonAscii = /[^\x00-\x7F]/.test(firstQuestion)
        
        if (isEnglishOnly && !hasNonAscii) {
          console.warn('⚠️ Warning: Questions appear to be in English despite requesting', selectedLanguage)
          console.warn('First question:', firstQuestion)
        } else {
          console.log('✅ Success: Questions appear to be in', selectedLanguage)
          console.log('First question:', firstQuestion)
        }
      }
      
      setProcessedData(formattedData)
      setUploadProgress(100)
      
      // Save to localStorage
      try {
        localStorage.setItem('quillium_data', JSON.stringify(formattedData))
        localStorage.setItem('quillium_language', selectedLanguage)
        // Notify other parts of the app (Header) that data is available
        try {
          window.dispatchEvent(new CustomEvent('quillium:data:updated', { detail: { hasData: true } }))
        } catch (e) {
          // ignore if dispatch fails
        }
      } catch (error) {
        console.error('Failed to save to localStorage:', error)
      }
      
      setTimeout(() => {
        setCurrentView('quiz')
        try {
          window.dispatchEvent(new CustomEvent('navigation', { detail: { view: 'quiz' } }))
        } catch (e) {
          // ignore
        }
      }, 500)
      
    } catch (error: any) {
      console.error('Upload failed:', error)
      // Show detailed error message from server if available
      const message = error?.message || (error?.response && error.response.data) || 'Failed to process PDF. Please try again.'
      alert(message)
      setUploadProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    localStorage.setItem('quillium_language', language)
    
    // If we have processed data, we should reprocess with new language
    if (processedData && uploadedFile) {
      alert(`Language changed to ${language}. Re-upload the file to translate content.`)
    }
  }

  const handleQuizAnswer = (isCorrect: boolean) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
        quizzesTaken: prev.quizzesTaken + 1,
      }
      
      try {
        localStorage.setItem('quillium_progress', JSON.stringify(newProgress))
      } catch (error) {
        console.error('Failed to save progress:', error)
      }
      
      return newProgress
    })
  }

  const handleFlashcardStudy = () => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        flashcardsStudied: prev.flashcardsStudied + 1
      }
      
      try {
        localStorage.setItem('quillium_progress', JSON.stringify(newProgress))
      } catch (error) {
        console.error('Failed to save progress:', error)
      }
      
      return newProgress
    })
  }

  const navigateTo = (view: View) => {
    setCurrentView(view)
    try {
      window.dispatchEvent(new CustomEvent('navigation', { detail: { view } }))
    } catch (e) {
      // ignore
    }
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('quillium_data')
    localStorage.removeItem('quillium_progress')
    localStorage.removeItem('quillium_language')
    setProcessedData(null)
    setUploadProgress(0)
    setProgress({
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      quizzesTaken: 0,
      flashcardsStudied: 0,
    })
    setCurrentView('upload')
    try {
      window.dispatchEvent(new CustomEvent('quillium:data:updated', { detail: { hasData: false } }))
    } catch (e) {
      // ignore
    }
    try {
      window.dispatchEvent(new CustomEvent('navigation', { detail: { view: 'upload' } }))
    } catch (e) {
      // ignore
    }
  }

  const retryUploadWithLanguage = async () => {
    if (uploadedFile) {
      await handleFileUpload(uploadedFile)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="relative min-h-screen">
      <StarField />
      
      <AnimatePresence mode="wait">
        {currentView === 'hero' && (
          
            <Hero onGetStarted={() => navigateTo('upload')} />
        )}

        {currentView === 'upload' && (
          
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <FileUploadZone 
                  onFileUpload={handleFileUpload}
                  isProcessing={isProcessing}
                  uploadProgress={uploadProgress}
                  selectedLanguage={selectedLanguage}
                />
              </div>
              <div className="lg:col-span-1 space-y-6">
                {/* Language Selector */}
                <LanguageSelector 
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                />
                
                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="holographic-card p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <LoadingOrb />
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Processing in {selectedLanguage}
                        </h3>
                        <p className="text-green-400/70">{uploadProgress}% complete</p>
                      </div>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                      
                    </div>
                  </div>
                )}
                
                {/* Current Data Info */}
                {processedData && (
                  <div className="holographic-card p-6 rounded-2xl space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Current Session
                      </h3>
                      <p className="text-green-400/70 text-sm">
                        Language: <span className="text-green-400">{selectedLanguage}</span>
                      </p>
                      <p className="text-green-400/70 text-sm">
                        Questions: <span className="text-green-400">{processedData.mcqs.length}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={retryUploadWithLanguage}
                        className="w-full px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        Re-process with {selectedLanguage}
                      </button>
                      
                      <button
                        onClick={clearLocalStorage}
                        className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Clear Data & Start Fresh
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          
        )}

        {currentView === 'quiz' && processedData && (
          
            <QuizInterface 
              mcqs={processedData.mcqs}
              onAnswer={handleQuizAnswer}
              onBack={() => navigateTo('upload')}
              language={selectedLanguage}
            />
        )}

        {currentView === 'flashcards' && processedData && (
          
            <FlashcardHolo 
              flashcards={processedData.flashcards}
              onStudy={handleFlashcardStudy}
              onBack={() => navigateTo('upload')}
              language={selectedLanguage}
            />
         
        )}

        {currentView === 'progress' && (
          
            <ProgressDashboard 
              progress={progress}
              onBack={() => navigateTo('upload')}
              language={selectedLanguage}
            />
        )}

        {currentView === 'shorts' && (
          
            <QuilliumShorts 
              onBack={() => navigateTo('upload')}
              language={selectedLanguage}
            />
        )}
      </AnimatePresence>

    </div>
  )
}