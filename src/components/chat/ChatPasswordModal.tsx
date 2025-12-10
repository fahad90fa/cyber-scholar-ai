import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useChatSecurity } from '@/hooks/useChatSecurity'
import { formatLockoutTime, isAccountLocked } from '@/utils/chatSecurityUtils'

interface ChatPasswordModalProps {
  isOpen: boolean
  onSuccess: () => void
}

export function ChatPasswordModal({ isOpen, onSuccess }: ChatPasswordModalProps) {
  const { profile, verifyPassword, isLoading, error } = useChatSecurity()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [attemptsRemaining, setAttemptsRemaining] = useState(5)
  const [lockoutTime, setLockoutTime] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setPassword('')
      setVerifyError(null)
      setShowPassword(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (profile?.chat_locked_until) {
      setLockoutTime(profile.chat_locked_until)
    }
  }, [profile?.chat_locked_until])

  const locked = profile?.chat_locked_until ? isAccountLocked(profile.chat_locked_until) : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyError(null)

    if (!password) {
      setVerifyError('Password is required')
      return
    }

    try {
      const response = await verifyPassword(password)
      if (response.success) {
        setPassword('')
        onSuccess()
      } else {
        setVerifyError(response.message)
        if (response.attempts_remaining !== undefined) {
          setAttemptsRemaining(response.attempts_remaining)
        }
      }
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Failed to verify password')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Access Required</DialogTitle>
          <DialogDescription>
            Enter your chat password to access your conversation history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {profile?.chat_security_hint && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-600 font-medium mb-1">Password Hint:</p>
              <p className="text-sm text-blue-600">{profile.chat_security_hint}</p>
            </div>
          )}

          {locked ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">Account Locked</p>
                  <p className="text-xs text-red-600">
                    Too many failed attempts. Try again in {lockoutTime ? formatLockoutTime(lockoutTime) : 'a few minutes'}.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Locked - Try Later
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Chat Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setVerifyError(null)
                    }}
                    disabled={isLoading}
                    className="pl-10 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {(verifyError || error) && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-600">{verifyError || error}</p>
                  {attemptsRemaining > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || locked}
              >
                {isLoading ? 'Verifying...' : 'Access Chat'}
              </Button>
            </form>
          )}

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-600">
              💡 If you forget your password, you can disable and re-enable security in your settings.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
