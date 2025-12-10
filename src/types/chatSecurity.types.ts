export interface ChatSecurityProfile {
  id?: string
  chat_security_enabled: boolean
  chat_password_hash?: string
  chat_password_salt?: string
  chat_password_set_at?: string
  chat_security_hint?: string
  failed_chat_password_attempts: number
  chat_locked_until?: string
  last_chat_access?: string
}

export interface ChatSecurityLogEntry {
  id: string
  user_id: string
  action: 'password_set' | 'password_changed' | 'password_verified' | 'password_failed' | 'security_enabled' | 'security_disabled' | 'account_locked' | 'account_unlocked'
  ip_address?: string
  user_agent?: string
  success: boolean
  metadata?: Record<string, any>
  created_at: string
}

export interface ChatSecuritySessionToken {
  token: string
  expiresAt: Date
}

export interface SetPasswordResponse {
  success: boolean
  message: string
}

export interface VerifyPasswordResponse {
  success: boolean
  message: string
  locked?: boolean
  locked_until?: string
  chatSessionToken?: string
  expiresAt?: string
  attempts_remaining?: number
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}

export interface DisableSecurityResponse {
  success: boolean
  message: string
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  feedback: string[]
  isValid: boolean
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}
