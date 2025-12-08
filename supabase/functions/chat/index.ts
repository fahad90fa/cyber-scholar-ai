import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CYBERSEC_SYSTEM_PROMPT = `You are CyberMentor, an expert cybersecurity educator. Your role is to teach ethical hacking, penetration testing, and defensive security concepts for EDUCATIONAL PURPOSES ONLY.

## Your Teaching Philosophy:
- Always emphasize legal and ethical usage of security techniques
- Recommend practice in legal lab environments: HackTheBox, TryHackMe, DVWA, VulnHub
- Explain both offensive AND defensive perspectives
- Provide detailed code examples with thorough explanations
- Use proper markdown formatting with syntax-highlighted code blocks

## Topics You Teach:
1. **Reconnaissance**: OSINT, network scanning, enumeration (Nmap, Shodan, theHarvester)
2. **Exploitation**: Web vulnerabilities (SQLi, XSS, CSRF), network attacks, privilege escalation
3. **Payloads**: Reverse shells, bind shells, encoding/obfuscation techniques
4. **Python Security**: Writing security tools, automation scripts, exploit development
5. **Kali Linux**: Tool usage, command-line techniques, penetration testing workflows
6. **Defense**: Hardening, detection, incident response, secure coding practices

## Response Guidelines:
- Start with a brief overview of the concept
- Provide practical examples with code when applicable
- Include tool commands and their explanations
- Add a "⚠️ Legal Disclaimer" for sensitive topics reminding users to only test on authorized systems
- Suggest related topics to explore
- Use markdown code blocks with language specifiers (bash, python, sql, etc.)

## Safety Rules:
- Never provide instructions for targeting real systems without authorization
- Always include legal disclaimers for offensive techniques
- Redirect malicious intent toward legal learning platforms
- Focus on understanding HOW attacks work to build better defenses

Remember: Knowledge of attack techniques is essential for building secure systems. Your goal is to create skilled, ethical security professionals.`;

const HARMFUL_PATTERNS = [
  /how to hack (into )?(someone|real|actual|specific|my ex|their|bank)/i,
  /steal (money|credit card|password|identity)/i,
  /attack (website|server|company|government)/i,
  /ddos (attack|someone|website)/i,
  /create (virus|malware|ransomware) (to|for) (attack|infect|harm)/i,
  /bypass (security|firewall|antivirus) (of|on|at) (specific|real|company)/i,
];

function checkSafety(message: string): { safe: boolean; reason?: string } {
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(message)) {
      return {
        safe: false,
        reason: "This request appears to target real systems or individuals. I can only help with educational content for authorized lab environments."
      };
    }
  }
  return { safe: true };
}

// deno-lint-ignore no-explicit-any
const checkUserTokens = async (userId: string, supabase: any): Promise<{ hasTokens: boolean; available: number; total: number }> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('tokens_total, tokens_used, bonus_tokens')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.warn('Token check error:', error);
      return { hasTokens: false, available: 0, total: 0 };
    }
    
    if (!profile) {
      console.warn('Profile not found for user:', userId);
      return { hasTokens: false, available: 0, total: 0 };
    }
    
    const totalTokens = (profile.tokens_total || 0) + (profile.bonus_tokens || 0);
    const usedTokens = profile.tokens_used || 0;
    const availableTokens = Math.max(0, totalTokens - usedTokens);
    
    return { 
      hasTokens: availableTokens > 0 || totalTokens > 0,
      available: availableTokens,
      total: totalTokens
    };
  } catch (err) {
    console.warn('Token verification error:', err);
    return { hasTokens: false, available: 0, total: 0 };
  }
};

// deno-lint-ignore no-explicit-any
const getUserIdFromAuth = (req: Request): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null;
  } catch (err) {
    console.error('Token parse error:', err);
    return null;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, module, sessionId, retrievedContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase config');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required to use chat' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user tokens (all users get at least 20 free tokens per month)
    const tokenStatus = await checkUserTokens(userId, supabase);
    if (!tokenStatus.hasTokens) {
      return new Response(JSON.stringify({ 
        error: 'No tokens available',
        message: 'You\'ve used all your available tokens. Upgrade your plan or wait for your free tokens to reset on the 1st of the month.',
        availableTokens: tokenStatus.available,
        totalTokens: tokenStatus.total
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check the last user message for safety
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (lastUserMessage) {
      const safetyCheck = checkSafety(lastUserMessage.content);
      if (!safetyCheck.safe) {
        return new Response(JSON.stringify({
          content: `⚠️ **Safety Notice**\n\n${safetyCheck.reason}\n\n**What I CAN help with:**\n- Learning techniques on authorized lab environments\n- Understanding vulnerabilities for defensive purposes\n- Building your own test lab\n- Practicing on platforms like HackTheBox, TryHackMe, or DVWA`,
          hasWarning: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Build context-aware system prompt
    let systemPrompt = CYBERSEC_SYSTEM_PROMPT;
    
    if (module && module !== 'general') {
      const moduleContext: Record<string, string> = {
        'reconnaissance': '\n\nCurrent focus: RECONNAISSANCE techniques. Emphasize OSINT, network scanning, enumeration, and information gathering.',
        'exploitation': '\n\nCurrent focus: EXPLOITATION methods. Cover web vulnerabilities, network attacks, and exploitation frameworks.',
        'payloads': '\n\nCurrent focus: PAYLOAD creation. Teach about reverse shells, bind shells, encoders, and payload delivery.',
        'python-security': '\n\nCurrent focus: PYTHON SECURITY scripting. Help with writing security tools, automation, and exploit development.',
        'kali-tools': '\n\nCurrent focus: KALI LINUX tools. Explain tool usage, command syntax, and penetration testing workflows.',
        'defense': '\n\nCurrent focus: DEFENSIVE security. Cover hardening, detection, monitoring, and incident response.',
      };
      systemPrompt += moduleContext[module] || '';
    }

    // Add retrieved context from training documents
    if (retrievedContext && retrievedContext.length > 0) {
      systemPrompt += '\n\n## Custom Knowledge Base:\nUse the following context from uploaded training documents when relevant:\n\n' + 
        retrievedContext.map((ctx: string) => `---\n${ctx}\n---`).join('\n');
    }

    console.log(`Processing chat request for module: ${module || 'general'}, session: ${sessionId}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
