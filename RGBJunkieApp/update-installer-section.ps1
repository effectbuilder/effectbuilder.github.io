<#!
  Scans downloads/ for RGBJunkie_*_x64-setup.exe and matching *_x64_en-US.msi,
  then rewrites the marked regions in index.html (latest badge + download cards).

  Run from anywhere:
    pwsh -File "c:\wamp64\www\RGBJunkieApp\update-installer-section.ps1"
  Or cd RGBJunkieApp and:
    .\update-installer-section.ps1
#>
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$indexPath = Join-Path $here 'index.html'
$downloads = Join-Path $here 'downloads'

if (-not (Test-Path -LiteralPath $indexPath)) { throw "Missing index.html at $indexPath" }
if (-not (Test-Path -LiteralPath $downloads)) { throw "Missing downloads folder at $downloads" }

function Get-VersionFromExeName([string] $name) {
    if ($name -match '^RGBJunkie_(.+)_x64-setup\.exe$') { return $Matches[1] }
    return $null
}
function Get-VersionFromMsiName([string] $name) {
    if ($name -match '^RGBJunkie_(.+)_x64_en-US\.msi$') { return $Matches[1] }
    return $null
}
function Get-SortableVersion([string] $v) {
    try { return [version]$v } catch { return [version]'0.0.0' }
}
function Get-RelId([string] $v) {
    ('rel-' + ($v -replace '\.', '-'))
}
function Get-LinkSuffix([string] $v) {
    ($v -replace '\.', '')
}

$pairs = @{}
Get-ChildItem -LiteralPath $downloads -File -Filter 'RGBJunkie_*_x64-setup.exe' | ForEach-Object {
    $ver = Get-VersionFromExeName $_.Name
    if ($ver) {
        if (-not $pairs.ContainsKey($ver)) { $pairs[$ver] = @{ Setup = $null; Msi = $null } }
        $pairs[$ver].Setup = $_.Name
    }
}
Get-ChildItem -LiteralPath $downloads -File -Filter 'RGBJunkie_*_x64_en-US.msi' | ForEach-Object {
    $ver = Get-VersionFromMsiName $_.Name
    if ($ver) {
        if (-not $pairs.ContainsKey($ver)) { $pairs[$ver] = @{ Setup = $null; Msi = $null } }
        $pairs[$ver].Msi = $_.Name
    }
}

$complete = [System.Collections.Generic.List[object]]::new()
foreach ($kv in $pairs.GetEnumerator()) {
    $v = $kv.Key
    $s = $kv.Value.Setup
    $m = $kv.Value.Msi
    if ($s -and $m) {
        $complete.Add([pscustomobject]@{ Version = $v; Setup = $s; Msi = $m; SortKey = (Get-SortableVersion $v) }) | Out-Null
    }
}

if ($complete.Count -eq 0) {
    throw "No paired installers found in $downloads (need both RGBJunkie_<ver>_x64-setup.exe and RGBJunkie_<ver>_x64_en-US.msi)."
}

$sorted = $complete | Sort-Object -Property SortKey -Descending
$latest = $sorted[0]
$older = @()
if ($sorted.Count -gt 1) { $older = $sorted | Select-Object -Skip 1 }

$nl = "`r`n"
$midDot = [char]0x00B7
$badgeHtml = '<span class="badge rounded-pill text-bg-dark border">Latest ' + $midDot + ' v' + $latest.Version + '</span>'

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine(('                        <div class="card border-secondary shadow-sm mb-4">'))
[void]$sb.AppendLine(('                            <div class="card-header bg-dark border-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">'))
[void]$sb.AppendLine(('                                <span class="fw-semibold"><i class="bi bi-windows me-2"></i>RGBJunkie v' + $latest.Version + ' ' + $midDot + ' Windows 10 or later (64-bit)</span>'))
[void]$sb.AppendLine(('                                <span class="badge text-bg-success">Current</span>'))
[void]$sb.AppendLine(('                            </div>'))
[void]$sb.AppendLine(('                            <div class="card-body">'))
[void]$sb.AppendLine(('                                <div class="d-grid gap-2 d-sm-flex flex-sm-wrap">'))
[void]$sb.AppendLine(('                                    <a class="btn btn-primary btn-lg flex-sm-fill" href="downloads/{0}" download>' -f $latest.Setup))
[void]$sb.AppendLine(('                                        <i class="bi bi-download me-2"></i>Download installer'))
[void]$sb.AppendLine(('                                    </a>'))
[void]$sb.AppendLine(('                                    <a class="btn btn-outline-primary flex-sm-fill" href="downloads/{0}" download>' -f $latest.Msi))
[void]$sb.AppendLine(('                                        <i class="bi bi-box-seam me-2"></i>Download MSI (IT-friendly)'))
[void]$sb.AppendLine(('                                    </a>'))
[void]$sb.AppendLine(('                                </div>'))
[void]$sb.AppendLine(('                                <p class="small text-body-secondary mt-3 mb-0">The MSI option is handy if your PC is managed by work or school and standard installers are restricted.</p>'))
[void]$sb.AppendLine(('                                <hr class="border-secondary my-4">'))
[void]$sb.AppendLine(('                                <p class="small text-muted mb-2 fw-semibold">Share these links</p>'))
[void]$sb.AppendLine(('                                <div class="input-group input-group-sm mb-2">'))
[void]$sb.AppendLine(('                                    <span class="input-group-text bg-dark border-secondary text-secondary">Installer</span>'))
[void]$sb.AppendLine(('                                    <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="" id="link-setup" data-base-path="downloads/{0}">' -f $latest.Setup))
[void]$sb.AppendLine(('                                    <button class="btn btn-outline-secondary" type="button" data-copy-target="link-setup" title="Copy link"><i class="bi bi-clipboard"></i></button>'))
[void]$sb.AppendLine(('                                </div>'))
[void]$sb.AppendLine(('                                <div class="input-group input-group-sm">'))
[void]$sb.AppendLine(('                                    <span class="input-group-text bg-dark border-secondary text-secondary">MSI</span>'))
[void]$sb.AppendLine(('                                    <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="" id="link-msi" data-base-path="downloads/{0}">' -f $latest.Msi))
[void]$sb.AppendLine(('                                    <button class="btn btn-outline-secondary" type="button" data-copy-target="link-msi" title="Copy link"><i class="bi bi-clipboard"></i></button>'))
[void]$sb.AppendLine(('                                </div>'))
[void]$sb.AppendLine(('                            </div>'))
[void]$sb.AppendLine(('                        </div>'))

if ($older.Count -gt 0) {
    [void]$sb.AppendLine((''))
    [void]$sb.AppendLine(('                        <div class="card border-secondary shadow-sm mb-4">'))
    [void]$sb.AppendLine(('                            <div class="card-header bg-dark border-secondary">'))
    [void]$sb.AppendLine(('                                <span class="fw-semibold"><i class="bi bi-archive me-2"></i>Previous releases</span>'))
    [void]$sb.AppendLine(('                                <span class="small text-body-secondary d-block mt-1">All installer pairs we currently host (newest first); same 64-bit Windows requirement.</span>'))
    [void]$sb.AppendLine(('                            </div>'))
    [void]$sb.AppendLine(('                            <div class="card-body p-0">'))
    [void]$sb.AppendLine(('                                <div class="accordion accordion-flush" id="installersArchive">'))
    foreach ($row in $older) {
        $rid = Get-RelId $row.Version
        $lid = 'link-setup-' + (Get-LinkSuffix $row.Version)
        $mid = 'link-msi-' + (Get-LinkSuffix $row.Version)
        [void]$sb.AppendLine(('                                    <div class="accordion-item bg-body-tertiary border-secondary">'))
        [void]$sb.AppendLine(('                                        <h3 class="accordion-header">'))
        [void]$sb.AppendLine(('                                            <button class="accordion-button collapsed bg-body-tertiary text-body" type="button" data-bs-toggle="collapse" data-bs-target="#{0}" aria-expanded="false" aria-controls="{0}">v{1}</button>' -f $rid, $row.Version))
        [void]$sb.AppendLine(('                                        </h3>'))
        [void]$sb.AppendLine(('                                        <div id="{0}" class="accordion-collapse collapse" data-bs-parent="#installersArchive">' -f $rid))
        [void]$sb.AppendLine(('                                            <div class="accordion-body border-top border-secondary">'))
        [void]$sb.AppendLine(('                                                <div class="d-grid gap-2 d-sm-flex flex-sm-wrap mb-3">'))
        [void]$sb.AppendLine(('                                                    <a class="btn btn-outline-secondary flex-sm-fill" href="downloads/{0}" download><i class="bi bi-download me-2"></i>Setup (.exe)</a>' -f $row.Setup))
        [void]$sb.AppendLine(('                                                    <a class="btn btn-outline-secondary flex-sm-fill" href="downloads/{0}" download><i class="bi bi-box-seam me-2"></i>MSI</a>' -f $row.Msi))
        [void]$sb.AppendLine(('                                                </div>'))
        [void]$sb.AppendLine(('                                                <p class="small text-muted mb-2 fw-semibold">Share direct links</p>'))
        [void]$sb.AppendLine(('                                                <div class="input-group input-group-sm mb-2">'))
        [void]$sb.AppendLine(('                                                    <span class="input-group-text bg-dark border-secondary text-secondary">Installer</span>'))
        [void]$sb.AppendLine(('                                                    <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="" id="{0}" data-base-path="downloads/{1}">' -f $lid, $row.Setup))
        [void]$sb.AppendLine(('                                                    <button class="btn btn-outline-secondary" type="button" data-copy-target="{0}" title="Copy link"><i class="bi bi-clipboard"></i></button>' -f $lid))
        [void]$sb.AppendLine(('                                                </div>'))
        [void]$sb.AppendLine(('                                                <div class="input-group input-group-sm">'))
        [void]$sb.AppendLine(('                                                    <span class="input-group-text bg-dark border-secondary text-secondary">MSI</span>'))
        [void]$sb.AppendLine(('                                                    <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="" id="{0}" data-base-path="downloads/{1}">' -f $mid, $row.Msi))
        [void]$sb.AppendLine(('                                                    <button class="btn btn-outline-secondary" type="button" data-copy-target="{0}" title="Copy link"><i class="bi bi-clipboard"></i></button>' -f $mid))
        [void]$sb.AppendLine(('                                                </div>'))
        [void]$sb.AppendLine(('                                            </div>'))
        [void]$sb.AppendLine(('                                        </div>'))
        [void]$sb.AppendLine(('                                    </div>'))
    }
    [void]$sb.AppendLine(('                                </div>'))
    [void]$sb.AppendLine(('                            </div>'))
    [void]$sb.AppendLine(('                        </div>'))
}

$cardsHtml = $sb.ToString().TrimEnd()

$html = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

$badgeBegin = '<!-- RGBJUNKIE_AUTO:BEGIN latest-badge -->'
$badgeEnd = '<!-- RGBJUNKIE_AUTO:END latest-badge -->'
$cardsBegin = '<!-- RGBJUNKIE_AUTO:BEGIN download-cards -->'
$cardsEnd = '<!-- RGBJUNKIE_AUTO:END download-cards -->'

if ($html.IndexOf($badgeBegin, [System.StringComparison]::Ordinal) -lt 0) {
    throw "index.html is missing marker: $badgeBegin"
}
if ($html.IndexOf($cardsBegin, [System.StringComparison]::Ordinal) -lt 0) {
    throw "index.html is missing marker: $cardsBegin"
}

function Replace-MarkedRegion([string] $source, [string] $begin, [string] $end, [string] $inner) {
    $pattern = [regex]::Escape($begin) + '[\s\S]*?' + [regex]::Escape($end)
    $rx = [regex]::new($pattern, [System.Text.RegularExpressions.RegexOptions]::None)
    $m = $rx.Match($source)
    if (-not $m.Success) { throw "Could not find region between markers: $begin ... $end" }
    return $rx.Replace($source, $begin + $inner + $end, 1)
}

$badgeInner = $nl + '                        ' + $badgeHtml + $nl + '                        '
$cardsInner = $nl + $cardsHtml + $nl + '                        '
$html = Replace-MarkedRegion $html $badgeBegin $badgeEnd $badgeInner
$html = Replace-MarkedRegion $html $cardsBegin $cardsEnd $cardsInner

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($indexPath, $html, $utf8NoBom)

Write-Host ("Updated {0}: latest v{1}, {2} older release(s)." -f $indexPath, $latest.Version, $older.Count)
