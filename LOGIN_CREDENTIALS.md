# Login Credentials for Testing

Since the system only supports login (no registration), use these test credentials that are pre-loaded in the database:

## Test Credentials

### Primary Test Account
- **Email:** `testuser20240925191200@example.com`
- **Password:** `TestPass123`

### Secondary Test Account
- **Email:** `test@example.com`
- **Password:** `password123`

## How to Login

1. Start the app: `npm run dev`
2. Go to http://localhost:3000
3. You will see the login modal
4. Enter one of the email/password combinations above
5. Click "Log In"
6. If successful, you'll be logged in and see the survey creation form

## If Login Fails

If you get a 401 error (Invalid credentials), it means:
- The credentials might have been deleted from the backend
- Ask your backend engineer for valid test credentials

If you get a 409 error (Conflict), it means:
- The backend thinks you're already logged in
- Clear browser storage: F12 → Application → LocalStorage → Delete all
- Then try logging in again

## What Happens After Login

After successful login, you'll see:
1. The survey creation form
2. Niche filters dropdown (Institution, College, Department, Course, Gender, Role)
3. Form fields for survey details
4. The ability to create a survey and see the invoice

## Account Information

These test accounts should have:
- First Name: Test
- Last Name: User
- Email: (as shown above)
- All necessary permissions to create surveys

If you need to test with different accounts or need more test data, contact your backend engineer.
