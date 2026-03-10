# Error Message Testing Guide

## Quick Start

The error message system has been completely overhauled to provide specific, actionable guidance instead of generic messages.

### What You Should See Now

When an error occurs, instead of:
```
Invalid request data. Please check your input and try again.
```

You'll now see something like:
```
Invalid Survey Data
One or more fields in your survey are invalid. Please review your information.

Responder link must be a valid URL

What to do:
Make sure your Google Form link is correct and complete
```

## How to Test

### Test 1: Invalid Google Form Link
1. Fill in the survey form
2. In the "Survey Link" field, enter an invalid URL (e.g., "not a url")
3. Fill in the rest of the form normally
4. Click "Proceed to Pay"
5. Click "Proceed to Pay" on the confirmation modal

**Expected Result:**
- Error mentions "Responder link must be a valid URL"
- Action item suggests: "Make sure your Google Form link is correct and complete"

### Test 2: Missing Required Information
1. Fill in the survey form but leave a required field empty
2. Click "Proceed to Pay"

**Expected Result:**
- Validation errors for each missing field
- Specific action items for each error

### Test 3: Access Denied
If you don't have proper sharing settings on your Google Form/Sheet:

**Expected Result:**
- Error title: "Access Denied"
- Message: "Survey Hustler does not have access to your Google Form or Sheet"
- Action items: Step-by-step instructions to share your documents

### Test 4: Account Issues
If there's an issue with your account:

**Expected Result:**
- Specific error about the account issue
- Action items to resolve it

## How Error Messages Are Structured

Each error message has THREE parts:

1. **Title** - What type of error this is
   - "Invalid Survey Data", "Access Denied", "Server Error", etc.

2. **Message** - General explanation of what went wrong
   - "One or more fields in your survey are invalid..."

3. **Details + Action Items** - Specific problems and how to fix them
   - "Responder link must be a valid URL"
   - "What to do: Make sure your Google Form link is correct and complete"

## Console Logging for Debugging

If something isn't working as expected, open the browser console (F12) and:

1. Look for logs starting with `[API]`, `[PARSER]`, or `[ERROR]`
2. Check if the error data is being extracted properly
3. Verify the action items are appearing

### Example Good Console Output:
```
[API] Error response received: {
  status: 400,
  hasErrors: true,
  errorsArray: [{ description: "Responder link must be a valid URL" }]
}

[PARSER] Found errors array: [...]

[PARSER] Final parsed result: {
  title: 'Invalid Survey Data',
  details: ['Responder link must be a valid URL'],
  actionItems: ['Make sure your Google Form link is correct and complete']
}
```

## Troubleshooting

### I'm still seeing generic error messages

1. Open browser console (F12)
2. Look for `[API]` logs - are errors being detected?
3. Look for `[PARSER]` logs - is the error being parsed?
4. If you see `[PARSER] No errors array found` - the API format might be different than expected

### Error message is blank or truncated

1. Check if `error.split('\n')` is working correctly
2. Verify the formatted message includes newlines at the right places
3. Check console for `[ERROR] User friendly message` to see what's being sent

### Action items aren't showing

1. The error description might not match the expected text
2. Check console `[PARSER] Found errors array` to see the actual description
3. Let us know the exact text and we can add a matching rule

## Known Issues and Fixes

### Issue: Error shows status code prefix (e.g., "400: Responder link...")
**Fix:** This is actually helpful - it shows the HTTP status code. Remove the code in api.ts if you don't want it.

### Issue: Some errors show the same generic action item
**Fix:** We might need to add more specific matching rules for certain error types.

### Issue: Error message is too long
**Fix:** Action items are intentionally detailed. They can be simplified if needed.

## API Error Response Formats Expected

The system handles multiple error response formats:

### Format 1: Validation Errors (Most Common)
```json
{
  "status": 400,
  "title": "Validation Error",
  "errors": [
    { "description": "Responder link must be a valid URL" },
    { "description": "School ID is required for each condition" }
  ]
}
```

### Format 2: Single Error
```json
{
  "status": 403,
  "title": "Survey.AccessDenied",
  "detail": "Survey Hustler does not have access to your Google Form"
}
```

### Format 3: Generic Message
```json
{
  "status": 500,
  "message": "An unexpected error occurred"
}
```

## Recent Changes

1. **Added fullError property** - API errors now preserve the complete response data
2. **Created error parser** - Extracts validation errors and generates action items
3. **Added comprehensive logging** - Three levels of console logging for debugging
4. **Improved error display** - Multi-line formatting for better readability
5. **Updated ConfirmationModal** - Shows before survey is created to prevent issues

## When to Contact Support

If you're seeing errors and:

1. The action items don't help fix the issue
2. The error message seems incorrect
3. The console shows inconsistent error data
4. You want to add handling for a new error type

Please share:
- Screenshot of the error message
- Console logs (copy the [API], [PARSER], and [ERROR] lines)
- What you were trying to do when the error occurred
- The data you entered (sanitized)

