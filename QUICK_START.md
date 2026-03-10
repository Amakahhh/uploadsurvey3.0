# Quick Start Guide - SurveyHustler Backend

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- Supabase client (@supabase/supabase-js)
- Google Sheets API (googleapis)
- Gemini AI (google-generative-ai)
- KoraPay & payment utilities

### Step 2: Create Supabase Project
```
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose PostgreSQL database
4. Wait for initialization (2-3 minutes)
5. Navigate to "Settings" → "API"
6. Copy these values:
   - URL → NEXT_PUBLIC_SUPABASE_URL
   - Anon Key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Service Role Key → SUPABASE_SERVICE_ROLE_KEY
```

### Step 3: Update .env.local
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Optional for now (add later):
GOOGLE_SHEETS_API_KEY=
KORAPAY_SECRET_KEY=
KORAPAY_PUBLIC_KEY=
GEMINI_API_KEY=
```

### Step 4: Create Database Schema
```bash
# In Supabase Dashboard:
1. Go to "SQL Editor"
2. Click "New Query"
3. Copy contents of lib/db/schema.sql
4. Paste and click "Run"
5. Create another query with lib/db/functions.sql
6. Run it
```

### Step 5: Test Local Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## ✅ First Test

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "fullName": "Test User",
    "role": "respondent",
    "college": "Engineering",
    "department": "Computer Science",
    "level": "200"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "test@example.com"
    },
    "message": "Sign up successful! Check your email to verify your account."
  }
}
```

### What Happens Automatically
✅ User created in Supabase Auth
✅ Profile created automatically
✅ Wallet created with 0 balance
✅ Verification email sent
✅ Logged in session created

---

## 🔑 Optional: Add API Keys Later

### Get Google Sheets API Key
```
1. Go to https://console.cloud.google.com
2. Create project or select existing
3. Enable "Google Sheets API"
4. Go to "Credentials"
5. Click "Create Credentials" → "API Key"
6. Copy key to GOOGLE_SHEETS_API_KEY
```

### Get KoraPay Keys
```
1. Go to https://korapay.com
2. Sign up and verify account
3. Dashboard → Settings → API
4. Copy public key → KORAPAY_PUBLIC_KEY
5. Copy secret key → KORAPAY_SECRET_KEY
6. Copy webhook secret → KORAPAY_WEBHOOK_SECRET
```

### Get Gemini API Key
```
1. Go to https://aistudio.google.com/app/apikeys
2. Click "Create API Key"
3. Copy to GEMINI_API_KEY
```

---

## 📋 Checklist Before Production

- [ ] All environment variables set
- [ ] Database schema created
- [ ] Database functions created
- [ ] Test signup works
- [ ] Test login works
- [ ] Email verification configured
- [ ] Domain added to Supabase redirects
- [ ] Webhook URL configured in KoraPay
- [ ] Rate limiting tested
- [ ] Error handling verified

---

## 🐛 Common Issues

### "NEXT_PUBLIC_SUPABASE_URL not set"
→ Check .env.local file exists and is in root directory

### "Email not verified" on login
→ User must click verify link in email (check spam folder)

### "Sheet is not publicly accessible"
→ Share Google Sheet with "Anyone with link" permission

### "Invalid signature" on webhook
→ Verify webhook secret matches in KoraPay dashboard

---

## 📚 Next Steps

1. **Read** [API_REFERENCE.md](./API_REFERENCE.md) - Complete endpoint documentation
2. **Review** [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) - What's built
3. **Follow** [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md) - Detailed setup
4. **Deploy** to Vercel (see deployment section below)

---

## 🚢 Deploy to Vercel

### Before Deploying
1. Commit code to GitHub:
```bash
git add .
git commit -m "Build complete backend"
git push origin main
```

2. All environment variables must be set

### Deploy Steps
```
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose your GitHub repo
4. Add environment variables under "Environment Variables"
5. Click "Deploy"
6. Wait 2-3 minutes for deployment
```

### Post-Deploy
1. Get production URL from Vercel
2. Update Supabase redirect URLs:
   - Dashboard → Authentication → URL Configuration
   - Add: `https://yourapp.vercel.app/auth/callback`
3. Update KoraPay webhook:
   - Dashboard → Webhooks
   - Set URL: `https://yourapp.vercel.app/api/webhooks/korapay`

---

## 🎉 You're Ready!

All backend endpoints are functional. Integrate with your frontend and you have a complete platform.

For questions or issues:
- Check error logs: `npm run dev` shows all requests
- Review [API_REFERENCE.md](./API_REFERENCE.md) for endpoint details
- Check database: Supabase → Table Editor to see live data
