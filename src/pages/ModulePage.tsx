import { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Trash2, Search, Bug, Package, Code, Terminal, Shield } from "lucide-react";

const moduleConfig: Record<string, { 
  title: string; 
  description: string; 
  icon: typeof Search;
  color: string;
  placeholder: string;
  systemContext: string;
}> = {
  recon: {
    title: "Reconnaissance Module",
    description: "Learn information gathering and enumeration techniques",
    icon: Search,
    color: "text-terminal-cyan",
    placeholder: "Ask about reconnaissance techniques, OSINT, or enumeration...",
    systemContext: "Focus on reconnaissance, OSINT, network scanning, and enumeration techniques.",
  },
  exploitation: {
    title: "Exploitation Module",
    description: "Study vulnerability exploitation methods",
    icon: Bug,
    color: "text-terminal-amber",
    placeholder: "Ask about vulnerabilities, exploits, or attack vectors...",
    systemContext: "Focus on vulnerability exploitation, common attack vectors, and exploit development.",
  },
  payloads: {
    title: "Payloads Module",
    description: "Understand payload creation and delivery",
    icon: Package,
    color: "text-terminal-red",
    placeholder: "Ask about payload types, encoding, or delivery methods...",
    systemContext: "Focus on payload creation, encoding, obfuscation, and delivery mechanisms.",
  },
  python: {
    title: "Python Security Module",
    description: "Learn security scripting with Python",
    icon: Code,
    color: "text-primary",
    placeholder: "Ask for Python security scripts or automation...",
    systemContext: "Focus on Python security scripting, automation, and tool development.",
  },
  kali: {
    title: "Kali Linux Tools",
    description: "Master Kali Linux security tools",
    icon: Terminal,
    color: "text-secondary",
    placeholder: "Ask about Kali tools like Nmap, Burp Suite, Metasploit...",
    systemContext: "Focus on Kali Linux tools, their usage, and practical examples.",
  },
  defense: {
    title: "Defense Module",
    description: "Learn defensive security strategies",
    icon: Shield,
    color: "text-primary",
    placeholder: "Ask about security hardening, monitoring, or incident response...",
    systemContext: "Focus on defensive security, hardening, monitoring, and incident response.",
  },
};

const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const config = moduleConfig[moduleId || ""] || moduleConfig.recon;
  const { messages, isLoading, sendMessage, clearMessages } = useChat(config.systemContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const Icon = config.icon;

  return (
    <MainLayout>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{config.title}</h1>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
            <div className={`w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 ${config.color}`}>
              <Icon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {config.description}. Ask questions and learn with practical examples.
            </p>
            <div className="bg-card border border-border rounded-lg p-4 max-w-md">
              <p className="text-sm text-muted-foreground font-mono">
                💡 Tip: All responses include defensive perspectives and ethical guidelines.
              </p>
            </div>
          </div>
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
                  <div className="flex gap-1">
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
      <ChatInput 
        onSend={sendMessage} 
        isLoading={isLoading}
        placeholder={config.placeholder}
      />
    </MainLayout>
  );
};

export default ModulePage;
