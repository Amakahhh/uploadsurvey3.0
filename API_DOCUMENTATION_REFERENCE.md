# API Documentation Reference
**Last Updated:** December 17, 2025  
**API Base URL:** https://survey-hustler-api.onrender.com

## Overview
This document maps the official API documentation to the implementation in the frontend codebase. All 8 endpoints have been integrated and updated to match the official specifications.

---

## 1. Authentication
### Endpoint: POST /account/authenticate
**Purpose:** Authenticates a user with email and password

**Implementation Location:** [app/services/api.ts](app/services/api.ts#L365-L379)

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "isAuthenticated": true,
  "jwToken": "JWT token (expires in 15 minutes)",
  "refreshToken": "Refresh token (expires in 10 days)",
  "refreshTokenExpiration": "ISO date string",
  "roles": ["array of roles"],
  "isVerified": boolean
}
```

**Usage in Frontend:**
- **File:** [app/loginOverlay.tsx](app/loginOverlay.tsx#L35-L75)
- **Hook:** `apiService.login(credentials)`
- **State Management:** AuthContext stores JWT token and user data

**Test Credentials:**
```
Email: testuser20240925191200@example.com
Password: TestPass123
```

**Key Notes:**
- Refresh token is automatically set as HTTP-only cookie
- Access token expires in 15 minutes
- Refresh token expires in 10 days
- Implemented with retry logic for 409 conflicts

---

## 2. Schools Dropdown
### Endpoint: GET /schools
**Purpose:** Retrieves paginated list of all schools

**Implementation Location:** [app/services/api.ts](app/services/api.ts#L476-L488)

**Query Parameters:**
```
- searchTerm (optional): Search by name or short code
- sortColumn (optional): Column to sort by
- sortOrder (optional): 'asc' or 'desc'
- page (required): Page number (1-based)
- pageSize (required): Items per page
```

**Response Structure:**
```typescript
{
  items: School[],
  page: number,
  pageSize: number,
  totalCount: number
}
```

**Usage in Frontend:**
- **File:** [app/contexts/NicheFiltersContext.tsx](app/contexts/NicheFiltersContext.tsx#L91-L102)
- **Hook:** `useNicheFilters()`
- **Trigger:** Loads on page mount via useEffect

**Default Parameters:**
- page: 1
- pageSize: 100

---

## 3. Colleges/Courses by School
### Endpoint: GET /courses/by-school/{schoolId}
**Purpose:** Retrieves all courses within a specific school (acts as colleges filter)

**Implementation Location:** [app/services/api.ts](app/services/api.ts#L525-L533)

**Path Parameter:**
```
schoolId: string (UUID)
```

**Response:**
```typescript
College[]
```

**Usage in Frontend:**
- **File:** [app/contexts/NicheFiltersContext.tsx](app/contexts/NicheFiltersContext.tsx#L104-L115)
- **Trigger:** Called when user selects a school
- **State:** Updates `colleges` array in context

**Implementation Note:**
✅ **CORRECTED** - Fixed from `/colleges/by-school/{schoolId}` to `/courses/by-school/{schoolId}` per API documentation

---

## 4. Departments by College
### Endpoint: GET /departments/by-college/{collegeId}
**Purpose:** Retrieves paginated list of departments within a college

**Implementation Location:** [app/services/api.ts](app/services/api.ts#L600-L618)

**Path Parameter:**
```
collegeId: string (UUID)
```

**Query Parameters:**
```
- searchTerm (optional): Search by name
- sortColumn (optional): Column to sort by
- sortOrder (optional): 'asc' or 'desc'
- page (optional): Page number (default: 1)
- pageSize (optional): Items per page (default: 100)
```

**Response Structure:**
```typescript
{
  items: Department[],
  page: number,
  pageSize: number,
  totalCount: number
}
```

**Usage in Frontend:**
- **File:** [app/contexts/NicheFiltersContext.tsx](app/contexts/NicheFiltersContext.tsx#L117-L128)
- **Trigger:** Called when user selects a college
- **State:** Updates `departments` array in context

**Implementation Note:**
✅ **UPDATED** - Added pagination parameters (searchTerm, sortColumn, sortOrder, page, pageSize) to match API specification

---

## 5. Courses by Department
### Endpoint: GET /courses/by-department/{departmentId}
**Purpose:** Retrieves all courses within a specific department

**Implementation Location:** [app/services/api.ts](app/services/api.ts#L688-L696)

**Path Parameter:**
```
departmentId: string (UUID)
```

**Response:**
```typescript
Course[]
```

**Usage in Frontend:**
- **Trigger:** Called when user selects a department
- **State:** Updates `courses` array in context

---

## 6. Gender Enum
### Endpoint: GET /enums/genders
**Purpose:** Returns available gender options for person profiles

**Implementation Location:** [app/services/api.ts](app/services/api.ts#L945-L955)

**Query Parameters:** None

**Response:**
```typescript
Gender[]
// Where Gender = { id: number, name: string }
// Values: Male, Female, All
```

**Usage in Frontend:**
- **File:** [app/contexts/NicheFiltersContext.tsx](app/contexts/NicheFiltersContext.tsx#L130-L141)
- **Trigger:** Loads on page mount alongside schools
- **UI:** Populates gender dropdown in filter form

---

## 7. Person Types Enum
### Endpoint: GET /enums/person-types
**Purpose:** Returns available person types for survey targeting

**Implementation Location:** [app/services/api.ts](app/services/api.ts#L957-L967)

**Query Parameters:** None

**Response:**
```typescript
PersonType[]
// Where PersonType = { id: number, name: string }
// Values: Undergrad, Postgrad, Lecturer
```

**Usage in Frontend:**
- **File:** [app/contexts/NicheFiltersContext.tsx](app/contexts/NicheFiltersContext.tsx#L143-L154)
- **Trigger:** Loads on page mount alongside schools
- **UI:** Populates person type dropdown in filter form

---

## 8. Survey Creation with Payment
### Endpoint: POST /surveys
**Purpose:** Creates a new survey in draft mode and generates Korapay checkout URL

**Implementation Location:** [app/services/api.ts](app/services/api.ts#L734-L760)

**Request Body:**
```typescript
{
  name: string,                    // Survey title (must be unique)
  description: string,             // Optional survey description
  responderLink: string,           // Google Forms responder link
  sheetLink: string,               // Google Sheets link for responses
  maxResponseNo: number,           // Maximum number of responses
  chargePerResponse: number,       // Amount per respondent (NGN)
  begin: string,                   // Survey start date (ISO format)
  creatorId: string,               // Person ID (UUID)
  conditions: SurveyCondition[]    // Targeting criteria
}
```

**Conditions Array Structure:**
```typescript
{
  schoolId?: string,       // UUID
  collegeId?: string,      // UUID
  departmentId?: string,   // UUID
  courseId?: string,       // UUID
  personType?: number,     // From enums/person-types
  gender?: number,         // From enums/genders
  levels?: string,         // Academic level
  program?: number         // Program type
}
```

**Response:**
```typescript
{
  id: string,                      // Survey UUID
  surveyId: string,                // Alternative survey ID
  name: string,                    // Survey title
  description: string,             // Survey description
  responderLink: string,           // Google Forms link
  sheetLink: string,               // Google Sheets link
  maxResponseNo: number,           // Max responses
  chargePerResponse: number,       // Cost per response
  creatorId: string,               // Creator ID
  begin: string,                   // Start date
  conditions: SurveyCondition[],   // Applied conditions
  isActive: boolean,               // Survey status
  createdAt: string,               // Creation timestamp
  
  // Payment/Korapay Details
  checkoutUrl?: string,            // Korapay payment link
  checkoutLink?: string,           // Alternative checkout link
  totalAmount?: number,            // Total cost including fees
  respondentsCharge?: number,      // Cost for respondents (MaxResponseNo × ChargePerResponse)
  platformCommission?: number,     // Platform fee
  conditionsCharge?: number,       // Additional targeting charges
  transactionReference?: string    // Unique payment reference
}
```

**Usage in Frontend:**
- **File:** [app/SurveryInfoForm.tsx](app/SurveryInfoForm.tsx#L146-L172)
- **Trigger:** "Proceed to Pay" button
- **Invoice Display:** [app/components/InvoiceModal.tsx](app/components/InvoiceModal.tsx)
- **Payment Options:** Kora checkout or wallet payment

**Pricing Model:**
```
RespondentsCharge = MaxResponseNo × ChargePerResponse
ConditionsCharge = (based on number of targeting conditions)
PlatformCommission = (percentage of total)
TotalAmount = RespondentsCharge + ConditionsCharge + PlatformCommission
```

**HTTP Status Codes:**
- 200 OK: Survey created successfully
- 400 Bad Request: Invalid input, duplicate name, or inaccessible sheet
- 401 Unauthorized: Authentication required
- 403 Forbidden: User not authorized
- 404 Not Found: Creator not found
- 500 Internal Server Error: Server error

**Implementation Notes:**
✅ **UPDATED** - Added complete response fields including:
- checkoutUrl (Korapay payment link)
- totalAmount (total cost including fees)
- respondentsCharge (cost calculation)
- platformCommission (platform fee)
- conditionsCharge (targeting conditions cost)
- transactionReference (payment reference)

---

## Data Flow Diagram

```
1. LOGIN
   User enters credentials → POST /account/authenticate
   → Response: JWT token + user data
   → Stored in AuthContext

2. PAGE LOAD
   On component mount → GET /schools (page=1, pageSize=100)
   Simultaneously → GET /enums/genders
   Simultaneously → GET /enums/person-types
   → All loaded into NicheFiltersContext

3. USER SELECTS SCHOOL
   User selects school → GET /courses/by-school/{schoolId}
   → colleges array populated in context

4. USER SELECTS COLLEGE
   User selects college → GET /departments/by-college/{collegeId}
   → departments array populated in context

5. USER SELECTS DEPARTMENT
   User selects department → GET /courses/by-department/{departmentId}
   → courses array populated in context

6. SURVEY CREATION
   User fills form + selects filters → POST /surveys
   → Response includes:
     - surveyId
     - checkoutUrl (Korapay link)
     - totalAmount (with all fees)
     - transactionReference
   → Display invoice modal with breakdown
   → User chooses payment method:
     a) Kora Checkout → Direct to payment
     b) Wallet → Process via wallet endpoint
```

---

## Error Handling

### 409 Conflict (Login)
- **Cause:** Session conflict or stale token
- **Solution:** Retry logic implemented (max 2 retries)
- **User Action:** Clear localStorage and retry

### 400 Bad Request
- **Common Causes:**
  - Duplicate survey name
  - Inaccessible Google Sheets link
  - Missing required fields
- **User Feedback:** Specific error message displayed

### 401 Unauthorized
- **Cause:** Invalid or expired credentials
- **Solution:** Redirect to login

### 404 Not Found
- **Cause:** Creator or resource not found
- **Solution:** Verify user ID format (must be valid UUID)

### 500 Server Error
- **Cause:** Server-side issue
- **Solution:** Retry with exponential backoff

---

## Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=https://survey-hustler-api.onrender.com
```

---

## Testing Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build
npm run build

# Run tests
npm test
```

---

## Key Files Summary

| File | Purpose | Status |
|------|---------|--------|
| [app/services/api.ts](app/services/api.ts) | Central API service with all 8 endpoints | ✅ Complete |
| [app/contexts/AuthContext.tsx](app/contexts/AuthContext.tsx) | Authentication state management | ✅ Complete |
| [app/contexts/NicheFiltersContext.tsx](app/contexts/NicheFiltersContext.tsx) | Filter data state management | ✅ Complete |
| [app/loginOverlay.tsx](app/loginOverlay.tsx) | Login UI component | ✅ Complete |
| [app/SurveryInfoForm.tsx](app/SurveryInfoForm.tsx) | Survey creation form | ✅ Complete |
| [app/components/InvoiceModal.tsx](app/components/InvoiceModal.tsx) | Invoice display with payment breakdown | ✅ Updated |
| [app/components/EnhancedSuccessModal.tsx](app/components/EnhancedSuccessModal.tsx) | Post-creation success modal | ✅ Complete |

---

## Updates Made (This Session)

### 1. Fixed Colleges Endpoint
- **Issue:** Was calling `/colleges/by-school/{schoolId}` instead of `/courses/by-school/{schoolId}`
- **Fix:** Updated `getCollegesBySchool()` method to call correct endpoint
- **File:** [app/services/api.ts](app/services/api.ts#L525-L533)

### 2. Enhanced Departments Endpoint
- **Issue:** Missing pagination parameters per API specification
- **Fix:** Added searchTerm, sortColumn, sortOrder, page, pageSize parameters
- **File:** [app/services/api.ts](app/services/api.ts#L600-L618)

### 3. Updated Survey Response Interface
- **Issue:** Missing payment details from Korapay response
- **Add:** checkoutUrl, totalAmount, respondentsCharge, platformCommission, conditionsCharge, transactionReference
- **File:** [app/services/api.ts](app/services/api.ts#L144-L167)

### 4. Enhanced Invoice Modal
- **Issue:** Not displaying breakdown with all payment components
- **Fix:** Updated to display respondentsCharge, conditionsCharge, platformCommission separately
- **File:** [app/components/InvoiceModal.tsx](app/components/InvoiceModal.tsx)

---

## Next Steps

1. **Test Login Flow**
   - Use provided test credentials
   - Verify JWT token storage and retrieval

2. **Test Filter Chain**
   - Select school → verify colleges load
   - Select college → verify departments load
   - Select department → verify courses load

3. **Test Survey Creation**
   - Fill complete form with all filters
   - Verify invoice displays correct breakdown
   - Test payment methods (Kora, Wallet)

4. **Payment Integration**
   - Integrate Korapay SDK for checkout
   - Implement wallet payment flow
   - Handle webhooks for payment confirmation

---

## Support

For API-related issues:
1. Check [app/utils/apiErrorHandler.ts](app/utils/apiErrorHandler.ts) for error handling
2. Review browser console and Network tab for API calls
3. Verify authentication token is present in request headers
4. Ensure API base URL is correct: https://survey-hustler-api.onrender.com

