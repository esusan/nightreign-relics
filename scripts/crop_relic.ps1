# 遺物スクリーンショットから2枚の遺物画像を座標指定でトリミングする
# 使い方:
#   .\crop_relic.ps1 -SourceImage "C:\path\to\screenshot.png" -OutputPrefix "..\assets\relics\guardian-gladius"
#
# 座標(X,Y,幅,高さ)は screenshot.png を一度確認してから $Regions を書き換える。
# 解像度が変わると座標もズレるので、解像度ごとに値を調整すること。

param(
    [Parameter(Mandatory = $true)][string]$SourceImage,
    [Parameter(Mandatory = $true)][string]$OutputPrefix
)

Add-Type -AssemblyName System.Drawing

# TODO: 実際のスクリーンショットを見てから座標を確定する（暫定値）
$Regions = @(
    @{ X = 0; Y = 0; Width = 200; Height = 200 },   # 遺物1
    @{ X = 220; Y = 0; Width = 200; Height = 200 }  # 遺物2
)

if (-not (Test-Path $SourceImage)) {
    throw "元画像が見つからない: $SourceImage"
}

$src = [System.Drawing.Image]::FromFile((Resolve-Path $SourceImage))

for ($i = 0; $i -lt $Regions.Count; $i++) {
    $r = $Regions[$i]
    $rect = New-Object System.Drawing.Rectangle($r.X, $r.Y, $r.Width, $r.Height)
    $bmp = New-Object System.Drawing.Bitmap($r.Width, $r.Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $r.Width, $r.Height)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $outPath = "${OutputPrefix}_$($i + 1).png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "出力: $outPath"
}

$src.Dispose()
