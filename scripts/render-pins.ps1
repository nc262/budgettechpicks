# Renders Pinterest-optimized 1000x1500 pin images from a manifest.
# ASCII-only source on purpose — all display text (incl. star glyphs) comes from the
# UTF-8 manifest JSON so this file never carries encoding-sensitive literals.
# Usage: pwsh -File render-pins.ps1 -ManifestPath <json> -OutDir <dir> [-Force]
param(
  [Parameter(Mandatory = $true)] [string]$ManifestPath,
  [Parameter(Mandatory = $true)] [string]$OutDir,
  [switch]$Force
)
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$W = 1000; $H = 1500
$family = "Segoe UI"
$items = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json
New-Item -ItemType Directory -Force $OutDir | Out-Null

function Save-Jpeg([System.Drawing.Bitmap]$bmp, [string]$path, [int]$q) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$q)
  $bmp.Save($path, $codec, $ep)
}

function New-RoundedPath([int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function Get-WrappedLines($g, [string]$text, $font, [int]$maxW) {
  $lines = @(); $cur = ""
  foreach ($word in ($text -split '\s+')) {
    if (-not $word) { continue }
    $try = if ($cur) { "$cur $word" } else { $word }
    if (($g.MeasureString($try, $font)).Width -le $maxW) { $cur = $try }
    else { if ($cur) { $lines += $cur }; $cur = $word }
  }
  if ($cur) { $lines += $cur }
  return $lines
}

$rendered = 0
foreach ($it in $items) {
  $outPath = Join-Path $OutDir ($it.asin + ".jpg")
  if ((Test-Path $outPath) -and -not $Force) { continue }

  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

  # Background: dark navy -> blue vertical gradient
  $bgRect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, [System.Drawing.Color]::FromArgb(10, 14, 26), [System.Drawing.Color]::FromArgb(14, 26, 64), 90)
  $g.FillRectangle($bg, $bgRect)

  # Subtle dot grid (brand texture)
  $dot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 96, 165, 250))
  for ($x = 30; $x -lt $W; $x += 42) { for ($y = 30; $y -lt $H; $y += 42) { $g.FillEllipse($dot, $x, $y, 3, 3) } }

  # Glow orb top-left
  $orbRect = New-Object System.Drawing.Rectangle(-140, -120, 520, 520)
  $orb = New-Object System.Drawing.Drawing2D.LinearGradientBrush($orbRect, [System.Drawing.Color]::FromArgb(36, 37, 99, 235), [System.Drawing.Color]::FromArgb(0, 37, 99, 235), 45)
  $g.FillEllipse($orb, $orbRect)

  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $blue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(122, 184, 255))
  $blueChip = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))
  $yellow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 204, 21))
  $gray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 190, 210))

  # Kicker (uppercase, blue, tracked)
  $kickerFont = New-Object System.Drawing.Font($family, 22, [System.Drawing.FontStyle]::Bold)
  $kicker = ($it.kicker -as [string])
  if ($kicker) { $g.DrawString($kicker.ToUpper(), $kickerFont, $blue, 60, 70) }

  # Headline (auto-fit, bold white, with a drop shadow so it pops in a busy Pinterest feed)
  $maxW = $W - 116
  $maxHeadlineH = 340
  $size = 74
  $hFont = $null; $hLines = @()
  while ($true) {
    $hFont = New-Object System.Drawing.Font($family, $size, [System.Drawing.FontStyle]::Bold)
    $hLines = Get-WrappedLines $g $it.headline $hFont $maxW
    if (($hLines.Count * $hFont.Height) -le $maxHeadlineH -or $size -le 40) { break }
    $size -= 4
  }
  $hShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(150, 0, 0, 0))
  $hy = 120
  foreach ($ln in $hLines) {
    $g.DrawString($ln, $hFont, $hShadow, 61, ($hy + 3))
    $g.DrawString($ln, $hFont, $white, 58, $hy)
    $hy += $hFont.Height
  }

  # Product image on a white rounded card
  $cardX = 120; $cardY = 560; $cardW = 760; $cardH = 540
  $cardPath = New-RoundedPath $cardX $cardY $cardW $cardH 28
  $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $cardPath)
  try {
    if ($it.imagePath -and (Test-Path $it.imagePath)) {
      $img = [System.Drawing.Image]::FromFile($it.imagePath)
      $padX = 50; $padY = 50
      $innerW = $cardW - 2 * $padX; $innerH = $cardH - 2 * $padY
      $ratio = [Math]::Min($innerW / $img.Width, $innerH / $img.Height)
      $iw = [int]($img.Width * $ratio); $ih = [int]($img.Height * $ratio)
      $ix = $cardX + ($cardW - $iw) / 2; $iy = $cardY + ($cardH - $ih) / 2
      $g.DrawImage($img, [int]$ix, [int]$iy, $iw, $ih)
      $img.Dispose()
    }
  } catch { }

  # Rating row
  $rateFont = New-Object System.Drawing.Font($family, 26, [System.Drawing.FontStyle]::Bold)
  if ($it.rating) { $g.DrawString($it.rating, $rateFont, $yellow, 60, 1140) }

  # Price chip (big, blue rounded)
  $priceFont = New-Object System.Drawing.Font($family, 44, [System.Drawing.FontStyle]::Bold)
  $price = ($it.price -as [string])
  if ($price) {
    $pw = [int]($g.MeasureString($price, $priceFont)).Width + 56
    $chipPath = New-RoundedPath 60 1200 $pw 90 20
    $g.FillPath($blueChip, $chipPath)
    $g.DrawString($price, $priceFont, $white, 88, 1216)
  }

  # Footer band
  $footRect = New-Object System.Drawing.Rectangle(0, 1380, $W, 120)
  $foot = New-Object System.Drawing.Drawing2D.LinearGradientBrush($footRect, [System.Drawing.Color]::FromArgb(37, 99, 235), [System.Drawing.Color]::FromArgb(67, 56, 202), 0)
  $g.FillRectangle($foot, $footRect)
  $brandFont = New-Object System.Drawing.Font($family, 28, [System.Drawing.FontStyle]::Bold)
  $tagFont = New-Object System.Drawing.Font($family, 24, [System.Drawing.FontStyle]::Bold)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString("TOTALTECHPICKS.COM", $brandFont, $white, ($W / 2), 1398, $sf)
  $g.DrawString("Less Hype. More Hardware.", $tagFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(228, 236, 255))), ($W / 2), 1442, $sf)

  $g.Dispose()
  Save-Jpeg $bmp $outPath 92
  $bmp.Dispose()
  $rendered++
}

Write-Output "RENDERED $rendered pin image(s) -> $OutDir"
