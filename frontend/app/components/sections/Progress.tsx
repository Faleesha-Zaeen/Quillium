'use client'

import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Brain, 
  Award,
  Zap,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { GradientText } from '../ui/GradientText'
import { HolographicButton } from '../ui/HolographicButton'
import { CyberBorder } from '../ui/CyberBorder'
import { ProgressData } from '../../../types'
import { cn } from '../../../lib/utils'

interface ProgressDashboardProps {
  progress: ProgressData
  onBack: () => void
  language?: string
}

export const ProgressDashboard = ({ progress, onBack,language='English' }: ProgressDashboardProps) => {
  const totalQuestions = progress.totalQuestions
  const accuracy = totalQuestions > 0 
    ? (progress.correctAnswers / totalQuestions) * 100 
    : 0
  const averageScore = totalQuestions > 0 ? accuracy : 0

  const stats = [
    {
      icon: Target,
      label: 'Total Questions',
      value: progress.totalQuestions,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Trophy,
      label: 'Correct Answers',
      value: progress.correctAnswers,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      label: 'Accuracy',
      value: `${accuracy.toFixed(1)}%`,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Brain,
      label: 'Flashcards Studied',
      value: progress.flashcardsStudied,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ]

  const achievements = [
    { 
      title: 'First Quiz', 
      icon: Zap, 
      unlocked: progress.quizzesTaken > 0,
      description: 'Complete your first quiz'
    },
    { 
      title: 'Perfect Score', 
      icon: Award, 
      unlocked: accuracy === 100 && totalQuestions > 0,
      description: 'Achieve 100% accuracy in a quiz'
    },
    { 
      title: 'Flashcard Master', 
      icon: Brain, 
      unlocked: progress.flashcardsStudied >= 10,
      description: 'Study 10+ flashcards'
    },
    { 
      title: 'Consistent Learner', 
      icon: Clock, 
      unlocked: progress.quizzesTaken >= 3,
      description: 'Complete 3+ quizzes'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <CyberBorder className="max-w-6xl mx-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                <GradientText text="YOUR PROGRESS" gradient="cyber" />
              </h2>
              <p className="text-green-400/70">Track your learning journey</p>
            </div>
            <div className="mb-4">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
        <span className="text-green-400">🌐</span>
        <span className="text-white font-medium">Language: {language}</span>
      </div>
    </div>
            
            <div className="flex gap-4">
              <HolographicButton
                onClick={onBack}
                variant="ghost"
                size="md"
              >
                <span>Back to Upload</span>
              </HolographicButton>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="holographic-card p-6 rounded-2xl group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-linear-to-br ${stat.gradient}/20 border border-${stat.color}-500/30`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-2">{stat.label}</h3>
                  <div className="h-1 bg-linear-to-r from-transparent via-white/20 to-transparent w-0 group-hover:w-full transition-all duration-500" />
                </motion.div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Accuracy Gauge */}
            <div className="lg:col-span-2">
              <div className="holographic-card p-6 rounded-2xl h-full">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                  Accuracy Analysis
                </h3>
                
                {/* Gauge Chart */}
                <div className="relative h-48 flex items-center justify-center">
                  {/* Outer Ring */}
                  <svg className="w-64 h-64" viewBox="0 0 200 200">
                    {/* Background Ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="12"
                    />
                    
                    {/* Progress Ring */}
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="url(#progressGauge)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="565"
                      strokeDashoffset={565 - (565 * accuracy) / 100}
                      initial={{ strokeDashoffset: 565 }}
                      animate={{ strokeDashoffset: 565 - (565 * accuracy) / 100 }}
                      transition={{ duration: 2, type: 'spring' }}
                      transform="rotate(-90 100 100)"
                    />
                    
                    <defs>
                      <linearGradient id="progressGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center Text */}
                  <div className="absolute text-center">
                    <div className="text-5xl font-bold text-white mb-2">
                      {accuracy.toFixed(1)}%
                    </div>
                    <div className="text-cyan-400/70">Overall Accuracy</div>
                  </div>
                </div>
                
                {/* Accuracy Labels */}
                <div className="flex justify-between mt-6">
                  {[
                    { label: 'Needs Work', color: 'text-red-400', range: '0-60%' },
                    { label: 'Good', color: 'text-yellow-400', range: '60-80%' },
                    { label: 'Excellent', color: 'text-green-400', range: '80-100%' },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className={`font-bold ${item.color}`}>{item.label}</div>
                      <div className="text-white/50 text-sm">{item.range}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <div className="holographic-card p-6 rounded-2xl h-full">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  Achievements
                </h3>
                
                <div className="space-y-4">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon
                    
                    return (
                      <div
                        key={achievement.title}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl transition-all duration-300',
                          achievement.unlocked
                            ? 'bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30'
                            : 'bg-white/5 border border-white/10 opacity-50'
                        )}
                      >
                        <div className={cn(
                          'p-2 rounded-lg',
                          achievement.unlocked
                            ? 'bg-linear-to-br from-yellow-500/20 to-orange-500/20'
                            : 'bg-white/5'
                        )}>
                          <Icon className={cn(
                            'w-5 h-5',
                            achievement.unlocked ? 'text-yellow-400' : 'text-white/30'
                          )} />
                        </div>
                        <div>
                          <div className={cn(
                            'font-bold',
                            achievement.unlocked ? 'text-white' : 'text-white/50'
                          )}>
                            {achievement.title}
                          </div>
                          <div className="text-sm text-white/50">
                            {achievement.description}
                          </div>
                        </div>
                        
                        {achievement.unlocked && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Quiz Performance */}
            <div className="holographic-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Quiz Performance
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Quizzes Taken', value: progress.quizzesTaken },
                  { label: 'Total Questions', value: progress.totalQuestions },
                  { label: 'Correct Answers', value: progress.correctAnswers },
                  { label: 'Incorrect Answers', value: progress.incorrectAnswers },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="text-white/70">{stat.label}</span>
                    <span className="text-white font-bold">{stat.value}</span>
                  </div>
                ))}
                
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cyan-400">Learning Progress</span>
                    <span className="text-white/70">
                      {Math.min(100, Math.round((progress.totalQuestions / 50) * 100))}%
                    </span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.min(100, (progress.totalQuestions / 50) * 100)}%` }}
                      className="h-full bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Study Activity */}
            <div className="holographic-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-cyan-400" />
                Study Activity
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Flashcards Studied', value: progress.flashcardsStudied },
                  { label: 'Average Score', value: `${averageScore.toFixed(1)}%` },
                  { label: 'Learning Streak', value: '1 day' },
                  { label: 'Total Study Time', value: '≈ 15 min' },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="text-white/70">{stat.label}</span>
                    <span className="text-white font-bold">{stat.value}</span>
                  </div>
                ))}
                
                {/* Study Tips */}
                <div className="mt-6 p-4 rounded-xl bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                  <h4 className="font-bold text-white mb-2">Learning Tip</h4>
                  <p className="text-white/70 text-sm">
                    {accuracy < 60 
                      ? 'Focus on reviewing study cards and retaking quizzes to improve accuracy.'
                      : accuracy < 80
                      ? 'Great progress! Try more challenging quizzes to reach expert level.'
                      : 'Excellent! Share your knowledge with others or explore advanced topics.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </CyberBorder>
    </div>
  )
}