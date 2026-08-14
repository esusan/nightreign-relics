# 遺物スクリーンショット（3840x2160、遺物儀式画面）から遺物詳細パネルを切り抜く
# 使い方:
#   .\crop_relic.ps1 -SourceImages "C:\path\to\slot1.png","C:\path\to\slot4.png" -OutputPrefix "..\assets\relics\guardian-fulghor-heolstor-straghess"
#
# 1枚目→OutputPrefix_1.png、2枚目→OutputPrefix_2.png として出力される。
# スロットを切り替えて撮った複数枚のスクショから、同じ範囲（左側の詳細パネル）を切り抜く想定。
# 解像度が3840x2160でない場合は $Region を撮り直して調整すること。

param(
    [Parameter(Mandatory = $true)][string[]]$SourceImages,
    [Parameter(Mandatory = $true)][string]$OutputPrefix
)

Add-Type -AssemblyName System.Drawing

# 3840x2160のスクショで確認済みの範囲（詳細パネル全体、下端のボタン列の線は含めない）
$Region = @{ X = 164; Y = 464; Width = 1330; Height = 1531 }

for ($i = 0; $i -lt $SourceImages.Count; $i++) {
    $source = $SourceImages[$i]
    if (-not (Test-Path $source)) {
        throw "元画像が見つからない: $source"
    }

    $src = [System.Drawing.Image]::FromFile((Resolve-Path $source))
    $rect = New-Object System.Drawing.Rectangle($Region.X, $Region.Y, $Region.Width, $Region.Height)
    $bmp = New-Object System.Drawing.Bitmap($Region.Width, $Region.Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $Region.Width, $Region.Height)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $outPath = "${OutputPrefix}_$($i + 1).png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "出力: $outPath"
}
