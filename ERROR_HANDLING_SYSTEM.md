# Error Handling System - Complete Overview

## Problem Statement
User was seeing generic error message "Invalid request data. Please check your input and try again." without knowing what specifically was wrong.

## Solution Implemented

### 1. API Error Response Handling (`app/services/api.ts`)
**Location:** `handleResponse()` method

**What it does:**
- Catches HTTP error responses from the backend
- Parses the JSON error response
- Extracts the full error data (including validation errors array)
- Creates an Error object with a `fullError` property containing the complete API response
- Logs the error details to console for debugging

**Key code:**
```typescript
const fullErrorData: any = { status: response.status };
const errorData = await response.json();
fullErrorData = { ...fullErrorData, ...errorData };
const error = new Error(errorMessage);
(error as any).fullError = fullErrorData;
throw error;
```

### 2. Error Parser (`app/utils/apiErrorParser.ts`)
**Purpose:** Parse API error responses and generate user-friendly, actionable messages

**Main functions:**

#### `parseApiError(error: unknown): ParsedError`
- Checks for `error.fullError` property (set by API service)
- Extracts validation errors from `fullError.errors` array
- Identifies specific error types (e.g., "Survey.AccessDenied", "Person.NotFound")
- Maps error descriptions to specific action items
- Logs parsing steps to console

**Error type handling:**
| Error Type | Action Items |
|-----------|--------------|
| "Responder link must be a valid URL" | Make sure your Google Form link is correct and complete |
| Access denied / form / sheet | Share your Google Form and Sheet with the Survey Hustler service account |
| "School ID is required" | If you want targeting, select a school from the niche filters |
| "Person type" error | Select a valid person type if you want targeting filters |
| "Gender" error | Select a gender if you want gender-based targeting |

#### `formatErrorForDisplay(parsed: ParsedError): string`
- Formats the parsed error as multi-line string
- Format: `Title\nMessage\n\nDetails\n\nWhat to do:\nActionItems`
- Designed to be split on `\n` and displayed as separate paragraphs

### 3. Survey Form Integration (`app/SurveryInfoForm.tsx`)
**Location:** `createSurvey()` function - catch block

**What it does:**
```typescript
try {
  const survey = await apiService.createSurvey(surveyRequest);
  // ... handle success
} catch (err) {
  const parsedError = parseApiError(err);
  const userFriendlyMessage = formatErrorForDisplay(parsedError);
  setError(userFriendlyMessage);
}
```

**Error display:**
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 ...">
    <p className="font-semibold">Error</p>
    <div className="text-sm mt-2 space-y-2 whitespace-pre-wrap">
      {error.split('\n').map((line, idx) => (
        <p key={idx}>{line}</p>
      ))}
    </div>
  </div>
)}
```

## Data Flow Example

### Scenario: User provides invalid Google Form link

1. **API Response:**
```json
{
  "status": 400,
  "title": "Validation Error",
  "errors": [
    {
      "description": "Responder link must be a valid URL"
    }
  ]
}
```

2. **API Service (`api.ts`):**
```
[API] Error response received: {
  status: 400,
  fullErrorData: {
    status: 400,
    title: "Validation Error",
    errors: [{ description: "Responder link must be a valid URL" }]
  },
  hasErrors: true
}
```

3. **Error Caught in SurveryInfoForm:**
```
[ERROR] Full error object: Error: 400: Responder link must be a valid URL
[ERROR] Error fullError: { status: 400, title: "Validation Error", errors: [...] }
```

4. **Error Parser:**
```
[PARSER] Error data received: { errorData: {...}, hasFullError: true }
[PARSER] Found errors array: [{ description: "Responder link must be a valid URL" }]
[PARSER] Final parsed result: {
  title: 'Invalid Survey Data',
  message: 'One or more fields in your survey are invalid.',
  details: ['Responder link must be a valid URL'],
  actionItems: ['Make sure your Google Form link is correct and complete']
}
```

5. **User Sees:**
```
Error
Invalid Survey Data
One or more fields in your survey are invalid.

Responder link must be a valid URL

What to do:
Make sure your Google Form link is correct and complete
```

## Debugging Additions

### Console Logging
Three levels of logging have been added:

1. **[API]** - API service layer
   - Raw error response
   - fullErrorData content
   - What gets thrown

2. **[PARSER]** - Error parser layer
   - Error data received
   - Whether fullError was found
   - Errors array content
   - Final parsed result

3. **[ERROR]** - Survey form layer
   - Full error object
   - Error message
   - fullError property
   - Parsed error
   - User-friendly message

### How to Debug
1. Open browser console (F12)
2. Filter for `[API]`, `[PARSER]`, or `[ERROR]`
3. Try to create a survey with invalid data
4. Check the console logs to trace where the error is being lost

## Testing Checklist

- [ ] Test with invalid Google Form link
- [ ] Test with missing niche filters when form requires them
- [ ] Test with valid form but access denied error
- [ ] Verify specific action items appear for each error type
- [ ] Verify error message is multi-line and formatted correctly
- [ ] Check console logs show complete error chain

## Files Modified

1. `app/services/api.ts` - Added fullError property to Error object + logging
2. `app/utils/apiErrorParser.ts` - Created comprehensive error parser with action items + logging
3. `app/SurveryInfoForm.tsx` - Integrated error parser + detailed logging

## Files Created

1. `ERROR_DEBUGGING_GUIDE.md` - Comprehensive debugging guide for errors

## Known Limitations

1. If API response format is different than expected, the parser may not extract errors correctly
2. Action items are matched based on text in error description - if backend changes wording, matches may fail
3. Only handles specific error types defined in the parser - new error types need to be added manually

## Future Improvements

1. Create dynamic error mapping instead of hardcoded strings
2. Add support for more error types
3. Implement error analytics to track common issues
4. Add internationalization (i18n) for error messages
5. Create admin panel to update error mappings without code changes
