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
[System.IO.File]::WriteAllText($outPath, $json, $utf8NoBom)

$dc = ($devices.Values | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
$cc = ($components.Values | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
Write-Host "Wrote $outPath | device plugins: $dc | components: $cc"
