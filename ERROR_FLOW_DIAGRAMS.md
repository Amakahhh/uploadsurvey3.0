# Error Handling System - Visual Flow Diagrams

## High-Level Error Flow

```
User Interaction
      │
      ▼
┌─────────────────────────┐
│  User fills survey form │
│  Clicks "Proceed to Pay"│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  ConfirmationModal appears      │
│  "Notice! Verify details..."    │
│  (Go Back | Proceed to Pay)     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  User clicks "Proceed to Pay"   │
│  handleConfirmationProceed()    │
│  called                         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  createSurvey() called                  │
│  apiService.createSurvey(surveyRequest) │
└────────────┬────────────────────────────┘
             │
             ├─ Success ──────────► Show Invoice Modal
             │
             └─ Error ───┐
                         ▼
                 ┌───────────────────────┐
                 │  Catch Error Block    │
                 │  parseApiError(err)   │
                 │  formatErrorForDisplay│
                 │  setError()           │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │  Error displays to    │
                 │  user with specific   │
                 │  action items         │
                 └───────────────────────┘
```

## Detailed Error Handling Flow

```
┌─────────────────────────────────────────────────────┐
│        API Returns HTTP Error Response               │
│  e.g., 400 with validation errors array              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
     ┌───────────────────────────┐
     │  api.ts: handleResponse() │
     │  ├─ Parse JSON response   │
     │  ├─ Extract error data    │
     │  └─ Create fullErrorData  │
     │     object with all data  │
     └────────────┬──────────────┘
                  │
                  ▼
     ┌──────────────────────────────┐
     │  [API] Logging               │
     │  ├─ Error status code        │
     │  ├─ fullErrorData content    │
     │  ├─ Has errors array: true   │
     │  └─ Errors: [...]            │
     └────────────┬─────────────────┘
                  │
                  ▼
     ┌──────────────────────────────────────┐
     │  Throw Error                         │
     │  error.fullError = fullErrorData     │
     │  (Preserve complete response)        │
     └────────────┬─────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  SurveryInfoForm.tsx: createSurvey() catch block   │
│  Catch error from apiService                        │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  [ERROR] Logging                                    │
│  ├─ Full error object                               │
│  ├─ Error message                                   │
│  ├─ Error.fullError property                        │
│  └─ Error details                                   │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  parseApiError(error)                              │
│  ├─ Extract error.fullError                         │
│  ├─ Find errors array                               │
│  ├─ Map each error to action items                  │
│  └─ Return ParsedError object                       │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  [PARSER] Logging                                   │
│  ├─ Error data received                             │
│  ├─ Has fullError: true                             │
│  ├─ Found errors array: [...]                       │
│  └─ Final parsed result: {...}                      │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  formatErrorForDisplay(parsed)                      │
│  ├─ Format: Title\nMessage\nDetails\nActionItems    │
│  └─ Return formatted string with newlines           │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  setError(userFriendlyMessage)                      │
│  Store formatted error in state                     │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  Error Display JSX                                  │
│  error.split('\n').map((line) => <p>{line}</p>)   │
│  ├─ Error title (bold)                              │
│  ├─ Error message                                   │
│  ├─ Details (each on new line)                      │
│  └─ Action items                                    │
└─────────────────────────────────────────────────────┘
             │
             ▼
     ┌───────────────────┐
     │  User Sees        │
     │  Error message    │
     │  with guidance    │
     │  on how to fix    │
     └───────────────────┘
```

## Error Parser Logic Flow

```
┌─────────────────────────┐
│  parseApiError(error)   │
└────────────┬────────────┘
             │
             ▼
      ┌──────────────────┐
      │ Is error object? │
      └────┬─────────┬──┘
           │         │
        YES│         │NO
           │         └──► ParsedError with
           │              error.toString()
           ▼
    ┌────────────────────┐
    │ Get errorData      │
    │ err.fullError ||   │
    │ err                │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────────┐
    │ [PARSER] Log received  │
    │ Check for fullError    │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Extract title/message  │
    │ from errorData         │
    └────────┬───────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Has errors array?            │
    └────┬───────────────┬──────────┘
         │YES            │NO
         ▼               │
    ┌─────────────────┐  │
    │ Process each    │  │
    │ validation      │  │
    │ error:          │  │
    │                 │  │
    │ 1. Extract desc │  │
    │ 2. Add to       │  │
    │    details[]    │  │
    │ 3. Match to     │  │
    │    action item  │  │
    └────────┬────────┘  │
             │           │
             ▼           │
    ┌──────────────────┐ │
    │ [PARSER] Found   │ │
    │ errors array     │ │
    └────────┬─────────┘ │
             │           │
             ├───────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Check error type:        │
    │ ├─ title === "...."?     │
    │ ├─ status === 400?       │
    │ ├─ status === 401?       │
    │ ├─ status === 403?       │
    │ ├─ status === 404?       │
    │ └─ status === 500?       │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Set title, message,  │
    │ and action items     │
    │ based on type        │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ [PARSER] Final result:   │
    │ {                        │
    │   title: "...",          │
    │   message: "...",        │
    │   details: [...],        │
    │   actionItems: [...]     │
    │ }                        │
    └────────┬─────────────────┘
             │
             ▼
      ┌──────────────────┐
      │ Return           │
      │ ParsedError      │
      │ object           │
      └──────────────────┘
```

## Error Action Item Mapping

```
┌─────────────────────────────────────────────────────┐
│  Error Description from API                          │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌───────┐    ┌───────┐   ┌──────────────┐
    │ URL?  │    │Access?│   │ Required ID? │
    └───┬───┘    └───┬───┘   └────┬─────────┘
        │            │            │
        ▼            ▼            ▼
    ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐
    │ Responder    │  │ Share your    │  │ If you want       │
    │ link must    │  │ Google Form   │  │ targeting,        │
    │ be a valid   │  │ and Sheet     │  │ select a school   │
    │ URL          │  │ with the      │  │ from the niche    │
    │              │  │ Survey        │  │ filters           │
    │ Action:      │  │ Hustler       │  │                   │
    │ Make sure    │  │ service       │  │ Action: Select    │
    │ your Google  │  │ account       │  │ school from       │
    │ Form link    │  │               │  │ filters           │
    │ is correct   │  │ Actions:      │  │                   │
    │ and complete │  │ 1. Open Form  │  └───────────────────┘
    └──────────────┘  │ 2. Share      │
                      │ 3. Add email  │
                      │ 4. Repeat for │
                      │    Sheet      │
                      │ 5. Try again  │
                      └───────────────┘
```

## Console Logging Hierarchy

```
Error Occurs
    │
    ├─► [API] handleResponse()
    │   ├─ Receives HTTP error
    │   ├─ Parses JSON
    │   ├─ Creates fullErrorData
    │   ├─ Throws Error with fullError
    │   └─ Logs [API] details
    │
    ├─► Error caught by form
    │   ├─ [ERROR] Logs raw error
    │   ├─ [ERROR] Logs fullError property
    │   └─ Calls parseApiError(err)
    │
    ├─► [PARSER] parseApiError()
    │   ├─ Receives error object
    │   ├─ Extracts fullError
    │   ├─ Finds errors array
    │   ├─ Maps to action items
    │   ├─ Logs [PARSER] details
    │   └─ Returns ParsedError
    │
    ├─► formatErrorForDisplay()
    │   ├─ Formats ParsedError
    │   └─ [ERROR] Logs formatted message
    │
    └─► Error displays
        └─ [ERROR] Shows in UI
```

## Example: Invalid URL Error

### User Action
```
1. Fill survey form
2. Enter "invalid-url" in Survey Link field
3. Click "Proceed to Pay"
4. Click "Proceed to Pay" on confirmation modal
```

### API Response
```json
HTTP 400
{
  "title": "Validation Error",
  "errors": [
    {
      "description": "Responder link must be a valid URL"
    }
  ]
}
```

### Console Output
```
[API] Error response received: {
  status: 400,
  fullErrorData: {
    status: 400,
    title: "Validation Error",
    errors: [{ description: "Responder link must be a valid URL" }]
  },
  hasErrors: true,
  errorsArray: [{ description: "Responder link must be a valid URL" }]
}

[API] Throwing error with fullError: {
  message: "400: Responder link must be a valid URL",
  fullError: {
    status: 400,
    title: "Validation Error",
    errors: [{ description: "Responder link must be a valid URL" }]
  }
}

[ERROR] Full error object: Error: 400: Responder link must be a valid URL

[ERROR] Error fullError: {
  status: 400,
  title: "Validation Error",
  errors: [{ description: "Responder link must be a valid URL" }]
}

[PARSER] Error data received: {
  errorData: {
    status: 400,
    title: "Validation Error",
    errors: [{ description: "Responder link must be a valid URL" }]
  },
  hasFullError: true
}

[PARSER] Found errors array: [{ description: "Responder link must be a valid URL" }]

[PARSER] Final parsed result: {
  title: "Invalid Survey Data",
  message: "One or more fields in your survey are invalid. Please review your information.",
  details: ["Responder link must be a valid URL"],
  actionItems: ["Make sure your Google Form link is correct and complete"]
}

[ERROR] User friendly message: "Invalid Survey Data
One or more fields in your survey are invalid. Please review your information.

Responder link must be a valid URL

What to do:
Make sure your Google Form link is correct and complete"
```

### User Sees
```
Error
Invalid Survey Data
One or more fields in your survey are invalid. Please review your information.

Responder link must be a valid URL

What to do:
Make sure your Google Form link is correct and complete
```

---

## Summary

The error handling system uses a three-layer approach:
1. **API Layer** - Preserves complete error response
2. **Parser Layer** - Extracts and structures error information
3. **Display Layer** - Shows formatted message to user

Each layer includes logging for complete visibility into the error handling process.

