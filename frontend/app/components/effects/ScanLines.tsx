'use client'

import { useEffect, useState } from 'react'

export const ScanLines = () => {
  const [lines, setLines] = useState<Array<{ id: number; top: number }>>([])

  useEffect(() => {
    // Create initial scan lines
    const initialLines = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      top: Math.random() * 100
    }))
    setLines(initialLines)

    // Update scan lines periodically
    const interval = setInterval(() => {
      setLines(prev => 
        prev.map(line => ({
          ...line,
          top: line.top >= 100 ? 0 : line.top + 0.5 + Math.random() * 0.5
        }))
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {lines.map(line => (
        <div
          key={line.id}
          className="absolute left-0 w-full h-px bg-linear-to-r from-transparent via-green-500/20 to-transparent"
          style={{
            top: `${line.top}%`,
            animation: `scanLine 2s linear infinite`,
            animationDelay: `${line.id * 0.3}s`
          }}
        />
      ))}
      
      {/* Static scan lines */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          rgba(0, 255, 255, 0.1) 1px,
          rgba(0, 255, 255, 0.1) 2px
        )`,
        backgroundSize: '100% 4px'
      }} />
    </div>
  )
}