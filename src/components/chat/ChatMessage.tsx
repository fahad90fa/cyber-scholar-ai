import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Bot, User, AlertTriangle } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isWarning?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isWarning = message.isWarning;

  return (
    <div
      className={cn(
        "flex gap-4 p-4 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border",
          isUser
            ? "bg-secondary/20 border-secondary/50 text-secondary"
            : isWarning
            ? "bg-terminal-amber/20 border-terminal-amber/50 text-terminal-amber"
            : "bg-primary/20 border-primary/50 text-primary"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : isWarning ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex-1 max-w-[80%] rounded-lg p-4 border",
          isUser
            ? "bg-secondary/10 border-secondary/30"
            : isWarning
            ? "bg-terminal-amber/10 border-terminal-amber/30"
            : "bg-card border-border"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              "text-xs font-mono font-semibold",
              isUser
                ? "text-secondary"
                : isWarning
                ? "text-terminal-amber"
                : "text-primary"
            )}
          >
            {isUser ? "user@terminal" : isWarning ? "security_warning" : "cyberai@system"}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>

        {/* Content */}
        <div className="text-sm">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
}
