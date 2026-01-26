'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Clapperboard, Sparkles, ChevronLeft, Loader2 } from 'lucide-react'
import { GradientText } from '../ui/GradientText'
import { HolographicButton } from '../ui/HolographicButton'
import { CyberBorder } from '../ui/CyberBorder'
import { generateShortScript } from '../../../lib/api/client'

declare global {
  interface Window {
    puter?: {
      ai?: {
        txt2speech?: (text: string) => Promise<string | { url?: string }>
      }
    }
  }
}

interface QuilliumShortsProps {
  onBack: () => void
  language?: string
}

export const QuilliumShorts = ({ onBack, language = 'English' }: QuilliumShortsProps) => {
  const [topic, setTopic] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [script, setScript] = useState('')
  const [isNarrationLoading, setIsNarrationLoading] = useState(false)
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false)
  const [ttsError, setTtsError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [captionCues, setCaptionCues] = useState<Array<{ text: string; duration: number }>>([])
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0)
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buildLocalFallbackScript = (subject: string) => {
    const safeSubject = subject || 'this topic'
    return `Here is a calm thirty second reminder about ${safeSubject}. Picture one clear scene, focus on why it matters right now, and carry that image with you for a quick review.`
  }

  const splitIntoSentences = (text: string) => {
    const ESTIMATED_WORDS_PER_SECOND = 2.8
    return text
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .map((sentence) => {
        const wordCount = sentence.split(/\s+/).filter(Boolean).length || 1
        const duration = Math.max(1200, Math.round((wordCount / ESTIMATED_WORDS_PER_SECOND) * 1000))
        return { text: sentence, duration }
      })
  }

  const clearCaptionTimer = () => {
    if (captionTimerRef.current) {
      clearTimeout(captionTimerRef.current)
      captionTimerRef.current = null
    }
  }

  const resetCaptions = () => {
    clearCaptionTimer()
    setCurrentCaptionIndex(0)
  }

  const startCaptionLoop = () => {
    if (!captionCues.length) return
    clearCaptionTimer()
    const playCaption = (index: number) => {
      if (index >= captionCues.length) {
        clearCaptionTimer()
        return
      }
      setCurrentCaptionIndex(index)
      captionTimerRef.current = setTimeout(() => {
        playCaption(index + 1)
      }, captionCues[index].duration)
    }

    playCaption(0)
  }

  const applyScriptState = (value: string) => {
    setScript(value)
    setCaptionCues(splitIntoSentences(value))
    setCurrentCaptionIndex(0)
    clearCaptionTimer()
  }

  const stopNarration = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsNarrationPlaying(false)
    resetCaptions()
  }

  const handleGenerateShort = async () => {
    if (isGenerating) return
    const subject = topic.trim() || 'Your topic'
    setShowPreview(true)
    setIsGenerating(true)
    applyScriptState('')
    setTtsError(null)
    stopNarration()
    try {
      const response = await generateShortScript(subject)
      const nextScript = response?.script?.trim()
      applyScriptState(nextScript || buildLocalFallbackScript(subject))
    } catch (error) {
      console.error('Short script generation failed:', error)
      applyScriptState(buildLocalFallbackScript(subject))
    } finally {
      setIsGenerating(false)
    }
  }

  const waitForPuterTts = () => {
    return new Promise<NonNullable<NonNullable<Window['puter']>['ai']>['txt2speech']>((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Audio playback is unavailable in this environment.'))
        return
      }

      const startedAt = Date.now()
      const timeout = 2000
      const pollInterval = 100

      const poll = () => {
        const tts = window.puter?.ai?.txt2speech
        if (tts) {
          resolve(tts)
          return
        }

        if (Date.now() - startedAt >= timeout) {
          reject(new Error('Puter text-to-speech is not available yet.'))
          return
        }

        setTimeout(poll, pollInterval)
      }

      poll()
    })
  }

  const handleNarrationClick = async () => {
    if (!script || isNarrationLoading || isNarrationPlaying) {
      return
    }

    setIsNarrationLoading(true)
    setTtsError(null)

    try {
      const tts = await waitForPuterTts()
      const result = await tts(script)

      const audio = (() => {
        if (typeof window !== 'undefined' && result instanceof window.Audio) {
          return result
        }
        if (result && typeof (result as HTMLAudioElement)?.play === 'function') {
          return result as HTMLAudioElement
        }
        if (typeof result === 'string') {
          return new Audio(result)
        }
        const fallbackUrl = (result as { url?: string })?.url
        if (fallbackUrl) {
          return new Audio(fallbackUrl)
        }
        throw new Error('Missing audio response from Puter.')
      })()

      stopNarration()
      audioRef.current = audio

      audio.onended = () => {
        setIsNarrationPlaying(false)
        audioRef.current = null
        resetCaptions()
      }

      audio.onerror = () => {
        setTtsError('Playback failed. Please try again.')
        stopNarration()
      }

      await audio.play()
      setIsNarrationPlaying(true)
      startCaptionLoop()
    } catch (error) {
      console.error('Puter TTS failed:', error)
      setTtsError(error instanceof Error ? error.message : 'Unable to play narration. Please try again.')
      stopNarration()
    } finally {
      setIsNarrationLoading(false)
    }
  }

  const handleStopNarration = () => {
    stopNarration()
  }

  useEffect(() => {
    return () => {
      stopNarration()
      clearCaptionTimer()
    }
  }, [])

  const activeCaption = isNarrationPlaying ? captionCues[currentCaptionIndex]?.text ?? '' : ''

  return (
    <div className="container mx-auto px-4 py-8">
      <CyberBorder className="max-w-6xl mx-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                <GradientText text="Quillium Shorts" gradient="cyber" />
              </h2>
              <p className="text-green-400/70">Snackable AI study reels are on the way.</p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <span className="text-green-400">🌐</span>
              <span className="text-white font-medium">Language: {language}</span>
            </div>
          </div>

          {/* Placeholder Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="holographic-card p-8 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="p-6 rounded-2xl bg-linear-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <Clapperboard className="w-12 h-12 text-green-300" />
              </div>
              <div className="text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-300 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Coming soon
                </div>
                <p className="text-white text-xl font-semibold">
                  Cinematic micro-lessons, generated from your documents.
                </p>
                <p className="text-white/60">
                  We&apos;re crafting looping study shorts that remix your PDFs into fast, visual refreshers.
                </p>
                <div className="pt-2 w-full">
                  <label htmlFor="quillium-shorts-topic" className="block text-white/70 text-sm font-semibold mb-2">
                    Enter a topic
                  </label>
                  <input
                    id="quillium-shorts-topic"
                    type="text"
                    className="cyber-input w-full text-sm"
                    placeholder="e.g. Arrays, Binary Search, Operating Systems"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                  />
                  <div className="mt-4">
                    <HolographicButton
                      onClick={handleGenerateShort}
                      className="w-full"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Short</span>
                        </>
                      )}
                    </HolographicButton>
                  </div>
                  {showPreview && (
                    <div className="mt-6 flex justify-center">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-[390px] aspect-[9/16] rounded-[32px] border border-white/10 bg-gradient-to-b from-cyber-dark/95 via-[#0b1119] to-[#05060a] shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden"
                      >
                        <video
                          className="absolute inset-0 h-full w-full object-cover z-0"
                          autoPlay
                          loop
                          muted
                          playsInline
                          aria-hidden="true"
                        >
                          <source src="/shorts/minecraft.mp4" type="video/mp4" />
                        </video>
                        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/5 via-transparent to-cyber-dark/60" />
                        <div className="relative z-20 flex h-full flex-col px-5 py-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-white">
                              🎬 {topic.trim() ? topic : 'Your topic'}
                            </h4>
                            <span className="text-xs uppercase tracking-wide text-green-300/70">Preview coming soon</span>
                          </div>
                          <div className="mt-4 flex-1" />
                          <div className="mt-4 space-y-3">
                            <HolographicButton
                              onClick={handleNarrationClick}
                              disabled={!script || isGenerating || isNarrationLoading || isNarrationPlaying}
                              className="w-full"
                            >
                              {isNarrationLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Preparing voice...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  <span>Play narration</span>
                                </>
                              )}
                            </HolographicButton>
                            {isNarrationPlaying && (
                              <HolographicButton variant="ghost" onClick={handleStopNarration} className="w-full">
                                <span>Stop narration</span>
                              </HolographicButton>
                            )}
                            {ttsError && (
                              <p className="text-red-400 text-sm text-center">{ttsError}</p>
                            )}
                          </div>
                          {activeCaption && (
                            <div className="absolute inset-x-4 bottom-6 z-30">
                              <div className="rounded-2xl bg-black/55 px-4 py-3 text-center text-white shadow-[0_0_30px_rgba(0,0,0,0.65)] backdrop-blur-md">
                                <p className="text-2xl font-extrabold leading-snug tracking-wide drop-shadow-[0_4px_25px_rgba(0,0,0,0.85)]">
                                  {activeCaption}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <HolographicButton onClick={onBack} variant="ghost">
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </HolographicButton>
            <HolographicButton disabled>
              <Sparkles className="w-4 h-4" />
              <span>Shorts beta unlocking soon</span>
            </HolographicButton>
          </div>
        </div>
      </CyberBorder>
    </div>
  )
}
