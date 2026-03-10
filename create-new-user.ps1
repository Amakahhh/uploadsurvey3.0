# Create a completely new user with unique timestamp
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$randomNum = Get-Random -Minimum 1000 -Maximum 9999
$email = "user$timestamp$randomNum@test.com"
$username = "user$timestamp$randomNum"
$password = "Password123"

Write-Host "Creating user with email: $email"
Write-Host "Username: $username"
Write-Host "Password: $password"

$body = "{
    `"email`": `"$email`",
    `"password`": `"$password`",
    `"confirmPassword`": `"$password`",
    `"firstName`": `"Test`",
    `"lastName`": `"User`",
    `"userName`": `"$username`"
}"

try {
    $response = Invoke-RestMethod -Uri "https://survey-hustler-api.onrender.com/account/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "`n✅ USER CREATION SUCCESSFUL!"
    Write-Host "Email: $email"
    Write-Host "Password: $password"
    Write-Host "Username: $username"
    Write-Host "User ID: $($response.id)"
    Write-Host "Name: $($response.firstName) $($response.lastName)"
} catch {
    Write-Host "`n❌ USER CREATION FAILED:"
    Write-Host "Error: $($_.Exception.Message)"
}

# Test login immediately after creation
Write-Host "`nTesting login..."
$loginBody = "{
    `"email`": `"$email`",
    `"password`": `"$password`"
}"

try {
    $loginResponse = Invoke-RestMethod -Uri "https://survey-hustler-api.onrender.com/account/authenticate" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "`n✅ LOGIN SUCCESSFUL!"
    Write-Host "User authenticated: $($loginResponse.isAuthenticated)"
    Write-Host "JWT Token received: $($loginResponse.jwToken -ne $null)"
} catch {
    Write-Host "`n❌ LOGIN FAILED:"
    Write-Host "Error: $($_.Exception.Message)"
}





