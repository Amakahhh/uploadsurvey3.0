# PowerShell script to test backend endpoints directly
# This helps debug what the backend expects

$API_BASE_URL = "https://survey-hustler-api.onrender.com"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Backend API Endpoint Debugging" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register endpoint
Write-Host "Test 1: Attempting Registration" -ForegroundColor Yellow
Write-Host "Endpoint: POST /account/register" -ForegroundColor Gray

$registerPayload = @{
    email = "testuser123@example.com"
    password = "TestPassword123"
    confirmPassword = "TestPassword123"
    firstName = "Test"
    lastName = "User"
    userName = "testuser123"
} | ConvertTo-Json

Write-Host "Sending payload:" -ForegroundColor Gray
Write-Host $registerPayload -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/account/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $registerPayload `
        -ErrorAction Stop

    Write-Host "✓ Registration Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Green
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $statusCode = [int]$errorResponse.StatusCode
        $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Dispose()
        
        Write-Host "✗ Registration Failed!" -ForegroundColor Red
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        Write-Host "Error Response:" -ForegroundColor Red
        
        try {
            Write-Host ($responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Red
        } catch {
            Write-Host $responseBody -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test 2: Attempting Login" -ForegroundColor Yellow
Write-Host "Endpoint: POST /account/authenticate" -ForegroundColor Gray
Write-Host "Note: Use credentials from backend engineer" -ForegroundColor Gray

$loginPayload = @{
    email = "testuser123@example.com"
    password = "TestPassword123"
} | ConvertTo-Json

Write-Host "Sending payload:" -ForegroundColor Gray
Write-Host $loginPayload -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/account/authenticate" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $loginPayload `
        -ErrorAction Stop

    Write-Host "✓ Login Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Green
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $statusCode = [int]$errorResponse.StatusCode
        $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Dispose()
        
        Write-Host "✗ Login Failed!" -ForegroundColor Red
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        Write-Host "Error Response:" -ForegroundColor Red
        
        try {
            Write-Host ($responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Red
        } catch {
            Write-Host $responseBody -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test 3: Check GET /schools (Public endpoint)" -ForegroundColor Yellow
Write-Host "Endpoint: GET /schools" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/schools" `
        -Method GET `
        -ErrorAction Stop

    Write-Host "✓ GET /schools Success!" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Schools returned: $($data.Count)" -ForegroundColor Green
    if ($data.Count -gt 0) {
        Write-Host "First school:" -ForegroundColor Gray
        Write-Host ($data[0] | ConvertTo-Json) -ForegroundColor Green
    }
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $statusCode = [int]$errorResponse.StatusCode
        Write-Host "✗ Failed with status $statusCode" -ForegroundColor Red
    } else {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "1. Copy the EXACT error message from above" -ForegroundColor White
Write-Host "2. Ask your backend engineer:" -ForegroundColor White
Write-Host "   - Is the register endpoint expecting different field names?" -ForegroundColor White
Write-Host "   - What should the exact request body look like?" -ForegroundColor White
Write-Host "   - Provide a test user account (email + password)" -ForegroundColor White
Write-Host "   - Are there any validation rules for passwords?" -ForegroundColor White
