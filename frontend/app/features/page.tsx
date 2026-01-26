"use client"

import Link from 'next/link'
import { FileText, Brain, Zap, Layers, Globe } from 'lucide-react'
import { GradientText } from '../components/ui/GradientText'
import { HolographicButton } from '../components/ui/HolographicButton'

export default function FeaturesPage() {
  const features = [
    { icon: FileText, title: 'PDF Intelligence', desc: 'Extract structured information and key points from any PDF.' },
    { icon: Brain, title: 'AI-Powered Quizzes', desc: 'Generate meaningful multiple-choice questions to test understanding.' },
    { icon: Layers, title: 'Study Cards', desc: 'Turn questions into simple Q&A study cards for quick revision.' },
    { icon: Globe, title: 'Multi-Language', desc: 'Supports 50+ target languages for localized quizzes and cards.' },
    { icon: Zap, title: 'Fast Processing', desc: 'Process documents quickly and get instant quizzes and flashcards.' },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <GradientText text="Features" gradient="cyber" className="text-4xl font-bold mb-4" />
        <p className="text-white/70 mb-8">What Quillium does: upload a PDF, get quizzes, study cards and track progress across languages.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="p-6 rounded-2xl bg-black/70 border border-green-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-white">{f.title}</h4>
                    <p className="text-white/70 text-sm mt-1">{f.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center gap-4">
          
            <a>
              <HolographicButton variant="ghost" onClick={() => (window.location.href = '/')} size="lg">Back to Home</HolographicButton>
            </a>
         

          <HolographicButton onClick={() => (window.location.href = '/upload')} size="lg">Upload PDF</HolographicButton>
        </div>
      </div>
    </div>
  )
}
