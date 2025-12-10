import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function getUserIdFromAuth(req: Request): string | null {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return payload.sub || null
  } catch (err) {
    console.error("Token parse error:", err)
    return null
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration")
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const userId = getUserIdFromAuth(req)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data: existingProfile, error: selectError } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, created_at")
      .eq("id", userId)
      .maybeSingle()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Profile select error:", selectError)
      throw selectError
    }

    if (existingProfile) {
      console.log(`Profile already exists for user ${userId}`)
      return new Response(
        JSON.stringify({
          success: true,
          message: "Profile already exists",
          profile: {
            id: existingProfile.id,
            onboarding_completed: existingProfile.onboarding_completed,
            created_at: existingProfile.created_at
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const now = new Date().toISOString()
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        onboarding_completed: false,
        tokens_total: 20,
        tokens_used: 0,
        bonus_tokens: 0,
        created_at: now,
        updated_at: now,
      })
      .select("id, onboarding_completed, tokens_total, tokens_used, created_at")
      .single()

    if (insertError) {
      console.error("Profile creation error:", insertError)
      return new Response(
        JSON.stringify({
          error: "Failed to create profile",
          details: insertError.message,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log(`Profile created successfully for user ${userId}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile created successfully",
        profile: newProfile,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Ensure profile error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
