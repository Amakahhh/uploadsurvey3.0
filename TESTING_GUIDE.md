# Backend Testing Guide - Live Examples

Complete curl commands to test all endpoints. Run these against your local dev server or production.

---

## Prerequisites

```bash
# Start dev server
npm run dev

# Server runs on http://localhost:3000

# For production testing, replace http://localhost:3000 with your domain
```

---

## 1️⃣ Authentication Endpoints

### Sign Up (Create Account)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{\
    "email": "testuser@example.com",\
    "password": "SecurePassword123!",\
    "fullName": "Test User",\
    "role": "respondent",\
    "college": "Engineering",\
    "department": "Computer Science",\
    "level": "200"\
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "testuser@example.com"
    },
    "message": "Sign up successful! Check your email to verify your account."
  }
}
```

⚠️ **Note**: User must verify email before using marketplace. Check email for verification link.

---

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{\
    "email": "testuser@example.com",\
    "password": "SecurePassword123!"\
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "testuser@example.com"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "refresh_token_here",
      "expires_at": 1234567890
    }
  }
}
```

💾 **Save** `access_token` for subsequent requests

---

### Get Profile
```bash
TOKEN="your_access_token_here"

curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "testuser@example.com",
    "role": "respondent",
    "college": "Engineering",
    "department": "Computer Science",
    "level": "200",
    "full_name": "Test User",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### Update Profile
```bash
TOKEN="your_access_token_here"

curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{\
    "full_name": "Updated Name",\
    "bio": "I love taking surveys",\
    "avatar_url": "https://example.com/avatar.jpg"\
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "Updated Name",
    "bio": "I love taking surveys",
    "avatar_url": "https://example.com/avatar.jpg"
  },
  "message": "Profile updated successfully"
}
```

---

### Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

---

## 2️⃣ Survey Endpoints

### Get All Surveys (Browse Marketplace)
```bash
TOKEN="your_access_token_here"

# Get all surveys
curl -X GET "http://localhost:3000/api/surveys" \
  -H "Authorization: Bearer $TOKEN"

# Filter by college
curl -X GET "http://localhost:3000/api/surveys?college=Engineering" \
  -H "Authorization: Bearer $TOKEN"

# Filter by multiple criteria
curl -X GET "http://localhost:3000/api/surveys?college=Engineering&department=Computer%20Science&level=200" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "survey-uuid-1",
      "title": "Customer Satisfaction Survey",
      "description": "Help us improve our service",
      "reward": 150,
      "response_cap": 100,
      "responses_count": 45,
      "status": "active",
      "estimated_time": 5,
      "target_college": "Engineering",
      "target_department": "Computer Science",
      "target_level": "200",
      "creator_id": "researcher-uuid",
      "profiles": {
        "full_name": "Dr. John Smith",
        "avatar_url": "https://..."
      },
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Create Survey (Researcher Only)
```bash
TOKEN="your_researcher_token_here"

curl -X POST http://localhost:3000/api/surveys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{\
    "title": "My Research Study",\
    "description": "Collection of consumer preferences",\
    "reward": 250,\
    "response_cap": 50,\
    "google_sheet_url": "https://docs.google.com/spreadsheets/d/1ABC123DEF/edit",\
    "target_college": "Engineering",\
    "target_department": "Computer Science",\
    "target_level": "200",\
    "estimated_time": 8\
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-survey-uuid",
    "status": "draft",
    "title": "My Research Study",
    "reward": 250,
    "response_cap": 50,
    "created_at": "2024-01-15T11:00:00Z"
  },
  "message": "Survey created successfully. Proceed to funding."
}
```

---

### Start Survey Session
```bash
TOKEN="your_access_token_here"
SURVEY_ID="survey-uuid-1"

curl -X POST http://localhost:3000/api/surveys/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"surveyId\": \"$SURVEY_ID\"}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "surveyId": "survey-uuid-1",
    "startedAt": "2024-01-15T11:15:00Z",
    "expiresAt": "2024-01-15T11:45:00Z",
    "estimatedTime": 5
  },
  "message": "Survey session started. You have 30 minutes to complete the Google Form."
}
```

⏰ **Note**: Session expires 30 minutes after start. User must complete Google Form within this time.

---

### Verify Survey Response & Get Paid
```bash
TOKEN="your_access_token_here"
SURVEY_ID="survey-uuid-1"

# After user submits Google Form, verify and credit wallet
curl -X POST http://localhost:3000/api/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"surveyId\": \"$SURVEY_ID\"}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "walletBalance": 1500,
    "rewardAmount": 250,
    "message": "Congratulations! You earned 250 naira for this survey."
  }
}
```

---

## 3️⃣ Wallet Endpoints

### Check Wallet Balance & History
```bash
TOKEN="your_access_token_here"

curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 1500,
    "totalEarned": 2000,
    "totalWithdrawn": 500,
    "history": [
      {
        "id": "entry-uuid-1",
        "amount": 250,
        "type": "credit",
        "description": "Reward for completing survey: Customer Satisfaction Survey",
        "reference": "survey_survey-uuid-1",
        "createdAt": "2024-01-15T11:20:00Z"
      },
      {
        "id": "entry-uuid-2",
        "amount": 500,
        "type": "debit",
        "description": "Withdrawal to GTB account",
        "reference": "withdrawal_withdrawal-uuid",
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

---

### Get Wallet Ledger (explicit)
```bash
TOKEN="your_access_token_here"

curl -X GET http://localhost:3000/api/wallet/ledger \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "entry-uuid-1",
      "amount": 250,
      "type": "credit",
      "description": "Reward for completing survey: Customer Satisfaction Survey",
      "reference": "survey_survey-uuid-1",
      "created_at": "2024-01-15T11:20:00Z"
    }
  ]
}
```

---
## 4️⃣ Withdrawal Endpoints

### Request Withdrawal
```bash
TOKEN="your_access_token_here"

curl -X POST http://localhost:3000/api/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{\
    "amount": 1500,\
    "bankName": "GTB",\
    "accountNumber": "0123456789",\
    "accountHolderName": "John Doe"\
  }'
```

**Expected Response (202):**
```json
{
  "success": true,
  "data": {
    "withdrawalId": "withdrawal-uuid",
    "reference": "payout_user-uuid_timestamp",
    "status": "processing",
    "amount": 1500,
    "bank": "GTB",
    "message": "Your withdrawal of 1500 naira has been initiated. It will be processed within 24-48 hours."
  }
}
```

💳 **Note**: Minimum 500 naira required

---

### Get Withdrawal History
```bash
TOKEN="your_access_token_here"

curl -X GET http://localhost:3000/api/withdraw \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "withdrawal-uuid",
      "amount": 1500,
      "bank_name": "GTB",
      "account_number": "0123456789",
      "status": "paid",
      "korapay_reference": "payout_...",
      "created_at": "2024-01-15T11:00:00Z",
      "processed_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

---

## 5️⃣ Payment Endpoints (Researcher)

### Create Checkout Session
```bash
TOKEN="your_researcher_token_here"
SURVEY_ID="new-survey-uuid"

curl -X POST http://localhost:3000/api/payments/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"surveyId\": \"$SURVEY_ID\"}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.korapay.com/pay/xyz123...",
    "surveyId": "new-survey-uuid",
    "totalBudget": 12500,
    "platformFee": 625
  }
}
```

🔗 **Next**: Redirect user to `checkoutUrl` to complete payment

---

## 6️⃣ AI Analysis Endpoint

### Analyze Survey Responses
```bash
TOKEN="your_researcher_token_here"
SURVEY_ID="completed-survey-uuid"

curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"surveyId\": \"$SURVEY_ID\"}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": "Survey collected 45 responses with diverse feedback across multiple demographics. Key themes include customer satisfaction (72%), support quality (68%), and pricing concerns (45%).",
    "keyFindings": [
      "72% of respondents were satisfied with the service",
      "Customer support was mentioned most frequently (23 times)",
      "Price sensitivity increases with lower income brackets",
      "Mobile users reported 15% more issues than desktop",
      "Recommendation rate: 78% (excellent)"
    ],
    "respondentCount": 45,
    "averages": {
      "age": 21.4
    },
    "correlations": [
      {
        "fieldA": "age",
        "fieldB": "satisfaction_score",
        "correlation": 0.42
      }
    ],
    "fullAnalysis": "Detailed analysis text..."
  }
}
```

---

## ❌ Error Responses Examples

### Unauthorized (No Token)
```bash
curl http://localhost:3000/api/surveys
```

**Response (401):**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "User not authenticated"
}
```

---

### Email Not Verified
```bash
curl -X POST http://localhost:3000/api/surveys/start \
  -H "Authorization: Bearer $UNVERIFIED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"surveyId": "survey-uuid"}'
```

**Response (403):**
```json
{
  "success": false,
  "error": "NOT_VERIFIED",
  "message": "Email not verified. Please verify your email to continue."
}
```

---

### Insufficient Balance
```bash
curl -X POST http://localhost:3000/api/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "bankName": "GTB", ...}'
```

**Response (400):**
```json
{
  "success": false,
  "error": "INSUFFICIENT_BALANCE",
  "message": "Insufficient wallet balance"
}
```

---

### Survey Already Completed
```bash
curl -X POST http://localhost:3000/api/surveys/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"surveyId": "already-completed-survey"}'
```

**Response (400):**
```json
{
  "success": false,
  "error": "ALREADY_COMPLETED",
  "message": "You have already completed this survey"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete Respondent Journey
```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/signup ...

# 2. Verify email (click link in email)
# (Manual - visit verification link)

# 3. Login
curl -X POST http://localhost:3000/api/auth/login ...

# 4. Browse surveys
curl -X GET http://localhost:3000/api/surveys -H "Authorization: Bearer $TOKEN"

# 5. Start survey
curl -X POST http://localhost:3000/api/surveys/start -H "Authorization: Bearer $TOKEN" ...

# 6. User completes Google Form
# (Manual - fill Google Form)

# 7. Verify response
curl -X POST http://localhost:3000/api/verify -H "Authorization: Bearer $TOKEN" ...

# 8. Check wallet
curl -X GET http://localhost:3000/api/wallet -H "Authorization: Bearer $TOKEN"

# 9. Request withdrawal
curl -X POST http://localhost:3000/api/withdraw -H "Authorization: Bearer $TOKEN" ...

# 10. Check history
curl -X GET http://localhost:3000/api/withdraw -H "Authorization: Bearer $TOKEN"
```

---

### Scenario 2: Complete Researcher Journey
```bash
# 1. Sign up as researcher
curl -X POST http://localhost:3000/api/auth/signup ... -d '{"role": "researcher"}'

# 2. Verify email
# (Manual)

# 3. Create survey
curl -X POST http://localhost:3000/api/surveys -H "Authorization: Bearer $TOKEN" ...

# 4. Create checkout (start payment)
curl -X POST http://localhost:3000/api/payments/create -H "Authorization: Bearer $TOKEN" ...

# 5. User completes payment
# (Manual - visit checkout URL)

# 6. Webhook automatically activates survey
# (Automatic - KoraPay webhook)

# 7. Collect responses
# (Users complete surveys)

# 8. Analyze results
curl -X POST http://localhost:3000/api/ai/analyze -H "Authorization: Bearer $TOKEN" ...
```

---

## 📊 Testing Checklist

- [ ] Sign up works
- [ ] Email verification works
- [ ] Login works
- [ ] Browse surveys works
- [ ] Start survey works
- [ ] Verify response works
- [ ] Wallet credits
- [ ] Request withdrawal works
- [ ] Create survey works (as researcher)
- [ ] Create payment checkout works
- [ ] AI analysis works
- [ ] Error handling works
- [ ] Profile update works

---

## 🔧 Tips

1. **Save Token**: After login, save the `access_token`
   ```bash
   TOKEN="eyJ..."
   export TOKEN
   ```

2. **Use Variables**: Replace values consistently
   ```bash
   SURVEY_ID="survey-uuid"
   EMAIL="test@example.com"
   ```

3. **Pretty Print JSON**: Use `jq`
   ```bash
   curl ... | jq .
   ```

4. **Check Headers**: See response headers
   ```bash
   curl -v ... 2>&1 | head -20
   ```

5. **Test Multiple Files**: Save curls in `.sh` file
   ```bash
   #!/bin/bash
   TOKEN="..."
   curl ...
   ```

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "UNAUTHORIZED" | Add `-H "Authorization: Bearer $TOKEN"` |
| "NOT_VERIFIED" | Click email verification link |
| "SURVEY_FULL" | Choose different survey |
| "SIGNATURE_NOT_FOUND" | Check email is in Google Sheet |
| "Invalid signature" | Verify webhook secret matches |

---

## ✅ You're Ready!

All endpoints are fully functional. Test them out and build your frontend integration!







