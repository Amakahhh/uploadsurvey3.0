# SurveyHustler - Quick Start Guide

## ✅ Completed Features

### Backend Infrastructure
- ✅ Node.js/Express API routes (Next.js App Router)
- ✅ JSON-based database (no external DB needed)
- ✅ Authentication (JWT, refresh tokens)
- ✅ Survey management (CRUD operations)
- ✅ Session management (30-minute survey sessions)
- ✅ Wallet system with balance tracking
- ✅ Response verification logic
- ✅ KoraPay payment integration (webhook handlers)

### Frontend Integration
- ✅ Marketplace with real survey data
- ✅ Researcher dashboard for survey creation
- ✅ Auth context and API service updated
- ✅ Session timer (30 minutes)
- ✅ Wallet display component
- ✅ Error handling and user feedback

---

## 🚀 Deployment Instructions

### Step 1: Install Dependencies
```bash
cd "c:\Users\DELL 7300\surveylasttime\uploadsurvey frontend"
npm install
```

### Step 2: Seed Test Data
The system needs initial survey data. Call this endpoint once to populate test data:

```bash
# From browser or curl
https://yourdomain.com/api/seed

# This creates:
- Test respondent account (email: respondent@example.com, password: password123)
- Test researcher account (email: researcher@example.com, password: password123)
- 5 sample surveys with realistic data
```

### Step 3: Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Step 4: Start Using the App

#### As a Respondent:
1. Sign up or Login with: `respondent@example.com` / `password123`
2. Go to Marketplace
3. Click "Start Survey" on any survey
4. You'll have 30 minutes to complete the Google Form
5. Return and click "Verify My Response" to earn money

#### As a Researcher:
1. Sign up or Login with: `researcher@example.com` / `password123`
2. Go to Researcher Dashboard
3. Click "Create Survey"
4. Fill in survey details:
   - Google Form URL
   - Google Sheet URL (for responses)
   - Reward per response (₦)
   - Max responses needed
5. Click "Proceed to Pay"
6. Complete payment to activate survey

---

## 📁 Project Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── register/route.ts
│   │   └── login/route.ts
│   ├── surveys/
│   │   ├── route.ts (list & create)
│   │   └── verify/route.ts
│   ├── sessions/
│   │   └── start/route.ts
│   ├── wallet/
│   │   └── route.ts
│   ├── korapay/
│   │   ├── checkout/route.ts
│   │   └── webhook/route.ts
│   ├── init/route.ts
│   └── seed/route.ts
├── marketplace/
│   └── page.tsx (updated to fetch from API)
├── researcher/
│   └── page.tsx
├── contexts/
│   └── AuthContext.tsx
└── services/
    └── api.ts (updated with new endpoints)

lib/
├── db/
│   └── database.ts (JSON-based storage)
└── utils/
    ├── auth.ts (JWT, passwords)
    └── response.ts (API response helpers)
```

---

## 🔑 Key Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password

### Surveys
- `GET /api/surveys` - List all active surveys (public)
- `POST /api/surveys` - Create new survey (researchers)

### Sessions & Verification
- `POST /api/sessions/start` - Start 30-min survey session
- `POST /api/surveys/verify` - Verify response & credit wallet

### Wallet
- `GET /api/wallet` - Get balance & transaction history
- `POST /api/wallet` - Request withdrawal (₦500 min)

### Payments
- `POST /api/payments/create` - Initiate payment (researchers)
- `POST /api/korapay/webhook` - Handle payment webhooks

### Admin
- `GET /api/init` - Initialize database
- `GET /api/seed` - Populate test data

---

## 🧪 Testing Checklist

### ✅ Core Flow
- [ ] Can register as respondent
- [ ] Can login as respondent
- [ ] Marketplace loads surveys from database
- [ ] Can start a survey (30-min timer works)
- [ ] Can verify response & see wallet credit
- [ ] Can see updated balance after verification
- [ ] Can register as researcher
- [ ] Can create a survey as researcher
- [ ] Survey payment flow initiates

### ✅ Edge Cases
- [ ] Can't start 2 surveys simultaneously
- [ ] Session expires after 30 minutes
- [ ] Can't verify same survey twice
- [ ] Can't verify without active session
- [ ] Wallet balance never goes negative

---

## 🔧 Database

The database is stored as JSON in `.data/surveyhustler.json`

Structure:
```json
{
  "users": {
    "email": { user object }
  },
  "surveys": {
    "surveyId": { survey object }
  },
  "wallets": {
    "userId": { wallet object }
  },
  "survey_sessions": { ... },
  "survey_responses": { ... },
  "korapay_transactions": { ... },
  "ledger": [...]
}
```

---

## ⚙️ Environment Variables

Create a `.env.local` file (optional):
```
JWT_SECRET=your-secret-key
REFRESH_SECRET=your-refresh-secret
KORAPAY_PUBLIC_KEY=your-korapay-key
```

If not set, defaults will be used (safe for development).

---

## 🚨 Known Limitations (MVP)

1. **Google Sheets Verification**: Currently placeholder - accepts any verification. To integrate real Google Sheets, add service account credentials.

2. **KoraPay Integration**: Webhook handlers exist but payment is mocked. To enable real payments:
   - Add KoraPay API keys
   - Implement real payment initiation
   - Configure webhook URLs

3. **Database**: Uses JSON file storage. For production, migrate to PostgreSQL.

4. **Session Storage**: Sessions stored in database (survives restart but minimal durability).

---

## 📈 Next Steps for Production

1. **Replace JSON Database** → Use PostgreSQL
2. **Implement Real Google Sheets API** → Verify responses automatically
3. **Complete KoraPay Integration** → Real payment processing
4. **Add Image/Video Support** → For survey banners
5. **Implement Search/Filters** → Better survey discovery
6. **Add Notifications** → Email/SMS for respondents
7. **Analytics Dashboard** → For researchers to track surveys
8. **AI Analysis Module** → Gemini integration for insights
9. **Withdrawal Processing** → Automated payout system
10. **Admin Dashboard** → Moderation & reporting

---

## 📞 Support

For issues or questions, check:
- Console logs for error details
- Browser DevTools Network tab for API responses
- `.data/surveyhustler.json` for database state

---

**Status**: MVP Ready for Testing  
**Last Updated**: March 5, 2026  
**Deployment Time**: ~24 hours

