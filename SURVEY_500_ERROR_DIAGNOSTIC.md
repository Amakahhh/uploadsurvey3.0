# Survey Creation 500 Error - Diagnostic Guide

## Likely Causes

### 1. **CreatorId Format Issue** (Most Likely)
The backend may be receiving an invalid UUID format.

**Current Logic:**
```typescript
const creatorId = user.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
  ? user.id 
  : `550e8400-e29b-41d4-a716-${Date.now().toString().padStart(12, '0').slice(-12)}`;
```

**Problem:** If `user.id` doesn't match the UUID regex, it creates a fake UUID using timestamp, which might not be valid.

**Fix:** Use the user.id as-is if logged in via the authentication endpoint.

---

### 2. **Conditions Array with Undefined Values**
The backend may not like `undefined` values in the conditions array.

**Current Code:**
```typescript
conditions: nicheFilters.map((filter) => ({
  schoolId: filter.schoolId || undefined,
  collegeId: filter.collegeId || undefined,
  departmentId: filter.departmentId || undefined,
  courseId: filter.courseId || undefined,
  gender: filter.gender,
  personType: filter.personType,
})) as SurveyCondition[]
```

**Problem:** The API spec shows that conditions should include `levels` and `program` fields, but they're not being sent.

**Fix:** Only send fields that have values (remove undefined).

---

### 3. **Google Sheets Validation**
The backend checks if the Google Sheets link is accessible.

**Current Requirement:**
```
sheetLink: string   // Must be accessible
```

**Problem:** If the link doesn't exist or isn't publicly accessible, the backend returns 500.

---

## Diagnostic Steps

### Step 1: Check the Console Logs
When you try to create a survey, look for:
```
🔍 API Request Body: {...}
🔍 API Response Status: 500
🔍 API Response Body: {...}
```

Copy the exact request body and response body.

---

### Step 2: Verify Your Inputs

**Check each field:**
- [ ] Survey Title: Non-empty string
- [ ] Description: Non-empty string
- [ ] Responder Link: Valid Google Forms link (e.g., https://forms.gle/...)
- [ ] Sheet Link: Valid Google Sheets link (e.g., https://docs.google.com/spreadsheets/...)
  - **IMPORTANT:** Sheet must be accessible (not private)
- [ ] Number of Responses: Positive integer (e.g., 100)
- [ ] Cost per Response: Positive number (e.g., 500)

---

### Step 3: Check Request Format

**What you're sending:**
```typescript
{
  "name": "string",
  "description": "string",
  "responderLink": "https://forms.gle/...",
  "sheetLink": "https://docs.google.com/spreadsheets/...",
  "maxResponseNo": number,
  "chargePerResponse": number,
  "begin": "2025-12-17T...",
  "creatorId": "uuid",
  "conditions": [{
    "schoolId": "uuid?",
    "collegeId": "uuid?",
    "departmentId": "uuid?",
    "courseId": "uuid?",
    "gender": number?,
    "personType": number?
  }]
}
```

**Issue:** The `levels` and `program` fields from the API spec are missing.

---

## Quick Fixes to Try

### Fix 1: Clean Conditions Array
Replace the conditions mapping in [app/SurveryInfoForm.tsx](app/SurveryInfoForm.tsx#L213) with:

```typescript
conditions: nicheFilters.map((filter) => {
  const condition: any = {};
  if (filter.schoolId) condition.schoolId = filter.schoolId;
  if (filter.collegeId) condition.collegeId = filter.collegeId;
  if (filter.departmentId) condition.departmentId = filter.departmentId;
  if (filter.courseId) condition.courseId = filter.courseId;
  if (filter.gender) condition.gender = filter.gender;
  if (filter.personType) condition.personType = filter.personType;
  return condition;
}) as SurveyCondition[]
```

**Why:** Only sends fields that have actual values, avoiding `undefined` issues.

---

### Fix 2: Use Actual User ID
Replace the creatorId logic with:

```typescript
const creatorId = user.id;  // Trust the login response
if (!creatorId) {
  throw new Error('User ID from login is invalid. Please log in again.');
}
```

**Why:** The JWT token came from login, so the user.id should be valid.

---

### Fix 3: Verify Google Sheets is Accessible
1. Copy your sheets link
2. Open in **private/incognito window** (not logged in)
3. If you get "Access Denied", the backend will too

**Solution:** Make the sheet publicly accessible or share it with the backend service account.

---

## Testing the Fix

### Step 1: Enable Console Logging
Open DevTools (F12) and watch the console.

### Step 2: Fill Form with Test Data
```
Title:           "Test Survey Dec 17"
Description:     "Testing the survey creation"
Responder Link:  "https://forms.gle/YOUR_FORM_ID"
Sheet Link:      "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
Responses:       100
Cost:            500
```

### Step 3: Submit and Check
1. Look at console logs for exact request
2. Check Network tab for response status and body
3. Note the error message

---

## Network Inspection

**In Browser DevTools:**

1. Open DevTools (F12)
2. Go to Network tab
3. Filter to "surveys"
4. Submit form
5. Click on the POST request to `/surveys`
6. Check **Response** tab for exact error message

**Expected 500 Response Might Be:**
```json
{
  "message": "Google Sheets link is not accessible",
  "code": "SHEET_NOT_ACCESSIBLE"
}
```

Or:

```json
{
  "message": "Invalid creator ID format",
  "code": "INVALID_CREATOR"
}
```

---

## Common 500 Error Reasons

| Error Message | Cause | Solution |
|---|---|---|
| "Google Sheets link is not accessible" | Sheet is private | Make it publicly readable |
| "Invalid creator ID" | User ID format wrong | Check console logs for user.id format |
| "Survey name already exists" | Duplicate name | Use a unique title |
| "Conditions validation failed" | Invalid condition data | Use clean conditions (no undefined) |
| "Form link is invalid" | Forms link is private | Check form accessibility |

---

## Check Your User Object

Add this to console and check user.id:

```javascript
// In browser console:
const authData = localStorage.getItem('userData');
const userData = JSON.parse(authData);
console.log('User ID:', userData.id);
console.log('User ID Format:', userData.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'Valid UUID' : 'Invalid UUID');
```

---

## Next Steps

1. **Share the exact error** from the Network Response tab
2. **Copy the exact request body** from Network Request tab
3. **Verify your Google Sheets link** is publicly accessible
4. **Apply Fix 1 and Fix 2** above
5. **Try creating a survey again**

---

## Backend Requirements (From API Docs)

```
POST /surveys Requirements:
- name: string (unique, not empty)
- description: string (optional but recommended)
- responderLink: string (valid Google Forms link)
- sheetLink: string (valid, publicly accessible Google Sheets)
- maxResponseNo: number > 0
- chargePerResponse: number > 0
- begin: ISO date string (current date is fine)
- creatorId: valid UUID from login response
- conditions: array (can be empty, all fields are optional per condition)
```

---

## Questions to Answer

1. **What exact error message do you see in browser console?**
2. **What is your user.id value?** (Check in console)
3. **Is your Google Sheets link publicly accessible?** (Test in incognito)
4. **What are you filling in for each field?** (Exact test data)

Please provide these details and I can give you the exact fix!

