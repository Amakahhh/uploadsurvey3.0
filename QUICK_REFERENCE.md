# Quick Reference - Frontend to Backend Integration

## ✅ Completed Integration Tasks

### 1. Authentication (Login Modal)
- **Endpoint:** `POST /account/authenticate`
- **Status:** ✅ Already Implemented
- **Location:** `app/loginOverlay.tsx` → `handleLogin()`
- **File:** `app/services/api.ts` → `login()` method

### 2. Niche Selection Dropdowns
- **Endpoint:** `GET /schools`
- **Status:** ✅ Implemented
- **Location:** `app/contexts/NicheFiltersContext.tsx`
- **Component:** `app/NicheFilters.tsx`

### 3. Colleges (Dependent Dropdown)
- **Endpoint:** `GET /courses/by-school/{schoolId}`
- **Status:** ✅ Implemented
- **Trigger:** When school is selected
- **File:** `app/contexts/NicheFiltersContext.tsx`

### 4. Departments (Dependent Dropdown)
- **Endpoint:** `GET /departments/by-college/{collegeId}`
- **Status:** ✅ Implemented
- **Trigger:** When college is selected
- **File:** `app/contexts/NicheFiltersContext.tsx`

### 5. Courses (Dependent Dropdown)
- **Endpoint:** `GET /courses/by-department/{departmentId}`
- **Status:** ✅ Implemented
- **Trigger:** When department is selected
- **File:** `app/contexts/NicheFiltersContext.tsx`

### 6. Gender Dropdown
- **Endpoint:** `GET /enums/genders`
- **Status:** ✅ Implemented
- **Location:** `app/NicheFilters.tsx`
- **File:** `app/services/api.ts` → `getGenders()`

### 7. Role/Person Types Dropdown
- **Endpoint:** `GET /enums/person-types`
- **Status:** ✅ Implemented
- **Location:** `app/NicheFilters.tsx`
- **File:** `app/services/api.ts` → `getPersonTypes()`

### 8. Survey Creation
- **Endpoint:** `POST /surveys`
- **Status:** ✅ Implemented
- **Location:** `app/SurveryInfoForm.tsx` → `createSurvey()`
- **Includes:** Niche filter conditions

### 9. Invoice Display
- **Endpoint:** Displays response from POST /surveys
- **Status:** ✅ Implemented
- **Component:** `app/components/InvoiceModal.tsx`
- **Shows:** Responses, cost, service fee, total

---

## How Each Part Works

### Authentication Flow
```
Login Modal → apiService.login() → POST /account/authenticate
→ Store JWT Token → Update AuthContext → User Authenticated
```

### Niche Filter Flow
```
App Loads → NicheFiltersProvider → Load Schools + Enums
→ User Selects School → Load Colleges by School
→ User Selects College → Load Departments by College
→ User Selects Department → Load Courses by Department
```

### Survey Submission Flow
```
Fill Form + Select Filters → Click "Proceed to Pay"
→ Bundle Data with Conditions → POST /surveys
→ Receive Survey Response → Display InvoiceModal
→ Click "Proceed to Payment" → Next Step (Payment Gateway)
```

---

## API Request/Response Summary

### POST /account/authenticate
**Request:**
```json
{ "email": "user@example.com", "password": "password" }
```
**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isAuthenticated": true,
  "jwToken": "...",
  "refreshToken": "..."
}
```

### GET /schools
**Response:**
```json
[
  { "id": "school-uuid-1", "name": "School Name 1" },
  { "id": "school-uuid-2", "name": "School Name 2" }
]
```

### GET /courses/by-school/{schoolId}
**Response:** Array of colleges with same structure as schools

### GET /departments/by-college/{collegeId}
**Response:** Array of departments with `id`, `name`, `collegeId`

### GET /courses/by-department/{departmentId}
**Response:** Array of courses with `id`, `name`, `departmentId`

### GET /enums/genders
**Response:**
```json
[
  { "id": 1, "name": "Male" },
  { "id": 2, "name": "Female" },
  { "id": 3, "name": "Other" }
]
```

### GET /enums/person-types
**Response:**
```json
[
  { "id": 1, "name": "Student" },
  { "id": 2, "name": "Lecturer" },
  { "id": 3, "name": "Staff" }
]
```

### POST /surveys
**Request:**
```json
{
  "name": "Survey Title",
  "description": "Description",
  "responderLink": "https://forms.google.com/...",
  "sheetLink": "https://sheets.google.com/...",
  "maxResponseNo": 100,
  "chargePerResponse": 500,
  "begin": "2024-12-17T10:00:00Z",
  "creatorId": "uuid",
  "conditions": [
    {
      "schoolId": "uuid",
      "collegeId": "uuid",
      "departmentId": "uuid",
      "courseId": "uuid",
      "gender": 1,
      "personType": 2
    }
  ]
}
```

**Response:**
```json
{
  "id": "survey-uuid",
  "name": "Survey Title",
  "description": "Description",
  "maxResponseNo": 100,
  "chargePerResponse": 500,
  "creatorId": "uuid",
  "begin": "2024-12-17T10:00:00Z",
  "conditions": [...],
  "isActive": true,
  "createdAt": "2024-12-17T10:05:00Z"
}
```

---

## File Locations Quick Map

| Component | File | Purpose |
|-----------|------|---------|
| Authentication | `app/contexts/AuthContext.tsx` | User auth state |
| Filter Data | `app/contexts/NicheFiltersContext.tsx` | Dropdown data state |
| Filters UI | `app/NicheFilters.tsx` | Dropdown components |
| Survey Form | `app/SurveryInfoForm.tsx` | Survey creation form |
| Invoice | `app/components/InvoiceModal.tsx` | Invoice display |
| API Calls | `app/services/api.ts` | All endpoint methods |
| Layout | `app/layout.tsx` | Context providers |

---

## Key State Variables

### In NicheFiltersContext
- `schools`: Array of School objects
- `colleges`: Array of College objects
- `departments`: Array of Department objects
- `courses`: Array of Course objects
- `genders`: Array of Gender enums
- `personTypes`: Array of PersonType enums
- `selectedFilters`: Array of NicheFilter objects
- `loading*`: Boolean flags for each dropdown

### In SurveryInfoForm
- `formData`: { title, desc, link, sheet, minutes, responses, cost }
- `nicheFilters`: Array of NicheFilter objects
- `createdSurvey`: CreateSurveyResponse object
- `showInvoice`: Boolean to show/hide invoice modal

---

## How to Test

### 1. Login
```
1. Visit http://localhost:3000
2. Click Log In button
3. Enter test credentials
4. Verify JWT token in localStorage
```

### 2. Filter Dropdowns
```
1. After login, schools should load automatically
2. Select a school → colleges should populate
3. Select a college → departments should populate
4. Select a department → courses should populate
5. Verify all options load from API
```

### 3. Survey Creation
```
1. Fill survey form (all required fields)
2. Select niche filters (optional)
3. Click "Proceed to Pay"
4. Verify POST /surveys sends conditions
5. Verify invoice modal displays correct calculations
```

### 4. Invoice Display
```
1. Check response calculation: subtotal = responses × cost
2. Verify service fee displayed (₦800)
3. Verify total = subtotal + service fee
4. Verify survey ID and creation date shown
```

---

## Debugging Tips

### Check API Requests
- Open browser DevTools → Network tab
- Filter by "Fetch/XHR"
- Look for requests to `https://survey-hustler-api.onrender.com`
- Check request headers include `Authorization: Bearer {token}`
- Check response status (200 = success, 4xx/5xx = error)

### Check Local Storage
- DevTools → Application tab → Storage → Local Storage
- Verify `jwtToken` exists and is valid JWT
- Verify `userData` contains user info
- Verify `user_surveys` contains created surveys

### Check Context Values
- Add console.log in component using hooks
- Example: `console.log(useNicheFilters())`
- Verify schools, colleges, etc. are populated

### Check Component Props
- Verify InvoiceModal receives correct survey object
- Verify calculations are correct
- Verify buttons trigger correct handlers

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Dropdown shows empty | Check API call in Network tab, verify status 200 |
| Schools don't load | Check NicheFiltersContext loaded in layout.tsx |
| Filters not saving | Check nicheFilters state in SurveryInfoForm |
| Survey creation fails | Check POST /surveys request includes creatorId as UUID |
| Invoice shows wrong total | Verify calculation: responses × cost + 800 |
| Token expired error | Clear localStorage, login again, verify token is valid JWT |
| CORS error | Backend at render.com should allow frontend origin |

---

## Next Integration Steps

After payment gateway integration:

1. **Kora Payment**
   - Integrate Kora SDK
   - Pass total amount from invoice modal
   - Handle success/failure callbacks

2. **Survey Management**
   - List created surveys on dashboard
   - Show survey status and response count
   - Allow editing/deleting surveys

3. **Response Tracking**
   - Fetch responses via API
   - Display analytics and charts
   - Export responses to CSV

4. **Wallet Feature**
   - Allow wallet payment option
   - Check balance before payment
   - Handle wallet funding

---

## Support Resources

- **API Documentation:** Check with backend engineer for detailed specs
- **Backend URL:** https://survey-hustler-api.onrender.com
- **Frontend Files:** All in `/app` directory
- **Tests:** Manual testing recommended before production

---

**Status:** ✅ All backend API integration complete and ready for payment gateway implementation.
