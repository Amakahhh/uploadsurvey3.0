# Deployment Checklist

## Pre-Deployment ✅

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] ESLint passes
- [ ] No console.logs in production code
- [ ] All env variables documented

### Database
- [ ] Schema created and tested locally
- [ ] All functions created
- [ ] RLS policies enabled
- [ ] Indexes created for performance
- [ ] Backups configured in Supabase

### Security
- [ ] Service role key never exposed to client
- [ ] All sensitive data in environment variables
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak system info
- [ ] Webhook signatures verified
- [ ] HTTPS enforced in production

### Testing
- [ ] Authentication flow tested
- [ ] Survey CRUD operations tested
- [ ] Wallet operations tested
- [ ] Payment webhook tested
- [ ] Email verification tested
- [ ] All error cases tested

### API Keys
- [ ] Supabase keys obtained
- [ ] Google API key configured
- [ ] KoraPay keys configured
- [ ] Gemini API key configured
- [ ] All keys in .env.local

---

## Deployment (GitHub → Vercel)

### 1. Prepare Repository
```bash
# Ensure clean working directory
git status

# Add all files
git add .

# Commit
git commit -m "Complete backend implementation"

# Push to GitHub
git push origin main
```

### 2. Connect to Vercel
```
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Search for your repository
4. Click "Import"
```

### 3. Configure Environment
```
In Vercel Dashboard → Settings → Environment Variables

Add each variable:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_SHEETS_API_KEY
- KORAPAY_PUBLIC_KEY
- KORAPAY_SECRET_KEY
- KORAPAY_WEBHOOK_SECRET
- GEMINI_API_KEY
- NEXT_PUBLIC_APP_URL (production domain)
```

### 4. Deploy
```
Click "Deploy" button
Wait 3-5 minutes for build and deployment
Monitor build logs for errors
```

### 5. Verify Deployment
```bash
# Test production endpoint
curl https://yourdomain.com/api/surveys

# Should return:
# {"success": false, "error": "UNAUTHORIZED", ...}
```

---

## Post-Deployment

### 1. Update Supabase
```
Supabase Dashboard → Authentication → URL Configuration

Add production URLs:
- Redirect URL: https://yourdomain.com/auth/callback
```

### 2. Configure KoraPay Webhook
```
KoraPay Dashboard → Webhooks → Add Webhook

URL: https://yourdomain.com/api/webhooks/korapay
Events: charge.success, charge.failed
Secret: (Already set environment variable)
```

### 3. Set Custom Domain (Optional)
```
Vercel + Supabase → Domain Settings
```

### 4. Enable Monitoring
```
Vercel → Analytics
Monitor:
- API response times
- Error rates
- Function duration
```

### 5. Configure Backups
```
Supabase Dashboard → Database → Backups

Enable daily backups
Set retention to 7 days
```

---

## Health Checks

Run these tests after deployment:

### 1. Database Health
```sql
-- In Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public';
-- Should show all 11 tables
```

### 2. Auth Health
```bash
curl -X POST https://yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 3. API Health
```bash
# Get surveys (should return 401 without token)
curl https://yourdomain.com/api/surveys

# Should return: {"error":"UNAUTHORIZED"}
```

### 4. Webhook Health
```
KoraPay Dashboard → Webhook Logs
Should show successful requests
```

---

## Monitoring

### Set Up Error Alerts
```
Vercel → Integrations → Error Tracking

Connect to:
- Sentry (recommended)
- LogRocket
- Datadog
```

### Monitor Database
```
Supabase Dashboard → Logs → Database Logs

Check for:
- Failed queries
- Slow queries
- Connection issues
```

### Monitor API
```
Vercel → Analytics

Watch:
- Error rate (should be < 1%)
- Response time (should be < 200ms)
- Request volume
```

---

## Scaling Checklist

When you reach:

### 100 Users
- [ ] Review database queries
- [ ] Check slow query logs
- [ ] Consider adding caching

### 1,000 Users
- [ ] Implement rate limiting
- [ ] Set up CDN for static assets
- [ ] Monitor KoraPay rate limits

### 10,000 Users
- [ ] Implement request queuing
- [ ] Upgrade database plan
- [ ] Add database read replicas

---

## Maintenance

### Daily
- Monitor error logs
- Check webhook deliveries
- Verify payment processing

### Weekly
- Review fraud logs
- Check database performance
- Update dependencies

### Monthly
- Security audit
- Database optimization
- Cost review

---

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel auto-redeploys on push
# Or manually click "Redeploy" in dashboard
```

---

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Error logs in Vercel dashboard
- Database logs in Supabase dashboard
