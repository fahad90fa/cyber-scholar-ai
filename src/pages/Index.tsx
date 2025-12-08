import { useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { TokenBalance } from "@/components/chat/TokenBalance";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const Index = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <MainLayout>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/30 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-semibold text-foreground">AI Chat</h1>
          <p className="text-sm text-muted-foreground font-mono">
            cybersec_educational_mode
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TokenBalance />
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onQuickStart={sendMessage} />
        ) : (
          <div className="max-w-4xl mx-auto py-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
                <div className="flex-1 max-w-[80%] rounded-lg p-4 bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary">
                      cyberai@system
                    </span>
                    <span className="text-xs text-muted-foreground">
                      processing...
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </MainLayout>
  );
};

export default Index;
