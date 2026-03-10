# API Integration Documentation

## Overview
This frontend application has been successfully integrated with the SurveyHustler backend API deployed at `https://survey-hustler-api.onrender.com`.

## Features Implemented

### 1. Authentication System
- **Login**: Users can log in with email and password
- **Registration**: New users can create accounts with email, password, and name
- **Forgot Password**: Users can request password reset emails
- **Token Management**: Automatic token refresh and secure storage

### 2. Dynamic Data Loading
- **Schools**: Load all available schools from the API
- **Colleges**: Load colleges filtered by school
- **Departments**: Load departments filtered by college
- **Courses**: Load courses filtered by department
- **Hierarchical Selection**: Users can navigate through school → college → department → course

### 3. Survey Management
- **Form Verification**: Verify Google Forms and Sheets before submission
- **Survey Creation**: Create surveys with all required parameters
- **Target Audience**: Select specific schools, colleges, departments, or courses
- **Cost Calculation**: Calculate total cost including service fees

### 4. Enhanced User Experience
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Comprehensive error messages and retry mechanisms
- **Health Monitoring**: Real-time API status indicator
- **Form Validation**: Client-side validation before API calls

## API Endpoints Used

### Account Management
- `POST /account/authenticate` - User login
- `POST /account/register` - User registration
- `POST /account/forgot-password` - Password reset request
- `POST /account/refresh-token` - Token refresh
- `GET /account/confirm-email` - Email confirmation

### Data Management
- `GET /schools` - Get all schools
- `GET /colleges/by-school/{schoolId}` - Get colleges by school
- `GET /departments/by-college/{collegeId}` - Get departments by college
- `GET /courses/by-department/{departmentId}` - Get courses by department

### Survey Management
- `POST /surveys/check-form-available` - Verify form accessibility
- `POST /surveys` - Create new survey
- `GET /surveys/{id}` - Get survey details
- `PUT /surveys/{surveyId}` - Update survey
- `DELETE /surveys/{surveyId}` - Delete survey

### Health Check
- `GET /health` - API health status

## Key Components

### 1. ApiService (`app/services/api.ts`)
- Centralized API communication
- Type-safe interfaces for all requests/responses
- Automatic error handling and response parsing
- Token management and authentication headers

### 2. Enhanced Login Overlay (`app/loginOverlay.tsx`)
- Multi-mode interface (Login/Register/Forgot Password)
- Form validation and error handling
- Secure password handling with visibility toggle

### 3. Dynamic College Filter (`app/collegeoptions.tsx`)
- Real-time data loading from API
- Hierarchical filtering (School → College → Department → Course)
- Search functionality and bulk selection
- Loading states and error handling

### 4. Survey Form (`app/SurveryInfoForm.tsx`)
- Form verification before submission
- Integration with survey creation API
- Cost calculation and validation
- Payment integration (Kora)

### 5. Health Check Component (`app/components/HealthCheck.tsx`)
- Real-time API status monitoring
- Automatic health checks every 30 seconds
- Visual status indicator

## Configuration

### Environment Variables
The API base URL is configured in `app/services/api.ts`:
```typescript
const API_BASE_URL = 'https://survey-hustler-api.onrender.com';
```

### Authentication
- JWT tokens are stored in localStorage
- Automatic token refresh on expiration
- Secure logout with token cleanup

## Error Handling

### Network Errors
- Automatic retry mechanisms
- User-friendly error messages
- Fallback UI states

### Validation Errors
- Client-side form validation
- Server-side error display
- Field-specific error highlighting

### Authentication Errors
- Automatic logout on token expiration
- Clear error messages for invalid credentials
- Password reset flow integration

## Security Features

### Token Management
- Secure token storage in localStorage
- Automatic token refresh
- Token expiration handling

### Input Validation
- Client-side validation before API calls
- Server-side validation error handling
- XSS protection through proper data sanitization

### API Security
- Bearer token authentication
- HTTPS-only communication
- CORS handling

## Testing

### Health Check
The application includes a health check component that:
- Monitors API availability in real-time
- Displays connection status
- Provides manual refresh capability
- Shows last check timestamp

### Manual Testing
1. **Authentication Flow**:
   - Test registration with valid/invalid data
   - Test login with correct/incorrect credentials
   - Test password reset functionality

2. **Data Loading**:
   - Verify schools, colleges, departments, and courses load correctly
   - Test filtering and search functionality
   - Check error handling for failed API calls

3. **Survey Creation**:
   - Test form verification
   - Test survey creation with valid/invalid data
   - Verify cost calculations

## Future Enhancements

### Potential Improvements
1. **Offline Support**: Cache API responses for offline functionality
2. **Real-time Updates**: WebSocket integration for live updates
3. **Advanced Filtering**: More sophisticated search and filter options
4. **Analytics Dashboard**: Survey performance tracking
5. **Bulk Operations**: Support for multiple survey operations

### Performance Optimizations
1. **Pagination**: Implement pagination for large datasets
2. **Caching**: Add intelligent caching for frequently accessed data
3. **Lazy Loading**: Implement lazy loading for better performance
4. **Debouncing**: Add debouncing to search inputs

## Troubleshooting

### Common Issues
1. **API Connection**: Check the health indicator in bottom-right corner
2. **Authentication**: Verify tokens are not expired
3. **Form Validation**: Ensure all required fields are filled
4. **Network Issues**: Check internet connection and API availability

### Debug Information
- Check browser console for detailed error messages
- Monitor network tab for API call status
- Verify API responses in browser dev tools

## Support

For technical support or issues:
1. Check the health indicator for API status
2. Review browser console for error messages
3. Verify network connectivity
4. Check API documentation at the Swagger endpoint

---

*Last updated: [Current Date]*
*API Version: Latest*
*Frontend Version: Next.js 15.1.8*


