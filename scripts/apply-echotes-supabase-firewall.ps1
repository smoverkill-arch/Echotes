#requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

$ruleName = "Echotes Supabase local ports - block inbound LAN"
$ports = "55420-55429"

$existingRules = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existingRules) {
  $existingRules | Remove-NetFirewallRule
}

New-NetFirewallRule `
  -DisplayName $ruleName `
  -Direction Inbound `
  -Action Block `
  -Protocol TCP `
  -LocalPort $ports `
  -Profile Any `
  -RemoteAddress Any `
  -EdgeTraversalPolicy Block | Out-Null

Get-NetFirewallRule -DisplayName $ruleName | Format-List DisplayName,Enabled,Direction,Action,Profile
Get-NetFirewallRule -DisplayName $ruleName | Get-NetFirewallPortFilter | Format-List Protocol,LocalPort
Get-NetFirewallRule -DisplayName $ruleName | Get-NetFirewallAddressFilter | Format-List RemoteAddress
