# Testing & Verification Checklist

## ✅ Pre-Testing Setup

- [ ] Backend API deployed at `https://survey-hustler-api.onrender.com`
- [ ] Frontend running on `http://localhost:3000` (or appropriate port)
- [ ] Browser DevTools open (F12)
- [ ] Clear all cookies and localStorage before starting
- [ ] No console errors or warnings (TypeScript compilation successful)

---

## ✅ API Integration Test Cases

### 1. Authentication Tests

#### Test 1.1: Successful Login
```
Steps:
1. Navigate to http://localhost:3000
2. Click "Log In" button
3. Enter valid email and password
4. Click "Login" button

Expected:
- No error message displayed
- JWT token saved in localStorage
- User data stored in localStorage
- Page shows survey creation form (not login overlay)
- User name visible in navbar

Verify in DevTools:
- Network tab: POST /account/authenticate returns 200 OK
- Response contains: id, email, firstName, lastName, jwToken, refreshToken
- localStorage has: jwtToken, refreshToken, userData
```

#### Test 1.2: Failed Login
```
Steps:
1. Click "Log In" if logged out
2. Enter invalid credentials
3. Click "Login"

Expected:
- Error message displayed: "Invalid credentials"
- Page stays on login overlay
- No tokens saved to localStorage
```

#### Test 1.3: Session Persistence
```
Steps:
1. Login successfully
2. Refresh page (F5)
3. Wait for page to load

Expected:
- User should still be logged in
- No need to enter credentials again
- AuthContext.isAuthenticated = true
- User data persists
```

---

### 2. School Dropdown Test

#### Test 2.1: Schools Load on Page Load
```
Steps:
1. Login (if not already)
2. Observe NicheFilters component
3. Look for "Institution" dropdown

Expected:
- "Niche selection" toggle is OFF by default
- When toggle is ON, Institution dropdown appears
- Dropdown is NOT empty
- Options visible with school names

Verify in DevTools:
- Network tab: GET /schools returns 200 OK
- Response contains array of schools with id and name
- Browser console: no errors
```

#### Test 2.2: Schools Dropdown Populated
```
Steps:
1. Click "Niche selection" toggle to ON
2. Click Institution dropdown

Expected:
- List of schools displayed
- Each school has a name
- "Select option" placeholder present
- Dropdown is scrollable if many schools

Verify:
- All schools from API are shown
- No duplicates
- All have valid IDs (UUIDs)
```

---

### 3. College/Course Dropdown Test (Dependent)

#### Test 3.1: Colleges Load When School Selected
```
Steps:
1. Turn ON "Niche selection"
2. Select a school from Institution dropdown

Expected:
- College dropdown populates
- Shows relevant colleges for selected school
- Disabled state removed from College dropdown
- Loading indicator briefly visible (if slow API)

Verify in DevTools:
- Network tab: GET /courses/by-school/{schoolId} called
- Response returns array of colleges
- schoolId matches selected school
```

#### Test 3.2: College Selection Resets When School Changes
```
Steps:
1. Select a school
2. Select a college
3. Change school selection

Expected:
- College selection is cleared
- Department dropdown is cleared
- Course dropdown is cleared and disabled
```

---

### 4. Department Dropdown Test (Dependent)

#### Test 4.1: Departments Load When College Selected
```
Steps:
1. Select a school
2. Select a college

Expected:
- Department dropdown populates
- Shows relevant departments for selected college
- Department dropdown is enabled

Verify in DevTools:
- Network tab: GET /departments/by-college/{collegeId} called
- Response returns array of departments
- collegeId matches selected college
```

---

### 5. Course Dropdown Test (Dependent)

#### Test 5.1: Courses Load When Department Selected
```
Steps:
1. Select school → college → department

Expected:
- Course dropdown populates
- Shows relevant courses for selected department
- Course dropdown is enabled

Verify in DevTools:
- Network tab: GET /courses/by-department/{departmentId} called
- Response returns array of courses
- departmentId matches selected department
```

---

### 6. Gender Dropdown Test

#### Test 6.1: Genders Load
```
Steps:
1. Turn ON "Niche selection"
2. Look at Gender dropdown

Expected:
- Gender dropdown is populated
- Shows gender options (Male, Female, Other, etc.)
- Each gender has an ID and name

Verify in DevTools:
- Network tab: GET /enums/genders called
- Response returns array of gender objects
- Each has: id (number), name (string)
```

---

### 7. Person Type (Role) Dropdown Test

#### Test 7.1: Person Types Load
```
Steps:
1. Turn ON "Niche selection"
2. Look at Role dropdown

Expected:
- Role dropdown is populated
- Shows person type options (Student, Lecturer, Staff, etc.)
- Each person type has an ID and name

Verify in DevTools:
- Network tab: GET /enums/person-types called
- Response returns array of person type objects
- Each has: id (number), name (string)
```

---

### 8. Multiple Filters Test

#### Test 8.1: Add Filter Button Works
```
Steps:
1. Turn ON "Niche selection"
2. Fill out FILTER 1 with all selections
3. Click "Add filter +" button

Expected:
- FILTER 2 appears
- All dropdowns are reset for FILTER 2
- Remove button appears on both filters

Verify:
- Each filter can have independent selections
- Changes to one filter don't affect others
```

#### Test 8.2: Remove Filter Button Works
```
Steps:
1. Add multiple filters (3+)
2. Click remove button on FILTER 2

Expected:
- FILTER 2 is removed
- FILTER 3 becomes FILTER 2
- Only 1 remove button shown when 1 filter remains
```

---

### 9. Survey Creation Test

#### Test 9.1: Form Validation
```
Steps:
1. Click "Proceed to Pay" without filling form

Expected:
- Error message: "Please fill in all required fields"
- Form is NOT submitted
- Invoice modal does NOT appear
```

#### Test 9.2: Survey Creation with Data
```
Steps:
1. Fill in all required fields:
   - Title: "Test Survey"
   - Description: "This is a test"
   - Responder Link: "https://forms.gle/..."
   - Response Sheet: "https://sheets.google.com/..."
   - Duration: 15
   - Responses Needed: 100
   - Cost per Response: 500
2. Add one niche filter:
   - School: Any
   - College: Any
   - Department: Any
   - Course: Any
   - Gender: Any
   - Role: Any
3. Click "Proceed to Pay"

Expected:
- Invoice modal appears
- No error messages
- Modal shows survey details

Verify in DevTools:
- Network tab: POST /surveys called
- Request body includes:
  - name, description, responderLink, sheetLink
  - maxResponseNo (100), chargePerResponse (500)
  - creatorId (user UUID)
  - conditions: [{schoolId, collegeId, departmentId, courseId, gender, personType}]
- Response returns survey object with:
  - id, name, description
  - maxResponseNo, chargePerResponse
  - isActive: true
  - createdAt timestamp
```

#### Test 9.3: Survey Creation Without Filters
```
Steps:
1. Fill form fields
2. Leave "Niche selection" toggle OFF
3. Click "Proceed to Pay"

Expected:
- Survey still creates successfully
- conditions array is empty [] in request
- Invoice modal still appears correctly
```

---

### 10. Invoice Modal Test

#### Test 10.1: Invoice Calculations
```
Provided Data:
- Number of responses: 100
- Cost per response: ₦500
- Service fee: ₦800

Expected Displayed:
- Subtotal: ₦50,000 (100 × 500)
- Service fee: ₦800
- Total: ₦50,800

Verify:
- Calculations are mathematically correct
- Currency format shows ₦ symbol
- Numbers are formatted with commas (50,000 not 50000)
```

#### Test 10.2: Invoice Modal Shows All Data
```
Expected to see:
- Survey Title: (from form title field)
- Number of responses: (from form responses field)
- Cost per response: (from form cost field)
- Service fee: ₦800 (fixed)
- Total Amount: (calculated)
- Survey ID: (UUID from response)
- Created date: (formatted date)
- Back button
- "Proceed to Payment" button
```

#### Test 10.3: Modal Button Actions
```
Steps:
1. Click "Back" button

Expected:
- Invoice modal closes
- User back on form
- Can edit survey details

Steps:
1. Open invoice again
2. Click "Proceed to Payment"

Expected:
- Show payment options (Next step)
```

---

### 11. Error Handling Tests

#### Test 11.1: Network Error Handling
```
Steps:
1. Disconnect internet (or use offline DevTools)
2. Try to login
3. Wait for timeout

Expected:
- Error message displayed to user
- Message indicates network problem
- No partial/corrupted state
```

#### Test 11.2: Invalid JWT Token
```
Steps:
1. Manually edit localStorage
2. Change jwtToken to invalid value
3. Refresh page
4. Try to create survey

Expected:
- API returns 401 Unauthorized
- Error message: "Authentication failed"
- User prompted to login again
```

#### Test 11.3: API Error Responses
```
Test for each error code:
- 400: "Invalid request data"
- 401: "Authentication failed"
- 403: "Access denied"
- 500: "Server error"

Steps:
1. Trigger error condition
2. Verify appropriate message shown

Expected:
- User-friendly error messages
- No technical jargon
- Suggested action if possible
```

---

### 12. Local Storage Tests

#### Test 12.1: Tokens Stored Correctly
```
Steps:
1. Login successfully
2. Open DevTools → Application → Storage → Local Storage
3. Look for entry with domain

Expected:
- jwtToken: Valid JWT (3 parts: header.payload.signature)
- refreshToken: Non-empty string
- userData: Valid JSON with user details
```

#### Test 12.2: Data Persists on Refresh
```
Steps:
1. Login
2. Press F5 to refresh
3. Wait for page to load

Expected:
- All localStorage data intact
- User still logged in
- No need to login again
- Survey form visible (if on form page)
```

#### Test 12.3: Logout Clears Storage
```
Steps:
1. Login (if needed)
2. Click Logout
3. Check localStorage

Expected:
- jwtToken removed
- refreshToken removed
- userData removed
- Only empty localStorage remains
```

---

## 📋 Performance Checklist

- [ ] API requests complete in <2 seconds
- [ ] No duplicate API calls for same endpoint
- [ ] Dropdowns show loading indicator while fetching
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Page smooth scrolling with many filters
- [ ] Form submit button disabled during processing
- [ ] Error messages clear after 5-10 seconds (optional)

---

## 🎨 UI/UX Checklist

- [ ] All required fields clearly marked
- [ ] Error messages displayed prominently in red
- [ ] Success states shown (survey created ✓)
- [ ] Loading states visible (spinners, disabled buttons)
- [ ] Responsive on mobile devices
- [ ] Buttons have hover states
- [ ] Form labels aligned properly
- [ ] Invoice modal centered and readable

---

## 🐛 Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (if available)

Check for:
- [ ] No console errors/warnings
- [ ] Forms work correctly
- [ ] Dropdowns display properly
- [ ] Modal appears centered
- [ ] LocalStorage works

---

## 📱 Responsive Design

Test at screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

Check for:
- [ ] Form fields readable
- [ ] Dropdowns accessible
- [ ] Modal scrollable if needed
- [ ] No horizontal scroll
- [ ] Buttons easily clickable

---

## 🔒 Security Checklist

- [ ] JWT token NOT exposed in URL
- [ ] Sensitive data not logged to console (production)
- [ ] No hardcoded credentials in code
- [ ] HTTPS used for API calls
- [ ] Bearer token in Authorization header
- [ ] Token sent only to authenticated endpoints
- [ ] LocalStorage used appropriately (not for secrets)

---

## ✅ Final Sign-Off

### Before Deployment

- [ ] All test cases passed
- [ ] No TypeScript errors
- [ ] No runtime errors in console
- [ ] API responses verified in Network tab
- [ ] localStorage data verified
- [ ] Mobile responsive working
- [ ] Performance acceptable (<2s responses)
- [ ] Security measures in place
- [ ] Error handling comprehensive
- [ ] Documentation complete

### Documentation Verified

- [ ] QUICK_REFERENCE.md complete
- [ ] INTEGRATION_SUMMARY.md complete
- [ ] ARCHITECTURE_DIAGRAM.md complete
- [ ] API_INTEGRATION_COMPLETE.md complete
- [ ] Code commented where necessary
- [ ] README.md updated with new features

### Ready for Payment Gateway Integration

- [ ] All form data collected correctly
- [ ] Invoice calculations verified
- [ ] Total amount accurate
- [ ] Survey response stored with ID
- [ ] Ready to pass data to Kora/payment provider

---

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Successful Login | ☐ | |
| 1.2 Failed Login | ☐ | |
| 1.3 Session Persistence | ☐ | |
| 2.1 Schools Load | ☐ | |
| 2.2 Schools Dropdown | ☐ | |
| 3.1 Colleges Load | ☐ | |
| 3.2 College Reset | ☐ | |
| 4.1 Departments Load | ☐ | |
| 5.1 Courses Load | ☐ | |
| 6.1 Genders Load | ☐ | |
| 7.1 Person Types Load | ☐ | |
| 8.1 Add Filter | ☐ | |
| 8.2 Remove Filter | ☐ | |
| 9.1 Form Validation | ☐ | |
| 9.2 Survey Creation | ☐ | |
| 9.3 No Filters | ☐ | |
| 10.1 Invoice Calculations | ☐ | |
| 10.2 Invoice Display | ☐ | |
| 10.3 Modal Actions | ☐ | |
| 11.1 Network Error | ☐ | |
| 11.2 Invalid Token | ☐ | |
| 11.3 API Errors | ☐ | |
| 12.1 Storage | ☐ | |
| 12.2 Refresh | ☐ | |
| 12.3 Logout | ☐ | |

---

**Date Tested:** _______________
**Tester Name:** _______________
**Overall Status:** ☐ PASS ☐ FAIL

**Notes/Issues Found:**
```
[Add notes here]
```

---

**Last Updated:** December 17, 2024
**Status:** ✅ Ready for Testing
