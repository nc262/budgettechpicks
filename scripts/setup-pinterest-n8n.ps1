# Pinterest Token Setup for n8n
# Run this yourself in PowerShell — your token stays local, never sent to chat
# Usage: .\scripts\setup-pinterest-n8n.ps1

Write-Host "`n🔐 Pinterest n8n Credential Setup" -ForegroundColor Cyan
Write-Host "Your token is hidden and sent directly to n8n.`n"

# Prompt for token — hidden input
$secureToken = Read-Host "Paste your Pinterest access token" -AsSecureString
$token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
)

# Prompt for n8n API key — hidden input
$secureN8nKey = Read-Host "Paste your n8n API key (from n8n Settings > API)" -AsSecureString
$n8nKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureN8nKey)
)

$n8nUrl = "http://localhost:5678"

# Build credential payload — httpHeaderAuth type (works with Bearer token)
$body = @{
    name = "Pinterest Bearer Token"
    type = "httpHeaderAuth"
    data = @{
        name  = "Authorization"
        value = "Bearer $token"
    }
} | ConvertTo-Json -Depth 5

Write-Host "`nConnecting to n8n at $n8nUrl..." -ForegroundColor Yellow

try {
    # Check if credential already exists
    $existing = Invoke-RestMethod `
        -Uri "$n8nUrl/api/v1/credentials" `
        -Method GET `
        -Headers @{ "X-N8N-API-KEY" = $n8nKey } `
        -ErrorAction Stop

    $existingCred = $existing.data | Where-Object { $_.name -eq "Pinterest Bearer Token" }

    if ($existingCred) {
        # Update existing
        $result = Invoke-RestMethod `
            -Uri "$n8nUrl/api/v1/credentials/$($existingCred.id)" `
            -Method PATCH `
            -Headers @{ "X-N8N-API-KEY" = $n8nKey; "Content-Type" = "application/json" } `
            -Body $body `
            -ErrorAction Stop
        Write-Host "✅ Updated existing 'Pinterest Bearer Token' credential (ID: $($result.id))" -ForegroundColor Green
    } else {
        # Create new
        $result = Invoke-RestMethod `
            -Uri "$n8nUrl/api/v1/credentials" `
            -Method POST `
            -Headers @{ "X-N8N-API-KEY" = $n8nKey; "Content-Type" = "application/json" } `
            -Body $body `
            -ErrorAction Stop
        Write-Host "✅ Created 'Pinterest Bearer Token' credential (ID: $($result.id))" -ForegroundColor Green
    }

    Write-Host "`n📋 Credential ID: $($result.id)" -ForegroundColor Cyan
    Write-Host "Use this ID when importing the Pinterest workflows into n8n.`n"

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure n8n is running and your API key is correct." -ForegroundColor Yellow
}

# Clear sensitive variables from memory
$token = $null; $n8nKey = $null
[System.GC]::Collect()
Write-Host "🔒 Token cleared from memory." -ForegroundColor Gray
