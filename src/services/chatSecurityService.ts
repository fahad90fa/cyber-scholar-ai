import { supabase } from '@/integrations/supabase/client'
import type {
  SetPasswordResponse,
  VerifyPasswordResponse,
  ChangePasswordResponse,
  DisableSecurityResponse,
  ChatSecurityLogEntry,
  ChatSecurityProfile,
} from '@/types/chatSecurity.types'

export class ChatSecurityService {
  static async getProfile(userId: string): Promise<ChatSecurityProfile | null> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/api/v1/chat-security/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const error = await response.json()
        throw new Error(error.detail || 'Failed to fetch chat security profile')
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error fetching chat security profile:', errorMessage)
      return null
    }
  }

  static async setPassword(
    userId: string,
    password: string,
    hint?: string
  ): Promise<SetPasswordResponse> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('auth_token')
      
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      const supabaseUserId = supabaseUser?.id || userId
      
      const response = await fetch(`${apiUrl}/api/v1/chat-security/set-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: supabaseUserId,
          password,
          hint,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to set password')
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error setting password:', errorMessage)
      throw error
    }
  }

  static async verifyPassword(userId: string, password: string): Promise<VerifyPasswordResponse> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('auth_token')
      
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      const supabaseUserId = supabaseUser?.id || userId
      
      const response = await fetch(`${apiUrl}/api/v1/chat-security/verify-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: supabaseUserId,
          password 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to verify password')
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error verifying password:', errorMessage)
      throw error
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ChangePasswordResponse> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('auth_token')
      
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      const supabaseUserId = supabaseUser?.id || userId
      
      const response = await fetch(`${apiUrl}/api/v1/chat-security/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: supabaseUserId,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to change password')
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error changing password:', errorMessage)
      throw error
    }
  }

  static async disableSecurity(userId: string, password: string): Promise<DisableSecurityResponse> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('auth_token')
      
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      const supabaseUserId = supabaseUser?.id || userId
      
      const response = await fetch(`${apiUrl}/api/v1/chat-security/disable-security`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: supabaseUserId,
          password 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to disable security')
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error disabling security:', errorMessage)
      throw error
    }
  }

  static async getSecurityLog(userId: string, limit: number = 50): Promise<ChatSecurityLogEntry[]> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/api/v1/chat-security/log?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to fetch security log')
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error fetching security log:', errorMessage)
      return []
    }
  }


}
