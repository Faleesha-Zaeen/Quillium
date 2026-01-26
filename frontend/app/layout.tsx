import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Orbitron, Rajdhani } from 'next/font/google'
import './globals.css'
import { MatrixRain } from './components/effects/MatrixRain'
import { ScanLines } from './components/effects/ScanLines'
import { RootLayoutClient } from './RootLayoutClient'


const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
})

const rajdhani = Rajdhani({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quillium | Learning Platform',
  description: 'Transform PDFs into interactive learning experiences with AI-powered quizzes and smart flashcards',
  keywords: ['AI Learning', 'PDF Quiz', 'Education', 'Flashcards', 'Interactive Learning'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body className={`${inter.className} bg-black text-white overflow-x-hidden`}>
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
        {/* Background Effects */}
        <MatrixRain intensity={0.1} />
        <ScanLines />
        
        {/* Glow Effects */}
        <div className="fixed top-0 left-0 w-full h-96 bg-linear-to-b from-green-500/10 via-emerald-500/5 to-transparent -z-10 blur-3xl" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-linear-to-t from-teal-500/10 via-green-500/5 to-transparent -z-10 blur-3xl" />
        
        <div className="relative min-h-screen flex flex-col">
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </div>
      </body>
    </html>
  )
}