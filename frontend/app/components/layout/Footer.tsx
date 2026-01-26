'use client'

import { Heart, Code, ExternalLink } from 'lucide-react'
import { GradientText } from '../ui/GradientText'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <GradientText 
                  text="QUILLIUM" 
                  gradient="cyber"
                  className="text-2xl font-bold"
                />
                <p className="text-sm text-white/50 mt-1">AI-Powered Learning</p>
              </div>
            </div>
            <p className="text-white/60 text-sm">
              Transform documents into interactive learning experiences with cutting-edge AI technology.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Quick Links</h3>
            <div className="space-y-2">
              {['Features', 'Documentation', 'API', 'Pricing', 'Support'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-white/60 hover:text-green-400 transition-colors text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Powered By</h3>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'FastAPI', 'OpenAI', 'Tailwind', 'Framer'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/70 border border-white/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <span>© {currentYear} Quillium. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-pink-500" /> by Quillium Team
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-white/60 hover:text-cyan-400 transition-colors text-sm flex items-center gap-1"
            >
              Terms <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="#"
              className="text-white/60 hover:text-cyan-400 transition-colors text-sm flex items-center gap-1"
            >
              Privacy <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}