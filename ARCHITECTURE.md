# System Architecture Diagram

## 🏗️ SurveyHustler Backend Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         FRONTEND                               │
│                  (Next.js + React)                             │
│  Signup UI | Login | Marketplace | Survey Card | Wallet       │
└─────────────────────────────────────┬──────────────────────────┘
                                      │
                     ┌────────────────┴────────────────┐
                     │                                 │
            ┌────────▼────────┐            ┌──────────▼─────────┐
            │  NEXT.JS ROUTE  │            │  SUPABASE AUTH     │
            │   HANDLERS      │            │                    │
            │                 │            │  JWT Tokens        │
            │ /api/surveys    │────────────┼  Email Verify      │
            │ /api/wallet     │            │  Sessions          │
            │ /api/withdraw   │            │                    │
            │ /api/payments   │            └────────────────────┘
            │ /api/webhooks   │
            │ /api/ai         │
            │ /api/auth       │
            └────────┬────────┘
                     │
       ┌─────────────┼─────────────┬─────────────┬──────────────┐
       │             │             │             │              │
    (RLS)        (RLS)        (RLS)         (RLS)          (RLS)
       │             │             │             │              │
┌──────▼──────┐ ┌───▼──────┐ ┌───▼──────┐ ┌───▼──────┐ ┌──────▼──────┐
│ profiles    │ │ surveys  │ │ wallets  │ │ ledger   │ │ survey_     │
│ table       │ │ table    │ │ table    │ │ table    │ │ sessions    │
├─────────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├────────────┤
│ id (PK)     │ │ id (PK)  │ │ id (PK)  │ │ id (PK)  │ │ id (PK)    │
│ email       │ │ title    │ │ balance  │ │ user_id  │ │ user_id    │
│ role        │ │ reward   │ │ user_id  │ │ amount   │ │ survey_id  │
│ college     │ │ response │ │ total_   │ │ type     │ │ status     │
│ is_verified │ │ _cap     │ │ earned   │ │ created  │ │ expires_at │
└─────────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────┘
       │             │             │             │              │
       │             │             │             │              │
   ┌───────────────────────────────────────────────────────────┐
   │        SUPABASE POSTGRESQL DATABASE                      │
   │  (11 Total Tables with RLS Policies & Indexes)           │
   └───────────────────────────────────────────────────────────┘
       │                                                        │
       └────────────────────────┬─────────────────────────────┘
                                │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
    │                            │                            │
┌───▼────────┐          ┌────────▼────────┐        ┌─────────▼────┐
│AUTHENTICATION          │  INTEGRATIONS  │        │  UTILITIES   │
│                        │                │        │              │
│ ✅ Signup              │ Google Sheets  │        │ Error        │
│ ✅ Login               │ API            │        │ Handling     │
│ ✅ Verify Email        │                │        │              │
│ ✅ Forgot Password     │ KoraPay        │        │ Logging      │
│ ✅ Update Profile      │ Payments       │        │              │
│ ✅ Session Management  │ Webhooks       │        │ Wallet       │
└──────────┬─────────────┘                │        │ Operations   │
           │            ┌────────────────┤        │              │
           │            │ Gemini AI      │        │ Type Safety  │
           │            │ Survey Analysis│        │              │
           │            │ Insights       │        └──────────────┘
           │            │                │
           │            └────────────────┘
           │                    │
           └────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼──────┐      ┌────────▼─────┐
   │ Google    │      │ KoraPay      │
   │ Sheets    │      │ Payment API  │
   │ API       │      │              │
   │           │      │ Checkout     │
   │ Forms &   │      │ Webhooks     │
   │ Responses │      │ Payouts      │
   └──────────┘      │ Bank         │
                     │ Transfers    │
                     └──────────────┘
```

---

## 🔄 User Flow: Respondent (Hustler)

```
START
  ↓
SIGNUP (email + password)
  ↓
EMAIL VERIFICATION (click link)
  ↓
LOGIN (get JWT token)
  ↓
BROWSE SURVEYS (GET /api/surveys)
  ├─ Filters by college/dept/level
  ├─ Shows completed surveys
  └─ Shows full response surveys
  ↓
SELECT SURVEY
  ↓
START SESSION (POST /api/surveys/start)
  ├─ Creates 30-min session
  ├─ Returns Google Form URL
  └─ Session expires at start + 30min
  ↓
COMPLETE GOOGLE FORM
  ├─ User fills form
  ├─ Submits in Google Forms interface
  └─ Email captured in form
  ↓
VERIFY RESPONSE (POST /api/surveys/verify)
  ├─ Check active session exists
  ├─ Fetch Google Sheet responses
  ├─ Find user email in responses
  ├─ Verify timestamp >= session start
  ├─ Prevent duplicate payment
  └─ Credit wallet atomically
  ↓
WALLET CREDITED
  ├─ Amount = survey.reward
  ├─ Ledger entry created
  ├─ Session closed
  └─ User sees confirmation
  ↓
REQUEST WITHDRAWAL (POST /api/withdraw)
  ├─ Min 500 naira
  ├─ Check balance sufficient
  ├─ Create withdrawal record
  └─ Call KoraPay payout API
  ↓
PAYOUT PROCESSING
  ├─ Status = processing
  ├─ Amount reserved in wallet
  ├─ KoraPay processes transfer
  └─ Bank receives funds (24-48h)
  ↓
END
```

---

## 🔄 User Flow: Researcher (Uploader)

```
START
  ↓
SIGNUP (email + password, role=researcher)
  ↓
EMAIL VERIFICATION
  ↓
LOGIN
  ↓
CREATE SURVEY (POST /api/surveys)
  ├─ Title, description
  ├─ Reward per response
  ├─ Response cap (max respondents)
  ├─ Google Sheet URL
  └─ Target filters (college/dept/level)
  ↓
SURVEY CREATED (status=draft)
  ↓
FUND SURVEY (POST /api/payments/create)
  ├─ Calculate: reward × response_cap
  ├─ Add 5% platform fee
  ├─ Create KoraPay checkout
  └─ Return checkout URL
  ↓
RESEARCHER PAYS
  ├─ User clicks checkout URL
  ├─ Enters payment details
  ├─ KoraPay processes transaction
  └─ Returns to app
  ↓
WEBHOOK (POST /api/webhooks/korapay)
  ├─ KoraPay sends success webhook
  ├─ Verify signature
  ├─ Record payment
  ├─ Update survey status → active
  └─ Activate survey
  ↓
SURVEY ACTIVE
  ├─ Appears in respondent marketplace
  ├─ Respondents can start
  └─ Forms submitted
  ↓
COLLECT RESPONSES (automatic)
  ├─ Respondents complete & verify
  ├─ Each verification increments count
  ├─ Funds held in escrow
  └─ Count reaches response_cap or timeout
  ↓
ANALYZE RESULTS (POST /api/ai/analyze)
  ├─ Fetch Google Sheet
  ├─ Send to Gemini AI
  ├─ Get insights & findings
  └─ Display to researcher
  ↓
END
```

---

## 📊 Data Flow: Payment Processing

```
RESEARCHER          FRONTEND         BACKEND         KORAPAY
    │                   │                │               │
    │  Add Bank Info     │                │               │
    ├──────────────────►│                │               │
    │                   │ POST create    │               │
    │                   │ payment        │               │
    │                   ├───────────────►│               │
    │                   │                │ POST /charges │
    │                   │                │ /initialize   │
    │                   │                ├──────────────►│
    │                   │            ◄───────────────────┤
    │                   │  checkout_url │ response       │
    │                   │◄───────────────┤               │
    │                   │ Checkout URL   │               │
    │                   │◄───────────────┤               │
    │ Pay URL Returned  │                │               │
    │◄──────────────────┤                │               │
    │ Visit Checkout    │                │               │
    │ Page              │                │               │
    │─────────────────────────────────────────────────► │
    │ Enters Card Info  │                │               │
    ├─────────────────────────────────────────────────► │
    │ Confirms          │                │               │
    ├─────────────────────────────────────────────────► │
    │ Payment Success   │                │               │
    │◄────────────────────────────────────────────────────┤
    │ Webhook Sent      │                                 │
    │                   │                 POST webhook    │
    │                   │                ◄────────────────┤
    │                   │  Verify Sig    │                │
    │                   │            Created Response
    │                   │                │ Record Payment │
    │                   │                │ Activate Survey│
    │                   │                │                │
    │◄──────────────────┤ Popup OK       │                │
    │ Survey Active!    │◄───────────────┤                │
    │                   │                │                │
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────┐
│  REQUEST COMES TO API ENDPOINT          │
└────────────────┬────────────────────────┘
                 │
     ┌───────────▼───────────┐
     │ Auth Middleware       │ ← Check JWT Token
     │ requireAuth()         │   [REJECT if missing]
     └───────────┬───────────┘
                 │
     ┌───────────▼───────────┐
     │ Email Verification    │ ← Check is_verified
     │ requireVerified()      │   [REJECT if not]
     └───────────┬───────────┘
                 │
     ┌───────────▼───────────┐
     │ Input Validation      │ ← Validate body
     │ Type checking         │   [REJECT if invalid]
     └───────────┬───────────┘
                 │
     ┌───────────▼───────────┐
     │ Business Logic Check  │ ← Check rules
     │ Duplicates, caps, etc │   [REJECT if violated]
     └───────────┬───────────┘
                 │
     ┌───────────▼───────────┐
     │ Database RLS Policy   │ ← Check row ownership
     │ Row-Level Security    │   [REJECT unauthorized]
     └───────────┬───────────┘
                 │
     ┌───────────▼───────────┐
     │ Execute Operation     │ ← Atomic transaction
     │ Prepared Statements   │   [COMMIT or ROLLBACK]
     └───────────┬───────────┘
                 │
     ┌───────────▼───────────┐
     │ Sanitized Response    │ ← No secret data
     │ Error Messages        │   [SAFE for client]
     └───────────┬───────────┘
                 │
┌────────────────▼────────────────┐
│ RESPONSE TO CLIENT              │
└─────────────────────────────────┘
```

---

## 📦 Deployment Architecture

```
┌──────────────────────────────────────────────┐
│              VERCEL                          │
│         (Hosting & CDN)                      │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  NextJS App                          │   │
│  │  ├─ Frontend (React)                 │   │
│  │  └─ API Routes (Backend)             │   │
│  │     ├─ /api/surveys                  │   │
│  │     ├─ /api/wallet                   │   │
│  │     ├─ /api/payments                 │   │
│  │     └─ ... more endpoints            │   │
│  └──────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────────┐
    │          │          │              │
    ▼          ▼          ▼              ▼
 ┌────┐   ┌───────┐  ┌────────┐  ┌──────────────┐
 │RLS │   │KoraPay│  │Google  │  │Gemini API    │
 │Poli│   │Payment│  │Sheets  │  │(AI Analysis) │
 │CIES│   │API    │  │API     │  │              │
 └────┘   └───────┘  └────────┘  └──────────────┘
    │          │          │              │
    └──────────┼──────────┴──────────────┘
               │
    ┌──────────▼──────────┐
    │ SUPABASE            │
    │ ├─ PostgreSQL DB    │
    │ ├─ Auth System      │
    │ ├─ RLS Policies     │
    │ └─ Storage (JSON)   │
    └─────────────────────┘
```

---

## 🔌 API Endpoint Organization

```
/api
├── auth/                    ← User management
│   ├── signup              ← Register
│   ├── login               ← Sign in
│   ├── logout              ← Sign out
│   ├── profile             ← Get/update profile
│   ├── verify-email        ← Verify address
│   ├── forgot-password     ← Reset request
│   └── reset-password      ← Reset confirm
│
├── surveys/                 ← Survey operations
│   ├── route.ts            ← GET (list), POST (create)
│   ├── start/              ← Start session
│   └── verify/             ← Verify & credit
│
├── wallet/                  ← Balance & history
│   └── route.ts            ← GET, POST
│
├── withdraw/                ← Cash out
│   └── route.ts            ← POST, GET
│
├── payments/                ← Researcher funding
│   └── create/route.ts     ← Create checkout
│
├── ai/                      ← AI features
│   └── analyze/route.ts    ← Analyze responses
│
└── webhooks/                ← External integrations
    └── korapay/route.ts    ← Payment webhooks
```

---

## 💾 Database Entity Relationships

```
              profiles (Users)
                  │
      ┌───────────┼───────────────┐
      │           │               │
      ▼           ▼               ▼
   surveys    wallets       survey_sessions
      │           │               │
      │           │               │
      ├──► ledger ◄──┤            │
      │                           │
      └─────► survey_responses ◄──┘
              (Join: surveys+users)

Payment Flow:
   profiles ──► payments ◄── korapay webhook
      │
      ├──► ledger
      │
      └──► withdrawals ──► korapay payout
```

---

## 📈 Request/Response Cycle

```
CLIENT                  BACKEND                  DB
  │                        │                      │
  ├─ HTTP Request ────────►│                      │
  │  (with JWT token)      │                      │
  │                        ├─ Auth Check          │
  │                        │  Verify Signature    │
  │                        │                      │
  │                        ├─ Input Validation    │
  │                        │  Type check          │
  │                        │  Safe from injection │
  │                        │                      │
  │                        ├─ Business Logic      │
  │                        │  Check conditions    │
  │                        │  Load data           │
  │                        │                      │
  │                        ├─ Database Query ────►│
  │                        │  SELECT with RLS     │
  │                        │◄───────── Results    │
  │                        │                      │
  │                        ├─ Database Update ───►│
  │                        │  INSERT/UPDATE/DEL   │
  │                        │  (atomic)            │
  │                        │◄─ Confirmation       │
  │                        │                      │
  │                        ├─ Logging             │
  │                        │ Track action         │
  │                        │                      │
  │                        ├─ Format Response     │
  │                        │ Sanitize data        │
  │                        │                      │
  │◄──── HTTP Response ────┤                      │
  │  (JSON)                │                      │
  │
```

---

This architecture ensures:
✅ Security at every layer
✅ Performance & scalability
✅ Reliability & atomicity
✅ Maintainability & clarity
✅ Production-ready implementation
