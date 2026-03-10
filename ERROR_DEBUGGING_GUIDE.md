# Error Message Debugging Guide

## What Changed

We've added comprehensive logging to help debug error messages. The error handling system now has three layers of logging:

1. **API Service Layer** (`app/services/api.ts`):
   - Logs the raw API error response
   - Logs what gets stored in `fullError` property
   - Logs what gets thrown to the error handler

2. **Error Parser Layer** (`app/utils/apiErrorParser.ts`):
   - Logs when it receives an error
   - Logs if it finds validation errors
   - Logs the final parsed error result

3. **Survey Form Layer** (`app/SurveryInfoForm.tsx`):
   - Logs the error object
   - Logs the fullError property
   - Logs the parsed error
   - Logs the user-friendly formatted message

## How to Debug

### Step 1: Open Browser Console
1. Open the application in your browser
2. Press `F12` or right-click → "Inspect" → "Console" tab
3. Filter for logs starting with `[API]`, `[PARSER]`, or `[ERROR]`

### Step 2: Try to Create a Survey
Fill in the form with test data and click "Proceed to Pay"

### Step 3: Check Console Logs
Look for:
```
[API] Error response received: { status: 400, fullErrorData: {...}, hasErrors: true, errorsArray: [...] }
[API] Throwing error with fullError: {...}
[ERROR] Full error object: Error...
[PARSER] Error data received: { errorData: {...}, hasFullError: true }
[PARSER] Found errors array: [...]
[PARSER] Final parsed result: {...}
[ERROR] User friendly message: ...
```

### Step 4: Identify the Issue

**If `hasErrors: false` in [API] logs:**
- The API is not returning an `errors` array
- Check if the API response has a different structure
- Update `apiErrorParser.ts` to handle the actual API response format

**If `[PARSER] No errors array found` appears:**
- The fullError property is not being populated correctly
- Check if fullErrorData is being set properly in api.ts

**If `[PARSER] Found errors array` appears with empty details:**
- The validation errors don't have `description` property
- Update the parser to look for different property names

**If the user-friendly message shows generic text:**
- The error action items aren't being matched
- Update the action item matching logic in `parseApiError`

## Example Console Output

### Good Output (Specific Errors):
```
[API] Error response received: { 
  status: 400, 
  fullErrorData: { 
    status: 400, 
    errors: [
      { description: "Responder link must be a valid URL" },
      { description: "School ID is required for each condition" }
    ]
  }
}
[PARSER] Found errors array: [...]
[PARSER] Final parsed result: {
  title: 'Invalid Survey Data',
  message: 'One or more fields in your survey are invalid. Please review your information.',
  details: ['Responder link must be a valid URL', 'School ID is required for each condition'],
  actionItems: [
    'Make sure your Google Form link is correct and complete',
    'If you want targeting, select a school from the niche filters'
  ]
}
```

### Bad Output (Generic Errors):
```
[API] Error response received: { 
  status: 400, 
  fullErrorData: { status: 400 },
  hasErrors: false
}
[PARSER] No errors array found
[PARSER] Final parsed result: {
  title: 'Error',
  message: 'An error occurred. Please try again.',
  details: [],
  actionItems: []
}
```

## What to Check in API Response

The API error response should look like one of these:

### Format 1: Errors Array (Expected)
```json
{
  "title": "Validation Error",
  "errors": [
    { "description": "Field name must be valid" }
  ]
}
```

### Format 2: Detail Property
```json
{
  "title": "Survey.AccessDenied",
  "detail": "Survey Hustler does not have access to your Google Form"
}
```

### Format 3: Message Property
```json
{
  "message": "Invalid request"
}
```

If the API returns a different format, we need to update the error parser to handle it.

## Common Fixes

### If errors are being lost:
Check that `fullErrorData = { ...fullErrorData, ...errorData }` is spreading all properties correctly.

### If details aren't showing:
Verify the error array items have a `description` property. If they use `message` instead, update line ~47 in apiErrorParser.ts:
```typescript
const description = validationError.description || validationError.message || '';
```

### If action items aren't showing:
Check that the condition text matches the error descriptions. Use `console.log()` to see the actual description text and update the matching logic.

