export interface MCQ {
  id: string
  question: string
  answer: string
  options: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  explanation?: string
  category?: string
}

export interface Flashcard {
  id: string
  question: string
  answer: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface ProgressData {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  quizzesTaken: number
  flashcardsStudied: number
}

export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

export interface UploadResponse {
  success: boolean
  data?: {
    text: string
    mcqs: MCQ[]
    flashcards: Flashcard[]
    pageCount: number
    language: string
  }
  error?: string
}

export interface QuizSession {
  id: string
  score: number
  total: number
  timeSpent: number
  completedAt: Date
  answers: {
    questionId: string
    selected: string
    correct: boolean
    time: number
  }[]
}

export interface AudioConfig {
  enabled: boolean
  volume: number
}

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'cyber'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
  }
  animations: boolean
  particleIntensity: number
}

export interface UserSettings {
  theme: ThemeConfig
  audio: AudioConfig
  language: string
  notifications: boolean
  autoSave: boolean
}

// App State
export interface AppState {
  currentView: 'hero' | 'upload' | 'quiz' | 'flashcards' | 'progress'
  uploadedFile: File | null
  processedData: UploadResponse['data'] | null
  progress: ProgressData
  settings: UserSettings
}

// Quiz State
export interface QuizState {
  currentQuestion: number
  selectedAnswers: Record<number, string>
  showExplanation: boolean
  score: number
  timeLeft: number
  completed: boolean
}

// Flashcard State
export interface FlashcardState {
  currentIndex: number
  isFlipped: boolean
  studiedCards: Set<number>
}