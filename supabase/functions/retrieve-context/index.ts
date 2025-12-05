import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple keyword-based retrieval (can be enhanced with embeddings later)
function scoreChunk(chunk: string, query: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const chunkLower = chunk.toLowerCase();
  
  let score = 0;
  for (const word of queryWords) {
    if (chunkLower.includes(word)) {
      score += 1;
      // Boost for exact word matches
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = chunkLower.match(regex);
      if (matches) {
        score += matches.length * 0.5;
      }
    }
  }
  
  return score;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    
    // Create client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    const { query, userId, limit = 5 } = await req.json();
    
    console.log(`Retrieving context for query: "${query.substring(0, 50)}..." for user ${userId}`);

    // Get all chunks from user's documents
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select(`
        content,
        training_documents!inner(user_id, status)
      `)
      .eq('training_documents.user_id', userId)
      .eq('training_documents.status', 'ready');

    if (error) {
      console.error('Error fetching chunks:', error);
      throw error;
    }

    if (!chunks || chunks.length === 0) {
      return new Response(JSON.stringify({ context: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Score and rank chunks
    const scoredChunks = chunks
      .map(chunk => ({
        content: chunk.content,
        score: scoreChunk(chunk.content, query)
      }))
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    console.log(`Found ${scoredChunks.length} relevant chunks`);

    return new Response(JSON.stringify({ 
      context: scoredChunks.map(c => c.content)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
