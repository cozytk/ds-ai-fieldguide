# Run in the extracted practice directory. Compatible with Windows PowerShell 5.1+.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if ((Test-Path opencode.json) -or (Test-Path opencode.jsonc)) {
    throw 'A project config already exists. Use a fresh lab folder or merge the shift-lab entry yourself.'
}
$labPython = (Resolve-Path '.venv/Scripts/python.exe').Path
$labServer = (Resolve-Path 'field_server.py').Path
$labVersion = (opencode --version | Select-Object -Last 1).Trim()
if ($labVersion -notmatch '^v?([12])\.') { throw "Check your OpenCode version: $labVersion" }
$labMajor = $Matches[1]
$entry = @{ type = 'local'; command = @($labPython, $labServer); enabled = $true }
if ($labMajor -eq '2') {
    $entry.Remove('enabled')
    $config = @{ mcp = @{ servers = @{ 'shift-lab' = $entry } } }
} else {
    $config = @{ mcp = @{ 'shift-lab' = $entry } }
}
$payload = $config | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'opencode.json'), $payload, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Created project config for OpenCode $labVersion"
opencode mcp list
