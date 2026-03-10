# Comprehensive Backend API Testing Script
# This helps identify what the backend expects

$API_BASE_URL = "https://survey-hustler-api.onrender.com"
$ErrorActionPreference = "Continue"

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "BACKEND API DEBUGGING SCRIPT" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

# Helper function to make API calls
function Test-Endpoint {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$Description
    )
    
    Write-Host "`n[TEST] $Description" -ForegroundColor Yellow
    Write-Host "Endpoint: $Method $Endpoint" -ForegroundColor Gray
    
    $params = @{
        Uri = "$API_BASE_URL$Endpoint"
        Method = $Method
        Headers = @{"Content-Type" = "application/json"}
        ErrorAction = "Continue"
    }
    
    if ($Body) {
        $params["Body"] = $Body | ConvertTo-Json -Depth 10
        Write-Host "Request Body:" -ForegroundColor Gray
        Write-Host ($Body | ConvertTo-Json -Depth 10) -ForegroundColor White
    }
    
    try {
        $response = Invoke-WebRequest @params
        Write-Host "✓ SUCCESS" -ForegroundColor Green
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        try {
            $json = $response.Content | ConvertFrom-Json
            Write-Host ($json | ConvertTo-Json -Depth 10) -ForegroundColor Green
        } catch {
            Write-Host $response.Content -ForegroundColor Green
        }
        return $true
    } catch {
        $err = $_
        Write-Host "✗ FAILED" -ForegroundColor Red
        
        $statusCode = $err.Exception.Response.StatusCode.Value
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($err.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Dispose()
            
            Write-Host "Error Response Body:" -ForegroundColor Red
            try {
                Write-Host ($responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Red
            } catch {
                Write-Host $responseBody -ForegroundColor Red
            }
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Red
        }
        
        return $false
    }
}

# Test 1: Check if backend is reachable
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "1. CONNECTIVITY TEST" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $API_BASE_URL -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend is reachable" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is NOT reachable" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nThe backend server appears to be down or unreachable." -ForegroundColor Yellow
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. Is the Render service running?" -ForegroundColor Yellow
    Write-Host "2. Is the URL correct? (https://survey-hustler-api.onrender.com)" -ForegroundColor Yellow
    exit
}

# Test 2: Try simple GET endpoint
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "2. PUBLIC ENDPOINTS TEST" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

Test-Endpoint -Endpoint "/schools" -Method GET -Description "Fetch all schools (should be public)"

# Test 3: Different register payloads
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "3. REGISTRATION PAYLOAD TESTS" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# Attempt 1: Full payload
$payload1 = @{
    email = "test$timestamp@example.com"
    password = "TestPassword123"
    confirmPassword = "TestPassword123"
    firstName = "Test"
    lastName = "User"
    userName = "testuser$timestamp"
}
Test-Endpoint -Endpoint "/account/register" -Method POST -Body $payload1 -Description "Full payload (all fields)"

# Attempt 2: Minimal payload (no userName)
$payload2 = @{
    email = "test$timestamp@example.com"
    password = "TestPassword123"
    confirmPassword = "TestPassword123"
    firstName = "Test"
    lastName = "User"
}
Test-Endpoint -Endpoint "/account/register" -Method POST -Body $payload2 -Description "Without userName field"

# Attempt 3: Even more minimal
$payload3 = @{
    email = "test$timestamp@example.com"
    password = "TestPassword123"
    firstName = "Test"
    lastName = "User"
}
Test-Endpoint -Endpoint "/account/register" -Method POST -Body $payload3 -Description "Without confirmPassword field"

# Test 4: Try login with non-existent user
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "4. LOGIN TEST" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

$loginPayload = @{
    email = "nonexistent@example.com"
    password = "WrongPassword123"
}
Test-Endpoint -Endpoint "/account/authenticate" -Method POST -Body $loginPayload -Description "Login with non-existent credentials"

# Summary
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "DEBUGGING SUMMARY" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan
Write-Host @"
Next Steps:
1. Look at the test results above
2. Identify which test(s) failed and why
3. Share the error messages with your backend engineer
4. Ask them for:
   - The exact required fields for registration
   - Example registration payload
   - A test user account (email + password)
   - Any password requirements (min length, special chars, etc.)

Common Issues:
- 400: Bad Request - Check field names and data types
- 409: Conflict - User already exists or session issue
- 500: Server Error - Backend bug, contact engineer
- Connection refused - Backend is down

@ -ForegroundColor White

Write-Host "`nTest completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
