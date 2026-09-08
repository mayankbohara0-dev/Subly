# Setting Up Free SMS Authentication with httpSMS & Supabase

This guide walks you through setting up free SMS OTP login in **Subly** using the open-source [httpSMS](https://github.com/NdoleStudio/httpsms) gateway and Supabase Auth.

---

## 📱 How It Works

```
Subly Mobile App (User enters +91XXXXXXXXXX)
      │
      ▼
Supabase Auth (generates secure 6-digit OTP)
      │
      ▼
Supabase SMS Hook (supabase/functions/send-sms-hook)
      │
      ▼
httpSMS API (https://api.httpsms.com/v1/messages/send)
      │
      ▼
Your Android Phone with SIM Card (httpSMS Android App)
      │ (Sends cellular SMS via SIM plan)
      ▼
User's Phone receives: "Your Subly verification code is: 482910"
```

Because the SMS is sent through your Android phone's cellular SIM card, **it is 100% free** if your SIM plan includes SMS allowances.

---

## Step 1: Install the httpSMS Android App

1. On any Android phone with an active SIM card, download the official httpSMS APK:
   👉 **Direct APK Download:** [https://apk.httpsms.com/HttpSms.apk](https://apk.httpsms.com/HttpSms.apk)  
   *(Or download from [GitHub Releases](https://github.com/NdoleStudio/httpsms/releases))*
2. Install the APK on the phone and grant SMS permissions.
3. Open the app and log in with your free [httpsms.com](https://httpsms.com) account.
4. Keep the app running in the background (disable battery optimization for httpSMS so Android doesn't sleep the gateway).

---

## Step 2: Get Your httpSMS API Key

1. Go to **[httpsms.com/settings](httpsms.com/settings)** in your browser.
2. Under **API Keys**, click **Create API Key**.
3. Copy your API Key (e.g. `secret_api_key_...`).
4. Note down the phone number of the SIM inside the Android phone (including country code, e.g. `+919876543210`).

---

## Step 3: Run the Supabase Database Migration

In your [Supabase Dashboard](https://supabase.com/dashboard) > **SQL Editor**:
1. Open [`supabase/migrations/002_phone_auth_schema.sql`](../supabase/migrations/002_phone_auth_schema.sql).
2. Copy and run the SQL script.
3. This adds the `phone` column to `public.profiles` and updates the user creation trigger so phone numbers are saved automatically upon verification.

---

## Step 4: Configure Supabase Auth Phone Provider

In your Supabase Dashboard:
1. Go to **Authentication** > **Providers** > **Phone**.
2. Toggle **Enable Phone Provider** to **ON**.
3. Under SMS Provider, select **Custom SMS Provider / Hook** or configure **Send SMS Hook**.

---

## Step 5: Deploy the Supabase Send SMS Hook

We have included the ready-to-deploy Edge Function in:
[`supabase/functions/send-sms-hook/index.ts`](../supabase/functions/send-sms-hook/index.ts)

### Deploying via Supabase CLI:
```bash
# 1. Set environment secrets
supabase secrets set HTTPSMS_API_KEY="your_httpsms_api_key"
supabase secrets set HTTPSMS_FROM_PHONE="+919876543210"

# 2. Deploy function
supabase functions deploy send-sms-hook
```

### Configuring the Hook in Supabase Dashboard:
1. Navigate to **Authentication** > **Hooks** (or **Advanced Auth Settings**).
2. Find **Send SMS Hook**.
3. Select your deployed `send-sms-hook` Edge Function.
4. Click **Save**.

---

## Step 6: Test in Subly

1. Launch Subly on your phone or emulator.
2. Enter your mobile phone number (e.g. `+91 98765 43210`).
3. Tap **Send Verification Code**.
4. Your Android gateway phone will receive the push notification and send the SMS text immediately.
5. Enter the 6-digit OTP in Subly to instantly log in!
