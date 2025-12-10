import { useRef, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { TokenBalance } from '@/components/chat/TokenBalance'
import { useTrainingChat } from '@/hooks/useTrainingChat'
import { Button } from '@/components/ui/button'
import { Trash2, BookOpen, AlertCircle } from 'lucide-react'

const TrainingChatPage = () => {
  const { messages, isLoading, sendMessage, clearMessages, documents, loadDocuments } = useTrainingChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <MainLayout>
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/30 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Training Data Chat
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            {documents.length > 0
              ? `${documents.length} document${documents.length !== 1 ? 's' : ''} loaded`
              : 'No documents uploaded'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TokenBalance />
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-lg font-semibold mb-2">No Training Documents</h2>
              <p className="text-muted-foreground mb-4">
                Please upload training documents first to chat with them. Go to the Training section to upload files.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/training'}>
                Go to Training
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center px-4">
            <div className="text-center max-w-2xl">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary/50" />
              <h2 className="text-lg font-semibold mb-2">Start Training Chat</h2>
              <p className="text-muted-foreground mb-6">
                Ask questions about your uploaded training documents. I'll answer based only on the documents you've provided.
              </p>
              
              <div className="mb-6 p-4 rounded-lg bg-card border border-border text-left">
                <p className="text-sm font-semibold text-foreground mb-3">📚 Your Training Documents:</p>
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">•</span>
                      {doc.filename}
                    </p>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-600 mb-3 font-medium">💡 Try asking:</p>
                <ul className="text-sm text-blue-600 space-y-2 text-left">
                  <li>• Summarize the key points from [document name]</li>
                  <li>• What are the main topics covered in these documents?</li>
                  <li>• Explain [specific concept] from my training materials</li>
                  <li>• Compare ideas from different documents</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <ChatMessage
                  message={{
                    id: message.id,
                    role: message.role,
                    content: message.content,
                    timestamp: message.timestamp,
                  }}
                />
                {message.sources && message.sources.length > 0 && (
                  <div className="ml-14 mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs font-medium text-blue-600 mb-2">Sources:</p>
                    <div className="space-y-1">
                      {message.sources.map((source, idx) => (
                        <p key={idx} className="text-xs text-blue-600">
                          📄 {source.filename}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
                <div className="flex-1 max-w-[80%] rounded-lg p-4 bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary">training_ai</span>
                    <span className="text-xs text-muted-foreground">processing...</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {documents.length > 0 && <ChatInput onSend={sendMessage} isLoading={isLoading} />}
    </MainLayout>
  )
}

export default TrainingChatPage
