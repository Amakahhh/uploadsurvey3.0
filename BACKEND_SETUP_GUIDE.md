# Backend Setup and Configuration Guide

## Database Setup Instructions

### 1. Create a Supabase Project
1. Go to https://supabase.com and create a new project
2. Enable PostgreSQL database
3. Note your `Project URL` and `Anon Key`

### 2. Run Database Schema
1. Go to Supabase dashboard → SQL Editor
2. Create a new query and paste contents of `lib/db/schema.sql`
3. Execute the query
4. Create another query and paste contents of `lib/db/functions.sql`
5. Execute to create helper functions

### 3. Configure Environment Variables
1. Copy environment variables from `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Get these from Supabase Dashboard:
   - Project Settings → API → URL (NEXT_PUBLIC_SUPABASE_URL)
   - Project Settings → API → Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Project Settings → API → Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

## API Keys Setup

### Google Sheets API
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable "Google Sheets API"
4. Create Service Account (for server-side)
5. Create API Key (for client read-only access)
6. Download JSON key file
7. Place values in `.env.local`:
```
GOOGLE_SHEETS_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_EMAIL=service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
```

### KoraPay Integration
1. Sign up at https://korapay.com
2. Go to Dashboard → Settings → API Keys
3. Copy public and secret keys
4. Get webhook secret
5. Place in `.env.local`:
```
NEXT_PUBLIC_KORAPAY_PUBLIC_KEY=pk_test_...
KORAPAY_SECRET_KEY=sk_test_...
KORAPAY_WEBHOOK_SECRET=whsec_...
```

6. Configure webhook in KoraPay:
   - URL: `https://yourdomain.com/api/webhooks/korapay`
   - Events: `charge.success`, `charge.failed`

### Gemini API
1. Go to https://aistudio.google.com/app/apikeys
2. Create new API key
3. Place in `.env.local`:
```
GEMINI_API_KEY=your_api_key
```

## Supabase Auth Setup

### Email Templates
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize email verification template:
   - Subject: `Verify your SurveyHustler account`
   - Include link: `{{ .ConfirmationURL }}`
3. Set verification email expiry (default 24 hours)

### Auth Settings
1. Dashboard → Authentication → Providers
2. Enable Email/Password authentication
3. Configure redirect URLs:
   - Add `http://localhost:3000/auth/callback`
   - Add `https://yourdomain.com/auth/callback`

## Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import GitHub repository
3. Add environment variables from `.env.local`
4. Deploy

### 3. Configure Domain
1. Add custom domain in Vercel project settings
2. Update Supabase redirect URLs with production domain

## Testing the Backend

### 1. Start Development Server
```bash
npm install
npm run dev
```

### 2. Test Authentication
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "respondent",
    "college": "Engineering",
    "department": "Computer Science",
    "level": "200"
  }'
```

### 3. Test Gets Surveys
```bash
curl http://localhost:3000/api/surveys \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Survey Start
```bash
curl -X POST http://localhost:3000/api/surveys/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"surveyId": "survey-id"}'
```

## Security Checklist

- [ ] All API keys are in environment variables
- [ ] Service role key is never exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] Verify webhook signatures in webhook routes
- [ ] Rate limiting is implemented
- [ ] Input validation on all endpoints
- [ ] Proper error handling with no data leaks
- [ ] Logging configured for audit trail
- [ ] HTTPS enforced in production
- [ ] CORS properly configured

## Database Maintenance

### Regular Tasks
1. **Expire old sessions** - Run weekly:
   ```sql
   SELECT expire_old_sessions();
   ```

2. **Archive old surveys** - Monthly:
   ```sql
   UPDATE surveys SET is_deleted = true, status = 'archived'
   WHERE created_at < NOW() - INTERVAL '6 months'
   AND status = 'completed';
   ```

3. **Monitor fraud logs**:
   ```sql
   SELECT * FROM fraud_logs WHERE severity = 'high'
   ORDER BY created_at DESC LIMIT 20;
   ```

## Troubleshooting

### "Email not verified" error
- User needs to click verification link in email
- Check Supabase Auth → Users and verify email status

### "No active session" error
- Session expired (30 minutes)
- User needs to click "Start Survey" again

### Sheet responses not found
- Ensure Google Sheet is publicly shared
- Check sheet URL format
- Verify email column exists in sheet

### Payment webhook not triggering
- Verify webhook URL is accessible
- Check webhook secret matches in KoraPay dashboard
- Monitor webhook logs in KoraPay dashboard

## Next Steps

1. Test all endpoints thoroughly
2. Implement rate limiting
3. Set up monitoring/logging service (Sentry, LogRocket)
4. Configure production database backups
5. Set up CI/CD pipeline
6. Load testing before launch
