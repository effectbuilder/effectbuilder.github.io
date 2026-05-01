<#!
  Rebuilds _supported-data.json from your RGBJunkie app plugin/component trees,
  then embeds that JSON into supported.html (so the gear page works offline and without a separate fetch).

  To refresh only the embed from an existing JSON file:
    .\embed-supported-json.ps1
#>
$ErrorActionPreference = 'Stop'
$pluginsRoot = 'C:\Users\josea\RGBJunkieApp\plugins'
$compsRoot = 'C:\Users\josea\RGBJunkieApp\components'
$outPath = Join-Path $PSScriptRoot '_supported-data.json'

if (-not (Test-Path -LiteralPath $pluginsRoot)) { throw "Missing plugins: $pluginsRoot" }
if (-not (Test-Path -LiteralPath $compsRoot)) { throw "Missing components: $compsRoot" }

$devices = [ordered]@{}
Get-ChildItem -LiteralPath $pluginsRoot -Directory |
    Where-Object { $_.Name -notmatch '^(?i)custom$' } |
    Sort-Object Name |
    ForEach-Object {
        $vendor = $_.Name
        $names = @(Get-ChildItem -LiteralPath $_.FullName -File -Filter '*.js' -ErrorAction SilentlyContinue |
            Sort-Object Name |
            ForEach-Object { [System.IO.Path]::GetFileNameWithoutExtension($_.Name) })
        if ($names.Count -gt 0) { $devices[$vendor] = $names }
    }

$components = [ordered]@{}
Get-ChildItem -LiteralPath $compsRoot -Directory |
    Where-Object { $_.Name -notmatch '^(?i)custom$' } |
    Sort-Object Name |
    ForEach-Object {
        $vendor = $_.Name
        $names = @(Get-ChildItem -LiteralPath $_.FullName -File -Filter '*.json' -Recurse -ErrorAction SilentlyContinue |
            Sort-Object FullName |
            ForEach-Object { [System.IO.Path]::GetFileNameWithoutExtension($_.Name) })
        if ($names.Count -gt 0) { $components[$vendor] = $names }
    }

$obj = [ordered]@{
    generated = (Get-Date).ToString('yyyy-MM-dd')
    devices     = $devices
    components  = $components
}
$json = $obj | ConvertTo-Json -Depth 12
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$dc = ($devices.Values | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
$cc = ($components.Values | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
if ($dc -eq 0 -and $cc -eq 0 -and (Test-Path -LiteralPath $outPath)) {
    Write-Warning "Scan produced no entries; keeping existing _supported-data.json (check plugins/components paths)."
    $json = [System.IO.File]::ReadAllText($outPath, $utf8NoBom)
} else {
    [System.IO.File]::WriteAllText($outPath, $json, $utf8NoBom)
    Write-Host "Wrote $outPath | device plugins: $dc | components: $cc"
}

# Embed same JSON into supported.html so the page works from file:// and if _supported-data.json is missing on the server.
$supportedPath = Join-Path $PSScriptRoot 'supported.html'
$begin = '<!-- SUPPORTED_GEAR_JSON:BEGIN -->'
$end = '<!-- SUPPORTED_GEAR_JSON:END -->'
if (Test-Path -LiteralPath $supportedPath) {
    $safeJson = $json.Replace('</textarea', '<\/textarea')
    $nl = "`r`n"
    $block = $begin + $nl + '<textarea id="supported-gear-data" class="d-none" readonly aria-hidden="true">' + $safeJson + '</textarea>' + $nl + $end
    $html = [System.IO.File]::ReadAllText($supportedPath, [System.Text.UTF8Encoding]::new($false))
    $pattern = [regex]::Escape($begin) + '[\s\S]*?' + [regex]::Escape($end)
    $rx = [regex]::new($pattern)
    if (-not $rx.IsMatch($html)) {
        Write-Warning "supported.html missing SUPPORTED_GEAR_JSON markers; skipping embed."
    } else {
        $html2 = $rx.Replace($html, $block, 1)
        [System.IO.File]::WriteAllText($supportedPath, $html2, $utf8NoBom)
        Write-Host "Embedded JSON into supported.html"
    }
}
