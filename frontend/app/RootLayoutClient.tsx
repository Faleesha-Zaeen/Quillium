'use client'

import { useState, useEffect } from 'react'   
import { Header } from './components/layout/Header'
import { AskQuillChat } from './components/ui/AskQuillChat'

type View = 'hero' | 'upload' | 'quiz' | 'flashcards' | 'progress' | 'shorts'

interface RootLayoutClientProps {
  children: React.ReactNode
}

export const RootLayoutClient = ({ children }: RootLayoutClientProps) => {
  const [currentView, setCurrentView] = useState<View>('hero')
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    // Check if we have data in localStorage
    try {
      const savedData = localStorage.getItem('quillium_data')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setHasData(!!parsedData && typeof parsedData === 'object' && 'mcqs' in parsedData)
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }

    // Listen for storage changes *and* an in-app custom event to update header navigation state
    const handleStorageChange = () => {
      try {
        const savedData = localStorage.getItem('quillium_data')
        setHasData(!!savedData && (JSON.parse(savedData)?.mcqs?.length > 0))
      } catch (error) {
        console.error('Error loading from localStorage:', error)
      }
    }

    const handleDataUpdate = (e: Event) => {
      try {
        const custom = e as CustomEvent<{ hasData: boolean }>
        if (custom?.detail && typeof custom.detail.hasData === 'boolean') {
          setHasData(!!custom.detail.hasData)
          return
        }
      } catch (err) {
        // ignore and fallback
      }

      // fallback to reading localStorage
      handleStorageChange()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('quillium:data:updated', handleDataUpdate as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('quillium:data:updated', handleDataUpdate as EventListener)
    }
  }, [])

  // Redirect hash `#features` to the features page so existing button works unchanged
  useEffect(() => {
    const handleHash = () => {
      try {
        if (typeof window !== 'undefined' && window.location.hash === '#features') {
          // Navigate to /features (full navigation is fine here)
          window.location.href = '/features'
        }
      } catch (e) {
        console.error('Hash redirect error', e)
      }
    }

    // Check initially in case page loaded with the hash
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const handleNavigate = (view: View) => {
    setCurrentView(view)
    // Dispatch custom event that page.tsx can listen to
    window.dispatchEvent(new CustomEvent('navigation', { detail: { view } }))
  }

  // Listen for navigation events dispatched from pages/components so header stays in sync
  useEffect(() => {
    const handleNavEvent = (e: Event) => {
      try {
        const custom = e as CustomEvent<{ view: View }>
        if (custom?.detail && custom.detail.view) {
          setCurrentView(custom.detail.view)
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('navigation', handleNavEvent as EventListener)
    return () => window.removeEventListener('navigation', handleNavEvent as EventListener)
  }, [])

  return (
    <>
      <Header 
        currentView={currentView}
        onNavigate={handleNavigate}
        hasData={hasData}
      />
      <main className="flex-1">
        {children}
      </main>
      <AskQuillChat />
    </>
  )
}
