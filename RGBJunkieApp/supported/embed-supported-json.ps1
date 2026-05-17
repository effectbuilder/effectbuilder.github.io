$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$jsonPath = Join-Path $root '_supported-data.json'
$supportedPath = Join-Path $root 'supported.html'
$begin = '<!-- SUPPORTED_GEAR_JSON:BEGIN -->'
$end = '<!-- SUPPORTED_GEAR_JSON:END -->'
if (-not (Test-Path -LiteralPath $jsonPath)) { throw "Missing $jsonPath" }
if (-not (Test-Path -LiteralPath $supportedPath)) { throw "Missing $supportedPath" }
$utf8 = New-Object System.Text.UTF8Encoding $false
$json = [System.IO.File]::ReadAllText($jsonPath, $utf8)
$safeJson = $json.Replace('</textarea', '<\/textarea')
$nl = "`r`n"
$block = $begin + $nl + '<textarea id="supported-gear-data" class="d-none" readonly aria-hidden="true">' + $safeJson + '</textarea>' + $nl + $end
$html = [System.IO.File]::ReadAllText($supportedPath, $utf8)
$pattern = [regex]::Escape($begin) + '[\s\S]*?' + [regex]::Escape($end)
$rx = [regex]::new($pattern)
if (-not $rx.IsMatch($html)) { throw "Markers not found in supported.html" }
$html2 = $rx.Replace($html, $block, 1)
[System.IO.File]::WriteAllText($supportedPath, $html2, $utf8)
Write-Host "Embedded _supported-data.json into supported.html"
