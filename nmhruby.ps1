#requires -version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# =========================
# CONFIG
# =========================
$Script:AppName    = "NMHRUBY Tools"
$Script:AppVer     = "1.0.0"

# Google Sheet CSV endpoint (sheet name: keyadmin)
$Script:SheetId    = "1HQLBTHR5u5xc3wzB_Dr-aNtOWy4fiQW8i7YS5rCnx4I"
$Script:SheetName  = "keyadmin"
$Script:SheetCsvUrl = "https://docs.google.com/spreadsheets/d/1HQLBTHR5u5xc3wzB_Dr-aNtOWy4fiQW8i7YS5rCnx4I/gviz/tq?tqx=out:csv&sheet=keyadmin"

# Local binding (skip nhập key ở lần sau trên cùng máy)
$Script:DataDir    = Join-Path $env:ProgramData "NMHTools"
$Script:LicensePath = Join-Path $Script:DataDir "license.json"

# =========================
# UTIL
# =========================
function Ensure-Tls12 {
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    } catch {}
}

function Get-MachineGuid {
    (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Cryptography").MachineGuid
}

function Show-MsgBox([string]$Text, [string]$Title = $Script:AppName) {
    try {
        Add-Type -AssemblyName System.Windows.Forms | Out-Null
        [System.Windows.Forms.MessageBox]::Show($Text, $Title,
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        ) | Out-Null
    } catch {
        # fallback console
        Write-Host "[$Title] $Text"
    }
}

function Parse-DateFlexible([string]$s) {
    if ([string]::IsNullOrWhiteSpace($s)) { return $null }

    $cult = [Globalization.CultureInfo]::InvariantCulture
    $styles = [Globalization.DateTimeStyles]::AssumeLocal

    $formats = @(
        "yyyy-MM-dd","yyyy/MM/dd",
        "dd/MM/yyyy","d/M/yyyy",
        "dd-MM-yyyy","d-M-yyyy",
        "MM/dd/yyyy","M/d/yyyy",
        "MM-dd-yyyy","M-d-yyyy",
        "yyyy-MM-dd HH:mm:ss","dd/MM/yyyy HH:mm:ss"
    )

    $dt = $null
    if ([DateTime]::TryParseExact($s.Trim(), $formats, $cult, $styles, [ref]$dt)) { return $dt }
    if ([DateTime]::TryParse($s.Trim(), [ref]$dt)) { return $dt }
    return $null
}

function Write-RainbowLine([string]$Line) {
    $colors = @("Red","Yellow","Green","Cyan","Blue","Magenta")
    $i = 0
    foreach ($ch in $Line.ToCharArray()) {
        $c = $colors[$i % $colors.Count]
        Write-Host -NoNewline $ch -ForegroundColor $c
        $i++
    }
    Write-Host
}

function Get-WindowsInfo {
    $cv = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"
    $product  = $cv.ProductName
    $edition  = $cv.EditionID
    $version  = $cv.DisplayVersion
    if ([string]::IsNullOrWhiteSpace($version)) { $version = $cv.ReleaseId }
    $build    = $cv.CurrentBuild
    [pscustomobject]@{
        DeviceName = $env:COMPUTERNAME
        Product    = $product
        Edition    = $edition
        Version    = $version
        Build      = $build
    }
}

function Get-KeyTable {
    Ensure-Tls12
    $csv = Invoke-RestMethod -Uri $Script:SheetCsvUrl -Method Get
    $rows = $csv | ConvertFrom-Csv
    return $rows
}

function Save-License([pscustomobject]$lic) {
    if (-not (Test-Path $Script:DataDir)) {
        New-Item -ItemType Directory -Path $Script:DataDir -Force | Out-Null
    }
    $lic | ConvertTo-Json -Depth 5 | Set-Content -Path $Script:LicensePath -Encoding UTF8
}

function Load-License {
    if (Test-Path $Script:LicensePath) {
        try {
            return (Get-Content $Script:LicensePath -Raw -Encoding UTF8 | ConvertFrom-Json)
        } catch {
            return $null
        }
    }
    return $null
}

function Clear-License {
    if (Test-Path $Script:LicensePath) { Remove-Item $Script:LicensePath -Force }
}

function Find-KeyRow($rows, [string]$key) {
    $keyTrim = $key.Trim()
    return $rows | Where-Object { ($_.Key -as [string]).Trim() -eq $keyTrim } | Select-Object -First 1
}

function Get-LicenseFromRow($row) {
    # Row columns: Key, Expiry, Expired, User
    $expiry  = ($row.Expiry  -as [string])
    $expired = ($row.Expired -as [string])
    $user    = ($row.User    -as [string])

    if ([string]::IsNullOrWhiteSpace($expiry) -or [string]::IsNullOrWhiteSpace($expired)) {
        return [pscustomobject]@{
            Status = "Exploit"
            Expiry = $expiry
            Expired = $expired
            User = $user
        }
    }

    $d1 = Parse-DateFlexible $expiry
    $d2 = Parse-DateFlexible $expired

    return [pscustomobject]@{
        Status = "OK"
        ExpiryDate  = $d1
        ExpiredDate = $d2
        ExpiryRaw   = $expiry
        ExpiredRaw  = $expired
        User        = $user
    }
}

function Format-DateOrDash($dt, $raw) {
    if ($dt) { return $dt.ToString("yyyy-MM-dd") }
    if (-not [string]::IsNullOrWhiteSpace($raw)) { return $raw.Trim() }
    return "-"
}

function Show-Header($licCached = $null) {
    Clear-Host
    $win = Get-WindowsInfo

    # ASCII (bạn có thể thay bằng đúng output ANSI Shadow bạn muốn)
    $ascii = @(
        " _   _ __  __ _   _   _____ ___   ___  _     ____  ",
        "| \ | |  \/  | | | | |_   _/ _ \ / _ \| |   / ___| ",
        "|  \| | |\/| | |_| |   | || | | | | | | |   \___ \ ",
        "| |\  | |  | |  _  |   | || |_| | |_| | |___ ___) |",
        "|_| \_|_|  |_|_| |_|   |_| \___/ \___/|_____|____/ "
    )

    foreach ($line in $ascii) { Write-RainbowLine $line }
    Write-Host ""

    # license fields
    $expiryStr  = "-"
    $expiredStr = "-"
    $userStr    = "-"

    $remainStr  = "-"
    $totalStr   = "-"

    if ($licCached -and $licCached.ExpiryRaw) {
        $expiryDt  = Parse-DateFlexible ($licCached.ExpiryRaw  -as [string])
        $expiredDt = Parse-DateFlexible ($licCached.ExpiredRaw -as [string])

        $expiryStr  = Format-DateOrDash $expiryDt  $licCached.ExpiryRaw
        $expiredStr = Format-DateOrDash $expiredDt $licCached.ExpiredRaw
        $userStr    = if ($licCached.User) { [string]$licCached.User } else { "-" }

        if ($expiryDt -and $expiredDt) {
            $total = [math]::Floor(($expiredDt - $expiryDt).TotalDays)
            $totalStr = "$total ngày"

            $remain = [math]::Ceiling(($expiredDt - (Get-Date)).TotalDays)
            if ($remain -lt 0) { $remain = 0 }
            $remainStr = "$remain ngày"
        }
    }

    Write-Host ("Device Name      : {0}" -f $win.DeviceName)
    Write-Host ("Windows          : {0}" -f $win.Product)
    Write-Host ("Edition          : {0}" -f $win.Edition)
    Write-Host ("Version/Build    : {0} / {1}" -f $win.Version, $win.Build)
    Write-Host "-----------------------------------------------"
    Write-Host ("Hạn sử dụng      : {0}" -f $expiryStr)
    Write-Host ("Ngày hết hạn     : {0}" -f $expiredStr)
    Write-Host ("User             : {0}" -f $userStr)
    Write-Host ("Số ngày còn lại  : {0}" -f $remainStr)
    Write-Host ("Tổng thời hạn    : {0}" -f $totalStr)
    Write-Host ("Phiên bản PM     : {0}" -f $Script:AppVer)
    Write-Host "-----------------------------------------------"
    Write-Host ""
}

function Validate-OrPromptKey {
    # returns license object (cached fields used by header), or $null
    $machineGuid = Get-MachineGuid
    $cached = Load-License

    # Always re-check against sheet to ensure key still exists/updated
    $rows = $null
    try {
        $rows = Get-KeyTable
    } catch {
        Show-MsgBox ("$($Script:AppName) thông báo !`nKhông thể tải dữ liệu Key từ Google Sheet. Vui lòng kiểm tra mạng hoặc quyền public của Sheet.")
        return $cached
    }

    if ($cached -and $cached.MachineGuid -eq $machineGuid -and $cached.Key) {
        $row = Find-KeyRow $rows $cached.Key
        if ($row) {
            $lic2 = Get-LicenseFromRow $row
            if ($lic2.Status -eq "Exploit") {
                Show-MsgBox ("$($Script:AppName) thông báo !`nKey '$($cached.Key)' bạn đang dùng đã cố tình sử dụng lỗ hổng, vui lòng báo lại Admin để được phần quà thích đáng !")
                Clear-License
                return $null
            }

            # update cached values from sheet
            $cached.ExpiryRaw  = $lic2.ExpiryRaw
            $cached.ExpiredRaw = $lic2.ExpiredRaw
            $cached.User       = $lic2.User
            Save-License $cached
            return $cached
        } else {
            # key revoked/removed
            Clear-License
        }
    }

    while ($true) {
        Show-Header $null
        Write-Host "MENU CHÍNH"
        Write-Host "1) Import Key"
        Write-Host "0) Thoát"
        $c = Read-Host "Chọn"

        switch ($c) {
            "0" { return $null }
            "1" {
                $key = (Read-Host "Nhập Key (24 kí tự)").Trim()

                if ($key.Length -ne 24) {
                    Show-MsgBox ("$($Script:AppName) thông báo !`nKey '$key' của bạn đã nhập sai, Key chỉ có 24 kí tự, nếu Key lỗi vui lòng liên hệ Admin để xử lý nhanh nhất")
                    continue
                }

                $row = Find-KeyRow $rows $key
                if (-not $row) {
                    Show-MsgBox ("$($Script:AppName) thông báo !`nKey '$key' của bạn đã nhập sai, Key chỉ có 24 kí tự, nếu Key lỗi vui lòng liên hệ Admin để xử lý nhanh nhất")
                    continue
                }

                $lic = Get-LicenseFromRow $row
                if ($lic.Status -eq "Exploit") {
                    Show-MsgBox ("$($Script:AppName) thông báo !`nKey '$key' bạn đang dùng đã cố tình sử dụng lỗ hổng, vui lòng báo lại Admin để được phần quà thích đáng !")
                    continue
                }

                $toCache = [pscustomobject]@{
                    MachineGuid = $machineGuid
                    Key         = $key
                    ExpiryRaw   = $lic.ExpiryRaw
                    ExpiredRaw  = $lic.ExpiredRaw
                    User        = $lic.User
                    ActivatedAt = (Get-Date).ToString("o")
                }
                Save-License $toCache

                Show-MsgBox ("$($Script:AppName) thông báo !`nKey '$key' của bạn đã được kích hoạt thành công, cảm ơn bạn đã tin tưởng và ủng hộ")
                return $toCache
            }
            default { }
        }
    }
}

function Show-SubMenu($lic) {
    while ($true) {
        Show-Header $lic
        Write-Host "MENU PHỤ"
        Write-Host "Group 1: Activate Windows & Office"
        Write-Host "1) Mở Windows Activation (hợp pháp)"
        Write-Host ""
        Write-Host "Group 2: Installer Office"
        Write-Host "2) Mở trang Office (hợp pháp)"
        Write-Host ""
        Write-Host "9) Xoá Key đã lưu trên máy này"
        Write-Host "0) Thoát"
        $c = Read-Host "Chọn"

        switch ($c) {
            "1" { Start-Process "ms-settings:activation" | Out-Null }
            "2" { Start-Process "https://www.office.com/" | Out-Null }
            "9" {
                Clear-License
                Show-MsgBox ("$($Script:AppName) thông báo !`nĐã xoá thông tin Key đã lưu trên máy.")
                return
            }
            "0" { return }
            default { }
        }
    }
}

# =========================
# MAIN
# =========================
$lic = Validate-OrPromptKey
if ($lic) {
    Show-SubMenu $lic
}
