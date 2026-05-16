# ============================================
# NMHRUBY TOOLS - PowerShell Script
# ============================================

# Đảm bảo PowerShell hỗ trợ UTF-8 để hiển thị tiếng Việt
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

# Load Windows Forms để dùng MsgBox
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName Microsoft.VisualBasic

# Biến toàn cục
$Global:Expiry = "Chưa kích hoạt"
$Global:Expired = "Chưa kích hoạt"
$Global:ActivatedKey = ""

# ============================================
# HÀM 1: Hiển thị ASCII Rainbow Header
# ============================================
function Show-RainbowAscii {
    param([string]$Text)
    
    # ASCII Art "NMH TOOLS" font ANSI Shadow
    $ascii = @"
███╗   ██╗███╗   ███╗██╗  ██╗    ████████╗ ██████╗  ██████╗ ██╗     ███████╗
████╗  ██║████╗ ████║██║  ██║    ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
██╔██╗ ██║██╔████╔██║███████║       ██║   ██║   ██║██║   ██║██║     ███████╗
██║╚██╗██║██║╚██╔╝██║██╔══██║       ██║   ██║   ██║██║   ██║██║     ╚════██║
██║ ╚████║██║ ╚═╝ ██║██║  ██║       ██║   ╚██████╔╝╚██████╔╝███████╗███████║
╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═╝       ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
"@
    
    # 7 màu cầu vồng
    $colors = @('Red', 'Yellow', 'Green', 'Cyan', 'Blue', 'Magenta', 'White')
    $lines = $ascii -split "`n"
    
    foreach ($line in $lines) {
        $chars = $line.ToCharArray()
        for ($i = 0; $i -lt $chars.Length; $i++) {
            $color = $colors[$i % $colors.Length]
            Write-Host $chars[$i] -ForegroundColor $color -NoNewline
        }
        Write-Host ""
    }
}

# ============================================
# HÀM 2: Hiển thị thông tin hệ thống
# ============================================
function Show-SystemInfo {
    $deviceName = $env:COMPUTERNAME
    $os = Get-CimInstance Win32_OperatingSystem
    $edition = $os.Caption
    $version = $os.Version
    
    Write-Host ""
    Write-Host ("=" * 80) -ForegroundColor DarkCyan
    Write-Host " 💻 Device Name : " -ForegroundColor Yellow -NoNewline
    Write-Host $deviceName -ForegroundColor White
    Write-Host " 🪟 Edition     : " -ForegroundColor Yellow -NoNewline
    Write-Host $edition -ForegroundColor White
    Write-Host " 🔢 Version     : " -ForegroundColor Yellow -NoNewline
    Write-Host $version -ForegroundColor White
    Write-Host " ⏳ Hạn Sử Dụng : " -ForegroundColor Yellow -NoNewline
    Write-Host $Global:Expiry -ForegroundColor Green
    Write-Host " 📅 Ngày Hết Hạn: " -ForegroundColor Yellow -NoNewline
    Write-Host $Global:Expired -ForegroundColor Green
    Write-Host ("=" * 80) -ForegroundColor DarkCyan
    Write-Host ""
}

# ============================================
# HÀM 3: Hiển thị Header (Gọi 1 & 2)
# ============================================
function Show-Header {
    Clear-Host
    Show-RainbowAscii
    Show-SystemInfo
}

# ============================================
# HÀM 4: Import Key - Kiểm tra với Google Sheet
# ============================================
function Import-Key {
    # Nhập key bằng InputBox
    $inputKey = [Microsoft.VisualBasic.Interaction]::InputBox(
        "Vui lòng nhập Key kích hoạt (24 ký tự):",
        "NMHRUBY Tools - Nhập Key",
        ""
    )
    
    if ([string]::IsNullOrWhiteSpace($inputKey)) {
        [System.Windows.Forms.MessageBox]::Show(
            "Bạn chưa nhập Key!",
            "NMHRUBY Tools thông báo !",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Warning
        )
        return $false
    }
    
    $inputKey = $inputKey.Trim()
    
    # Link CSV export của Google Sheet (sheet tên: keyadmin)
    $sheetId = "1HQLBTHR5u5xc3wzB_Dr-aNtOWy4fiQW8i7YS5rCnx4I"
    $csvUrl = "https://docs.google.com/spreadsheets/d/$sheetId/gviz/tq?tqx=out:csv&sheet=keyadmin"
    
    try {
        Write-Host "🔄 Đang kiểm tra Key..." -ForegroundColor Cyan
        $csvData = Invoke-RestMethod -Uri $csvUrl -ErrorAction Stop
        $rows = $csvData | ConvertFrom-Csv
        
        $matched = $false
        foreach ($row in $rows) {
            $sheetKey = ($row.Key).Trim()
            if ($sheetKey -eq $inputKey) {
                $matched = $true
                $Global:Expiry = $row.Expiry
                $Global:Expired = $row.Expired
                $Global:ActivatedKey = $inputKey
                break
            }
        }
        
        if ($matched) {
            [System.Windows.Forms.MessageBox]::Show(
                "Key '$inputKey' của bạn đã được kích hoạt thành công, cảm ơn bạn đã tin tưởng và ủng hộ",
                "NMHRUBY Tools thông báo !",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Information
            )
            return $true
        } else {
            [System.Windows.Forms.MessageBox]::Show(
                "Key '$inputKey' của bạn đã nhập sai, Key chỉ có 24 kí tự, nếu Key lỗi vui lòng liên hệ Admin để xử lý nhanh nhất",
                "NMHRUBY Tools thông báo !",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Error
            )
            return $false
        }
    } catch {
        [System.Windows.Forms.MessageBox]::Show(
            "Không thể kết nối tới máy chủ Key!`nLỗi: $($_.Exception.Message)",
            "NMHRUBY Tools thông báo !",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return $false
    }
}

# ============================================
# HÀM 5: Menu Chính
# ============================================
function Show-MainMenu {
    while ($true) {
        Show-Header
        Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Magenta
        Write-Host "║           MENU CHÍNH - MAIN MENU         ║" -ForegroundColor Magenta
        Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Magenta
        Write-Host "║  " -ForegroundColor Magenta -NoNewline
        Write-Host "[1] " -ForegroundColor Yellow -NoNewline
        Write-Host "Import Key                           " -ForegroundColor White -NoNewline
        Write-Host "║" -ForegroundColor Magenta
        Write-Host "║  " -ForegroundColor Magenta -NoNewline
        Write-Host "[0] " -ForegroundColor Yellow -NoNewline
        Write-Host "Thoát                                " -ForegroundColor White -NoNewline
        Write-Host "║" -ForegroundColor Magenta
        Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Magenta
        Write-Host ""
        $choice = Read-Host " 👉 Mời bạn chọn"
        
        switch ($choice) {
            "1" {
                if (Import-Key) {
                    Show-SubMenu
                    return
                }
            }
            "0" {
                Write-Host "👋 Tạm biệt!" -ForegroundColor Cyan
                exit
            }
            default {
                Write-Host "❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
                Start-Sleep -Seconds 1
            }
        }
    }
}

# ============================================
# HÀM 6: Chạy lệnh với quyền Admin
# ============================================
function Invoke-AdminCommand {
    param([string]$Command, [string]$Title)
    
    Write-Host "🚀 Đang khởi chạy: $Title..." -ForegroundColor Cyan
    Write-Host "📌 Lệnh: $Command" -ForegroundColor DarkGray
    
    try {
        Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-Command", $Command
        Write-Host "✅ Đã mở cửa sổ Administrator!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 2
}

# ============================================
# HÀM 7: Menu Phụ
# ============================================
function Show-SubMenu {
    while ($true) {
        Show-Header
        Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║              MENU PHỤ - SUB MENU                 ║" -ForegroundColor Cyan
        Write-Host "╠══════════════════════════════════════════════════╣" -ForegroundColor Cyan
        Write-Host "║  " -ForegroundColor Cyan -NoNewline
        Write-Host "━━━ Group 1: Activate Windows & Office ━━━     " -ForegroundColor Yellow -NoNewline
        Write-Host "║" -ForegroundColor Cyan
        Write-Host "║  " -ForegroundColor Cyan -NoNewline
        Write-Host "[1] " -ForegroundColor Green -NoNewline
        Write-Host "Activate Windows & Office (MAS)              " -ForegroundColor White -NoNewline
        Write-Host "║" -ForegroundColor Cyan
        Write-Host "║                                                  ║" -ForegroundColor Cyan
        Write-Host "║  " -ForegroundColor Cyan -NoNewline
        Write-Host "━━━ Group 2: Installer Office ━━━━━━━━━━━━━    " -ForegroundColor Yellow -NoNewline
        Write-Host "║" -ForegroundColor Cyan
        Write-Host "║  " -ForegroundColor Cyan -NoNewline
        Write-Host "[2] " -ForegroundColor Green -NoNewline
        Write-Host "Installer Office (Office Tool Plus)          " -ForegroundColor White -NoNewline
        Write-Host "║" -ForegroundColor Cyan
        Write-Host "║                                                  ║" -ForegroundColor Cyan
        Write-Host "║  " -ForegroundColor Cyan -NoNewline
        Write-Host "[0] " -ForegroundColor Green -NoNewline
        Write-Host "Thoát                                        " -ForegroundColor White -NoNewline
        Write-Host "║" -ForegroundColor Cyan
        Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
        Write-Host ""
        $choice = Read-Host " 👉 Mời bạn chọn"
        
        switch ($choice) {
            "1" {
                Invoke-AdminCommand -Command "irm https://get.activated.win | iex" -Title "Activate Windows & Office"
            }
            "2" {
                Invoke-AdminCommand -Command "irm https://officetool.plus | iex" -Title "Installer Office"
            }
            "0" {
                Write-Host "👋 Tạm biệt! Cảm ơn bạn đã sử dụng NMHRUBY Tools!" -ForegroundColor Cyan
                exit
            }
            default {
                Write-Host "❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
                Start-Sleep -Seconds 1
            }
        }
    }
}

# ============================================
# BẮT ĐẦU CHẠY CHƯƠNG TRÌNH
# ============================================
$Host.UI.RawUI.WindowTitle = "NMHRUBY TOOLS - by NMH"
Show-MainMenu