'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Brain, FileText } from 'lucide-react'
import { GradientText } from '../ui/GradientText'
import { HolographicButton } from '../ui/HolographicButton'

interface HeroProps {
  onGetStarted: () => void
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  const features = [
    {
      icon: FileText,
      title: 'PDF Intelligence',
      description: 'Extract knowledge from any document format',
      color: 'text-green-400',
    },
    {
      icon: Brain,
      title: 'AI-Powered Quizzes',
      description: 'Smart, adaptive question generation',
      color: 'text-green-400',
    },
    {
      icon: Zap,
      title: 'Instant Learning',
      description: 'Real-time feedback & progress tracking',
      color: 'text-green-400',
    },
    {
      icon: Sparkles,
      title: 'Smart Interface',
      description: 'Simple, intuitive experience',
      color: 'text-green-300',
    },
  ]

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-linear-to-br from-black via-emerald-900/10 to-green-900/10" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Main Title */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                <Sparkles className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">AI powered learning tool</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
                <span className="block">TRANSFORM</span>
                <GradientText 
                  text="DOCUMENTS" 
                  gradient="cyber"
                  className="block"
                />
                <span className="block">INTO KNOWLEDGE</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light">
                Upload any PDF. Get interactive quizzes, holographic flashcards, and 
                <span className="text-green-400"> AI-powered insights</span> instantly.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <HolographicButton
                size="lg"
                onClick={onGetStarted}
                className="group"
              >
                <span>Start Learning Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </HolographicButton>
              
              <HolographicButton
                variant="secondary"
                size="lg"
                onClick={() => window.open('#features', '_self')}
              >
                <span>See Features</span>
              </HolographicButton>
            </div>
          <br></br>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: '50+', label: 'Languages' },
                { value: '∞', label: 'Documents' },
                { value: 'AI', label: 'Powered' },
                { value: '100%', label: 'Interactive' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-green-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="holographic-card p-6 rounded-2xl cursor-pointer group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-linear-to-br from-${feature.color.split('-')[1]}-500/20 to-transparent border border-${feature.color.split('-')[1]}-500/30`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-green-300 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-white/60 text-sm">
                    {feature.description}
                  </p>
                  
                  {/* Hover line */}
                  <div className="h-0.5 bg-linear-to-r from-transparent via-green-500 to-transparent w-0 group-hover:w-full transition-all duration-500 mt-4" />
                </motion.div>
              )
            })}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="text-center">
              <div className="w-6 h-10 rounded-full border-2 border-green-500/50 mx-auto mb-2 relative">
                <div className="w-1 h-3 bg-green-400 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-bounce" />
              </div>
              <span className="text-green-400/70 text-sm font-mono">SCROLL</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}