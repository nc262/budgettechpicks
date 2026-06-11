# One-time image optimization: shrink the logo, build og-default.png, compress oversized product JPEGs.
Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot -Parent
$pub = Join-Path $root "public"

function Save-Jpeg([System.Drawing.Bitmap]$bmp, [string]$path, [int]$quality) {
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
    $bmp.Save($path, $codec, $ep)
}

function Resize-Image([System.Drawing.Image]$img, [int]$maxW, [int]$maxH) {
    $ratio = [Math]::Min([Math]::Min($maxW / $img.Width, $maxH / $img.Height), 1.0)
    $w = [int]($img.Width * $ratio); $h = [int]($img.Height * $ratio)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()
    return $bmp
}

# ── 1. Logo: 953KB → small header-size PNG (rendered at h-14 ≈ 56px; 3x for retina) ──
$logoPath = Join-Path $pub "logo.png"
$orig = [System.Drawing.Image]::FromFile($logoPath)
$small = Resize-Image $orig 999 168
$tmp = Join-Path $pub "logo-small.png"
$small.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
$origW = $orig.Width; $origH = $orig.Height
$orig.Dispose(); $small.Dispose()
Move-Item -Force $tmp $logoPath
"logo.png: ${origW}x${origH} -> $((Get-Item $logoPath).Length / 1KB -as [int])KB"

# ── 2. og-default.png 1200x630 ──
$og = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Dark gradient background
$rect = New-Object System.Drawing.Rectangle(0, 0, 1200, 630)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(10, 14, 26), [System.Drawing.Color]::FromArgb(14, 24, 56), 35)
$g.FillRectangle($bg, $rect)

# Subtle dot grid
$dot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 59, 130, 246))
for ($x = 20; $x -lt 1200; $x += 36) { for ($y = 20; $y -lt 630; $y += 36) { $g.FillEllipse($dot, $x, $y, 2, 2) } }

# Accent bar
$accent = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Rectangle(80, 200, 120, 8)), [System.Drawing.Color]::FromArgb(96, 165, 250), [System.Drawing.Color]::FromArgb(129, 140, 248), 0)
$g.FillRectangle($accent, 80, 208, 120, 8)

# Headline
$white = [System.Drawing.Brushes]::White
$blue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(96, 165, 250))
$gray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(156, 163, 175))
$f1 = New-Object System.Drawing.Font("Segoe UI", 64, [System.Drawing.FontStyle]::Bold)
$f2 = New-Object System.Drawing.Font("Segoe UI", 26)
$f3 = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Less Hype.", $f1, $white, 70, 240)
$g.DrawString("More Hardware.", $f1, $blue, 70, 330)
$g.DrawString("Tech picks built from real owner feedback — with sources you can check.", $f2, $gray, 76, 450)
$g.DrawString("TOTALTECHPICKS.COM", $f3, $white, 76, 540)
$g.Dispose()
$og.Save((Join-Path $pub "og-default.png"), [System.Drawing.Imaging.ImageFormat]::Png)
"og-default.png: $((Get-Item (Join-Path $pub 'og-default.png')).Length / 1KB -as [int])KB"

# ── 3. Product images over 120KB → max 600px wide JPEG q82 ──
$count = 0; $saved = 0
Get-ChildItem (Join-Path $pub "images\products\*.jpg") | Where-Object { $_.Length -gt 120KB } | ForEach-Object {
    $before = $_.Length
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $bmp = Resize-Image $img 600 600
    $img.Dispose()
    $tmpJ = "$($_.FullName).tmp"
    Save-Jpeg $bmp $tmpJ 82
    $bmp.Dispose()
    $after = (Get-Item $tmpJ).Length
    if ($after -lt $before) { Move-Item -Force $tmpJ $_.FullName; $count++; $saved += ($before - $after) }
    else { Remove-Item $tmpJ }
}
"product images: $count compressed, saved $([int]($saved/1MB))MB"
