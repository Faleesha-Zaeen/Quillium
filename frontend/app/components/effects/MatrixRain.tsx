'use client'

import { useEffect, useRef } from 'react'

interface MatrixRainProps {
  intensity?: number
  speed?: number
  fontSize?: number
}

export const MatrixRain = ({ 
  intensity = 0.1, 
  speed = 20,
  fontSize = 14 
}: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Matrix characters - mix of numbers, Latin, and Japanese
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~'
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(1)

    // Draw function
    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = `rgba(10, 10, 15, ${intensity})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set text style
      ctx.font = `bold ${fontSize}px 'Courier New', monospace`
      
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)]
        
        // Gradient color from bright green to cyan
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#00ff88')
        gradient.addColorStop(0.5, '#00ffcc')
        gradient.addColorStop(1, '#00ffff')
        ctx.fillStyle = gradient
        
        // Draw character
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        // Move drop down
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        
        // Random speed variation
        drops[i] += Math.random() > 0.95 ? 2 : 1
      }
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      draw()
      animationId = requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [intensity, speed, fontSize])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 opacity-20"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}