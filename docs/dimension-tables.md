# Dimension Tables / 尺寸對照表

Use this page when you want to find the actual Quick Latent output size without opening a CSV. The tables are generated from the same 330-combination matrix used by the ComfyUI API E2E image-size test.

這份文件是給使用者直接查尺寸的 Markdown 對照表。每一列都列出使用者從 preset 預期的 target、8 對齊並向上取整後的實際 target，以及兩者差異。

## Read This First

| Column | Meaning |
| --- | --- |
| `Output` | The actual 8-aligned sampler size from `OUTPUT_WIDTH` and `OUTPUT_HEIGHT`. |
| `Expected Target` | The original preset target after applying orientation. This is what users usually expect from the resolution setting. |
| `Actual Target` | `Output * scale_factor`, matching the node Target Size display. It is rounded to the nearest integer pixel for display/image size. |
| `Difference` | `Actual Target - Expected Target`. `0` means the final target still matches the preset target. |
| `Rounding` | `Exact` means no 8-alignment change. Rounded rows show changed axes plus output and target deltas. |

中文速讀：

| 欄位 | 意思 |
| --- | --- |
| `Output` | QuickLatent 實際輸出的 sampler 尺寸，使用 8 對齊並向上取整。 |
| `Expected Target` | 使用者從解析度 preset 直覺期待的目標尺寸。 |
| `Actual Target` | `Output * scale_factor`，也就是節點 UI 顯示的 Target Size。 |
| `Difference` | `Actual Target - Expected Target`。`0` 代表最終 target 仍等於 preset 目標。 |
| `Rounding` | `Exact` 代表沒有被 8 對齊改動；round 的列會標出被改動的軸，以及 output/target 差異。 |

## Section Index

- [1K Landscape](#1k-landscape) / [1K Portrait](#1k-portrait)
- [2K Landscape](#2k-landscape) / [2K Portrait](#2k-portrait)
- [4K Landscape](#4k-landscape) / [4K Portrait](#4k-portrait)

## Rounding Summary

Each scale has 30 combinations: `3 resolutions * 5 aspect ratios * 2 orientations`.

| Scale | Rounded up | Exact |
| --- | ---: | ---: |
| `1.0x` | 0 | 30 |
| `1.1x` | 30 | 0 |
| `1.2x` | 22 | 8 |
| `1.3x` | 30 | 0 |
| `1.4x` | 30 | 0 |
| `1.5x` | 20 | 10 |
| `1.6x` | 16 | 14 |
| `1.7x` | 30 | 0 |
| `1.8x` | 28 | 2 |
| `1.9x` | 30 | 0 |
| `2.0x` | 2 | 28 |

Across all 330 combinations, 238 combinations have an actual target different from the preset target.

After excluding `1.0x`, `1.3x`, `1.5x`, `1.7x`, and `2.0x`, these remaining scales still round up:

| Remaining Scale | Rounded up | Exact |
| --- | ---: | ---: |
| `1.1x` | 30 | 0 |
| `1.2x` | 22 | 8 |
| `1.4x` | 30 | 0 |
| `1.6x` | 16 | 14 |
| `1.8x` | 28 | 2 |
| `1.9x` | 30 | 0 |

On the excluded scales themselves:

| Excluded Scale | Rounded up | Exact |
| --- | ---: | ---: |
| `1.0x` | 0 | 30 |
| `1.3x` | 30 | 0 |
| `1.5x` | 20 | 10 |
| `1.7x` | 30 | 0 |
| `2.0x` | 2 | 28 |

## Lookup Tables

Tip: open the matching section below, then use browser search for values like `3:4` or `2.0x`.

<a id="1k-landscape"></a>
### 1K Landscape

<details>
<summary><strong>1K Landscape lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `1024x1024` | `1024x1024` | `1024x1024` | `0` | Exact |
|  | `1.1x` | `936x936` | `1024x1024` | `1030x1030` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.2x` | `856x856` | `1024x1024` | `1027x1027` | `+3W, +3H` | Round up: Width + Height<br>Output +3W, +3H<br>Target +3W, +3H |
|  | `1.3x` | `792x792` | `1024x1024` | `1030x1030` | `+6W, +6H` | Round up: Width + Height<br>Output +4W, +4H<br>Target +6W, +6H |
|  | `1.4x` | `736x736` | `1024x1024` | `1030x1030` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.5x` | `688x688` | `1024x1024` | `1032x1032` | `+8W, +8H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +8W, +8H |
|  | `1.6x` | `640x640` | `1024x1024` | `1024x1024` | `0` | Exact |
|  | `1.7x` | `608x608` | `1024x1024` | `1034x1034` | `+10W, +10H` | Round up: Width + Height<br>Output +6W, +6H<br>Target +10W, +10H |
|  | `1.8x` | `576x576` | `1024x1024` | `1037x1037` | `+13W, +13H` | Round up: Width + Height<br>Output +7W, +7H<br>Target +13W, +13H |
|  | `1.9x` | `544x544` | `1024x1024` | `1034x1034` | `+10W, +10H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +10W, +10H |
|  | `2.0x` | `512x512` | `1024x1024` | `1024x1024` | `0` | Exact |
| `2:3` | `1.0x` | `1920x1280` | `1920x1280` | `1920x1280` | `0` | Exact |
|  | `1.1x` | `1752x1168` | `1920x1280` | `1927x1285` | `+7W, +5H` | Round up: Width + Height<br>Output +7W, +4H<br>Target +7W, +5H |
|  | `1.2x` | `1600x1072` | `1920x1280` | `1920x1286` | `+6H` | Round up: Height<br>Output +5H<br>Target +6H |
|  | `1.3x` | `1480x992` | `1920x1280` | `1924x1290` | `+4W, +10H` | Round up: Width + Height<br>Output +3W, +7H<br>Target +4W, +10H |
|  | `1.4x` | `1376x920` | `1920x1280` | `1926x1288` | `+6W, +8H` | Round up: Width + Height<br>Output +5W, +6H<br>Target +6W, +8H |
|  | `1.5x` | `1280x856` | `1920x1280` | `1920x1284` | `+4H` | Round up: Height<br>Output +3H<br>Target +4H |
|  | `1.6x` | `1200x800` | `1920x1280` | `1920x1280` | `0` | Exact |
|  | `1.7x` | `1136x760` | `1920x1280` | `1931x1292` | `+11W, +12H` | Round up: Width + Height<br>Output +7W, +7H<br>Target +11W, +12H |
|  | `1.8x` | `1072x712` | `1920x1280` | `1930x1282` | `+10W, +2H` | Round up: Width + Height<br>Output +5W, +1H<br>Target +10W, +2H |
|  | `1.9x` | `1016x680` | `1920x1280` | `1930x1292` | `+10W, +12H` | Round up: Width + Height<br>Output +5W, +6H<br>Target +10W, +12H |
|  | `2.0x` | `960x640` | `1920x1280` | `1920x1280` | `0` | Exact |
| `3:4` | `1.0x` | `1920x1440` | `1920x1440` | `1920x1440` | `0` | Exact |
|  | `1.1x` | `1752x1312` | `1920x1440` | `1927x1443` | `+7W, +3H` | Round up: Width + Height<br>Output +7W, +3H<br>Target +7W, +3H |
|  | `1.2x` | `1600x1200` | `1920x1440` | `1920x1440` | `0` | Exact |
|  | `1.3x` | `1480x1112` | `1920x1440` | `1924x1446` | `+4W, +6H` | Round up: Width + Height<br>Output +3W, +4H<br>Target +4W, +6H |
|  | `1.4x` | `1376x1032` | `1920x1440` | `1926x1445` | `+6W, +5H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +6W, +5H |
|  | `1.5x` | `1280x960` | `1920x1440` | `1920x1440` | `0` | Exact |
|  | `1.6x` | `1200x904` | `1920x1440` | `1920x1446` | `+6H` | Round up: Height<br>Output +4H<br>Target +6H |
|  | `1.7x` | `1136x848` | `1920x1440` | `1931x1442` | `+11W, +2H` | Round up: Width + Height<br>Output +7W, +1H<br>Target +11W, +2H |
|  | `1.8x` | `1072x800` | `1920x1440` | `1930x1440` | `+10W` | Round up: Width<br>Output +5W<br>Target +10W |
|  | `1.9x` | `1016x760` | `1920x1440` | `1930x1444` | `+10W, +4H` | Round up: Width + Height<br>Output +5W, +2H<br>Target +10W, +4H |
|  | `2.0x` | `960x720` | `1920x1440` | `1920x1440` | `0` | Exact |
| `16:9` | `1.0x` | `1920x1080` | `1920x1080` | `1920x1080` | `0` | Exact |
|  | `1.1x` | `1752x984` | `1920x1080` | `1927x1082` | `+7W, +2H` | Round up: Width + Height<br>Output +7W, +2H<br>Target +7W, +2H |
|  | `1.2x` | `1600x904` | `1920x1080` | `1920x1085` | `+5H` | Round up: Height<br>Output +4H<br>Target +5H |
|  | `1.3x` | `1480x832` | `1920x1080` | `1924x1082` | `+4W, +2H` | Round up: Width + Height<br>Output +3W, +1H<br>Target +4W, +2H |
|  | `1.4x` | `1376x776` | `1920x1080` | `1926x1086` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.5x` | `1280x720` | `1920x1080` | `1920x1080` | `0` | Exact |
|  | `1.6x` | `1200x680` | `1920x1080` | `1920x1088` | `+8H` | Round up: Height<br>Output +5H<br>Target +8H |
|  | `1.7x` | `1136x640` | `1920x1080` | `1931x1088` | `+11W, +8H` | Round up: Width + Height<br>Output +7W, +5H<br>Target +11W, +8H |
|  | `1.8x` | `1072x600` | `1920x1080` | `1930x1080` | `+10W` | Round up: Width<br>Output +5W<br>Target +10W |
|  | `1.9x` | `1016x576` | `1920x1080` | `1930x1094` | `+10W, +14H` | Round up: Width + Height<br>Output +5W, +8H<br>Target +10W, +14H |
|  | `2.0x` | `960x544` | `1920x1080` | `1920x1088` | `+8H` | Round up: Height<br>Output +4H<br>Target +8H |
| `21:9` | `1.0x` | `2560x1088` | `2560x1088` | `2560x1088` | `0` | Exact |
|  | `1.1x` | `2328x992` | `2560x1088` | `2561x1091` | `+1W, +3H` | Round up: Width + Height<br>Output +1W, +3H<br>Target +1W, +3H |
|  | `1.2x` | `2136x912` | `2560x1088` | `2563x1094` | `+3W, +6H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +3W, +6H |
|  | `1.3x` | `1976x840` | `2560x1088` | `2569x1092` | `+9W, +4H` | Round up: Width + Height<br>Output +7W, +3H<br>Target +9W, +4H |
|  | `1.4x` | `1832x784` | `2560x1088` | `2565x1098` | `+5W, +10H` | Round up: Width + Height<br>Output +3W, +7H<br>Target +5W, +10H |
|  | `1.5x` | `1712x728` | `2560x1088` | `2568x1092` | `+8W, +4H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +8W, +4H |
|  | `1.6x` | `1600x680` | `2560x1088` | `2560x1088` | `0` | Exact |
|  | `1.7x` | `1512x640` | `2560x1088` | `2570x1088` | `+10W` | Round up: Width<br>Output +6W<br>Target +10W |
|  | `1.8x` | `1424x608` | `2560x1088` | `2563x1094` | `+3W, +6H` | Round up: Width + Height<br>Output +2W, +4H<br>Target +3W, +6H |
|  | `1.9x` | `1352x576` | `2560x1088` | `2569x1094` | `+9W, +6H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +9W, +6H |
|  | `2.0x` | `1280x544` | `2560x1088` | `2560x1088` | `0` | Exact |

</details>

<a id="1k-portrait"></a>
### 1K Portrait

<details>
<summary><strong>1K Portrait lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `1024x1024` | `1024x1024` | `1024x1024` | `0` | Exact |
|  | `1.1x` | `936x936` | `1024x1024` | `1030x1030` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.2x` | `856x856` | `1024x1024` | `1027x1027` | `+3W, +3H` | Round up: Width + Height<br>Output +3W, +3H<br>Target +3W, +3H |
|  | `1.3x` | `792x792` | `1024x1024` | `1030x1030` | `+6W, +6H` | Round up: Width + Height<br>Output +4W, +4H<br>Target +6W, +6H |
|  | `1.4x` | `736x736` | `1024x1024` | `1030x1030` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.5x` | `688x688` | `1024x1024` | `1032x1032` | `+8W, +8H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +8W, +8H |
|  | `1.6x` | `640x640` | `1024x1024` | `1024x1024` | `0` | Exact |
|  | `1.7x` | `608x608` | `1024x1024` | `1034x1034` | `+10W, +10H` | Round up: Width + Height<br>Output +6W, +6H<br>Target +10W, +10H |
|  | `1.8x` | `576x576` | `1024x1024` | `1037x1037` | `+13W, +13H` | Round up: Width + Height<br>Output +7W, +7H<br>Target +13W, +13H |
|  | `1.9x` | `544x544` | `1024x1024` | `1034x1034` | `+10W, +10H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +10W, +10H |
|  | `2.0x` | `512x512` | `1024x1024` | `1024x1024` | `0` | Exact |
| `2:3` | `1.0x` | `1280x1920` | `1280x1920` | `1280x1920` | `0` | Exact |
|  | `1.1x` | `1168x1752` | `1280x1920` | `1285x1927` | `+5W, +7H` | Round up: Width + Height<br>Output +4W, +7H<br>Target +5W, +7H |
|  | `1.2x` | `1072x1600` | `1280x1920` | `1286x1920` | `+6W` | Round up: Width<br>Output +5W<br>Target +6W |
|  | `1.3x` | `992x1480` | `1280x1920` | `1290x1924` | `+10W, +4H` | Round up: Width + Height<br>Output +7W, +3H<br>Target +10W, +4H |
|  | `1.4x` | `920x1376` | `1280x1920` | `1288x1926` | `+8W, +6H` | Round up: Width + Height<br>Output +6W, +5H<br>Target +8W, +6H |
|  | `1.5x` | `856x1280` | `1280x1920` | `1284x1920` | `+4W` | Round up: Width<br>Output +3W<br>Target +4W |
|  | `1.6x` | `800x1200` | `1280x1920` | `1280x1920` | `0` | Exact |
|  | `1.7x` | `760x1136` | `1280x1920` | `1292x1931` | `+12W, +11H` | Round up: Width + Height<br>Output +7W, +7H<br>Target +12W, +11H |
|  | `1.8x` | `712x1072` | `1280x1920` | `1282x1930` | `+2W, +10H` | Round up: Width + Height<br>Output +1W, +5H<br>Target +2W, +10H |
|  | `1.9x` | `680x1016` | `1280x1920` | `1292x1930` | `+12W, +10H` | Round up: Width + Height<br>Output +6W, +5H<br>Target +12W, +10H |
|  | `2.0x` | `640x960` | `1280x1920` | `1280x1920` | `0` | Exact |
| `3:4` | `1.0x` | `1440x1920` | `1440x1920` | `1440x1920` | `0` | Exact |
|  | `1.1x` | `1312x1752` | `1440x1920` | `1443x1927` | `+3W, +7H` | Round up: Width + Height<br>Output +3W, +7H<br>Target +3W, +7H |
|  | `1.2x` | `1200x1600` | `1440x1920` | `1440x1920` | `0` | Exact |
|  | `1.3x` | `1112x1480` | `1440x1920` | `1446x1924` | `+6W, +4H` | Round up: Width + Height<br>Output +4W, +3H<br>Target +6W, +4H |
|  | `1.4x` | `1032x1376` | `1440x1920` | `1445x1926` | `+5W, +6H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +5W, +6H |
|  | `1.5x` | `960x1280` | `1440x1920` | `1440x1920` | `0` | Exact |
|  | `1.6x` | `904x1200` | `1440x1920` | `1446x1920` | `+6W` | Round up: Width<br>Output +4W<br>Target +6W |
|  | `1.7x` | `848x1136` | `1440x1920` | `1442x1931` | `+2W, +11H` | Round up: Width + Height<br>Output +1W, +7H<br>Target +2W, +11H |
|  | `1.8x` | `800x1072` | `1440x1920` | `1440x1930` | `+10H` | Round up: Height<br>Output +5H<br>Target +10H |
|  | `1.9x` | `760x1016` | `1440x1920` | `1444x1930` | `+4W, +10H` | Round up: Width + Height<br>Output +2W, +5H<br>Target +4W, +10H |
|  | `2.0x` | `720x960` | `1440x1920` | `1440x1920` | `0` | Exact |
| `16:9` | `1.0x` | `1080x1920` | `1080x1920` | `1080x1920` | `0` | Exact |
|  | `1.1x` | `984x1752` | `1080x1920` | `1082x1927` | `+2W, +7H` | Round up: Width + Height<br>Output +2W, +7H<br>Target +2W, +7H |
|  | `1.2x` | `904x1600` | `1080x1920` | `1085x1920` | `+5W` | Round up: Width<br>Output +4W<br>Target +5W |
|  | `1.3x` | `832x1480` | `1080x1920` | `1082x1924` | `+2W, +4H` | Round up: Width + Height<br>Output +1W, +3H<br>Target +2W, +4H |
|  | `1.4x` | `776x1376` | `1080x1920` | `1086x1926` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.5x` | `720x1280` | `1080x1920` | `1080x1920` | `0` | Exact |
|  | `1.6x` | `680x1200` | `1080x1920` | `1088x1920` | `+8W` | Round up: Width<br>Output +5W<br>Target +8W |
|  | `1.7x` | `640x1136` | `1080x1920` | `1088x1931` | `+8W, +11H` | Round up: Width + Height<br>Output +5W, +7H<br>Target +8W, +11H |
|  | `1.8x` | `600x1072` | `1080x1920` | `1080x1930` | `+10H` | Round up: Height<br>Output +5H<br>Target +10H |
|  | `1.9x` | `576x1016` | `1080x1920` | `1094x1930` | `+14W, +10H` | Round up: Width + Height<br>Output +8W, +5H<br>Target +14W, +10H |
|  | `2.0x` | `544x960` | `1080x1920` | `1088x1920` | `+8W` | Round up: Width<br>Output +4W<br>Target +8W |
| `21:9` | `1.0x` | `1088x2560` | `1088x2560` | `1088x2560` | `0` | Exact |
|  | `1.1x` | `992x2328` | `1088x2560` | `1091x2561` | `+3W, +1H` | Round up: Width + Height<br>Output +3W, +1H<br>Target +3W, +1H |
|  | `1.2x` | `912x2136` | `1088x2560` | `1094x2563` | `+6W, +3H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +6W, +3H |
|  | `1.3x` | `840x1976` | `1088x2560` | `1092x2569` | `+4W, +9H` | Round up: Width + Height<br>Output +3W, +7H<br>Target +4W, +9H |
|  | `1.4x` | `784x1832` | `1088x2560` | `1098x2565` | `+10W, +5H` | Round up: Width + Height<br>Output +7W, +3H<br>Target +10W, +5H |
|  | `1.5x` | `728x1712` | `1088x2560` | `1092x2568` | `+4W, +8H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +4W, +8H |
|  | `1.6x` | `680x1600` | `1088x2560` | `1088x2560` | `0` | Exact |
|  | `1.7x` | `640x1512` | `1088x2560` | `1088x2570` | `+10H` | Round up: Height<br>Output +6H<br>Target +10H |
|  | `1.8x` | `608x1424` | `1088x2560` | `1094x2563` | `+6W, +3H` | Round up: Width + Height<br>Output +4W, +2H<br>Target +6W, +3H |
|  | `1.9x` | `576x1352` | `1088x2560` | `1094x2569` | `+6W, +9H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +6W, +9H |
|  | `2.0x` | `544x1280` | `1088x2560` | `1088x2560` | `0` | Exact |

</details>

<a id="2k-landscape"></a>
### 2K Landscape

<details>
<summary><strong>2K Landscape lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `2048x2048` | `2048x2048` | `2048x2048` | `0` | Exact |
|  | `1.1x` | `1864x1864` | `2048x2048` | `2050x2050` | `+2W, +2H` | Round up: Width + Height<br>Output +2W, +2H<br>Target +2W, +2H |
|  | `1.2x` | `1712x1712` | `2048x2048` | `2054x2054` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.3x` | `1576x1576` | `2048x2048` | `2049x2049` | `+1W, +1H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +1W, +1H |
|  | `1.4x` | `1464x1464` | `2048x2048` | `2050x2050` | `+2W, +2H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +2W, +2H |
|  | `1.5x` | `1368x1368` | `2048x2048` | `2052x2052` | `+4W, +4H` | Round up: Width + Height<br>Output +3W, +3H<br>Target +4W, +4H |
|  | `1.6x` | `1280x1280` | `2048x2048` | `2048x2048` | `0` | Exact |
|  | `1.7x` | `1208x1208` | `2048x2048` | `2054x2054` | `+6W, +6H` | Round up: Width + Height<br>Output +3W, +3H<br>Target +6W, +6H |
|  | `1.8x` | `1144x1144` | `2048x2048` | `2059x2059` | `+11W, +11H` | Round up: Width + Height<br>Output +6W, +6H<br>Target +11W, +11H |
|  | `1.9x` | `1080x1080` | `2048x2048` | `2052x2052` | `+4W, +4H` | Round up: Width + Height<br>Output +2W, +2H<br>Target +4W, +4H |
|  | `2.0x` | `1024x1024` | `2048x2048` | `2048x2048` | `0` | Exact |
| `2:3` | `1.0x` | `2560x1712` | `2560x1712` | `2560x1712` | `0` | Exact |
|  | `1.1x` | `2328x1560` | `2560x1712` | `2561x1716` | `+1W, +4H` | Round up: Width + Height<br>Output +1W, +4H<br>Target +1W, +4H |
|  | `1.2x` | `2136x1432` | `2560x1712` | `2563x1718` | `+3W, +6H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +3W, +6H |
|  | `1.3x` | `1976x1320` | `2560x1712` | `2569x1716` | `+9W, +4H` | Round up: Width + Height<br>Output +7W, +3H<br>Target +9W, +4H |
|  | `1.4x` | `1832x1224` | `2560x1712` | `2565x1714` | `+5W, +2H` | Round up: Width + Height<br>Output +3W, +1H<br>Target +5W, +2H |
|  | `1.5x` | `1712x1144` | `2560x1712` | `2568x1716` | `+8W, +4H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +8W, +4H |
|  | `1.6x` | `1600x1072` | `2560x1712` | `2560x1715` | `+3H` | Round up: Height<br>Output +2H<br>Target +3H |
|  | `1.7x` | `1512x1008` | `2560x1712` | `2570x1714` | `+10W, +2H` | Round up: Width + Height<br>Output +6W, +1H<br>Target +10W, +2H |
|  | `1.8x` | `1424x952` | `2560x1712` | `2563x1714` | `+3W, +2H` | Round up: Width + Height<br>Output +2W, +1H<br>Target +3W, +2H |
|  | `1.9x` | `1352x904` | `2560x1712` | `2569x1718` | `+9W, +6H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +9W, +6H |
|  | `2.0x` | `1280x856` | `2560x1712` | `2560x1712` | `0` | Exact |
| `3:4` | `1.0x` | `2560x1920` | `2560x1920` | `2560x1920` | `0` | Exact |
|  | `1.1x` | `2328x1752` | `2560x1920` | `2561x1927` | `+1W, +7H` | Round up: Width + Height<br>Output +1W, +7H<br>Target +1W, +7H |
|  | `1.2x` | `2136x1600` | `2560x1920` | `2563x1920` | `+3W` | Round up: Width<br>Output +3W<br>Target +3W |
|  | `1.3x` | `1976x1480` | `2560x1920` | `2569x1924` | `+9W, +4H` | Round up: Width + Height<br>Output +7W, +3H<br>Target +9W, +4H |
|  | `1.4x` | `1832x1376` | `2560x1920` | `2565x1926` | `+5W, +6H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +5W, +6H |
|  | `1.5x` | `1712x1280` | `2560x1920` | `2568x1920` | `+8W` | Round up: Width<br>Output +5W<br>Target +8W |
|  | `1.6x` | `1600x1200` | `2560x1920` | `2560x1920` | `0` | Exact |
|  | `1.7x` | `1512x1136` | `2560x1920` | `2570x1931` | `+10W, +11H` | Round up: Width + Height<br>Output +6W, +7H<br>Target +10W, +11H |
|  | `1.8x` | `1424x1072` | `2560x1920` | `2563x1930` | `+3W, +10H` | Round up: Width + Height<br>Output +2W, +5H<br>Target +3W, +10H |
|  | `1.9x` | `1352x1016` | `2560x1920` | `2569x1930` | `+9W, +10H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +9W, +10H |
|  | `2.0x` | `1280x960` | `2560x1920` | `2560x1920` | `0` | Exact |
| `16:9` | `1.0x` | `2560x1440` | `2560x1440` | `2560x1440` | `0` | Exact |
|  | `1.1x` | `2328x1312` | `2560x1440` | `2561x1443` | `+1W, +3H` | Round up: Width + Height<br>Output +1W, +3H<br>Target +1W, +3H |
|  | `1.2x` | `2136x1200` | `2560x1440` | `2563x1440` | `+3W` | Round up: Width<br>Output +3W<br>Target +3W |
|  | `1.3x` | `1976x1112` | `2560x1440` | `2569x1446` | `+9W, +6H` | Round up: Width + Height<br>Output +7W, +4H<br>Target +9W, +6H |
|  | `1.4x` | `1832x1032` | `2560x1440` | `2565x1445` | `+5W, +5H` | Round up: Width + Height<br>Output +3W, +3H<br>Target +5W, +5H |
|  | `1.5x` | `1712x960` | `2560x1440` | `2568x1440` | `+8W` | Round up: Width<br>Output +5W<br>Target +8W |
|  | `1.6x` | `1600x904` | `2560x1440` | `2560x1446` | `+6H` | Round up: Height<br>Output +4H<br>Target +6H |
|  | `1.7x` | `1512x848` | `2560x1440` | `2570x1442` | `+10W, +2H` | Round up: Width + Height<br>Output +6W, +1H<br>Target +10W, +2H |
|  | `1.8x` | `1424x800` | `2560x1440` | `2563x1440` | `+3W` | Round up: Width<br>Output +2W<br>Target +3W |
|  | `1.9x` | `1352x760` | `2560x1440` | `2569x1444` | `+9W, +4H` | Round up: Width + Height<br>Output +5W, +2H<br>Target +9W, +4H |
|  | `2.0x` | `1280x720` | `2560x1440` | `2560x1440` | `0` | Exact |
| `21:9` | `1.0x` | `3440x1440` | `3440x1440` | `3440x1440` | `0` | Exact |
|  | `1.1x` | `3128x1312` | `3440x1440` | `3441x1443` | `+1W, +3H` | Round up: Width + Height<br>Output +1W, +3H<br>Target +1W, +3H |
|  | `1.2x` | `2872x1200` | `3440x1440` | `3446x1440` | `+6W` | Round up: Width<br>Output +5W<br>Target +6W |
|  | `1.3x` | `2648x1112` | `3440x1440` | `3442x1446` | `+2W, +6H` | Round up: Width + Height<br>Output +2W, +4H<br>Target +2W, +6H |
|  | `1.4x` | `2464x1032` | `3440x1440` | `3450x1445` | `+10W, +5H` | Round up: Width + Height<br>Output +7W, +3H<br>Target +10W, +5H |
|  | `1.5x` | `2296x960` | `3440x1440` | `3444x1440` | `+4W` | Round up: Width<br>Output +3W<br>Target +4W |
|  | `1.6x` | `2152x904` | `3440x1440` | `3443x1446` | `+3W, +6H` | Round up: Width + Height<br>Output +2W, +4H<br>Target +3W, +6H |
|  | `1.7x` | `2024x848` | `3440x1440` | `3441x1442` | `+1W, +2H` | Round up: Width + Height<br>Output +1H<br>Target +1W, +2H |
|  | `1.8x` | `1912x800` | `3440x1440` | `3442x1440` | `+2W` | Round up: Width<br>Output +1W<br>Target +2W |
|  | `1.9x` | `1816x760` | `3440x1440` | `3450x1444` | `+10W, +4H` | Round up: Width + Height<br>Output +5W, +2H<br>Target +10W, +4H |
|  | `2.0x` | `1720x720` | `3440x1440` | `3440x1440` | `0` | Exact |

</details>

<a id="2k-portrait"></a>
### 2K Portrait

<details>
<summary><strong>2K Portrait lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `2048x2048` | `2048x2048` | `2048x2048` | `0` | Exact |
|  | `1.1x` | `1864x1864` | `2048x2048` | `2050x2050` | `+2W, +2H` | Round up: Width + Height<br>Output +2W, +2H<br>Target +2W, +2H |
|  | `1.2x` | `1712x1712` | `2048x2048` | `2054x2054` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.3x` | `1576x1576` | `2048x2048` | `2049x2049` | `+1W, +1H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +1W, +1H |
|  | `1.4x` | `1464x1464` | `2048x2048` | `2050x2050` | `+2W, +2H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +2W, +2H |
|  | `1.5x` | `1368x1368` | `2048x2048` | `2052x2052` | `+4W, +4H` | Round up: Width + Height<br>Output +3W, +3H<br>Target +4W, +4H |
|  | `1.6x` | `1280x1280` | `2048x2048` | `2048x2048` | `0` | Exact |
|  | `1.7x` | `1208x1208` | `2048x2048` | `2054x2054` | `+6W, +6H` | Round up: Width + Height<br>Output +3W, +3H<br>Target +6W, +6H |
|  | `1.8x` | `1144x1144` | `2048x2048` | `2059x2059` | `+11W, +11H` | Round up: Width + Height<br>Output +6W, +6H<br>Target +11W, +11H |
|  | `1.9x` | `1080x1080` | `2048x2048` | `2052x2052` | `+4W, +4H` | Round up: Width + Height<br>Output +2W, +2H<br>Target +4W, +4H |
|  | `2.0x` | `1024x1024` | `2048x2048` | `2048x2048` | `0` | Exact |
| `2:3` | `1.0x` | `1712x2560` | `1712x2560` | `1712x2560` | `0` | Exact |
|  | `1.1x` | `1560x2328` | `1712x2560` | `1716x2561` | `+4W, +1H` | Round up: Width + Height<br>Output +4W, +1H<br>Target +4W, +1H |
|  | `1.2x` | `1432x2136` | `1712x2560` | `1718x2563` | `+6W, +3H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +6W, +3H |
|  | `1.3x` | `1320x1976` | `1712x2560` | `1716x2569` | `+4W, +9H` | Round up: Width + Height<br>Output +3W, +7H<br>Target +4W, +9H |
|  | `1.4x` | `1224x1832` | `1712x2560` | `1714x2565` | `+2W, +5H` | Round up: Width + Height<br>Output +1W, +3H<br>Target +2W, +5H |
|  | `1.5x` | `1144x1712` | `1712x2560` | `1716x2568` | `+4W, +8H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +4W, +8H |
|  | `1.6x` | `1072x1600` | `1712x2560` | `1715x2560` | `+3W` | Round up: Width<br>Output +2W<br>Target +3W |
|  | `1.7x` | `1008x1512` | `1712x2560` | `1714x2570` | `+2W, +10H` | Round up: Width + Height<br>Output +1W, +6H<br>Target +2W, +10H |
|  | `1.8x` | `952x1424` | `1712x2560` | `1714x2563` | `+2W, +3H` | Round up: Width + Height<br>Output +1W, +2H<br>Target +2W, +3H |
|  | `1.9x` | `904x1352` | `1712x2560` | `1718x2569` | `+6W, +9H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +6W, +9H |
|  | `2.0x` | `856x1280` | `1712x2560` | `1712x2560` | `0` | Exact |
| `3:4` | `1.0x` | `1920x2560` | `1920x2560` | `1920x2560` | `0` | Exact |
|  | `1.1x` | `1752x2328` | `1920x2560` | `1927x2561` | `+7W, +1H` | Round up: Width + Height<br>Output +7W, +1H<br>Target +7W, +1H |
|  | `1.2x` | `1600x2136` | `1920x2560` | `1920x2563` | `+3H` | Round up: Height<br>Output +3H<br>Target +3H |
|  | `1.3x` | `1480x1976` | `1920x2560` | `1924x2569` | `+4W, +9H` | Round up: Width + Height<br>Output +3W, +7H<br>Target +4W, +9H |
|  | `1.4x` | `1376x1832` | `1920x2560` | `1926x2565` | `+6W, +5H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +6W, +5H |
|  | `1.5x` | `1280x1712` | `1920x2560` | `1920x2568` | `+8H` | Round up: Height<br>Output +5H<br>Target +8H |
|  | `1.6x` | `1200x1600` | `1920x2560` | `1920x2560` | `0` | Exact |
|  | `1.7x` | `1136x1512` | `1920x2560` | `1931x2570` | `+11W, +10H` | Round up: Width + Height<br>Output +7W, +6H<br>Target +11W, +10H |
|  | `1.8x` | `1072x1424` | `1920x2560` | `1930x2563` | `+10W, +3H` | Round up: Width + Height<br>Output +5W, +2H<br>Target +10W, +3H |
|  | `1.9x` | `1016x1352` | `1920x2560` | `1930x2569` | `+10W, +9H` | Round up: Width + Height<br>Output +5W, +5H<br>Target +10W, +9H |
|  | `2.0x` | `960x1280` | `1920x2560` | `1920x2560` | `0` | Exact |
| `16:9` | `1.0x` | `1440x2560` | `1440x2560` | `1440x2560` | `0` | Exact |
|  | `1.1x` | `1312x2328` | `1440x2560` | `1443x2561` | `+3W, +1H` | Round up: Width + Height<br>Output +3W, +1H<br>Target +3W, +1H |
|  | `1.2x` | `1200x2136` | `1440x2560` | `1440x2563` | `+3H` | Round up: Height<br>Output +3H<br>Target +3H |
|  | `1.3x` | `1112x1976` | `1440x2560` | `1446x2569` | `+6W, +9H` | Round up: Width + Height<br>Output +4W, +7H<br>Target +6W, +9H |
|  | `1.4x` | `1032x1832` | `1440x2560` | `1445x2565` | `+5W, +5H` | Round up: Width + Height<br>Output +3W, +3H<br>Target +5W, +5H |
|  | `1.5x` | `960x1712` | `1440x2560` | `1440x2568` | `+8H` | Round up: Height<br>Output +5H<br>Target +8H |
|  | `1.6x` | `904x1600` | `1440x2560` | `1446x2560` | `+6W` | Round up: Width<br>Output +4W<br>Target +6W |
|  | `1.7x` | `848x1512` | `1440x2560` | `1442x2570` | `+2W, +10H` | Round up: Width + Height<br>Output +1W, +6H<br>Target +2W, +10H |
|  | `1.8x` | `800x1424` | `1440x2560` | `1440x2563` | `+3H` | Round up: Height<br>Output +2H<br>Target +3H |
|  | `1.9x` | `760x1352` | `1440x2560` | `1444x2569` | `+4W, +9H` | Round up: Width + Height<br>Output +2W, +5H<br>Target +4W, +9H |
|  | `2.0x` | `720x1280` | `1440x2560` | `1440x2560` | `0` | Exact |
| `21:9` | `1.0x` | `1440x3440` | `1440x3440` | `1440x3440` | `0` | Exact |
|  | `1.1x` | `1312x3128` | `1440x3440` | `1443x3441` | `+3W, +1H` | Round up: Width + Height<br>Output +3W, +1H<br>Target +3W, +1H |
|  | `1.2x` | `1200x2872` | `1440x3440` | `1440x3446` | `+6H` | Round up: Height<br>Output +5H<br>Target +6H |
|  | `1.3x` | `1112x2648` | `1440x3440` | `1446x3442` | `+6W, +2H` | Round up: Width + Height<br>Output +4W, +2H<br>Target +6W, +2H |
|  | `1.4x` | `1032x2464` | `1440x3440` | `1445x3450` | `+5W, +10H` | Round up: Width + Height<br>Output +3W, +7H<br>Target +5W, +10H |
|  | `1.5x` | `960x2296` | `1440x3440` | `1440x3444` | `+4H` | Round up: Height<br>Output +3H<br>Target +4H |
|  | `1.6x` | `904x2152` | `1440x3440` | `1446x3443` | `+6W, +3H` | Round up: Width + Height<br>Output +4W, +2H<br>Target +6W, +3H |
|  | `1.7x` | `848x2024` | `1440x3440` | `1442x3441` | `+2W, +1H` | Round up: Width + Height<br>Output +1W<br>Target +2W, +1H |
|  | `1.8x` | `800x1912` | `1440x3440` | `1440x3442` | `+2H` | Round up: Height<br>Output +1H<br>Target +2H |
|  | `1.9x` | `760x1816` | `1440x3440` | `1444x3450` | `+4W, +10H` | Round up: Width + Height<br>Output +2W, +5H<br>Target +4W, +10H |
|  | `2.0x` | `720x1720` | `1440x3440` | `1440x3440` | `0` | Exact |

</details>

<a id="4k-landscape"></a>
### 4K Landscape

<details>
<summary><strong>4K Landscape lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `2160x2160` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.1x` | `1968x1968` | `2160x2160` | `2165x2165` | `+5W, +5H` | Round up: Width + Height<br>Output +4W, +4H<br>Target +5W, +5H |
|  | `1.2x` | `1800x1800` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.3x` | `1664x1664` | `2160x2160` | `2163x2163` | `+3W, +3H` | Round up: Width + Height<br>Output +2W, +2H<br>Target +3W, +3H |
|  | `1.4x` | `1544x1544` | `2160x2160` | `2162x2162` | `+2W, +2H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +2W, +2H |
|  | `1.5x` | `1440x1440` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.6x` | `1352x1352` | `2160x2160` | `2163x2163` | `+3W, +3H` | Round up: Width + Height<br>Output +2W, +2H<br>Target +3W, +3H |
|  | `1.7x` | `1272x1272` | `2160x2160` | `2162x2162` | `+2W, +2H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +2W, +2H |
|  | `1.8x` | `1200x1200` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.9x` | `1144x1144` | `2160x2160` | `2174x2174` | `+14W, +14H` | Round up: Width + Height<br>Output +7W, +7H<br>Target +14W, +14H |
|  | `2.0x` | `1080x1080` | `2160x2160` | `2160x2160` | `0` | Exact |
| `2:3` | `1.0x` | `3840x2560` | `3840x2560` | `3840x2560` | `0` | Exact |
|  | `1.1x` | `3496x2328` | `3840x2560` | `3846x2561` | `+6W, +1H` | Round up: Width + Height<br>Output +5W, +1H<br>Target +6W, +1H |
|  | `1.2x` | `3200x2136` | `3840x2560` | `3840x2563` | `+3H` | Round up: Height<br>Output +3H<br>Target +3H |
|  | `1.3x` | `2960x1976` | `3840x2560` | `3848x2569` | `+8W, +9H` | Round up: Width + Height<br>Output +6W, +7H<br>Target +8W, +9H |
|  | `1.4x` | `2744x1832` | `3840x2560` | `3842x2565` | `+2W, +5H` | Round up: Width + Height<br>Output +1W, +3H<br>Target +2W, +5H |
|  | `1.5x` | `2560x1712` | `3840x2560` | `3840x2568` | `+8H` | Round up: Height<br>Output +5H<br>Target +8H |
|  | `1.6x` | `2400x1600` | `3840x2560` | `3840x2560` | `0` | Exact |
|  | `1.7x` | `2264x1512` | `3840x2560` | `3849x2570` | `+9W, +10H` | Round up: Width + Height<br>Output +5W, +6H<br>Target +9W, +10H |
|  | `1.8x` | `2136x1424` | `3840x2560` | `3845x2563` | `+5W, +3H` | Round up: Width + Height<br>Output +3W, +2H<br>Target +5W, +3H |
|  | `1.9x` | `2024x1352` | `3840x2560` | `3846x2569` | `+6W, +9H` | Round up: Width + Height<br>Output +3W, +5H<br>Target +6W, +9H |
|  | `2.0x` | `1920x1280` | `3840x2560` | `3840x2560` | `0` | Exact |
| `3:4` | `1.0x` | `3840x2880` | `3840x2880` | `3840x2880` | `0` | Exact |
|  | `1.1x` | `3496x2624` | `3840x2880` | `3846x2886` | `+6W, +6H` | Round up: Width + Height<br>Output +5W, +6H<br>Target +6W, +6H |
|  | `1.2x` | `3200x2400` | `3840x2880` | `3840x2880` | `0` | Exact |
|  | `1.3x` | `2960x2216` | `3840x2880` | `3848x2881` | `+8W, +1H` | Round up: Width + Height<br>Output +6W, +1H<br>Target +8W, +1H |
|  | `1.4x` | `2744x2064` | `3840x2880` | `3842x2890` | `+2W, +10H` | Round up: Width + Height<br>Output +1W, +7H<br>Target +2W, +10H |
|  | `1.5x` | `2560x1920` | `3840x2880` | `3840x2880` | `0` | Exact |
|  | `1.6x` | `2400x1800` | `3840x2880` | `3840x2880` | `0` | Exact |
|  | `1.7x` | `2264x1696` | `3840x2880` | `3849x2883` | `+9W, +3H` | Round up: Width + Height<br>Output +5W, +2H<br>Target +9W, +3H |
|  | `1.8x` | `2136x1600` | `3840x2880` | `3845x2880` | `+5W` | Round up: Width<br>Output +3W<br>Target +5W |
|  | `1.9x` | `2024x1520` | `3840x2880` | `3846x2888` | `+6W, +8H` | Round up: Width + Height<br>Output +3W, +4H<br>Target +6W, +8H |
|  | `2.0x` | `1920x1440` | `3840x2880` | `3840x2880` | `0` | Exact |
| `16:9` | `1.0x` | `3840x2160` | `3840x2160` | `3840x2160` | `0` | Exact |
|  | `1.1x` | `3496x1968` | `3840x2160` | `3846x2165` | `+6W, +5H` | Round up: Width + Height<br>Output +5W, +4H<br>Target +6W, +5H |
|  | `1.2x` | `3200x1800` | `3840x2160` | `3840x2160` | `0` | Exact |
|  | `1.3x` | `2960x1664` | `3840x2160` | `3848x2163` | `+8W, +3H` | Round up: Width + Height<br>Output +6W, +2H<br>Target +8W, +3H |
|  | `1.4x` | `2744x1544` | `3840x2160` | `3842x2162` | `+2W, +2H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +2W, +2H |
|  | `1.5x` | `2560x1440` | `3840x2160` | `3840x2160` | `0` | Exact |
|  | `1.6x` | `2400x1352` | `3840x2160` | `3840x2163` | `+3H` | Round up: Height<br>Output +2H<br>Target +3H |
|  | `1.7x` | `2264x1272` | `3840x2160` | `3849x2162` | `+9W, +2H` | Round up: Width + Height<br>Output +5W, +1H<br>Target +9W, +2H |
|  | `1.8x` | `2136x1200` | `3840x2160` | `3845x2160` | `+5W` | Round up: Width<br>Output +3W<br>Target +5W |
|  | `1.9x` | `2024x1144` | `3840x2160` | `3846x2174` | `+6W, +14H` | Round up: Width + Height<br>Output +3W, +7H<br>Target +6W, +14H |
|  | `2.0x` | `1920x1080` | `3840x2160` | `3840x2160` | `0` | Exact |
| `21:9` | `1.0x` | `5120x2160` | `5120x2160` | `5120x2160` | `0` | Exact |
|  | `1.1x` | `4656x1968` | `5120x2160` | `5122x2165` | `+2W, +5H` | Round up: Width + Height<br>Output +1W, +4H<br>Target +2W, +5H |
|  | `1.2x` | `4272x1800` | `5120x2160` | `5126x2160` | `+6W` | Round up: Width<br>Output +5W<br>Target +6W |
|  | `1.3x` | `3944x1664` | `5120x2160` | `5127x2163` | `+7W, +3H` | Round up: Width + Height<br>Output +6W, +2H<br>Target +7W, +3H |
|  | `1.4x` | `3664x1544` | `5120x2160` | `5130x2162` | `+10W, +2H` | Round up: Width + Height<br>Output +7W, +1H<br>Target +10W, +2H |
|  | `1.5x` | `3416x1440` | `5120x2160` | `5124x2160` | `+4W` | Round up: Width<br>Output +3W<br>Target +4W |
|  | `1.6x` | `3200x1352` | `5120x2160` | `5120x2163` | `+3H` | Round up: Height<br>Output +2H<br>Target +3H |
|  | `1.7x` | `3016x1272` | `5120x2160` | `5127x2162` | `+7W, +2H` | Round up: Width + Height<br>Output +4W, +1H<br>Target +7W, +2H |
|  | `1.8x` | `2848x1200` | `5120x2160` | `5126x2160` | `+6W` | Round up: Width<br>Output +4W<br>Target +6W |
|  | `1.9x` | `2696x1144` | `5120x2160` | `5122x2174` | `+2W, +14H` | Round up: Width + Height<br>Output +1W, +7H<br>Target +2W, +14H |
|  | `2.0x` | `2560x1080` | `5120x2160` | `5120x2160` | `0` | Exact |

</details>

<a id="4k-portrait"></a>
### 4K Portrait

<details>
<summary><strong>4K Portrait lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `2160x2160` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.1x` | `1968x1968` | `2160x2160` | `2165x2165` | `+5W, +5H` | Round up: Width + Height<br>Output +4W, +4H<br>Target +5W, +5H |
|  | `1.2x` | `1800x1800` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.3x` | `1664x1664` | `2160x2160` | `2163x2163` | `+3W, +3H` | Round up: Width + Height<br>Output +2W, +2H<br>Target +3W, +3H |
|  | `1.4x` | `1544x1544` | `2160x2160` | `2162x2162` | `+2W, +2H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +2W, +2H |
|  | `1.5x` | `1440x1440` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.6x` | `1352x1352` | `2160x2160` | `2163x2163` | `+3W, +3H` | Round up: Width + Height<br>Output +2W, +2H<br>Target +3W, +3H |
|  | `1.7x` | `1272x1272` | `2160x2160` | `2162x2162` | `+2W, +2H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +2W, +2H |
|  | `1.8x` | `1200x1200` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.9x` | `1144x1144` | `2160x2160` | `2174x2174` | `+14W, +14H` | Round up: Width + Height<br>Output +7W, +7H<br>Target +14W, +14H |
|  | `2.0x` | `1080x1080` | `2160x2160` | `2160x2160` | `0` | Exact |
| `2:3` | `1.0x` | `2560x3840` | `2560x3840` | `2560x3840` | `0` | Exact |
|  | `1.1x` | `2328x3496` | `2560x3840` | `2561x3846` | `+1W, +6H` | Round up: Width + Height<br>Output +1W, +5H<br>Target +1W, +6H |
|  | `1.2x` | `2136x3200` | `2560x3840` | `2563x3840` | `+3W` | Round up: Width<br>Output +3W<br>Target +3W |
|  | `1.3x` | `1976x2960` | `2560x3840` | `2569x3848` | `+9W, +8H` | Round up: Width + Height<br>Output +7W, +6H<br>Target +9W, +8H |
|  | `1.4x` | `1832x2744` | `2560x3840` | `2565x3842` | `+5W, +2H` | Round up: Width + Height<br>Output +3W, +1H<br>Target +5W, +2H |
|  | `1.5x` | `1712x2560` | `2560x3840` | `2568x3840` | `+8W` | Round up: Width<br>Output +5W<br>Target +8W |
|  | `1.6x` | `1600x2400` | `2560x3840` | `2560x3840` | `0` | Exact |
|  | `1.7x` | `1512x2264` | `2560x3840` | `2570x3849` | `+10W, +9H` | Round up: Width + Height<br>Output +6W, +5H<br>Target +10W, +9H |
|  | `1.8x` | `1424x2136` | `2560x3840` | `2563x3845` | `+3W, +5H` | Round up: Width + Height<br>Output +2W, +3H<br>Target +3W, +5H |
|  | `1.9x` | `1352x2024` | `2560x3840` | `2569x3846` | `+9W, +6H` | Round up: Width + Height<br>Output +5W, +3H<br>Target +9W, +6H |
|  | `2.0x` | `1280x1920` | `2560x3840` | `2560x3840` | `0` | Exact |
| `3:4` | `1.0x` | `2880x3840` | `2880x3840` | `2880x3840` | `0` | Exact |
|  | `1.1x` | `2624x3496` | `2880x3840` | `2886x3846` | `+6W, +6H` | Round up: Width + Height<br>Output +6W, +5H<br>Target +6W, +6H |
|  | `1.2x` | `2400x3200` | `2880x3840` | `2880x3840` | `0` | Exact |
|  | `1.3x` | `2216x2960` | `2880x3840` | `2881x3848` | `+1W, +8H` | Round up: Width + Height<br>Output +1W, +6H<br>Target +1W, +8H |
|  | `1.4x` | `2064x2744` | `2880x3840` | `2890x3842` | `+10W, +2H` | Round up: Width + Height<br>Output +7W, +1H<br>Target +10W, +2H |
|  | `1.5x` | `1920x2560` | `2880x3840` | `2880x3840` | `0` | Exact |
|  | `1.6x` | `1800x2400` | `2880x3840` | `2880x3840` | `0` | Exact |
|  | `1.7x` | `1696x2264` | `2880x3840` | `2883x3849` | `+3W, +9H` | Round up: Width + Height<br>Output +2W, +5H<br>Target +3W, +9H |
|  | `1.8x` | `1600x2136` | `2880x3840` | `2880x3845` | `+5H` | Round up: Height<br>Output +3H<br>Target +5H |
|  | `1.9x` | `1520x2024` | `2880x3840` | `2888x3846` | `+8W, +6H` | Round up: Width + Height<br>Output +4W, +3H<br>Target +8W, +6H |
|  | `2.0x` | `1440x1920` | `2880x3840` | `2880x3840` | `0` | Exact |
| `16:9` | `1.0x` | `2160x3840` | `2160x3840` | `2160x3840` | `0` | Exact |
|  | `1.1x` | `1968x3496` | `2160x3840` | `2165x3846` | `+5W, +6H` | Round up: Width + Height<br>Output +4W, +5H<br>Target +5W, +6H |
|  | `1.2x` | `1800x3200` | `2160x3840` | `2160x3840` | `0` | Exact |
|  | `1.3x` | `1664x2960` | `2160x3840` | `2163x3848` | `+3W, +8H` | Round up: Width + Height<br>Output +2W, +6H<br>Target +3W, +8H |
|  | `1.4x` | `1544x2744` | `2160x3840` | `2162x3842` | `+2W, +2H` | Round up: Width + Height<br>Output +1W, +1H<br>Target +2W, +2H |
|  | `1.5x` | `1440x2560` | `2160x3840` | `2160x3840` | `0` | Exact |
|  | `1.6x` | `1352x2400` | `2160x3840` | `2163x3840` | `+3W` | Round up: Width<br>Output +2W<br>Target +3W |
|  | `1.7x` | `1272x2264` | `2160x3840` | `2162x3849` | `+2W, +9H` | Round up: Width + Height<br>Output +1W, +5H<br>Target +2W, +9H |
|  | `1.8x` | `1200x2136` | `2160x3840` | `2160x3845` | `+5H` | Round up: Height<br>Output +3H<br>Target +5H |
|  | `1.9x` | `1144x2024` | `2160x3840` | `2174x3846` | `+14W, +6H` | Round up: Width + Height<br>Output +7W, +3H<br>Target +14W, +6H |
|  | `2.0x` | `1080x1920` | `2160x3840` | `2160x3840` | `0` | Exact |
| `21:9` | `1.0x` | `2160x5120` | `2160x5120` | `2160x5120` | `0` | Exact |
|  | `1.1x` | `1968x4656` | `2160x5120` | `2165x5122` | `+5W, +2H` | Round up: Width + Height<br>Output +4W, +1H<br>Target +5W, +2H |
|  | `1.2x` | `1800x4272` | `2160x5120` | `2160x5126` | `+6H` | Round up: Height<br>Output +5H<br>Target +6H |
|  | `1.3x` | `1664x3944` | `2160x5120` | `2163x5127` | `+3W, +7H` | Round up: Width + Height<br>Output +2W, +6H<br>Target +3W, +7H |
|  | `1.4x` | `1544x3664` | `2160x5120` | `2162x5130` | `+2W, +10H` | Round up: Width + Height<br>Output +1W, +7H<br>Target +2W, +10H |
|  | `1.5x` | `1440x3416` | `2160x5120` | `2160x5124` | `+4H` | Round up: Height<br>Output +3H<br>Target +4H |
|  | `1.6x` | `1352x3200` | `2160x5120` | `2163x5120` | `+3W` | Round up: Width<br>Output +2W<br>Target +3W |
|  | `1.7x` | `1272x3016` | `2160x5120` | `2162x5127` | `+2W, +7H` | Round up: Width + Height<br>Output +1W, +4H<br>Target +2W, +7H |
|  | `1.8x` | `1200x2848` | `2160x5120` | `2160x5126` | `+6H` | Round up: Height<br>Output +4H<br>Target +6H |
|  | `1.9x` | `1144x2696` | `2160x5120` | `2174x5122` | `+14W, +2H` | Round up: Width + Height<br>Output +7W, +1H<br>Target +14W, +2H |
|  | `2.0x` | `1080x2560` | `2160x5120` | `2160x5120` | `0` | Exact |

</details>

## Compact Machine-Readable Files

The Markdown tables above are for reading. These CSV files are kept for verification and spreadsheet workflows.

| File | Purpose |
| --- | --- |
| [`dimension-size-reference.csv`](dimension-size-reference.csv) | Full 330-row reference table with expected target, actual target, target deltas, raw values, aligned output, rounded axes, and deltas. |
| [`manual-e2e-size-matrix.csv`](manual-e2e-size-matrix.csv) | Manual E2E checklist with expected output and target sizes. |
| [`comfy-api-rounded-combinations.csv`](comfy-api-rounded-combinations.csv) | Only combinations where width, height, or both axes were rounded up by 8-alignment. |
| [`comfy-api-e2e-results.csv`](comfy-api-e2e-results.csv) | ComfyUI API E2E image-size verification results. |
