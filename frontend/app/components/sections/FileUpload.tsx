'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, File, Cloud, Zap, X, CheckCircle, AlertCircle, Loader2, Globe } from 'lucide-react'
import { HolographicButton } from '../ui/HolographicButton'
import { GradientText } from '../ui/GradientText'
import { CyberBorder } from '../ui/CyberBorder'

interface FileUploadZoneProps {
  onFileUpload: (file: File) => Promise<void>
  isProcessing: boolean
  uploadProgress?: number
  selectedLanguage?: string
}

export const FileUploadZone = ({ 
  onFileUpload, 
  isProcessing, 
  uploadProgress = 0,
  selectedLanguage = "English"  // Destructure and default to English
}: FileUploadZoneProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [internalUploadProgress, setInternalUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      } else {
        alert('Please upload a valid PDF file under 50MB')
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      } else {
        alert('Please upload a valid PDF file under 50MB')
      }
    }
  }

  const validateFile = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedTypes = ['application/pdf']
    
    if (!allowedTypes.includes(file.type)) {
      return false
    }
    
    if (file.size > maxSize) {
      return false
    }
    
    return true
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    console.log(`🌐 Uploading with language: ${selectedLanguage}`)
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setInternalUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 100)
    
    try {
      await onFileUpload(selectedFile)
      setInternalUploadProgress(100)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      clearInterval(progressInterval)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setInternalUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Use external progress if provided, otherwise use internal
  const displayProgress = uploadProgress > 0 ? uploadProgress : internalUploadProgress

  return (
    <CyberBorder intensity="medium" className="h-full">
      <div className="p-6 lg:p-8">
        {/* Header with Language Info */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                <Upload className="w-7 h-7 text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <File className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <GradientText 
                text="File Upload" 
                gradient="cyber"
                className="text-3xl font-bold"
              />
              <div className="flex items-center justify-center gap-2 mt-2">
                <Globe className="w-4 h-4 text-green-400" />
                <p className="text-green-400/70 font-mono text-sm">
                  Language: <span className="text-green-400 font-bold">{selectedLanguage}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Language Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border border-green-500/30 rounded-full mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-mono">
              Generating in <span className="font-bold">{selectedLanguage}</span>
            </span>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className={`
            relative border-3 border-dashed rounded-2xl p-8 lg:p-12 text-center
            transition-all duration-500 group cursor-pointer mb-8
            ${dragActive 
              ? 'border-green-500 bg-green-500/10 scale-[1.02] shadow-[0_0_40px_rgba(34,197,94,0.3)]' 
              : 'border-green-500/20 hover:border-green-500 hover:bg-green-500/5'
            }
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={isProcessing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {selectedFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* File Info */}
              <div className="flex items-center justify-center gap-4">
                <div className="p-4 rounded-xl bg-linear-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedFile.name}
                  </h3>
                  <p className="text-green-400/70 text-sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="w-3 h-3 text-green-400" />
                    <p className="text-xs text-green-400">
                      Will be processed in <span className="font-bold">{selectedLanguage}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Processing</span>
                  <span className="text-white/70">
                    {displayProgress}% • {selectedLanguage}
                  </span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${displayProgress}%` }}
                    className="h-full bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full"
                  />
                </div>
              </div>

              {/* Upload Button */}
              <HolographicButton
                onClick={handleUpload}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing in {selectedLanguage}...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Process in {selectedLanguage}</span>
                  </>
                )}
              </HolographicButton>
            </motion.div>
          ) : (
            <>
              {/* Floating Icons */}
              <div className="absolute top-6 left-6 animate-float">
                <Cloud className="w-6 h-6 text-green-400" />
              </div>
              <div className="absolute top-6 right-6 animate-float" style={{ animationDelay: '1s' }}>
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="absolute bottom-6 left-6 animate-float" style={{ animationDelay: '2s' }}>
                <Upload className="w-6 h-6 text-green-400" />
              </div>

              {/* Main Content */}
              <div className="relative z-10 space-y-8">
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <div className="w-40 h-40 rounded-full border-4 border-green-500/20 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-teal-500/20 flex items-center justify-center bg-linear-to-br from-green-500/10 to-transparent">
                          <Upload className="w-12 h-12 text-green-400" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-white">
                    Drag & Drop File
                  </h3>
                  <p className="text-green-400/70 text-lg">
                    Or click to browse your device
                  </p>
                  
                  {/* Language Display */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border border-green-500/30 rounded-full">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">
                      Selected: <span className="font-bold">{selectedLanguage}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="px-6 py-3 bg-black/50 rounded-full border border-green-500/30 text-green-400 font-mono text-sm">
                    .PDF FORMAT ONLY
                  </div>
                  <p className="text-sm text-green-400/50">
                    Max file size: 50MB • Processing in {selectedLanguage}
                  </p>
                </div>
              </div>

              {/* Holographic Effect */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'AI Processing',
              description: 'Smart analysis of document content',
              color: 'green'
            },
            {
              icon: Cloud,
              title: 'Multi-Language',
              description: `Supports 50+ languages - Currently: ${selectedLanguage}`,
              color: 'emerald'
            },
            {
              icon: AlertCircle,
              title: 'Security',
              description: 'End-to-end encryption for your documents',
              color: 'teal'
            }
          ].map((item, index) => {
            const Icon = item.icon
            
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="holographic-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl bg-linear-to-br from-${item.color}-500/20 to-transparent border border-${item.color}-500/30`}>
                    <Icon className={`w-6 h-6 text-${item.color}-400`} />
                  </div>
                  <h4 className="font-bold text-white text-lg">{item.title}</h4>
                </div>
                <p className="text-white/60 text-sm">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </CyberBorder>
  )
}