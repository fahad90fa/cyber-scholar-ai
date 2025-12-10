import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatSecurityService } from '@/services/chatSecurityService'
import { useChatSecurityStore } from '@/stores/chatSecurityStore'
import { useAuthContext } from '@/context/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import type { ChatSecurityProfile } from '@/types/chatSecurity.types'

export function useChatSecurity() {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<ChatSecurityProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const session = useChatSecurityStore((state) => state.session)
  const isSessionValid = useChatSecurityStore((state) => state.isSessionValid)
  const setSession = useChatSecurityStore((state) => state.setSession)
  const clearSession = useChatSecurityStore((state) => state.clearSession)
  
  const isFetchingRef = useRef(false)

  const fetchProfile = useCallback(async () => {
    if (!user?.id || isFetchingRef.current) return
    
    isFetchingRef.current = true
    try {
      setIsLoading(true)
      const data = await ChatSecurityService.getProfile(user.id)
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [user?.id])

  const verifyPassword = useCallback(async (password: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    try {
      setIsLoading(true)
      setError(null)
      const response = await ChatSecurityService.verifyPassword(user.id, password)
      
      if (!response.success) {
        throw new Error(response.message)
      }

      if (response.chatSessionToken && response.expiresAt) {
        setSession(response.chatSessionToken, new Date(response.expiresAt))
      }

      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to verify password'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, setSession])

  const setPassword = useCallback(async (password: string, hint?: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    try {
      setIsLoading(true)
      setError(null)
      const response = await ChatSecurityService.setPassword(user.id, password, hint)
      
      if (!response.success) {
        throw new Error(response.message)
      }

      await fetchProfile()
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to set password'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchProfile])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    try {
      setIsLoading(true)
      setError(null)
      const response = await ChatSecurityService.changePassword(user.id, currentPassword, newPassword)
      
      if (!response.success) {
        throw new Error(response.message)
      }

      clearSession()
      await fetchProfile()
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to change password'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, clearSession, fetchProfile])

  const disableSecurity = useCallback(async (password: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    try {
      setIsLoading(true)
      setError(null)
      const response = await ChatSecurityService.disableSecurity(user.id, password)
      
      if (!response.success) {
        throw new Error(response.message)
      }

      clearSession()
      await fetchProfile()
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disable security'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, clearSession, fetchProfile])

  useEffect(() => {
    if (!user?.id) return
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`chat-security-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const oldData = payload.old as ChatSecurityProfile
          const newData = payload.new as ChatSecurityProfile

          if (oldData?.chat_password_set_at !== newData?.chat_password_set_at) {
            clearSession()
          }

          setProfile((prevProfile) => {
            if (JSON.stringify(prevProfile) === JSON.stringify(newData)) {
              return prevProfile
            }
            return newData
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const canAccessChat = useCallback(() => {
    if (!profile?.chat_security_enabled) return true
    return isSessionValid()
  }, [profile?.chat_security_enabled, isSessionValid])

  return {
    profile,
    isLoading,
    error,
    session,
    canAccessChat,
    verifyPassword,
    setPassword,
    changePassword,
    disableSecurity,
    fetchProfile,
    clearSession,
  }
}
