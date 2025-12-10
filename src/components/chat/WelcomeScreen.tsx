import { Shield, Terminal, Code, Search, Bug, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onQuickStart: (prompt: string) => void;
}

const quickStarts = [
  {
    icon: Search,
    title: "Reconnaissance",
    prompt: "Explain the reconnaissance phase of ethical hacking and common tools used for information gathering.",
    color: "text-terminal-cyan",
  },
  {
    icon: Bug,
    title: "Vulnerability Analysis",
    prompt: "What are the OWASP Top 10 vulnerabilities and how can I identify them in web applications?",
    color: "text-terminal-amber",
  },
  {
    icon: Code,
    title: "Python Security",
    prompt: "Write a Python script for network scanning using the scapy library with detailed explanations.",
    color: "text-primary",
  },
  {
    icon: Package,
    title: "Payload Creation",
    prompt: "Explain how to create a reverse shell payload for educational purposes in a controlled lab environment.",
    color: "text-terminal-red",
  },
];

export function WelcomeScreen({ onQuickStart }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse-glow">
          <Shield className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center">
          <Terminal className="w-4 h-4 text-secondary" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-primary text-glow mb-2 font-mono">
        CyberSecurity AI
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Your educational companion for learning ethical hacking, penetration testing, 
        and cybersecurity defense strategies.
      </p>

      {/* Disclaimer */}
      <div className="bg-terminal-amber/10 border border-terminal-amber/30 rounded-lg p-4 mb-8 max-w-lg">
        <p className="text-sm text-terminal-amber text-center font-mono">
          ⚠️ EDUCATIONAL PURPOSE ONLY • Practice only in authorized environments
        </p>
      </div>

      {/* Quick Start */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {quickStarts.map((item) => (
          <Button
            key={item.title}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 text-left hover:bg-card hover:border-primary/50 transition-all group overflow-hidden"
            onClick={() => onQuickStart(item.prompt)}
          >
            <div className="flex items-center gap-2 w-full min-w-0">
              <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {item.title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 w-full">
              {item.prompt}
            </p>
          </Button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-8 font-mono">
        Powered by AI • Recommended: HackTheBox, TryHackMe, DVWA for practice
      </p>
    </div>
  );
}
