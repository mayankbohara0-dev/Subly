// Supabase Edge Function: send-sms-hook
// Handles Supabase Auth "Send SMS Hook" by relaying OTPs via httpSMS (https://github.com/NdoleStudio/httpsms)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface SupabaseSmsHookPayload {
  user: {
    id: string;
    phone: string;
  };
  sms: {
    otp: string;
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: SupabaseSmsHookPayload = await req.json();
    const recipientPhone = payload.user?.phone;
    const otpCode = payload.sms?.otp;

    if (!recipientPhone || !otpCode) {
      return new Response(
        JSON.stringify({ error: "Invalid payload: missing phone or otp" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const httpsmsApiKey = Deno.env.get("HTTPSMS_API_KEY");
    const senderPhone = Deno.env.get("HTTPSMS_FROM_PHONE");

    if (!httpsmsApiKey || !senderPhone) {
      console.error(
        "[httpSMS Hook] Missing HTTPSMS_API_KEY or HTTPSMS_FROM_PHONE environment variables"
      );
      return new Response(
        JSON.stringify({ error: "Server configuration missing httpSMS keys" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const messageContent = `Your Subly verification code is: ${otpCode}. Valid for 5 minutes. Never share this code.`;

    // Forward to httpSMS Gateway API
    const httpsmsResponse = await fetch("https://api.httpsms.com/v1/messages/send", {
      method: "POST",
      headers: {
        "x-api-key": httpsmsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: messageContent,
        from: senderPhone,
        to: recipientPhone,
      }),
    });

    const httpsmsResult = await httpsmsResponse.json();

    if (!httpsmsResponse.ok) {
      console.error("[httpSMS Gateway Error]", httpsmsResult);
      return new Response(
        JSON.stringify({ error: "Failed to dispatch SMS via httpSMS gateway", details: httpsmsResult }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[httpSMS Hook] SMS OTP sent successfully to ${recipientPhone}`);
    return new Response(JSON.stringify({ success: true, messageId: httpsmsResult.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[httpSMS Hook Exception]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
