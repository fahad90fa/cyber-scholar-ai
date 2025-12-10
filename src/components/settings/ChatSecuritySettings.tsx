import { useState } from 'react'
import { Shield, Lock, Eye, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useChatSecurity } from '@/hooks/useChatSecurity'
import { EnableSecurityModal } from './EnableSecurityModal'
import { ChangePasswordModal } from './ChangePasswordModal'
import { DisableSecurityModal } from './DisableSecurityModal'
import { SecurityLogModal } from './SecurityLogModal'

export function ChatSecuritySettings() {
  const { profile } = useChatSecurity()
  const [showEnableModal, setShowEnableModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)

  const isSecurityEnabled = profile?.chat_security_enabled

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Chat Security
        </h2>
        <p className="text-muted-foreground">
          Protect your chat history and conversations with a password
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold">Security Status</h3>
              <p className="text-sm text-muted-foreground">
                {isSecurityEnabled ? (
                  <span className="text-green-600">✓ Chat security is enabled</span>
                ) : (
                  <span className="text-gray-600">Chat security is not enabled</span>
                )}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isSecurityEnabled ? 'bg-green-500/10' : 'bg-gray-500/10'
              }`}
            >
              {isSecurityEnabled ? (
                <Shield className="w-6 h-6 text-green-500" />
              ) : (
                <Lock className="w-6 h-6 text-gray-500" />
              )}
            </div>
          </div>

          {isSecurityEnabled && profile?.chat_password_set_at && (
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Password Last Set:</p>
              <p className="text-sm text-muted-foreground">
                {new Date(profile.chat_password_set_at).toLocaleDateString()}
              </p>
              {profile.last_chat_access && (
                <>
                  <p className="text-sm font-medium mt-3">Last Access:</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(profile.last_chat_access).toLocaleDateString()} at{' '}
                    {new Date(profile.last_chat_access).toLocaleTimeString()}
                  </p>
                </>
              )}
            </div>
          )}

          {isSecurityEnabled && profile?.chat_security_hint && (
            <div className="space-y-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm font-medium text-blue-900">Password Hint:</p>
              <p className="text-sm text-blue-800">{profile.chat_security_hint}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Actions</h3>
        <div className="space-y-3">
          {isSecurityEnabled ? (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowChangeModal(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowLogModal(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Security Log
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDisableModal(true)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disable Security
              </Button>
            </>
          ) : (
            <>
              <Button
                className="w-full"
                onClick={() => setShowEnableModal(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Enable Chat Security
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Setting up chat security will also complete your account setup if not already done.
              </p>
            </>
          )}
        </div>
      </Card>

      <EnableSecurityModal
        isOpen={showEnableModal}
        onClose={() => setShowEnableModal(false)}
      />
      <ChangePasswordModal
        isOpen={showChangeModal}
        onClose={() => setShowChangeModal(false)}
      />
      <DisableSecurityModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
      />
      <SecurityLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
      />
    </div>
  )
}
