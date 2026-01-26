'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { HolographicButton } from '../ui/HolographicButton'
import { GradientText } from '../ui/GradientText'

const languages = {
  "European Languages": [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
    { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
    { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
    { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
    { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
  ],
  "Asian Languages": [
    { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
    { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
    { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
    { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
    { code: "tl", name: "Filipino", nativeName: "Filipino", flag: "🇵🇭" },
  ],
  "Other Languages": [
    { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
    { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷" },
    { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
    { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
    { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
    { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
    { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
    { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰" },
    { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮" },
    { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺" },
  ]
}

interface LanguageSelectorProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
}

export const LanguageSelector = ({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const allLanguages = Object.values(languages).flat()
  const selectedLang = allLanguages.find(lang => lang.name === selectedLanguage) || allLanguages[0]

  const filteredLanguages = allLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLanguageSelect = (languageName: string) => {
    onLanguageChange(languageName)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      {/* Language Selector Button */}
      <HolographicButton
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5" />
          <div className="text-left">
            <div className="font-bold">{selectedLang.name}</div>
            <div className="text-xs opacity-70">{selectedLang.nativeName}</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </HolographicButton>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 mt-2 w-full"
        >
          <div className="holographic-card rounded-2xl border border-cyan-500/30 p-4 max-h-96 overflow-y-auto">
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cyber-input w-full text-sm"
                autoFocus
              />
            </div>

            {/* Language List */}
            <div className="space-y-2">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      selectedLanguage === lang.name
                        ? 'bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-left">
                        <div className="font-medium text-white">{lang.name}</div>
                        <div className="text-sm text-white/60">{lang.nativeName}</div>
                      </div>
                    </div>
                    {selectedLanguage === lang.name && (
                      <Check className="w-5 h-5 text-cyan-400" />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-white/60">
                  No languages found
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm text-white/50">
                <span>Available Languages</span>
                <span>{allLanguages.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Language Info Card */}
      <div className="mt-4 holographic-card p-4 rounded-2xl">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Translation Powered By
        </h4>
        <div className="flex items-center gap-3 mb-3">
          <div className="px-2 py-1 bg-linear-to-r from-cyan-500/20 to-purple-500/20 rounded text-xs">
            AI Translation
          </div>
          <div className="px-2 py-1 bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded text-xs">
            50+ Languages
          </div>
        </div>
        <p className="text-sm text-white/60">
          Questions and flashcards will be automatically translated to your selected language
        </p>
      </div>
    </div>
  )
}