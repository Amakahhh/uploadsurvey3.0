# Survey 500 Error - Fixes Applied

**Date:** December 17, 2025  
**Issue:** POST /surveys endpoint returning 500 error

---

## Root Causes Identified & Fixed

### Fix 1: Clean Conditions Array (Remove Undefined Values)
**File:** [app/SurveryInfoForm.tsx](app/SurveryInfoForm.tsx#L213)

**Problem:**
The backend was receiving conditions with `undefined` values:
```typescript
{
  "schoolId": undefined,  // ❌ Backend rejects this
  "collegeId": undefined,
  "gender": undefined,
  "personType": undefined
}
```

**Solution:**
Only include fields that have actual values:
```typescript
const condition: SurveyCondition = {};
if (filter.schoolId) condition.schoolId = filter.schoolId;
if (filter.collegeId) condition.collegeId = filter.collegeId;
if (filter.departmentId) condition.departmentId = filter.departmentId;
if (filter.courseId) condition.courseId = filter.courseId;
if (filter.gender) condition.gender = filter.gender;
if (filter.personType) condition.personType = filter.personType;
return condition;
```

**Result:**
```typescript
// Now sends only filled conditions
{
  "schoolId": "uuid-value",  // ✅ Only if selected
  "gender": 1                 // ✅ Only if selected
}
```

---

### Fix 2: Simplify CreatorId Logic
**File:** [app/SurveryInfoForm.tsx](app/SurveryInfoForm.tsx#L193)

**Problem:**
The fake UUID generation was creating invalid IDs:
```typescript
// ❌ Could generate: 550e8400-e29b-41d4-a716-1734470000000
// This might not be a valid UUID format for backend
const creatorId = user.id.match(/uuid_regex/)
  ? user.id 
  : `550e8400-e29b-41d4-a716-${Date.now().toString()...}`;
```

**Solution:**
Trust the authentication endpoint - if login succeeded, user.id is valid:
```typescript
// ✅ Use user.id directly from successful login
const creatorId = user.id;
```

**Why This Works:**
1. User logged in successfully via POST /account/authenticate
2. Backend returned user.id in response
3. If user.id was invalid, backend wouldn't have returned it
4. No need to validate or regenerate it

---

## Code Changes

### Before (Problematic)
```typescript
// Lines 193-200 OLD
const creatorId = user.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
  ? user.id 
  : `550e8400-e29b-41d4-a716-${Date.now().toString().padStart(12, '0').slice(-12)}`;

// Lines 213-220 OLD
conditions: nicheFilters.map((filter) => ({
  schoolId: filter.schoolId || undefined,
  collegeId: filter.collegeId || undefined,
  departmentId: filter.departmentId || undefined,
  courseId: filter.courseId || undefined,
  gender: filter.gender,
  personType: filter.personType,
})) as SurveyCondition[]
```

### After (Fixed)
```typescript
// Lines 193-195 NEW
if (!user.id) {
  throw new Error('User ID is missing. Please log in again.');
}
const creatorId = user.id;  // ✅ Direct, trusted value

// Lines 213-226 NEW
conditions: nicheFilters.map((filter) => {
  const condition: SurveyCondition = {};
  if (filter.schoolId) condition.schoolId = filter.schoolId;
  if (filter.collegeId) condition.collegeId = filter.collegeId;
  if (filter.departmentId) condition.departmentId = filter.departmentId;
  if (filter.courseId) condition.courseId = filter.courseId;
  if (filter.gender) condition.gender = filter.gender;
  if (filter.personType) condition.personType = filter.personType;
  return condition;
})
```

---

## Testing the Fix

### Step 1: Clear Data
```javascript
// In browser console
localStorage.clear();
```

### Step 2: Login Fresh
- Log in with test credentials
- Check that user.id is populated in localStorage

### Step 3: Create Survey
**Use valid test data:**
```
Title:           "Test Survey 2025"
Description:     "Testing fixed conditions"
Responder Link:  "https://forms.gle/YOUR_GOOGLE_FORM_ID"
Sheet Link:      "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
Responses:       50
Cost:            500
Filters:         Select School, College, Department (optional)
```

### Step 4: Monitor Network
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: "surveys"
4. Submit form
5. Check response status

**Expected:**
- ✅ Status: 200 OK (success)
- ✅ Response includes: checkoutUrl, totalAmount, etc.

---

## Request Comparison

### Old Request (Causing 500)
```json
{
  "name": "Test",
  "description": "...",
  "responderLink": "...",
  "sheetLink": "...",
  "maxResponseNo": 100,
  "chargePerResponse": 500,
  "begin": "2025-12-17T...",
  "creatorId": "550e8400-e29b-41d4-a716-1734470000000",  // ❌ Fake UUID
  "conditions": [
    {
      "schoolId": undefined,     // ❌ Undefined in JSON
      "collegeId": undefined,
      "gender": undefined,
      "personType": undefined
    }
  ]
}
```

### New Request (Should Work)
```json
{
  "name": "Test",
  "description": "...",
  "responderLink": "...",
  "sheetLink": "...",
  "maxResponseNo": 100,
  "chargePerResponse": 500,
  "begin": "2025-12-17T...",
  "creatorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",  // ✅ From login
  "conditions": [
    {
      "schoolId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"  // ✅ Only filled fields
    }
  ]
}
```

---

## Other Possible Causes (If Still 500)

If you still get 500 after these fixes, check:

### 1. Google Sheets Accessibility
**Test:**
1. Copy your sheet link
2. Open in **private/incognito window** (not logged in)
3. Should NOT require authentication

**If blocked:** Make sheet publicly readable

### 2. Google Forms Link
**Test:**
1. Copy your form link
2. Open in incognito
3. Should be able to view the form

**If blocked:** Make form publicly accessible

### 3. Network Tab Error Details
**To see exact error:**
1. DevTools → Network
2. Click on POST /surveys request
3. Go to Response tab
4. Copy the exact error message
5. Share it for more specific diagnosis

---

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| app/SurveryInfoForm.tsx | Fix 1: Clean conditions | 213-226 |
| app/SurveryInfoForm.tsx | Fix 2: Simplify creatorId | 193-195 |

---

## Summary

✅ **Removed undefined values from conditions array**  
✅ **Simplified creatorId to use authenticated user.id directly**  
✅ **Reduced potential failure points in request**

**Impact:**
- Conditions array now only contains fields with actual values
- CreatorId is guaranteed valid from successful login
- Request body cleaner and more aligned with backend expectations

---

## Next Steps

1. **Test the fix** by creating a survey
2. **Monitor Network tab** for 200 OK response
3. If still 500, check:
   - Google Sheets accessibility
   - Google Forms link validity
   - Network Response for exact error message

---

**Status:** Fixes applied ✅  
**Ready for testing:** Yes ✅

