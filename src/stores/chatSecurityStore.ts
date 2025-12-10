import { create } from 'zustand'

interface ChatSecuritySession {
  token: string | null
  expiresAt: Date | null
}

interface ChatSecurityState {
  session: ChatSecuritySession
  isSessionValid: () => boolean
  setSession: (token: string, expiresAt: Date) => void
  clearSession: () => void
  hasSession: () => boolean
  loadSession: () => void
}

const STORAGE_KEY = 'chat_security_session'

const getStoredSession = (): ChatSecuritySession => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { token: null, expiresAt: null }
    
    const parsed = JSON.parse(stored)
    return {
      token: parsed.token || null,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    }
  } catch {
    return { token: null, expiresAt: null }
  }
}

const saveSession = (session: ChatSecuritySession) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: session.token,
      expiresAt: session.expiresAt?.toISOString() || null,
    }))
  } catch {
    console.error('Failed to save session to localStorage')
  }
}

export const useChatSecurityStore = create<ChatSecurityState>((set, get) => ({
  session: getStoredSession(),

  isSessionValid: () => {
    const { session } = get()
    if (!session.token || !session.expiresAt) return false
    return new Date() < session.expiresAt
  },

  setSession: (token: string, expiresAt: Date) => {
    const newSession = { token, expiresAt }
    set({ session: newSession })
    saveSession(newSession)
  },

  clearSession: () => {
    const emptySession = { token: null, expiresAt: null }
    set({ session: emptySession })
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      console.error('Failed to clear session from localStorage')
    }
  },

  hasSession: () => {
    const { session } = get()
    return !!session.token && !!session.expiresAt
  },

  loadSession: () => {
    const session = getStoredSession()
    set({ session })
  },
}))
