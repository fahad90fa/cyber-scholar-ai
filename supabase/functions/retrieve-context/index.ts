import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_PATTERNS = [
  /\b(hacking|ethical|penetration|security|testing)\b/i,
  /\b(research|vulnerability|exploit|payload)\b/i,
  /\b(ctf|capture|flag|hackathon|bug\s+bounty)\b/i,
  /\b(lab|sandbox|isolated|test|education|learning)\b/i,
  /\b(hackthebox|tryhackme|htb|thm|picoctf)\b/i,
  /\b(oscp|ceh|security\+|cissp|course)\b/i,
  /\b(nmap|burp|metasploit|wireshark|tcpdump)\b/i,
  /\b(reverse|engineering|malware|binary)\b/i,
  /\b(cryptography|encryption|decryption|hash)\b/i,
  /\b(network|application|web|defense|hardening)\b/i,
  /\b(reconnaissance|enumeration|scanning|footprint)\b/i,
  /\b(sql|injection|xss|csrf|overflow)\b/i,
  /\b(monitor|incident|response|analysis)\b/i,
  /\b(python|bash|shell|powershell|script)\b/i,
  /\b(kali|linux|tool|command|code)\b/i,
];

function sanitizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .slice(0, 500)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function validateQueryContent(query: string): { valid: boolean; reason?: string } {
  let matchedPatterns = 0;
  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.test(query)) {
      matchedPatterns++;
    }
  }
  
  if (matchedPatterns === 0) {
    return {
      valid: false,
      reason: "Query does not contain recognized cybersecurity education keywords. Please ask about security topics like penetration testing, vulnerabilities, tools, or educational content."
    };
  }
  
  return { valid: true };
}

function scoreChunk(chunk: string, query: string): number {
  if (!chunk || chunk.length === 0) return 0;

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 10);

  if (queryWords.length === 0) return 0;

  const chunkLower = chunk.toLowerCase();
  let score = 0;

  for (const word of queryWords) {
    if (chunkLower.includes(word)) {
      score += 1;
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = chunkLower.match(regex);
      if (matches) {
        score += Math.min(matches.length * 0.5, 2);
      }
    }
  }

  const wordOverlapRatio = queryWords.filter(w => chunkLower.includes(w)).length / queryWords.length;
  score *= (0.5 + wordOverlapRatio * 0.5);

  return Math.min(score, 10);
}

function getUserIdFromAuth(req: Request): string | null {
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, limit = 5 } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid query',
        context: [] 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentValidation = validateQueryContent(query);
    if (!contentValidation.valid) {
      return new Response(JSON.stringify({ 
        error: contentValidation.reason,
        context: []
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestUserId = userId || getUserIdFromAuth(req);
    if (!requestUserId) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        context: [] 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 5, 20));
    const sanitizedQuery = sanitizeQuery(query);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Retrieving context - User: ${requestUserId}, Query: "${sanitizedQuery.substring(0, 40)}...", Limit: ${parsedLimit}`);

    const { data: chunks, error: fetchError } = await supabase
      .from('document_chunks')
      .select('id, content, chunk_index, training_documents(id, title, user_id, status)')
      .eq('training_documents.user_id', requestUserId)
      .eq('training_documents.status', 'ready')
      .limit(200);

    if (fetchError) {
      console.error('Database error:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Failed to retrieve documents',
        context: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!chunks || chunks.length === 0) {
      console.log(`No chunks found for user ${requestUserId}`);
      return new Response(JSON.stringify({ context: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const scoredChunks = chunks
      .filter(chunk => chunk.content && chunk.content.trim().length > 0)
      .map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        score: scoreChunk(chunk.content, sanitizedQuery),
        chunkIndex: chunk.chunk_index || 0,
      }))
      .filter(c => c.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.chunkIndex - b.chunkIndex;
      })
      .slice(0, parsedLimit);

    const contextChunks = scoredChunks.map(c => c.content);

    console.log(`Retrieved ${contextChunks.length} relevant chunks (from ${chunks.length} total)`);

    return new Response(JSON.stringify({ 
      context: contextChunks,
      count: contextChunks.length,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });

  } catch (error) {
    console.error('Context retrieval error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Retrieval failed',
      context: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
