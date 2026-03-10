# Frontend Architecture & Integration Diagram

## Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   Layout (Root Provider)                  │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │         AuthProvider (JWT, User Data)             │ │ │
│  │  │  ┌───────────────────────────────────────────────┐ │ │ │
│  │  │  │  NicheFiltersProvider (Schools, Colleges...)  │ │ │ │
│  │  │  │  ┌─────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │  Application Pages & Components        │ │ │ │ │
│  │  │  │  │  - Page.tsx                             │ │ │ │ │
│  │  │  │  │  - LoginOverlay                         │ │ │ │ │
│  │  │  │  │  - SurveryInfoForm                      │ │ │ │ │
│  │  │  │  │  - NicheFilters                         │ │ │ │ │
│  │  │  │  │  - InvoiceModal                         │ │ │ │ │
│  │  │  │  │  - SurveyDashboard                      │ │ │ │ │
│  │  │  │  └─────────────────────────────────────────┘ │ │ │ │
│  │  │  └───────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  API Service       │
                    │  (Centralized)     │
                    │                    │
                    │  Methods:          │
                    │  - login()         │
                    │  - getSchools()    │
                    │  - getColleges...  │
                    │  - createSurvey()  │
                    │  - getGenders()    │
                    │  - etc.            │
                    └─────────┬──────────┘
                              │
                ┌─────────────▼──────────────┐
                │  Backend API               │
                │  https://survey-...        │
                │  onrender.com              │
                └────────────────────────────┘
```

## Data Flow: User Authentication

```
┌──────────────────┐
│  LoginOverlay    │
│  (UI Component)  │
└────────┬─────────┘
         │
         │ handleLogin()
         │
    ┌────▼─────────────────────┐
    │ loginData: {              │
    │   email,                  │
    │   password                │
    │ }                         │
    └────┬─────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ apiService.login(credentials)         │
    │ POST /account/authenticate            │
    └────┬──────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ Backend validates & returns:          │
    │ {                                      │
    │   id, email, firstName, lastName,     │
    │   roles, isVerified,                  │
    │   jwToken, refreshToken               │
    │ }                                      │
    └────┬──────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ AuthContext.login(userData, token, refresh) │
    │ - Store tokens in localStorage              │
    │ - Store userData in state                   │
    │ - Update isAuthenticated = true             │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼──────────────────┐
    │ User Authenticated    │
    │ (Redirect to app)     │
    └───────────────────────┘
```

## Data Flow: Niche Filters

```
┌──────────────────────────┐
│ App Initialization       │
│ (useEffect in Provider)  │
└────────┬─────────────────┘
         │
    ┌────▼────────────────────────────────────────────┐
    │ NicheFiltersContext.loadSchools()               │
    │ GET /schools                                    │
    └────┬────────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────────┐
    │ Parallel: loadEnums()                           │
    │ GET /enums/genders                              │
    │ GET /enums/person-types                         │
    └────┬────────────────────────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ State Updated:            │
    │ - schools: [...] ✓       │
    │ - genders: [...] ✓       │
    │ - personTypes: [...] ✓   │
    └──────────────────────────┘
         │
         │ (User selects school)
         │
    ┌────▼────────────────────────────────────────┐
    │ NicheFilters.handleSchoolChange()            │
    │ loadCollegesBySchool(schoolId)               │
    │ GET /courses/by-school/{schoolId}            │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ State Updated:            │
    │ - colleges: [...] ✓       │
    └──────────────────────────┘
         │
         │ (User selects college)
         │
    ┌────▼────────────────────────────────────────┐
    │ NicheFilters.handleCollegeChange()           │
    │ loadDepartmentsByCollege(collegeId)          │
    │ GET /departments/by-college/{collegeId}      │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ State Updated:            │
    │ - departments: [...] ✓    │
    └──────────────────────────┘
         │
         │ (User selects department)
         │
    ┌────▼──────────────────────────────────────┐
    │ NicheFilters.handleDepartmentChange()      │
    │ loadCoursesByDepartment(departmentId)      │
    │ GET /courses/by-department/{departmentId}  │
    └────┬──────────────────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ State Updated:            │
    │ - courses: [...] ✓        │
    └──────────────────────────┘
```

## Data Flow: Survey Creation

```
┌─────────────────────────────────────────┐
│  SurveryInfoForm                        │
│  (User fills form + selects filters)    │
└────────┬────────────────────────────────┘
         │
         │ State:
         │ - formData: {title, desc, link, sheet, cost, responses}
         │ - nicheFilters: [{schoolId, collegeId, ...}, ...]
         │
    ┌────▼──────────────────────────────────┐
    │ handleSubmit() → shows InvoiceModal   │
    └────┬───────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────────┐
    │ User confirms → createSurvey()               │
    └────┬─────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────────────┐
    │ Bundle Request:                                  │
    │ {                                                │
    │   name: formData.title,                         │
    │   description: formData.desc,                   │
    │   responderLink: formData.link,                 │
    │   sheetLink: formData.sheet,                    │
    │   maxResponseNo: formData.responses,            │
    │   chargePerResponse: formData.cost,             │
    │   begin: new Date().toISOString(),              │
    │   creatorId: user.id,                           │
    │   conditions: nicheFilters.map(filter => ({    │
    │     schoolId: filter.schoolId,                  │
    │     collegeId: filter.collegeId,                │
    │     departmentId: filter.departmentId,          │
    │     courseId: filter.courseId,                  │
    │     gender: filter.gender,                      │
    │     personType: filter.personType               │
    │   }))                                            │
    │ }                                                │
    └────┬──────────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ apiService.createSurvey()      │
    │ POST /surveys                  │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────────────────────┐
    │ Backend Response:                            │
    │ {                                             │
    │   id: "survey-uuid",                         │
    │   name, description,                         │
    │   maxResponseNo,                             │
    │   chargePerResponse,                         │
    │   creatorId,                                 │
    │   begin,                                     │
    │   conditions: [...],                         │
    │   isActive: true,                            │
    │   createdAt: timestamp                       │
    │ }                                             │
    └────┬──────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ setCreatedSurvey(response)         │
    │ setShowPaymentOptions(true)        │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ InvoiceModal Displays:                │
    │ - Survey title                        │
    │ - Number of responses                 │
    │ - Cost per response                   │
    │ - Service fee (₦800)                  │
    │ - Total: (responses × cost) + 800     │
    │ - Survey ID & creation date           │
    └────┬──────────────────────────────────┘
         │
    ┌────▼───────────────────────┐
    │ User clicks "Pay with Kora" │
    │ → Payment Gateway (Next)    │
    └─────────────────────────────┘
```

## Component Tree with Data Flow

```
layout.tsx
├── AuthProvider
│   └── isAuthenticated, user, login(), logout()
│
├── NicheFiltersProvider
│   ├── schools: School[]
│   ├── colleges: College[]
│   ├── departments: Department[]
│   ├── courses: Course[]
│   ├── genders: Gender[]
│   ├── personTypes: PersonType[]
│   ├── selectedFilters: NicheFilter[]
│   └── Actions: load*, update, add, remove, reset
│
└── Page.tsx (SurveyPage)
    ├── useAuth() → {isAuthenticated, user, loading}
    │
    ├── LoginOverlay (if !isAuthenticated)
    │   ├── handleLogin()
    │   └── apiService.login(credentials)
    │
    └── SurveryInfoForm (if isAuthenticated)
        ├── formData state: {title, desc, link, sheet, cost, responses}
        ├── nicheFilters state: NicheFilter[]
        │
        ├── NicheFilters component
        │   ├── useNicheFilters()
        │   ├── Schools dropdown → handleSchoolChange()
        │   ├── Colleges dropdown → handleCollegeChange()
        │   ├── Departments dropdown → handleDepartmentChange()
        │   ├── Courses dropdown
        │   ├── Gender dropdown
        │   ├── Role dropdown
        │   └── Add/Remove filter buttons
        │       └── onFiltersChange() callback
        │
        ├── Form Fields (title, description, links, cost)
        │
        ├── "Proceed to Pay" button
        │   └── handleSubmit() → createSurvey()
        │
        └── InvoiceModal
            ├── survey: CreateSurveyResponse
            ├── Calculation: subtotal + serviceFee = total
            ├── Display: responses, cost, fee, total
            └── Buttons: Back, Proceed to Payment
                └── onProceedToPaymentAction()
```

## API Endpoints Map

```
POST /account/authenticate
    ↑
    └─ LoginOverlay → apiService.login()

GET /schools
    ↑
    └─ NicheFiltersContext → loadSchools()

GET /courses/by-school/{schoolId}
    ↑
    └─ NicheFiltersContext → loadCollegesBySchool()

GET /departments/by-college/{collegeId}
    ↑
    └─ NicheFiltersContext → loadDepartmentsByCollege()

GET /courses/by-department/{departmentId}
    ↑
    └─ NicheFiltersContext → loadCoursesByDepartment()

GET /enums/genders
    ↑
    └─ NicheFiltersContext → loadEnums()

GET /enums/person-types
    ↑
    └─ NicheFiltersContext → loadEnums()

POST /surveys (with conditions)
    ↑
    └─ SurveryInfoForm → apiService.createSurvey()
       Returns: CreateSurveyResponse
       Display: InvoiceModal
```

## State Management Overview

```
┌─────────────────────────────────────────────────────┐
│           Global Contexts (Providers)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  AuthContext                                        │
│  ├── isAuthenticated: boolean                       │
│  ├── user: UserData | null                          │
│  ├── login(userData, token, refresh)                │
│  └── logout()                                       │
│                                                     │
│  NicheFiltersContext                                │
│  ├── schools: School[]                              │
│  ├── colleges: College[]                            │
│  ├── departments: Department[]                      │
│  ├── courses: Course[]                              │
│  ├── genders: Gender[]                              │
│  ├── personTypes: PersonType[]                      │
│  ├── selectedFilters: NicheFilter[]                 │
│  ├── loadingSchools, loadingColleges, etc.          │
│  ├── loadSchools()                                  │
│  ├── loadCollegesBySchool(schoolId)                 │
│  ├── loadDepartmentsByCollege(collegeId)            │
│  ├── loadCoursesByDepartment(departmentId)          │
│  ├── loadEnums()                                    │
│  ├── updateFilter(index, filter)                    │
│  ├── addFilter()                                    │
│  ├── removeFilter(index)                            │
│  └── resetFilters()                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
         │
         │ Used by Components
         │
┌─────────▼─────────────────────────────────────────┐
│         Local Component States                     │
├───────────────────────────────────────────────────┤
│                                                   │
│  SurveryInfoForm                                  │
│  ├── formData: {title, desc, link, sheet, ...}   │
│  ├── nicheFilters: NicheFilter[]                  │
│  ├── createdSurvey: CreateSurveyResponse | null   │
│  ├── showInvoice: boolean                         │
│  ├── showPaymentOptions: boolean                  │
│  ├── isLoading: boolean                           │
│  └── error: string | null                         │
│                                                   │
│  NicheFilters                                     │
│  ├── useFilters: boolean (toggle switch)          │
│  └── Derived from NicheFiltersContext             │
│                                                   │
│  LoginOverlay                                     │
│  ├── mode: 'login' | 'register' | 'forgot'       │
│  ├── loginData: {email, password}                 │
│  ├── isLoading: boolean                           │
│  └── error: string | null                         │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Request/Response Cycle with Error Handling

```
┌────────────────────────────┐
│   Component Action         │
│   (e.g., select school)    │
└────────┬───────────────────┘
         │
    ┌────▼─────────────────────────┐
    │ apiService.method()           │
    │ (e.g., loadCollegesBySchool)  │
    └────┬──────────────────────────┘
         │
    ┌────▼─────────────────┐
    │ fetch() to backend   │
    └────┬──────────────────┘
         │
    ┌────▼────────────────────────────────┐
    │ Response received                   │
    ├────────────────────────────────────┤
    │ OK (200) ────┐                     │
    │              │                     │
    │ Error ───┐   │                     │
    │          │   │                     │
    └──────────┼───┼─────────────────────┘
               │   │
          ┌────▼───▼──────────────────────┐
          │ handleResponse<T>()           │
          ├──────────────────────────────┤
          │ Check response.ok             │
          │ Parse JSON                    │
          │ Handle specific error codes   │
          │ (401, 403, 409, 500, etc.)   │
          └────┬──────────────────────────┘
               │
          ┌────▼──────────────────┐
          │ Return data or throw  │
          └────┬───────────────────┘
               │
          ┌────▼─────────────────┐
          │ catch() block        │
          ├─────────────────────┤
          │ setError(message)    │
          │ console.error()      │
          └─────────────────────┘
               │
          ┌────▼──────────────────────┐
          │ UI Update                  │
          │ (Error message displayed)  │
          └────────────────────────────┘
```

---

## Summary

This architecture ensures:
- **Clear separation of concerns** (API calls, state management, UI)
- **Reusable components** (NicheFilters can be used anywhere)
- **Type safety** (TypeScript interfaces for all data)
- **Error handling** (Consistent error handling across all API calls)
- **Responsive UI** (Loading states, disabled fields when needed)
- **Scalability** (Easy to add new API endpoints or features)

---
