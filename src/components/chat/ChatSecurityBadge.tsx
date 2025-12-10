import { Shield, ShieldOff } from 'lucide-react'
import { useChatSecurity } from '@/hooks/useChatSecurity'

export function ChatSecurityBadge() {
  const { profile } = useChatSecurity()

  if (!profile?.chat_security_enabled) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
      <Shield className="w-4 h-4 text-purple-500" />
      <span className="text-xs font-medium text-purple-600">Secured</span>
    </div>
  )
}
