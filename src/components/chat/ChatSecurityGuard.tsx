import { useState, useEffect, useMemo } from 'react'
import { useChatSecurity } from '@/hooks/useChatSecurity'
import { ChatPasswordModal } from './ChatPasswordModal'

interface ChatSecurityGuardProps {
  children: React.ReactNode
}

export function ChatSecurityGuard({ children }: ChatSecurityGuardProps) {
  const { profile, isLoading, session } = useChatSecurity()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const hasValidSession = useMemo(() => {
    if (!session?.token || !session?.expiresAt) return false
    return new Date() < session.expiresAt
  }, [session.token, session.expiresAt])

  const chatSecurityEnabled = useMemo(() => {
    return profile?.chat_security_enabled === true
  }, [profile?.chat_security_enabled])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (chatSecurityEnabled && !hasValidSession) {
      setShowPasswordModal(true)
    } else {
      setShowPasswordModal(false)
    }
  }, [chatSecurityEnabled, hasValidSession, isLoading])

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading security settings...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {showPasswordModal && (
        <ChatPasswordModal
          isOpen={showPasswordModal}
          onSuccess={handlePasswordSuccess}
        />
      )}
      {!showPasswordModal && children}
    </>
  )
}
