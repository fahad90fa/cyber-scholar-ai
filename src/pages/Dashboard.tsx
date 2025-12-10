import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, BookOpen, Shield, MessageSquare } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { hasValidSubscription } = useSubscription()

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat',
      description: 'Get instant answers to your cybersecurity questions',
      href: '/chat',
      locked: false,
    },
    {
      icon: BookOpen,
      title: 'Learning Modules',
      description: 'Learn cybersecurity concepts step by step',
      href: '/modules',
      locked: false,
    },
    {
      icon: Zap,
      title: 'Training Documents',
      description: 'Upload and train with your custom documents',
      href: '/training',
      locked: false,
    },
    {
      icon: Shield,
      title: 'Chat Security',
      description: 'Secure your chat sessions with password protection',
      href: '/settings',
      locked: false,
    },
  ]

  return (
    <MainLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to CyberSec AI</h1>
            <p className="text-muted-foreground text-lg">
              Your AI-powered cybersecurity learning and training platform
            </p>
          </div>

          {/* Subscription Status */}
          {!hasValidSubscription && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-3">
                To access all AI features, you need an active subscription
              </p>
              <Button
                onClick={() => navigate('/subscriptions')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Plans
              </Button>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className={feature.locked ? 'opacity-60' : 'hover:border-primary/50 transition-colors cursor-pointer'}
                  onClick={() => !feature.locked && navigate(feature.href)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className={`w-8 h-8 ${feature.locked ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <Button
                      onClick={() => navigate(feature.href)}
                      disabled={feature.locked}
                      variant={feature.locked ? 'ghost' : 'default'}
                      className="w-full"
                    >
                      {feature.locked ? 'Locked' : 'Open'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
