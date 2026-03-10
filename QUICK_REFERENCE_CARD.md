# Quick Reference Card - Error Handling System

## What Changed

**Before:** Generic error message → User confused
```
Error
Invalid request data. Please check your input and try again.
```

**After:** Specific error message → User knows what to fix
```
Error
Invalid Survey Data
One or more fields in your survey are invalid.

Responder link must be a valid URL

What to do:
Make sure your Google Form link is correct and complete
```

---

## How It Works

```
User Creates Survey
        ↓
Validation Error Occurs
        ↓
API Returns Detailed Error
        ↓
Error Parser Extracts Details
        ↓
Action Items Generated
        ↓
User Sees Specific Guidance
```

---

## Error Message Structure

Every error now has 4 parts:

1. **Title** - What type of error
   - "Invalid Survey Data"
   - "Access Denied"
   - "Server Error"

2. **Message** - General explanation
   - "One or more fields in your survey are invalid."

3. **Details** - Specific problems
   - "Responder link must be a valid URL"
   - "School ID is required"

4. **Action Items** - How to fix
   - "Make sure your Google Form link is correct"
   - "Share your Google Form and Sheet with..."

---

## Common Errors & Solutions

### Invalid Google Form URL
**Error:** Responder link must be a valid URL
**Fix:** Make sure your Google Form link is correct and complete

### Access Denied
**Error:** Survey Hustler does not have access to your Google Form or Sheet
**Fix:** 
1. Open your Google Form
2. Click Share button
3. Add the Survey Hustler service account as Editor
4. Repeat for your Google Sheet
5. Try again

### Missing School
**Error:** School ID is required for each condition
**Fix:** If you want targeting, select a school from the niche filters

### Missing Person Type
**Error:** Person type required
**Fix:** Select a valid person type if you want targeting filters

### Missing Gender
**Error:** Gender required
**Fix:** Select a gender if you want gender-based targeting

---

## Debugging

### Open Console
1. Press **F12** in browser
2. Go to **Console** tab
3. Look for logs starting with `[API]`, `[PARSER]`, `[ERROR]`

### Example Good Output
```
[API] Error response received: {
  status: 400,
  hasErrors: true,
  errorsArray: [...]
}

[PARSER] Found errors array: [...]

[PARSER] Final parsed result: {
  title: 'Invalid Survey Data',
  details: ['Responder link must be a valid URL'],
  actionItems: ['Make sure your Google Form link is correct']
}
```

### If You See These Problems

| Log | Problem | Solution |
|-----|---------|----------|
| `[PARSER] No errors array found` | Error details not extracted | Check API response format |
| `[ERROR] Error fullError: undefined` | fullError property missing | Check API service logging |
| Empty error message shown | Parser didn't find error | Check console logs for details |

---

## Files That Changed

### Code (2 files)
- `app/services/api.ts` - Added error preservation
- `app/SurveryInfoForm.tsx` - Added error parser integration

### New Utility (1 file)
- `app/utils/apiErrorParser.ts` - Error parsing logic

### Documentation (7 files)
- `ERROR_MESSAGE_TESTING_GUIDE.md`
- `ERROR_DEBUGGING_GUIDE.md`
- `ERROR_HANDLING_SYSTEM.md`
- `ERROR_HANDLING_CHANGES.md`
- `SESSION_SUMMARY_ERROR_HANDLING.md`
- `ERROR_FLOW_DIAGRAMS.md`
- `IMPLEMENTATION_CHECKLIST.md`
- `COMPLETE_IMPLEMENTATION_SUMMARY.md`

---

## What to Test

### Test 1: Invalid URL
1. Fill form with invalid Google Form link (e.g., "not a url")
2. Click "Proceed to Pay"
3. Expect: Specific error about URL

### Test 2: Missing Fields
1. Leave a required field empty
2. Click "Proceed to Pay"
3. Expect: Error for that specific field

### Test 3: Access Denied
1. Try creating survey if documents aren't shared
2. Expect: Error about access with sharing instructions

### Test 4: Success
1. Fill form correctly
2. Click "Proceed to Pay"
3. Expect: No error, invoice modal appears

---

## Key Features

✅ **Specific** - Know exactly what went wrong
✅ **Actionable** - Know exactly how to fix it
✅ **Professional** - Better styling and formatting
✅ **Debuggable** - Complete console logging
✅ **Well-Documented** - Guides for testing and debugging

---

## Performance

- **Impact:** Minimal (error handling only, not happy path)
- **Logging:** Only in error scenarios
- **Overhead:** Negligible

---

## Backward Compatibility

- ✅ All existing code continues to work
- ✅ No breaking changes
- ✅ Transparent to UI components

---

## When to Contact Support

If you see an error and:
- [ ] The action item doesn't help fix the issue
- [ ] The error message seems incorrect
- [ ] Console shows inconsistent data
- [ ] Want to add handling for new error type

Share:
- Screenshot of error
- Console logs ([API], [PARSER], [ERROR] lines)
- What you were doing
- Data you entered (sanitized)

---

## Support Resources

**For Testing:** `ERROR_MESSAGE_TESTING_GUIDE.md`
**For Debugging:** `ERROR_DEBUGGING_GUIDE.md`
**For Technical Details:** `ERROR_HANDLING_SYSTEM.md`

---

**Implementation Status:** ✅ COMPLETE

Ready for testing and deployment.

