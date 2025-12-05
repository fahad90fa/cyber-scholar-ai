import { useState, useCallback } from "react";
import { Message } from "@/components/chat/ChatMessage";

const SYSTEM_PROMPT = `You are CyberAI, an advanced cybersecurity educational assistant. Your purpose is to teach ethical hacking, penetration testing, and cybersecurity concepts.

## Guidelines:
1. **Educational Focus**: Always explain the "why" behind techniques, not just the "how"
2. **Ethical Emphasis**: Remind users to only practice in authorized environments (HackTheBox, TryHackMe, DVWA, personal labs)
3. **Defense Perspective**: Include defensive countermeasures alongside offensive techniques
4. **Code Examples**: Provide well-commented code snippets with security best practices
5. **Legal Awareness**: Include disclaimers for sensitive topics

## Response Format:
- Use markdown for formatting
- Include code blocks with language specification
- Structure complex topics with headers
- Add practical examples and use cases

## Topics You Cover:
- Network reconnaissance and enumeration
- Web application security testing
- Vulnerability assessment
- Exploit development concepts
- Python security scripting
- Kali Linux tools and usage
- Defensive security measures
- Incident response basics
- Cryptography fundamentals

Remember: You are an educator. Always prioritize learning and ethical practice.`;

// Safety filter for potentially harmful requests
const HARMFUL_PATTERNS = [
  /how to hack (my|someone's|a) (bank|government|school)/i,
  /credit card (number|steal|hack)/i,
  /ddos attack on/i,
  /hack into (police|fbi|cia|nsa)/i,
  /steal (password|data|money) from/i,
];

const checkSafety = (message: string): { safe: boolean; warning?: string } => {
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(message)) {
      return {
        safe: false,
        warning: `⚠️ **Security Notice**

Your request appears to involve unauthorized access or illegal activities. As an educational AI, I cannot assist with:

- Unauthorized access to systems you don't own
- Stealing data or credentials
- Attacking production systems
- Any illegal hacking activities

**Instead, I recommend:**
1. Practice on legal platforms: HackTheBox, TryHackMe, DVWA
2. Set up your own lab environment
3. Obtain proper authorization before testing
4. Study for certifications: CEH, OSCP, CompTIA Security+

Would you like to learn about ethical alternatives or legal practice environments?`,
      };
    }
  }
  return { safe: true };
};

export function useChat(moduleContext?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Safety check
    const safetyResult = checkSafety(content);
    if (!safetyResult.safe) {
      const warningMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: safetyResult.warning!,
        timestamp: new Date(),
        isWarning: true,
      };
      setMessages((prev) => [...prev, warningMessage]);
      setIsLoading(false);
      return;
    }

    try {
      // For now, simulate AI response - will be replaced with actual API call
      // when Lovable Cloud is connected
      const response = await simulateAIResponse(content, moduleContext);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "⚠️ An error occurred while processing your request. Please try again.",
        timestamp: new Date(),
        isWarning: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [moduleContext]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}

// Simulated responses until AI backend is connected
async function simulateAIResponse(message: string, context?: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("reconnaissance") || lowerMessage.includes("recon")) {
    return `# Reconnaissance Phase in Ethical Hacking

Reconnaissance (or "recon") is the first phase of penetration testing where you gather information about your target.

## Types of Reconnaissance

### 1. Passive Reconnaissance
Gathering information without directly interacting with the target:

\`\`\`bash
# WHOIS lookup
whois example.com

# DNS enumeration
dig example.com ANY

# Google dorking
site:example.com filetype:pdf
\`\`\`

### 2. Active Reconnaissance
Directly interacting with the target system:

\`\`\`bash
# Nmap port scanning
nmap -sV -sC -oN scan.txt target.com

# Directory enumeration
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt
\`\`\`

## Popular Tools
- **Nmap**: Network scanning and enumeration
- **theHarvester**: Email and subdomain gathering
- **Shodan**: IoT and exposed services search
- **Maltego**: Visual link analysis

## 🔒 Defensive Measures
- Minimize exposed services
- Implement rate limiting
- Monitor for suspicious reconnaissance activity
- Use honeypots to detect attackers

> ⚠️ **Remember**: Only perform reconnaissance on systems you have explicit permission to test!`;
  }

  if (lowerMessage.includes("python") || lowerMessage.includes("script")) {
    return `# Python Security Scripting

Here's an example of a simple port scanner in Python:

\`\`\`python
#!/usr/bin/env python3
"""
Simple Port Scanner
Educational Purpose Only - Use on authorized systems only
"""

import socket
import concurrent.futures
from typing import List, Tuple

def scan_port(target: str, port: int) -> Tuple[int, bool]:
    """Scan a single port on the target."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((target, port))
        sock.close()
        return (port, result == 0)
    except socket.error:
        return (port, False)

def scan_ports(target: str, ports: List[int]) -> List[int]:
    """Scan multiple ports using thread pool."""
    open_ports = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
        futures = {executor.submit(scan_port, target, port): port for port in ports}
        
        for future in concurrent.futures.as_completed(futures):
            port, is_open = future.result()
            if is_open:
                open_ports.append(port)
                print(f"[+] Port {port} is OPEN")
    
    return sorted(open_ports)

if __name__ == "__main__":
    target = "127.0.0.1"  # Only scan authorized targets!
    common_ports = [21, 22, 23, 25, 53, 80, 443, 445, 3306, 3389, 8080]
    
    print(f"[*] Scanning {target}...")
    open_ports = scan_ports(target, common_ports)
    print(f"[*] Scan complete. {len(open_ports)} open ports found.")
\`\`\`

## Key Concepts:
1. **Socket Programming**: Low-level network communication
2. **Threading**: Parallel port scanning for speed
3. **Error Handling**: Graceful timeout handling

## 🛡️ Defensive Note
Implement port scan detection using tools like \`fail2ban\` or \`snort\` to detect and block scanning attempts.`;
  }

  // Default response
  return `# CyberSecurity Concepts

I understand you're asking about: **${message}**

As your cybersecurity educational assistant, I can help you learn about:

## 📚 Topics I Cover

### Offensive Security
- Network reconnaissance and enumeration
- Web application penetration testing
- Vulnerability assessment methodologies
- Exploit development basics
- Social engineering awareness

### Defensive Security
- Security hardening best practices
- Intrusion detection systems
- Incident response procedures
- Security monitoring and logging

### Practical Skills
- Python scripting for security
- Kali Linux tools and usage
- CTF challenge strategies
- Lab environment setup

## 🎯 How Can I Help?

Please ask me about specific topics like:
- "Explain SQL injection attacks and prevention"
- "Write a Python script for network scanning"
- "How do I set up a penetration testing lab?"
- "What tools are used for web app testing?"

> 💡 **Pro Tip**: Practice on legal platforms like [HackTheBox](https://hackthebox.com), [TryHackMe](https://tryhackme.com), or set up [DVWA](https://github.com/digininja/DVWA) locally.

---
*Remember: Always practice ethically and only on systems you have permission to test.*`;
}
