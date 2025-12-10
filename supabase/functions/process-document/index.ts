import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function computeSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const MIN_CHUNK_LENGTH = 50;
const MAX_CHUNKS_PER_DOCUMENT = 1000;
const MAX_CONTENT_LENGTH = 5 * 1024 * 1024;

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

function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  if (!text || text.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length && chunks.length < MAX_CHUNKS_PER_DOCUMENT) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);
    
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > chunkSize * 0.5) {
        chunk = text.slice(start, start + breakPoint + 1);
      }
    }
    
    const trimmedChunk = chunk.trim();
    if (trimmedChunk.length > MIN_CHUNK_LENGTH) {
      chunks.push(trimmedChunk);
    }
    
    const nextStart = start + chunk.length - overlap;
    if (nextStart >= start + chunk.length) break;
    start = nextStart;
  }
  
  return chunks;
}

function validateRequestBody(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  if (!body.documentId || typeof body.documentId !== 'string') {
    return { valid: false, error: 'Missing or invalid documentId' };
  }

  if (!body.content || typeof body.content !== 'string') {
    return { valid: false, error: 'Missing or invalid content' };
  }

  if (body.content.length === 0) {
    return { valid: false, error: 'Content is empty' };
  }

  if (body.content.length > MAX_CONTENT_LENGTH) {
    return { valid: false, error: `Content exceeds maximum size of ${MAX_CONTENT_LENGTH} bytes` };
  }

  if (!body.userId || typeof body.userId !== 'string') {
    return { valid: false, error: 'Missing or invalid userId' };
  }

  return { valid: true };
}

function validateDocumentContent(content: string): { valid: boolean; reason?: string } {
  let matchedPatterns = 0;
  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns++;
    }
  }
  
  if (matchedPatterns === 0) {
    return {
      valid: false,
      reason: "Document content does not contain recognized cybersecurity education keywords. Please upload documents related to security topics like penetration testing, vulnerabilities, tools, or educational content."
    };
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestBody = await req.json();
    const validation = validateRequestBody(requestBody);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { documentId, content, userId } = requestBody;

    const contentValidation = validateDocumentContent(content);
    if (!contentValidation.valid) {
      return new Response(
        JSON.stringify({ error: contentValidation.reason }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing document - ID: ${documentId}, User: ${userId}, Size: ${content.length} bytes`);

    const chunks = chunkText(content);
    
    if (chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid chunks could be created from content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created ${chunks.length} chunks from document`);

    const contentChecksum = await computeSHA256(content);

    const chunkInserts = chunks.map((chunk, index) => ({
      document_id: documentId,
      content: chunk,
      chunk_index: index,
      created_at: new Date().toISOString(),
    }));

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts);

    if (chunkError) {
      console.error('Error inserting chunks:', chunkError);
      return new Response(
        JSON.stringify({ error: 'Failed to store document chunks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: updateError } = await supabase
      .from('training_documents')
      .update({ 
        status: 'ready',
        chunk_count: chunks.length,
        checksum_sha256: contentChecksum,
        file_size: content.length,
        processed_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating document status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update document status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully processed document ${documentId} with ${chunks.length} chunks`);

    return new Response(JSON.stringify({ 
      success: true,
      documentId,
      chunkCount: chunks.length,
      contentSize: content.length,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Document processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Processing failed';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
