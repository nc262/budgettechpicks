# Quick live-site spot check for totaltechpicks.com — run any time to confirm the deployed site is healthy.
$ErrorActionPreference = "Stop"
$checks = @()

$h = (Invoke-WebRequest -Uri "https://totaltechpicks.com" -TimeoutSec 30).Content
$checks += "homepage live-stats badge:        " + ($h -match 'picks tracked')
$checks += "community intel feed:             " + ($h -match 'Latest Community Intel')

$a = (Invoke-WebRequest -Uri "https://totaltechpicks.com/best-monitors-and-displays/" -TimeoutSec 30).Content
$checks += "guide comparison table:           " + ($a -match 'At a Glance')
$checks += "guide head-to-head verdicts:      " + ($a -match 'Head-to-Head')
$checks += "guide FAQ structured data:        " + ($a -match 'FAQPage')
$checks += "guide affiliate disclosure:       " + ($a -match 'affiliate links')
# Intel stamp only renders on guides that currently have insights — check across two guides
$b = (Invoke-WebRequest -Uri "https://totaltechpicks.com/best-budget-webcams/" -TimeoutSec 30).Content
$checks += "guide intel freshness stamp:      " + (($a -match 'community intel refreshed') -or ($b -match 'community intel refreshed'))

$g = (Invoke-WebRequest -Uri "https://totaltechpicks.com/best-tech-gifts/" -TimeoutSec 30).Content
$checks += "gift guide live:                  " + ($g -match 'Best Tech Gifts That Actually Get Used')

$og = Invoke-WebRequest -Uri "https://totaltechpicks.com/og-default.png" -Method Head -TimeoutSec 20
$checks += "social share image:               $($og.StatusCode -eq 200)"

$sm = (Invoke-WebRequest -Uri "https://totaltechpicks.com/sitemap.xml" -TimeoutSec 20).Content
$checks += "sitemap reachable:                $($sm.Length -gt 500)"

$checks -join "`n"
if ($checks -match 'False') { Write-Error "Some live checks failed"; exit 1 } else { "`nALL LIVE CHECKS PASSED" }
