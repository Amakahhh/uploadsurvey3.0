# Test login with existing user
$loginBody = '{"email":"testuser20240925191200@example.com","password":"TestPass123"}'

try {
    $loginResponse = Invoke-RestMethod -Uri "https://survey-hustler-api.onrender.com/account/authenticate" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "LOGIN SUCCESS!"
    Write-Host "User ID: $($loginResponse.id)"
    Write-Host "Name: $($loginResponse.firstName) $($loginResponse.lastName)"
    Write-Host "Email: $($loginResponse.email)"
    Write-Host "Username: $($loginResponse.userName)"
    Write-Host "Authenticated: $($loginResponse.isAuthenticated)"
} catch {
    Write-Host "LOGIN ERROR: $($_.Exception.Message)"
}

Write-Host "`nTrying with a different test user..."
$loginBody2 = '{"email":"test@example.com","password":"password123"}'

try {
    $loginResponse2 = Invoke-RestMethod -Uri "https://survey-hustler-api.onrender.com/account/authenticate" -Method Post -Body $loginBody2 -ContentType "application/json"
    Write-Host "LOGIN SUCCESS with test@example.com!"
    Write-Host "User ID: $($loginResponse2.id)"
    Write-Host "Name: $($loginResponse2.firstName) $($loginResponse2.lastName)"
    Write-Host "Email: $($loginResponse2.email)"
} catch {
    Write-Host "LOGIN ERROR with test@example.com: $($_.Exception.Message)"
}





