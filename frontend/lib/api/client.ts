import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add loading state
    if (typeof document !== 'undefined') {
      document.body.classList.add('loading')
    }
    return config
  },
  (error) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('loading')
    }
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('loading')
    }
    return response
  },
  (error) => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('loading')
    }
    
    if (error.response?.status === 401) {
      console.error('Unauthorized access')
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)

// @/lib/api/client.ts
export const uploadPDF = async (file: File, language: string = 'English', questionCount: number = 20) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)  // CRITICAL: Add language
  formData.append('question_count', questionCount.toString())
  
  console.log('Sending to API:', {
    filename: file.name,
    language: language,
    questionCount: questionCount
  })
  
  try {
    const url = `${API_BASE_URL}/process-pdf`
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('API response:', data)
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

export const getLanguages = async () => {
  try {
    const response = await apiClient.get('/languages')
    return response.data
  } catch (error) {
    console.error('Failed to fetch languages:', error)
    throw error
  }
}

export const generateShortScript = async (topic: string) => {
  try {
    const response = await apiClient.post('/generate-short-script', { topic })
    return response.data
  } catch (error) {
    console.error('Failed to generate short script:', error)
    throw error
  }
}

export const askQuill = async (message: string) => {
  const url = `${API_BASE_URL}/ask-quill`
  try {
    const response = await apiClient.post(url, { message })
    return response.data
  } catch (error) {
    console.error('Ask Quill request failed:', error)
    throw error
  }
}

// Mock data for development
export const mockUploadPDF = async (file: File) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    data: {
      text: "This is a mock response from the PDF. In a real scenario, this would contain the extracted text from your document.",
      mcqs: Array.from({ length: 10 }, (_, i) => ({
        id: `q${i + 1}`,
        question: `Sample question ${i + 1} about the document content?`,
        answer: `Correct answer for question ${i + 1}`,
        options: [
          `Correct answer for question ${i + 1}`,
          `Incorrect option A for question ${i + 1}`,
          `Incorrect option B for question ${i + 1}`,
          `Incorrect option C for question ${i + 1}`
        ],
        difficulty: i < 3 ? 'easy' : i < 7 ? 'medium' : 'hard'
      })),
      flashcards: Array.from({ length: 10 }, (_, i) => ({
        id: `f${i + 1}`,
        question: `Flashcard question ${i + 1}?`,
        answer: `Flashcard answer ${i + 1}`
      })),
      pageCount: 5,
      language: 'English'
    }
  }
}