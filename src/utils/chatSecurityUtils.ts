import type { PasswordStrengthResult } from '@/types/chatSecurity.types'

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const metRequirements = Object.values(requirements).filter(Boolean).length
  
  const feedback: string[] = []
  
  if (!requirements.minLength) {
    feedback.push('At least 8 characters required')
  }
  if (!requirements.hasUppercase) {
    feedback.push('Add uppercase letters (A-Z)')
  }
  if (!requirements.hasLowercase) {
    feedback.push('Add lowercase letters (a-z)')
  }
  if (!requirements.hasNumber) {
    feedback.push('Add numbers (0-9)')
  }
  if (!requirements.hasSpecialChar) {
    feedback.push('Add special characters (!@#$%^&*)')
  }

  const score = Math.floor((metRequirements / 5) * 4) as 0 | 1 | 2 | 3 | 4
  const isValid = Object.values(requirements).every(Boolean)

  return {
    score,
    feedback,
    isValid,
    requirements,
  }
}

export function getPasswordStrengthLabel(score: 0 | 1 | 2 | 3 | 4): string {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[score]
}

export function getPasswordStrengthColor(score: 0 | 1 | 2 | 3 | 4): string {
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500']
  return colors[score]
}

export function formatLockoutTime(lockedUntil: string): string {
  const lockDate = new Date(lockedUntil)
  const now = new Date()
  const diffMs = lockDate.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Account unlocked'
  
  const minutes = Math.floor(diffMs / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`
  }
  return `${seconds}s remaining`
}

export function isAccountLocked(lockedUntil?: string): boolean {
  if (!lockedUntil) return false
  return new Date(lockedUntil) > new Date()
}

export function getSecurityLogActionLabel(action: string): string {
  const labels: Record<string, string> = {
    'password_set': 'Password Set',
    'password_changed': 'Password Changed',
    'password_verified': 'Successful Access',
    'password_failed': 'Failed Access Attempt',
    'security_enabled': 'Security Enabled',
    'security_disabled': 'Security Disabled',
    'account_locked': 'Account Locked',
    'account_unlocked': 'Account Unlocked',
  }
  return labels[action] || action
}

export function getSecurityLogActionColor(action: string, success: boolean): string {
  if (!success) return 'text-red-500'
  
  const colors: Record<string, string> = {
    'password_set': 'text-blue-500',
    'password_changed': 'text-blue-500',
    'password_verified': 'text-green-500',
    'security_enabled': 'text-green-500',
    'security_disabled': 'text-orange-500',
  }
  return colors[action] || 'text-gray-500'
}

export function formatSecurityLogDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffSeconds < 60) return 'Just now'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

export async function compressImage(file: File, maxWidth: number = 400, maxHeight: number = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(resolve, 'image/jpeg', 0.8)
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
  })
}
