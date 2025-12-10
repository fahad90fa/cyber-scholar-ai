import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChatSecurityService } from '@/services/chatSecurityService'
import { getSecurityLogActionLabel, getSecurityLogActionColor, formatSecurityLogDate } from '@/utils/chatSecurityUtils'
import { useAuthContext } from '@/context/AuthContext'
import { Loader } from 'lucide-react'
import type { ChatSecurityLogEntry } from '@/types/chatSecurity.types'

interface SecurityLogModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SecurityLogModal({ isOpen, onClose }: SecurityLogModalProps) {
  const { user } = useAuthContext()
  const [logs, setLogs] = useState<ChatSecurityLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadLogs = useCallback(async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const data = await ChatSecurityService.getSecurityLog(user.id)
      setLogs(data)
    } catch (err) {
      console.error('Failed to load security log:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isOpen && user?.id) {
      loadLogs()
    }
  }, [isOpen, user?.id, loadLogs])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Security Log</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No security events recorded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium text-sm ${getSecurityLogActionColor(log.action, log.success)}`}>
                        {getSecurityLogActionLabel(log.action)}
                      </p>
                      {!log.success && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                          Failed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      {formatSecurityLogDate(log.created_at)}
                    </p>

                    {log.ip_address && log.ip_address !== 'unknown' && (
                      <p className="text-xs text-muted-foreground">
                        IP: {log.ip_address}
                      </p>
                    )}

                    {log.metadata?.attempts && (
                      <p className="text-xs text-muted-foreground">
                        Failed attempts: {log.metadata.attempts}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
