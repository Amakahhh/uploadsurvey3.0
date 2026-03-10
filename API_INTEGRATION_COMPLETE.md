# Frontend to Backend Integration Guide

## Overview
This document describes the complete integration between the frontend and the backend API deployed at `https://survey-hustler-api.onrender.com`.

## API Endpoints Implemented

### 1. Authentication (Login Modal)
**Endpoint:** `POST /account/authenticate`  
**Location:** `app/services/api.ts` → `login()` method  
**Component:** `app/loginOverlay.tsx` → `handleLogin()`

**Flow:**
1. User clicks "Log In" and enters email/password
2. LoginOverlay calls `apiService.login()`
3. Credentials are sent to `/account/authenticate`
4. Response contains JWT token and user data
5. User is stored in AuthContext and localStorage
6. User can now create surveys

**Current Status:** ✅ Implemented

---

### 2. Niche Selection / Filter Data (Dropdowns)

#### 2.1 Schools Dropdown
**Endpoint:** `GET /schools`  
**Location:** `app/contexts/NicheFiltersContext.tsx` → `loadSchools()`  
**Component:** `app/NicheFilters.tsx`

**Flow:**
1. On app load, NicheFiltersContext calls `loadSchools()`
2. Populates the "Institution" dropdown
3. User selects a school by ID

#### 2.2 Colleges Dropdown (Dependent)
**Endpoint:** `GET /courses/by-school/{schoolId}`  
**Location:** `app/contexts/NicheFiltersContext.tsx` → `loadCollegesBySchool()`  
**Component:** `app/NicheFilters.tsx`

**Flow:**
1. When a school is selected
2. `handleSchoolChange()` calls `loadCollegesBySchool(schoolId)`
3. Colleges are filtered and populated
4. Dependent field resets when school changes

#### 2.3 Departments Dropdown (Dependent)
**Endpoint:** `GET /departments/by-college/{collegeId}`  
**Location:** `app/contexts/NicheFiltersContext.tsx` → `loadDepartmentsByCollege()`  
**Component:** `app/NicheFilters.tsx`

**Flow:**
1. When a college is selected
2. `handleCollegeChange()` calls `loadDepartmentsByCollege(collegeId)`
3. Departments are filtered and populated

#### 2.4 Courses Dropdown (Dependent)
**Endpoint:** `GET /courses/by-department/{departmentId}`  
**Location:** `app/contexts/NicheFiltersContext.tsx` → `loadCoursesByDepartment()`  
**Component:** `app/NicheFilters.tsx`

**Flow:**
1. When a department is selected
2. `handleDepartmentChange()` calls `loadCoursesByDepartment(departmentId)`
3. Courses are filtered and populated

#### 2.5 Gender Dropdown
**Endpoint:** `GET /enums/genders`  
**Location:** `app/contexts/NicheFiltersContext.tsx` → `loadEnums()`  
**Component:** `app/NicheFilters.tsx`

**Flow:**
1. On app load, `loadEnums()` fetches genders
2. Populates gender dropdown with ID and name pairs

#### 2.6 Role (Person Types) Dropdown
**Endpoint:** `GET /enums/person-types`  
**Location:** `app/contexts/NicheFiltersContext.tsx` → `loadEnums()`  
**Component:** `app/NicheFilters.tsx`

**Flow:**
1. On app load, `loadEnums()` fetches person types
2. Populates role dropdown with ID and name pairs

**Current Status:** ✅ Implemented

---

### 3. Survey Submission Flow

#### Step A: Proceed to Pay
**Endpoint:** `POST /surveys`  
**Location:** `app/services/api.ts` → `createSurvey()` method  
**Component:** `app/SurveryInfoForm.tsx` → `createSurvey()`

**Request Body Structure:**
```typescript
{
  name: string;                    // Survey title
  description: string;             // Survey description
  responderLink: string;          // Form URL
  sheetLink: string;              // Google Sheets URL
  maxResponseNo: number;          // Number of responses needed
  chargePerResponse: number;      // Price per response
  begin: string;                  // ISO timestamp
  creatorId: string;              // User ID (UUID)
  conditions: SurveyCondition[];  // Niche filters
}
```

**Conditions Structure (from niche filters):**
```typescript
interface SurveyCondition {
  schoolId?: string;
  collegeId?: string;
  departmentId?: string;
  courseId?: string;
  gender?: number;        // Gender ID from enum
  personType?: number;    // Person Type ID from enum
}
```

**Flow:**
1. User fills survey info form (title, description, links, duration, cost)
2. User selects niche filters (optional)
3. User clicks "Proceed to Pay"
4. `createSurvey()` bundles all data with conditions
5. POST request sent to `/surveys`
6. Backend returns survey with:
   - Survey ID
   - Total cost
   - Service fee
   - Cost per response
   - Response count
   - Checkout link (if available)

**Data Flow in Code:**
```
NicheFilters.tsx
  ↓ (onFiltersChange callback)
SurveryInfoForm.tsx (nicheFilters state)
  ↓ (createSurvey function)
apiService.createSurvey()
  ↓
POST /surveys
  ↓
Backend creates survey and returns CreateSurveyResponse
  ↓
InvoiceModal displays response data
```

**Current Status:** ✅ Implemented

---

#### Step B: Invoice & Payment
**Component:** `app/components/InvoiceModal.tsx`

**Flow:**
1. Survey creation response contains all invoice data
2. InvoiceModal displays:
   - Survey title
   - Number of responses
   - Cost per response
   - Service fee
   - Total amount
3. User clicks "Proceed to Payment"
4. Payment gateway integration is triggered

**Invoice Data from API Response:**
```typescript
{
  id: string;              // Survey ID
  name: string;            // Survey title
  maxResponseNo: number;   // Number of responses
  chargePerResponse: number; // Cost per response
  // ... other fields
}
```

**Current Status:** ✅ Modal component ready

---

## State Management Architecture

### NicheFiltersContext
**Location:** `app/contexts/NicheFiltersContext.tsx`

**Provides:**
- `schools`: Array of schools from API
- `colleges`: Array of colleges from API
- `departments`: Array of departments from API
- `courses`: Array of courses from API
- `genders`: Array of gender enums
- `personTypes`: Array of person type enums
- `selectedFilters`: User's selected filter combinations
- `loading` states for each dropdown

**Actions:**
- `loadSchools()`: GET /schools
- `loadCollegesBySchool()`: GET /courses/by-school/{id}
- `loadDepartmentsByCollege()`: GET /departments/by-college/{id}
- `loadCoursesByDepartment()`: GET /courses/by-department/{id}
- `loadEnums()`: GET /enums/genders + GET /enums/person-types

**Usage:**
```tsx
const { schools, colleges, loadCollegesBySchool, selectedFilters } = useNicheFilters();
```

---

## Component Integration Points

### 1. Layout (`app/layout.tsx`)
Wraps entire app with:
- `AuthProvider` - Authentication context
- `NicheFiltersProvider` - Filter data context

### 2. NicheFilters Component (`app/NicheFilters.tsx`)
- Uses `useNicheFilters()` hook
- Displays dependent dropdowns
- Calls API when selections change
- Passes selected filters to parent via callback

### 3. SurveryInfoForm Component (`app/SurveryInfoForm.tsx`)
- Collects survey info (title, description, links, cost)
- Receives niche filters from NicheFilters component
- Bundles data and sends to `/surveys` endpoint
- Receives response with invoice data
- Displays InvoiceModal with payment options

### 4. InvoiceModal Component (`app/components/InvoiceModal.tsx`)
- Displays invoice data from survey creation response
- Shows:
  - Survey details (title, responses, cost per response)
  - Service fee
  - Total amount
- Provides payment action buttons

---

## Error Handling

### API Errors
All API calls use the error handler in `app/utils/apiErrorHandler.ts`:
- Network errors trigger retry logic
- HTTP error codes (401, 403, 500, etc.) provide specific messages
- Errors are displayed to user in red error boxes

### Form Validation
- Required fields checked before submission
- Niche filters optional (can submit without)
- Cost validation (must be > 0)
- Response count validation (must be > 0)

### Retry Logic
- Login attempts retry up to 2 times for conflict errors
- Survey creation retries up to 3 times for network errors
- Form verification retries up to 3 times

---

## Database Models Represented

### Survey
```typescript
{
  id: UUID;
  name: string;
  description: string;
  responderLink: string;
  sheetLink: string;
  maxResponseNo: number;
  chargePerResponse: number;
  creatorId: UUID;
  begin: DateTime;
  conditions: SurveyCondition[];
  isActive: boolean;
  createdAt: DateTime;
}
```

### SurveyCondition
```typescript
{
  schoolId?: UUID;
  collegeId?: UUID;
  departmentId?: UUID;
  courseId?: UUID;
  gender?: number;
  personType?: number;
}
```

---

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Schools dropdown loads on page load
- [ ] Select school → Colleges populate
- [ ] Select college → Departments populate
- [ ] Select department → Courses populate
- [ ] Gender dropdown shows gender options
- [ ] Role dropdown shows person type options
- [ ] Toggle "Apply filter" switch
- [ ] Click "Add filter +" to add multiple filters
- [ ] Fill survey info (title, description, links, cost, responses)
- [ ] Click "Proceed to Pay"
- [ ] Invoice modal displays correct calculations
- [ ] Verify response count, cost per response, service fee, total
- [ ] Payment options are available

---

## Next Steps

1. **Kora Payment Gateway Integration**
   - Integrate Kora payment SDK
   - Use total amount from invoice modal
   - Handle payment success/failure callbacks

2. **Wallet Integration**
   - Add wallet payment option
   - Implement wallet creation flow
   - Handle wallet balance checks

3. **Survey List/Dashboard**
   - Display created surveys
   - Show survey status
   - Allow survey management

4. **Response Tracking**
   - Track responses received
   - Display analytics
   - Handle survey completion

---

## Key Files Modified/Created

✅ **Created:**
- `app/contexts/NicheFiltersContext.tsx` - Filter state management
- `app/components/InvoiceModal.tsx` - Invoice display

✅ **Modified:**
- `app/services/api.ts` - Added enum endpoints
- `app/layout.tsx` - Added NicheFiltersProvider
- `app/NicheFilters.tsx` - Complete rewrite with API integration
- `app/SurveryInfoForm.tsx` - Integrated niche filters with survey creation

---

## API Base URL
`https://survey-hustler-api.onrender.com`

All endpoints relative to this URL.
