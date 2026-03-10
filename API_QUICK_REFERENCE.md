# API Integration Quick Reference
**Last Updated:** December 17, 2025

## 8 Integrated Endpoints

### 1️⃣ Login
```
POST /account/authenticate
Body: { "email": "string", "password": "string" }
Returns: { jwToken, refreshToken, user data }
Location: app/services/api.ts line 365
Usage: app/loginOverlay.tsx line 35
```

### 2️⃣ Schools List
```
GET /schools?page=1&pageSize=100
Query: searchTerm?, sortColumn?, sortOrder?, page*, pageSize*
Returns: { items: School[], page, pageSize, totalCount }
Location: app/services/api.ts line 476
Usage: app/contexts/NicheFiltersContext.tsx line 91
Trigger: Page load
```

### 3️⃣ Colleges by School ✅ FIXED
```
GET /courses/by-school/{schoolId}
Path: schoolId (UUID)
Returns: College[]
Location: app/services/api.ts line 525
Usage: app/contexts/NicheFiltersContext.tsx line 104
Trigger: User selects school
```

### 4️⃣ Departments by College ✅ ENHANCED
```
GET /departments/by-college/{collegeId}?page=1&pageSize=100
Query: searchTerm?, sortColumn?, sortOrder?, page*, pageSize*
Returns: { items: Department[], page, pageSize, totalCount }
Location: app/services/api.ts line 600
Usage: app/contexts/NicheFiltersContext.tsx line 117
Trigger: User selects college
```

### 5️⃣ Courses by Department
```
GET /courses/by-department/{departmentId}
Path: departmentId (UUID)
Returns: Course[]
Location: app/services/api.ts line 688
Trigger: User selects department
```

### 6️⃣ Gender Options
```
GET /enums/genders
Returns: [{ id: number, name: string }]
Values: Male, Female, All
Location: app/services/api.ts line 945
Trigger: Page load
```

### 7️⃣ Person Types
```
GET /enums/person-types
Returns: [{ id: number, name: string }]
Values: Undergrad, Postgrad, Lecturer
Location: app/services/api.ts line 957
Trigger: Page load
```

### 8️⃣ Create Survey ✅ ENHANCED
```
POST /surveys
Body: {
  name: string (unique),
  description: string,
  responderLink: string,
  sheetLink: string,
  maxResponseNo: number,
  chargePerResponse: number,
  begin: string (ISO date),
  creatorId: string (UUID),
  conditions: [{
    schoolId?, collegeId?, departmentId?, courseId?,
    personType?, gender?, levels?, program?
  }]
}
Returns: {
  id, surveyId, name, description, responderLink, sheetLink,
  maxResponseNo, chargePerResponse, begin, conditions, isActive,
  createdAt, checkoutLink,
  ✅ checkoutUrl, totalAmount, respondentsCharge,
  ✅ platformCommission, conditionsCharge, transactionReference
}
Location: app/services/api.ts line 734
Usage: app/SurveryInfoForm.tsx line 146
Display: app/components/InvoiceModal.tsx
```

---

## Key Files

| File | Purpose |
|------|---------|
| app/services/api.ts | All API endpoints + request/response handling |
| app/contexts/AuthContext.tsx | Login state + JWT token management |
| app/contexts/NicheFiltersContext.tsx | Filter data (schools, colleges, etc.) |
| app/loginOverlay.tsx | Login form component |
| app/SurveryInfoForm.tsx | Survey creation form |
| app/components/InvoiceModal.tsx | Invoice display with payment breakdown |

---

## Test Credentials
```
Email: testuser20240925191200@example.com
Pass:  TestPass123
```

---

## API Base URL
```
https://survey-hustler-api.onrender.com
```

---

## Recent Updates

✅ Fixed: Colleges endpoint now calls `/courses/by-school/{schoolId}`  
✅ Enhanced: Departments endpoint now includes pagination parameters  
✅ Enhanced: Survey response now includes payment details (checkoutUrl, totalAmount, etc.)  
✅ Enhanced: Invoice modal now displays backend payment breakdown

---

## Test Flow

1. **Login** → POST /account/authenticate
2. **Page Load** → GET /schools + GET /enums/genders + GET /enums/person-types
3. **Select School** → GET /courses/by-school/{schoolId}
4. **Select College** → GET /departments/by-college/{collegeId}?page=1&pageSize=100
5. **Select Department** → GET /courses/by-department/{departmentId}
6. **Fill Form** → POST /surveys with all data
7. **Show Invoice** → Display payment breakdown from response
8. **Payment** → Use checkoutUrl from response

---

## Error Handling

| Error | Solution |
|-------|----------|
| 401 Unauthorized | Login again |
| 409 Conflict | Clear localStorage, retry |
| 400 Bad Request | Check form validation |
| 403 Forbidden | Verify user permissions |
| 500 Server Error | Retry or contact support |

---

## Status
✅ All 8 endpoints integrated and verified  
✅ 100% specification compliant  
✅ Ready for testing and payment gateway integration

