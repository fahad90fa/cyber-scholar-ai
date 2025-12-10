import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { hash, verify } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/[a-z]/.test(password)) return false
  if (!/[0-9]/.test(password)) return false
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false
  return true
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { action, password, userId, hint, currentPassword, newPassword } = await req.json()
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    switch (action) {
      case "set_password": {
        if (!isStrongPassword(password)) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        const salt = crypto.randomUUID()
        const passwordHash = await hash(password + salt, 10)

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            chat_password_hash: passwordHash,
            chat_password_salt: salt,
            chat_security_enabled: true,
            chat_security_hint: hint || null,
            chat_password_set_at: new Date().toISOString(),
            failed_chat_password_attempts: 0,
            chat_locked_until: null
          })
          .eq("id", userId)

        if (updateError) throw updateError

        await supabase.from("chat_security_log").insert({
          user_id: userId,
          action: "password_set",
          ip_address: ipAddress,
          user_agent: userAgent,
          success: true
        })

        return new Response(
          JSON.stringify({ success: true, message: "Chat password set successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      case "verify_password": {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("chat_password_hash, chat_password_salt, chat_locked_until, failed_chat_password_attempts")
          .eq("id", userId)
          .single()

        if (profileError) throw profileError

        if (profile.chat_locked_until && new Date(profile.chat_locked_until) > new Date()) {
          await supabase.from("chat_security_log").insert({
            user_id: userId,
            action: "password_failed",
            ip_address: ipAddress,
            user_agent: userAgent,
            success: false,
            metadata: { reason: "account_locked" }
          })

          return new Response(
            JSON.stringify({
              success: false,
              locked: true,
              locked_until: profile.chat_locked_until,
              message: "Too many failed attempts. Please try again later."
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        const isValid = await verify(
          profile.chat_password_hash,
          password + profile.chat_password_salt
        )

        if (isValid) {
          await supabase
            .from("profiles")
            .update({
              failed_chat_password_attempts: 0,
              chat_locked_until: null,
              last_chat_access: new Date().toISOString()
            })
            .eq("id", userId)

          await supabase.from("chat_security_log").insert({
            user_id: userId,
            action: "password_verified",
            ip_address: ipAddress,
            user_agent: userAgent,
            success: true
          })

          const chatSessionToken = crypto.randomUUID()
          const tokenExpiry = new Date(Date.now() + 60 * 1000)

          return new Response(
            JSON.stringify({
              success: true,
              message: "Access granted",
              chatSessionToken,
              expiresAt: tokenExpiry.toISOString()
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        } else {
          const newAttempts = (profile.failed_chat_password_attempts || 0) + 1
          let lockUntil = null

          if (newAttempts >= 5) {
            lockUntil = new Date(Date.now() + 15 * 60 * 1000)
          } else if (newAttempts >= 3) {
            lockUntil = new Date(Date.now() + 5 * 60 * 1000)
          }

          await supabase
            .from("profiles")
            .update({
              failed_chat_password_attempts: newAttempts,
              chat_locked_until: lockUntil?.toISOString() || null
            })
            .eq("id", userId)

          await supabase.from("chat_security_log").insert({
            user_id: userId,
            action: "password_failed",
            ip_address: ipAddress,
            user_agent: userAgent,
            success: false,
            metadata: { attempts: newAttempts }
          })

          return new Response(
            JSON.stringify({
              success: false,
              locked: lockUntil !== null,
              locked_until: lockUntil?.toISOString(),
              attempts_remaining: Math.max(0, 5 - newAttempts),
              message: "Incorrect password"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      }

      case "change_password": {
        const { data: profile } = await supabase
          .from("profiles")
          .select("chat_password_hash, chat_password_salt")
          .eq("id", userId)
          .single()

        const isCurrentValid = await verify(
          profile.chat_password_hash,
          currentPassword + profile.chat_password_salt
        )

        if (!isCurrentValid) {
          return new Response(
            JSON.stringify({ success: false, message: "Current password is incorrect" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        if (!isStrongPassword(newPassword)) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "New password must be at least 8 characters with uppercase, lowercase, number, and special character"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        const newSalt = crypto.randomUUID()
        const newHash = await hash(newPassword + newSalt, 10)

        await supabase
          .from("profiles")
          .update({
            chat_password_hash: newHash,
            chat_password_salt: newSalt,
            chat_password_set_at: new Date().toISOString()
          })
          .eq("id", userId)

        await supabase.from("chat_security_log").insert({
          user_id: userId,
          action: "password_changed",
          ip_address: ipAddress,
          user_agent: userAgent,
          success: true
        })

        return new Response(
          JSON.stringify({ success: true, message: "Password changed successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      case "disable_security": {
        const { data: profile } = await supabase
          .from("profiles")
          .select("chat_password_hash, chat_password_salt")
          .eq("id", userId)
          .single()

        const isValid = await verify(
          profile.chat_password_hash,
          password + profile.chat_password_salt
        )

        if (!isValid) {
          return new Response(
            JSON.stringify({ success: false, message: "Incorrect password" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        await supabase
          .from("profiles")
          .update({
            chat_security_enabled: false,
            chat_password_hash: null,
            chat_password_salt: null,
            chat_security_hint: null,
            chat_password_set_at: null,
            failed_chat_password_attempts: 0,
            chat_locked_until: null
          })
          .eq("id", userId)

        await supabase.from("chat_security_log").insert({
          user_id: userId,
          action: "security_disabled",
          ip_address: ipAddress,
          user_agent: userAgent,
          success: true
        })

        return new Response(
          JSON.stringify({ success: true, message: "Chat security disabled" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    }
  } catch (error) {
    console.error("Chat security error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
