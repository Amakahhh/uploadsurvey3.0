# API Reference Guide

## Authentication

All endpoints (except webhooks) require Supabase JWT token in `Authorization: Bearer {token}` header.

Some endpoints require email verification - will return `403` with `NOT_VERIFIED` error if user hasn't verified email.

---

## Surveys API

### Get All Surveys
**GET** `/api/surveys`

Returns all active surveys available to the user, excluding:
- Surveys user already completed
- Surveys at response capacity
- Inactive surveys

**Query Parameters:**
- `college` (optional) - Filter by target college
- `department` (optional) - Filter by target department
- `level` (optional) - Filter by target level

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "survey-uuid",
      "title": "Customer Satisfaction Survey",
      "description": "Help us improve our service",
      "reward": 150,
      "response_cap": 100,
      "responses_count": 45,
      "status": "active",
      "estimated_time": 5,
      "target_college": "Engineering",
      "target_department": "Computer Science",
      "target_level": "300",
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

### Create Survey (Researcher)
**POST** `/api/surveys`

Create a new survey. User must have `role = 'researcher'`.

**Request:**
```json
{
  "title": "Customer Feedback Study",
  "description": "Brief description of survey",
  "reward": 200,
  "response_cap": 50,
  "google_sheet_url": "https://docs.google.com/spreadsheets/d/1ABC123DEF456/",
  "target_college": "Engineering",
  "target_department": "Computer Science",
  "target_level": "200",
  "estimated_time": 7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "survey-uuid",
    "status": "draft",
    "title": "Customer Feedback Study",
    "reward": 200,
    "response_cap": 50,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "message": "Survey created successfully. Proceed to funding."
}
```

---

### Start Survey Session
**POST** `/api/surveys/start`

Begin a survey session (30-minute timeout).

**Request:**
```json
{
  "surveyId": "survey-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "surveyId": "survey-uuid",
    "startedAt": "2024-01-15T10:00:00Z",
    "expiresAt": "2024-01-15T10:30:00Z",
    "estimatedTime": 5
  },
  "message": "Survey session started. You have 30 minutes to complete the Google Form."
}
```

**Errors:**
- `SURVEY_NOT_FOUND` - Survey doesn't exist
- `SURVEY_NOT_ACTIVE` - Survey status is not 'active'
- `SURVEY_FULL` - Response cap reached
- `ALREADY_COMPLETED` - User completed this survey
- `ACTIVE_SESSION_EXISTS` - User has another active session

---

### Verify Survey Response
**POST** `/api/verify`

Verify user's response and credit wallet.

**Request:**
```json
{
  "surveyId": "survey-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletBalance": 1500,
    "rewardAmount": 150,
    "message": "Congratulations! You earned 150 naira for this survey."
  }
}
```

**Process:**
1. Checks active session
2. Verifies session not expired
3. Fetches Google Sheet responses
4. Finds user's email in responses
5. Validates submission timestamp >= session start
6. Checks for duplicate payment
7. Credits wallet atomically
8. Records response
9. Updates survey count
10. Closes session

**Errors:**
- `SESSION_EXPIRED` - Session duration exceeded
- `SHEET_ERROR` - Cannot access Google Sheet
- `SIGNATURE_NOT_FOUND` - Email not in sheet responses
- `DUPLICATE_PAYMENT` - Already paid for this survey

---

## Wallet API

### Get Wallet Balance & History
**GET** `/api/wallet`

Retrieve current wallet balance and transaction history.

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1500,
    "totalEarned": 2000,
    "totalWithdrawn": 500,
    "history": [
      {
        "id": "entry-uuid",
        "amount": 150,
        "type": "credit",
        "description": "Reward for completing survey: Customer Satisfaction Survey",
        "reference": "survey_survey-uuid",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### Get Wallet Ledger (explicit)
**GET** `/api/wallet/ledger`

Retrieve wallet ledger entries only.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "entry-uuid",
      "amount": 150,
      "type": "credit",
      "description": "Reward for completing survey: Customer Satisfaction Survey",
      "reference": "survey_survey-uuid",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Withdraw Funds
**POST** `/api/withdraw`

Request withdrawal to bank account.

**Request:**
```json
{
  "amount": 1500,
  "bankName": "GTB",
  "accountNumber": "0123456789",
  "accountHolderName": "John Doe"
}
```

**Response:**
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

**Rules:**
- Minimum withdrawal: 500 naira
- Requires sufficient wallet balance
- Funds deducted immediately
- KoraPay processes actual transfer
- Status updates via webhook

**Supported Banks:**
- GTB (058)
- ACCESS (044)
- ZENITH (057)
- UBA (033)
- FCMB (214)
- ECOBANK (050)
- FIDELITY (070)
- STANBIC (221)
- WEMA (035)
- POLARIS (076)
- UNITY (215)
- TITAN (102)

---

### Get Withdrawal History
**GET** `/api/withdraw`

Retrieve past withdrawals.

**Response:**
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
      "created_at": "2024-01-15T10:00:00Z",
      "processed_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

---

## Payments API

### Create Checkout Session
**POST** `/api/payments/create`

Create payment session for survey funding.

**Request:**
```json
{
  "surveyId": "survey-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.korapay.com/...",
    "surveyId": "survey-uuid",
    "totalBudget": 10000,
    "platformFee": 500
  }
}
```

**Process:**
1. Validates user is researcher
2. Validates survey is in draft status
3. Validates Google Sheet is accessible
4. Creates checkout session with KoraPay
5. Returns checkout URL
6. User completes payment
7. KoraPay sends webhook
8. Survey automatically activated

---

## Webhooks

### KoraPay Payment Webhook
**POST** `/api/webhooks/korapay`

Receives payment notifications from KoraPay.

**Header:**
- `x-korapay-signature` - HMAC-SHA256 signature

**Payload:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "survey_uuid_timestamp",
    "status": "success",
    "amount": 10500,
    "metadata": {
      "surveyId": "survey-uuid",
      "researcherId": "user-uuid",
      "reward": 200,
      "responseCap": 50,
      "platformFee": 500
    }
  }
}
```

**Actions:**
1. Verifies webhook signature
2. Checks for duplicate processing
3. Records payment in database
4. Sets survey status to "active"
5. Returns success

**Idempotency:**
- Second webhook with same reference is ignored
- Safe to retry without side effects

---

## AI Analysis API

### Analyze Survey Responses
**POST** `/api/ai/analyze`

Generate AI-powered insights from survey responses.

**Request:**
```json
{
  "surveyId": "survey-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Survey collected 45 responses with diverse feedback. Key themes include...",
    "keyFindings": [
      "72% of respondents agreed with the main proposition",
      "Top mentioned feature was customer support",
      "Student segment showed 15% higher engagement"
    ],
    "respondentCount": 45,
    "fullAnalysis": "Detailed analysis text..."
  }
}
```

**Requirements:**
- User must be survey creator
- Survey must have responses

---

## Error Responses

All errors return standardized format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": { /* optional additional info */ }
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `202` - Accepted (async processing)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (not verified, etc)
- `404` - Not Found
- `500` - Server Error

**Common Error Codes:**
- `UNAUTHORIZED` - Not authenticated
- `NOT_VERIFIED` - Email not verified
- `INVALID_REQUEST` - Invalid input
- `SURVEY_NOT_FOUND` - Survey doesn't exist
- `INSUFFICIENT_BALANCE` - Not enough funds
- `SESSION_EXPIRED` - 30 minutes passed
- `DUPLICATE_PAYMENT` - Already paid for survey
- `FRAUD_DETECTED` - Suspicious activity
- `INTERNAL_SERVER_ERROR` - Server error

---

## Rate Limiting

(To be implemented)
- 100 requests/minute per user
- 10 survey start requests/minute
- 5 withdrawal requests/hour

---

## Authentication Examples

### JavaScript/Fetch
```javascript
const token = localStorage.getItem('supabase_token');

const response = await fetch('/api/surveys', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://surveyh ustler.com/api/surveys
```

---

## Timestamp Format

All timestamps are ISO 8601 UTC:
```
2024-01-15T10:30:45.123Z
```

Convert to local time in client for display.
