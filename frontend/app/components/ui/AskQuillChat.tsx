'use client'

import { useId, useState } from 'react'
import { Feather, Send, X } from 'lucide-react'
import { askQuill } from '../../../lib/api/client'
import { generateId, stripAssistantMarkdown } from '../../../lib/utils'

type ChatAuthor = 'assistant' | 'user'

interface ChatMessage {
  id: string
  author: ChatAuthor
  text: string
}

export const AskQuillChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: generateId(),
    author: 'assistant',
    text: "Hi there! I'm Quill, your AI tutor. How can I help you today?",
  }])
  const panelId = useId()

  const togglePanel = () => setIsOpen((prev) => !prev)
  const closePanel = () => setIsOpen(false)

  const appendMessage = (author: ChatAuthor, text: string) => {
    const normalizedText = author === 'assistant' ? stripAssistantMarkdown(text) : text

    setMessages((prev) => [...prev, { id: generateId(), author, text: normalizedText }])
  }

  const handleSend = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (isSending) {
      return
    }

    const trimmed = inputValue.trim()
    if (!trimmed) {
      return
    }

    appendMessage('user', trimmed)
    setInputValue('')
    setIsSending(true)

    try {
      const data = await askQuill(trimmed)
      const reply = (data?.reply ?? '').trim() || 'I could not find an answer right now, please try again.'
      appendMessage('assistant', reply)
    } catch (error) {
      console.error('Ask Quill request failed:', error)
      appendMessage('assistant', 'Something went wrong while reaching Quill. Please try again in a moment.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Ask Quill chatbot"
        className={`fixed bottom-28 right-6 w-[min(420px,90vw)] h-[70vh] rounded-3xl border border-emerald-400/20 bg-gradient-to-b from-[#0c111d]/95 to-[#05070f]/95 shadow-[0_25px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl z-40 flex flex-col transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'
        }`}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400/80">Ask Quill</p>
            <h3 className="text-xl font-semibold text-white">Need a hand?</h3>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close chat panel"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-white/80">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.author === 'assistant' ? 'flex items-start gap-3' : 'flex justify-end'}
            >
              {message.author === 'assistant' ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center">
                    <Feather className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  </div>
                </>
              ) : (
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-emerald-500/10 border border-emerald-400/30 text-sm text-white/90">
                  <p className="leading-relaxed whitespace-pre-line">{message.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          className="p-4 border-t border-white/10 flex items-center gap-3"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder="Send a question..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/60"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(45,212,191,0.5)] transition-shadow"
            aria-label="Send message"
            disabled={isSending || !inputValue.trim()}
          >
            <Send className={`w-4 h-4 ${isSending ? 'opacity-50' : ''}`} />
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={togglePanel}
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="fixed bottom-8 right-6 z-50 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500/90 to-green-400/90 text-white font-semibold shadow-[0_15px_40px_rgba(16,185,129,0.4)] border border-emerald-300/40 hover:scale-105 active:scale-95 transition-transform"
      >
        <div className="w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center">
          <Feather className="w-5 h-5" />
        </div>
        <span>Ask Quill</span>
      </button>
    </>
  )
}
