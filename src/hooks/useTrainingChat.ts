import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { trainingChatAPI } from '@/services/api'

export interface TrainingMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  sources?: Array<{
    filename: string
    source_name: string
  }>
}

export function useTrainingChat() {
  const [messages, setMessages] = useState<TrainingMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await trainingChatAPI.getTrainingDocuments()
      setDocuments(docs)
      
      if (docs.length === 0) {
        toast.info('No training documents found. Please upload documents first.')
      }
    } catch (error: any) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load training documents')
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    if (documents.length === 0) {
      toast.error('Please upload training documents first')
      return
    }

    const systemMessage = "Give ONLY code, CLI commands and deployment instructions. I dont want any explanation or details."
    const displayContent = `${content.trim()}\n\n(system_message)`
    const backendContent = `${content.trim()}\n\nIMPORTANT: ${systemMessage}`

    const userMessage: TrainingMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: displayContent,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response: any = await trainingChatAPI.sendTrainingMessage(backendContent)

      setMessages(prev => [
        ...prev,
        {
          id: response.message_id || crypto.randomUUID(),
          role: 'assistant',
          content: response.ai_response,
          timestamp: new Date(),
          sources: response.sources || [],
        },
      ])
    } catch (error: any) {
      console.error('Training chat error:', error)

      let errorMessage = error.message || 'Failed to send message'

      if (error.status === 403) {
        if (error.message?.includes('No tokens available')) {
          errorMessage =
            'You\'ve used all your available tokens. Upgrade your plan or wait for your free tokens to reset.'
        }
        toast.error(errorMessage)
        setMessages(prev => prev.filter(m => m.id !== userMessage.id))
      } else if (error.status === 401) {
        errorMessage = 'Please log in to use chat functionality.'
        toast.error(errorMessage)
        setMessages(prev => prev.filter(m => m.id !== userMessage.id))
      } else if (error.status === 400) {
        console.log('Got 400 response, which may contain helpful guidance')
      } else {
        toast.error(errorMessage)
        setMessages(prev => prev.filter(m => m.id !== userMessage.id))
      }
    } finally {
      setIsLoading(false)
    }
  }, [documents])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    documents,
    loadDocuments,
  }
}
