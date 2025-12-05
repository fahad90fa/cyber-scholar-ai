import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          {/* Terminal prompt styling */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <span className="text-primary font-mono text-sm">$</span>
          </div>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask about cybersecurity concepts..."}
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full resize-none rounded-lg border border-border bg-background pl-10 pr-4 py-3",
              "text-sm font-mono placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          
          {/* Cursor blink effect when empty */}
          {!input && !isLoading && (
            <span className="absolute left-10 top-1/2 -translate-y-1/2 w-2 h-5 bg-primary/70 terminal-cursor" />
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          variant="cyber"
          size="icon"
          className="h-12 w-12"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2 font-mono">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-primary">Enter</kbd> to send,{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-primary">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
