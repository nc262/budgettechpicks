# Quick live-site spot check for totaltechpicks.com — run any time to confirm the deployed site is healthy.
$ErrorActionPreference = "Stop"
$checks = @()

$h = (Invoke-WebRequest -Uri "https://totaltechpicks.com" -TimeoutSec 30).Content
$checks += "homepage live-stats badge:        " + ($h -match 'picks tracked')

$a = (Invoke-WebRequest -Uri "https://totaltechpicks.com/best-monitors-and-displays/" -TimeoutSec 30).Content
$checks += "guide comparison table:           " + ($a -match 'At a Glance')
$checks += "guide head-to-head verdicts:      " + ($a -match 'Head-to-Head')
$checks += "guide FAQ structured data:        " + ($a -match 'FAQPage')
$checks += "guide affiliate disclosure:       " + ($a -match 'affiliate links')
$checks += "guide author byline (E-E-A-T):    " + ($a -match 'Nathan Ceniceros')

# Trust / E-E-A-T pages (AdSense readiness)
$rev = Invoke-WebRequest -Uri "https://totaltechpicks.com/reviews/sony-wh-1000xm5/" -TimeoutSec 30 -SkipHttpErrorCheck
$checks += "deep review pages live:           " + ($rev.StatusCode -eq 200 -and $rev.Content -match 'How it holds up')
$ed = Invoke-WebRequest -Uri "https://totaltechpicks.com/editorial-policy/" -TimeoutSec 30 -SkipHttpErrorCheck
$checks += "editorial policy page live:       " + ($ed.StatusCode -eq 200)
$ct = Invoke-WebRequest -Uri "https://totaltechpicks.com/contact/" -TimeoutSec 30 -SkipHttpErrorCheck
$checks += "contact page live:                " + ($ct.StatusCode -eq 200)

# Auto-generated content should stay HIDDEN during AdSense review (flag off)
$showAuto = $env:EXPECT_AUTO_CONTENT -eq "1"
$intelHidden = -not ($h -match 'Latest Community Intel')
$checks += "AI content gated for review:      " + ($showAuto -or $intelHidden)

$g = (Invoke-WebRequest -Uri "https://totaltechpicks.com/best-tech-gifts/" -TimeoutSec 30).Content
$checks += "gift guide live:                  " + ($g -match 'Best Tech Gifts That Actually Get Used')

$bg = Invoke-WebRequest -Uri "https://totaltechpicks.com/best/monitors-under-300/" -TimeoutSec 30 -SkipHttpErrorCheck
$checks += "budget pages live:                " + ($bg.StatusCode -eq 200)

$og = Invoke-WebRequest -Uri "https://totaltechpicks.com/og-default.png" -Method Head -TimeoutSec 20
$checks += "social share image:               $($og.StatusCode -eq 200)"

$sm = (Invoke-WebRequest -Uri "https://totaltechpicks.com/sitemap.xml" -TimeoutSec 20).Content
$checks += "sitemap reachable:                $($sm.Length -gt 500)"

$checks -join "`n"
if ($checks -match 'False') { Write-Error "Some live checks failed"; exit 1 } else { "`nALL LIVE CHECKS PASSED" }
