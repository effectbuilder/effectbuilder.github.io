<#!
  Legacy helper: the live site uses index.php + includes/installers.php to scan
  downloads/nsis (*.exe) and downloads/msi (*.msi) automatically.

  This script is kept for reference only. To refresh the public page, drop new
  installer pairs into those folders; no HTML regeneration required.

  Optional: run PHP locally to verify discovery:
    php -r "require 'includes/installers.php'; print_r(rgbj_discover_installer_pairs(getcwd()));"
#>
Write-Host "Installer listing is handled by index.php (downloads/nsis + downloads/msi)." -ForegroundColor Cyan
