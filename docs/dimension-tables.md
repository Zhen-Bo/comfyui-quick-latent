# Dimension Tables / 尺寸對照表

Use this page when you want to find the actual Quick Latent output size without opening a CSV. The tables are generated from the same 330-combination matrix used by the ComfyUI API E2E image-size test.

這份文件是給使用者直接查尺寸的 Markdown 對照表。每一列都列出使用者從 preset 預期的 target、16 對齊後實際 target，以及兩者差異。

## Read This First

| Column | Meaning |
| --- | --- |
| `Output` | The actual 16-aligned sampler size from `OUTPUT_WIDTH` and `OUTPUT_HEIGHT`. |
| `Expected Target` | The original preset target after applying orientation. This is what users usually expect from the resolution setting. |
| `Actual Target` | `Output * scale_factor`, matching the node Target Size display. |
| `Difference` | `Actual Target - Expected Target`. `0` means the final target still matches the preset target. |
| `Rounding` | `Exact` means no 16-alignment change. Rounded rows show changed axes plus output and target deltas. |

中文速讀：

| 欄位 | 意思 |
| --- | --- |
| `Output` | QuickLatent 實際輸出的 sampler 尺寸。 |
| `Expected Target` | 使用者從解析度 preset 直覺期待的目標尺寸。 |
| `Actual Target` | `Output * scale_factor`，也就是節點 UI 顯示的 Target Size。 |
| `Difference` | `Actual Target - Expected Target`。`0` 代表最終 target 仍等於 preset 目標。 |
| `Rounding` | `Exact` 代表沒有被 16 對齊改動；round 的列會標出被改動的軸，以及 output/target 差異。 |

## Section Index

- [1K Landscape](#1k-landscape) / [1K Portrait](#1k-portrait)
- [2K Landscape](#2k-landscape) / [2K Portrait](#2k-portrait)
- [4K Landscape](#4k-landscape) / [4K Portrait](#4k-portrait)

## Rounding Summary

Each scale has 30 combinations: `3 resolutions * 5 aspect ratios * 2 orientations`.

| Scale | Rounded | Exact |
| --- | ---: | ---: |
| `1.0x` | 2 | 28 |
| `1.1x` | 30 | 0 |
| `1.2x` | 26 | 4 |
| `1.3x` | 30 | 0 |
| `1.4x` | 30 | 0 |
| `1.5x` | 20 | 10 |
| `1.6x` | 20 | 10 |
| `1.7x` | 30 | 0 |
| `1.8x` | 28 | 2 |
| `1.9x` | 30 | 0 |
| `2.0x` | 12 | 18 |

Across all 330 combinations, 258 combinations have an actual target different from the preset target.

After excluding `1.0x`, `1.3x`, `1.5x`, `1.7x`, and `2.0x`, these remaining scales still round:

| Remaining Scale | Rounded | Exact |
| --- | ---: | ---: |
| `1.1x` | 30 | 0 |
| `1.2x` | 26 | 4 |
| `1.4x` | 30 | 0 |
| `1.6x` | 20 | 10 |
| `1.8x` | 28 | 2 |
| `1.9x` | 30 | 0 |

On the excluded scales themselves:

| Excluded Scale | Rounded | Exact |
| --- | ---: | ---: |
| `1.0x` | 2 | 28 |
| `1.3x` | 30 | 0 |
| `1.5x` | 20 | 10 |
| `1.7x` | 30 | 0 |
| `2.0x` | 12 | 18 |

## Lookup Tables

Tip: open the matching section below, then use browser search for values like `3:4` or `2.0x`.

<a id="1k-landscape"></a>
### 1K Landscape

<details>
<summary><strong>1K Landscape lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `1024x1024` | `1024x1024` | `1024x1024` | `0` | Exact |
|  | `1.1x` | `928x928` | `1024x1024` | `1021x1021` | `-3W, -3H` | Round: Width + Height<br>Output -3W, -3H<br>Target -3W, -3H |
|  | `1.2x` | `848x848` | `1024x1024` | `1018x1018` | `-6W, -6H` | Round: Width + Height<br>Output -5W, -5H<br>Target -6W, -6H |
|  | `1.3x` | `784x784` | `1024x1024` | `1019x1019` | `-5W, -5H` | Round: Width + Height<br>Output -4W, -4H<br>Target -5W, -5H |
|  | `1.4x` | `736x736` | `1024x1024` | `1030x1030` | `+6W, +6H` | Round: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.5x` | `688x688` | `1024x1024` | `1032x1032` | `+8W, +8H` | Round: Width + Height<br>Output +5W, +5H<br>Target +8W, +8H |
|  | `1.6x` | `640x640` | `1024x1024` | `1024x1024` | `0` | Exact |
|  | `1.7x` | `608x608` | `1024x1024` | `1034x1034` | `+10W, +10H` | Round: Width + Height<br>Output +6W, +6H<br>Target +10W, +10H |
|  | `1.8x` | `576x576` | `1024x1024` | `1037x1037` | `+13W, +13H` | Round: Width + Height<br>Output +7W, +7H<br>Target +13W, +13H |
|  | `1.9x` | `544x544` | `1024x1024` | `1034x1034` | `+10W, +10H` | Round: Width + Height<br>Output +5W, +5H<br>Target +10W, +10H |
|  | `2.0x` | `512x512` | `1024x1024` | `1024x1024` | `0` | Exact |
| `2:3` | `1.0x` | `1920x1280` | `1920x1280` | `1920x1280` | `0` | Exact |
|  | `1.1x` | `1744x1168` | `1920x1280` | `1918x1285` | `-2W, +5H` | Round: Width + Height<br>Output -1W, +4H<br>Target -2W, +5H |
|  | `1.2x` | `1600x1072` | `1920x1280` | `1920x1286` | `+6H` | Round: Height<br>Output +5H<br>Target +6H |
|  | `1.3x` | `1472x992` | `1920x1280` | `1914x1290` | `-6W, +10H` | Round: Width + Height<br>Output -5W, +7H<br>Target -6W, +10H |
|  | `1.4x` | `1376x912` | `1920x1280` | `1926x1277` | `+6W, -3H` | Round: Width + Height<br>Output +5W, -2H<br>Target +6W, -3H |
|  | `1.5x` | `1280x848` | `1920x1280` | `1920x1272` | `-8H` | Round: Height<br>Output -5H<br>Target -8H |
|  | `1.6x` | `1200x800` | `1920x1280` | `1920x1280` | `0` | Exact |
|  | `1.7x` | `1136x752` | `1920x1280` | `1931x1278` | `+11W, -2H` | Round: Width + Height<br>Output +7W, -1H<br>Target +11W, -2H |
|  | `1.8x` | `1072x704` | `1920x1280` | `1930x1267` | `+10W, -13H` | Round: Width + Height<br>Output +5W, -7H<br>Target +10W, -13H |
|  | `1.9x` | `1008x672` | `1920x1280` | `1915x1277` | `-5W, -3H` | Round: Width + Height<br>Output -3W, -2H<br>Target -5W, -3H |
|  | `2.0x` | `960x640` | `1920x1280` | `1920x1280` | `0` | Exact |
| `3:4` | `1.0x` | `1920x1440` | `1920x1440` | `1920x1440` | `0` | Exact |
|  | `1.1x` | `1744x1312` | `1920x1440` | `1918x1443` | `-2W, +3H` | Round: Width + Height<br>Output -1W, +3H<br>Target -2W, +3H |
|  | `1.2x` | `1600x1200` | `1920x1440` | `1920x1440` | `0` | Exact |
|  | `1.3x` | `1472x1104` | `1920x1440` | `1914x1435` | `-6W, -5H` | Round: Width + Height<br>Output -5W, -4H<br>Target -6W, -5H |
|  | `1.4x` | `1376x1024` | `1920x1440` | `1926x1434` | `+6W, -6H` | Round: Width + Height<br>Output +5W, -5H<br>Target +6W, -6H |
|  | `1.5x` | `1280x960` | `1920x1440` | `1920x1440` | `0` | Exact |
|  | `1.6x` | `1200x896` | `1920x1440` | `1920x1434` | `-6H` | Round: Height<br>Output -4H<br>Target -6H |
|  | `1.7x` | `1136x848` | `1920x1440` | `1931x1442` | `+11W, +2H` | Round: Width + Height<br>Output +7W, +1H<br>Target +11W, +2H |
|  | `1.8x` | `1072x800` | `1920x1440` | `1930x1440` | `+10W` | Round: Width<br>Output +5W<br>Target +10W |
|  | `1.9x` | `1008x752` | `1920x1440` | `1915x1429` | `-5W, -11H` | Round: Width + Height<br>Output -3W, -6H<br>Target -5W, -11H |
|  | `2.0x` | `960x720` | `1920x1440` | `1920x1440` | `0` | Exact |
| `16:9` | `1.0x` | `1920x1088` | `1920x1080` | `1920x1088` | `+8H` | Round: Height<br>Output +8H<br>Target +8H |
|  | `1.1x` | `1744x976` | `1920x1080` | `1918x1074` | `-2W, -6H` | Round: Width + Height<br>Output -1W, -6H<br>Target -2W, -6H |
|  | `1.2x` | `1600x896` | `1920x1080` | `1920x1075` | `-5H` | Round: Height<br>Output -4H<br>Target -5H |
|  | `1.3x` | `1472x832` | `1920x1080` | `1914x1082` | `-6W, +2H` | Round: Width + Height<br>Output -5W, +1H<br>Target -6W, +2H |
|  | `1.4x` | `1376x768` | `1920x1080` | `1926x1075` | `+6W, -5H` | Round: Width + Height<br>Output +5W, -3H<br>Target +6W, -5H |
|  | `1.5x` | `1280x720` | `1920x1080` | `1920x1080` | `0` | Exact |
|  | `1.6x` | `1200x672` | `1920x1080` | `1920x1075` | `-5H` | Round: Height<br>Output -3H<br>Target -5H |
|  | `1.7x` | `1136x640` | `1920x1080` | `1931x1088` | `+11W, +8H` | Round: Width + Height<br>Output +7W, +5H<br>Target +11W, +8H |
|  | `1.8x` | `1072x608` | `1920x1080` | `1930x1094` | `+10W, +14H` | Round: Width + Height<br>Output +5W, +8H<br>Target +10W, +14H |
|  | `1.9x` | `1008x576` | `1920x1080` | `1915x1094` | `-5W, +14H` | Round: Width + Height<br>Output -3W, +8H<br>Target -5W, +14H |
|  | `2.0x` | `960x544` | `1920x1080` | `1920x1088` | `+8H` | Round: Height<br>Output +4H<br>Target +8H |
| `21:9` | `1.0x` | `2560x1088` | `2560x1088` | `2560x1088` | `0` | Exact |
|  | `1.1x` | `2320x992` | `2560x1088` | `2552x1091` | `-8W, +3H` | Round: Width + Height<br>Output -7W, +3H<br>Target -8W, +3H |
|  | `1.2x` | `2128x912` | `2560x1088` | `2554x1094` | `-6W, +6H` | Round: Width + Height<br>Output -5W, +5H<br>Target -6W, +6H |
|  | `1.3x` | `1968x832` | `2560x1088` | `2558x1082` | `-2W, -6H` | Round: Width + Height<br>Output -1W, -5H<br>Target -2W, -6H |
|  | `1.4x` | `1824x784` | `2560x1088` | `2554x1098` | `-6W, +10H` | Round: Width + Height<br>Output -5W, +7H<br>Target -6W, +10H |
|  | `1.5x` | `1712x720` | `2560x1088` | `2568x1080` | `+8W, -8H` | Round: Width + Height<br>Output +5W, -5H<br>Target +8W, -8H |
|  | `1.6x` | `1600x672` | `2560x1088` | `2560x1075` | `-13H` | Round: Height<br>Output -8H<br>Target -13H |
|  | `1.7x` | `1504x640` | `2560x1088` | `2557x1088` | `-3W` | Round: Width<br>Output -2W<br>Target -3W |
|  | `1.8x` | `1424x608` | `2560x1088` | `2563x1094` | `+3W, +6H` | Round: Width + Height<br>Output +2W, +4H<br>Target +3W, +6H |
|  | `1.9x` | `1344x576` | `2560x1088` | `2554x1094` | `-6W, +6H` | Round: Width + Height<br>Output -3W, +3H<br>Target -6W, +6H |
|  | `2.0x` | `1280x544` | `2560x1088` | `2560x1088` | `0` | Exact |

</details>

<a id="1k-portrait"></a>
### 1K Portrait

<details>
<summary><strong>1K Portrait lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `1024x1024` | `1024x1024` | `1024x1024` | `0` | Exact |
|  | `1.1x` | `928x928` | `1024x1024` | `1021x1021` | `-3W, -3H` | Round: Width + Height<br>Output -3W, -3H<br>Target -3W, -3H |
|  | `1.2x` | `848x848` | `1024x1024` | `1018x1018` | `-6W, -6H` | Round: Width + Height<br>Output -5W, -5H<br>Target -6W, -6H |
|  | `1.3x` | `784x784` | `1024x1024` | `1019x1019` | `-5W, -5H` | Round: Width + Height<br>Output -4W, -4H<br>Target -5W, -5H |
|  | `1.4x` | `736x736` | `1024x1024` | `1030x1030` | `+6W, +6H` | Round: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.5x` | `688x688` | `1024x1024` | `1032x1032` | `+8W, +8H` | Round: Width + Height<br>Output +5W, +5H<br>Target +8W, +8H |
|  | `1.6x` | `640x640` | `1024x1024` | `1024x1024` | `0` | Exact |
|  | `1.7x` | `608x608` | `1024x1024` | `1034x1034` | `+10W, +10H` | Round: Width + Height<br>Output +6W, +6H<br>Target +10W, +10H |
|  | `1.8x` | `576x576` | `1024x1024` | `1037x1037` | `+13W, +13H` | Round: Width + Height<br>Output +7W, +7H<br>Target +13W, +13H |
|  | `1.9x` | `544x544` | `1024x1024` | `1034x1034` | `+10W, +10H` | Round: Width + Height<br>Output +5W, +5H<br>Target +10W, +10H |
|  | `2.0x` | `512x512` | `1024x1024` | `1024x1024` | `0` | Exact |
| `2:3` | `1.0x` | `1280x1920` | `1280x1920` | `1280x1920` | `0` | Exact |
|  | `1.1x` | `1168x1744` | `1280x1920` | `1285x1918` | `+5W, -2H` | Round: Width + Height<br>Output +4W, -1H<br>Target +5W, -2H |
|  | `1.2x` | `1072x1600` | `1280x1920` | `1286x1920` | `+6W` | Round: Width<br>Output +5W<br>Target +6W |
|  | `1.3x` | `992x1472` | `1280x1920` | `1290x1914` | `+10W, -6H` | Round: Width + Height<br>Output +7W, -5H<br>Target +10W, -6H |
|  | `1.4x` | `912x1376` | `1280x1920` | `1277x1926` | `-3W, +6H` | Round: Width + Height<br>Output -2W, +5H<br>Target -3W, +6H |
|  | `1.5x` | `848x1280` | `1280x1920` | `1272x1920` | `-8W` | Round: Width<br>Output -5W<br>Target -8W |
|  | `1.6x` | `800x1200` | `1280x1920` | `1280x1920` | `0` | Exact |
|  | `1.7x` | `752x1136` | `1280x1920` | `1278x1931` | `-2W, +11H` | Round: Width + Height<br>Output -1W, +7H<br>Target -2W, +11H |
|  | `1.8x` | `704x1072` | `1280x1920` | `1267x1930` | `-13W, +10H` | Round: Width + Height<br>Output -7W, +5H<br>Target -13W, +10H |
|  | `1.9x` | `672x1008` | `1280x1920` | `1277x1915` | `-3W, -5H` | Round: Width + Height<br>Output -2W, -3H<br>Target -3W, -5H |
|  | `2.0x` | `640x960` | `1280x1920` | `1280x1920` | `0` | Exact |
| `3:4` | `1.0x` | `1440x1920` | `1440x1920` | `1440x1920` | `0` | Exact |
|  | `1.1x` | `1312x1744` | `1440x1920` | `1443x1918` | `+3W, -2H` | Round: Width + Height<br>Output +3W, -1H<br>Target +3W, -2H |
|  | `1.2x` | `1200x1600` | `1440x1920` | `1440x1920` | `0` | Exact |
|  | `1.3x` | `1104x1472` | `1440x1920` | `1435x1914` | `-5W, -6H` | Round: Width + Height<br>Output -4W, -5H<br>Target -5W, -6H |
|  | `1.4x` | `1024x1376` | `1440x1920` | `1434x1926` | `-6W, +6H` | Round: Width + Height<br>Output -5W, +5H<br>Target -6W, +6H |
|  | `1.5x` | `960x1280` | `1440x1920` | `1440x1920` | `0` | Exact |
|  | `1.6x` | `896x1200` | `1440x1920` | `1434x1920` | `-6W` | Round: Width<br>Output -4W<br>Target -6W |
|  | `1.7x` | `848x1136` | `1440x1920` | `1442x1931` | `+2W, +11H` | Round: Width + Height<br>Output +1W, +7H<br>Target +2W, +11H |
|  | `1.8x` | `800x1072` | `1440x1920` | `1440x1930` | `+10H` | Round: Height<br>Output +5H<br>Target +10H |
|  | `1.9x` | `752x1008` | `1440x1920` | `1429x1915` | `-11W, -5H` | Round: Width + Height<br>Output -6W, -3H<br>Target -11W, -5H |
|  | `2.0x` | `720x960` | `1440x1920` | `1440x1920` | `0` | Exact |
| `16:9` | `1.0x` | `1088x1920` | `1080x1920` | `1088x1920` | `+8W` | Round: Width<br>Output +8W<br>Target +8W |
|  | `1.1x` | `976x1744` | `1080x1920` | `1074x1918` | `-6W, -2H` | Round: Width + Height<br>Output -6W, -1H<br>Target -6W, -2H |
|  | `1.2x` | `896x1600` | `1080x1920` | `1075x1920` | `-5W` | Round: Width<br>Output -4W<br>Target -5W |
|  | `1.3x` | `832x1472` | `1080x1920` | `1082x1914` | `+2W, -6H` | Round: Width + Height<br>Output +1W, -5H<br>Target +2W, -6H |
|  | `1.4x` | `768x1376` | `1080x1920` | `1075x1926` | `-5W, +6H` | Round: Width + Height<br>Output -3W, +5H<br>Target -5W, +6H |
|  | `1.5x` | `720x1280` | `1080x1920` | `1080x1920` | `0` | Exact |
|  | `1.6x` | `672x1200` | `1080x1920` | `1075x1920` | `-5W` | Round: Width<br>Output -3W<br>Target -5W |
|  | `1.7x` | `640x1136` | `1080x1920` | `1088x1931` | `+8W, +11H` | Round: Width + Height<br>Output +5W, +7H<br>Target +8W, +11H |
|  | `1.8x` | `608x1072` | `1080x1920` | `1094x1930` | `+14W, +10H` | Round: Width + Height<br>Output +8W, +5H<br>Target +14W, +10H |
|  | `1.9x` | `576x1008` | `1080x1920` | `1094x1915` | `+14W, -5H` | Round: Width + Height<br>Output +8W, -3H<br>Target +14W, -5H |
|  | `2.0x` | `544x960` | `1080x1920` | `1088x1920` | `+8W` | Round: Width<br>Output +4W<br>Target +8W |
| `21:9` | `1.0x` | `1088x2560` | `1088x2560` | `1088x2560` | `0` | Exact |
|  | `1.1x` | `992x2320` | `1088x2560` | `1091x2552` | `+3W, -8H` | Round: Width + Height<br>Output +3W, -7H<br>Target +3W, -8H |
|  | `1.2x` | `912x2128` | `1088x2560` | `1094x2554` | `+6W, -6H` | Round: Width + Height<br>Output +5W, -5H<br>Target +6W, -6H |
|  | `1.3x` | `832x1968` | `1088x2560` | `1082x2558` | `-6W, -2H` | Round: Width + Height<br>Output -5W, -1H<br>Target -6W, -2H |
|  | `1.4x` | `784x1824` | `1088x2560` | `1098x2554` | `+10W, -6H` | Round: Width + Height<br>Output +7W, -5H<br>Target +10W, -6H |
|  | `1.5x` | `720x1712` | `1088x2560` | `1080x2568` | `-8W, +8H` | Round: Width + Height<br>Output -5W, +5H<br>Target -8W, +8H |
|  | `1.6x` | `672x1600` | `1088x2560` | `1075x2560` | `-13W` | Round: Width<br>Output -8W<br>Target -13W |
|  | `1.7x` | `640x1504` | `1088x2560` | `1088x2557` | `-3H` | Round: Height<br>Output -2H<br>Target -3H |
|  | `1.8x` | `608x1424` | `1088x2560` | `1094x2563` | `+6W, +3H` | Round: Width + Height<br>Output +4W, +2H<br>Target +6W, +3H |
|  | `1.9x` | `576x1344` | `1088x2560` | `1094x2554` | `+6W, -6H` | Round: Width + Height<br>Output +3W, -3H<br>Target +6W, -6H |
|  | `2.0x` | `544x1280` | `1088x2560` | `1088x2560` | `0` | Exact |

</details>

<a id="2k-landscape"></a>
### 2K Landscape

<details>
<summary><strong>2K Landscape lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `2048x2048` | `2048x2048` | `2048x2048` | `0` | Exact |
|  | `1.1x` | `1856x1856` | `2048x2048` | `2042x2042` | `-6W, -6H` | Round: Width + Height<br>Output -6W, -6H<br>Target -6W, -6H |
|  | `1.2x` | `1712x1712` | `2048x2048` | `2054x2054` | `+6W, +6H` | Round: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.3x` | `1568x1568` | `2048x2048` | `2038x2038` | `-10W, -10H` | Round: Width + Height<br>Output -7W, -7H<br>Target -10W, -10H |
|  | `1.4x` | `1456x1456` | `2048x2048` | `2038x2038` | `-10W, -10H` | Round: Width + Height<br>Output -7W, -7H<br>Target -10W, -10H |
|  | `1.5x` | `1360x1360` | `2048x2048` | `2040x2040` | `-8W, -8H` | Round: Width + Height<br>Output -5W, -5H<br>Target -8W, -8H |
|  | `1.6x` | `1280x1280` | `2048x2048` | `2048x2048` | `0` | Exact |
|  | `1.7x` | `1200x1200` | `2048x2048` | `2040x2040` | `-8W, -8H` | Round: Width + Height<br>Output -5W, -5H<br>Target -8W, -8H |
|  | `1.8x` | `1136x1136` | `2048x2048` | `2045x2045` | `-3W, -3H` | Round: Width + Height<br>Output -2W, -2H<br>Target -3W, -3H |
|  | `1.9x` | `1072x1072` | `2048x2048` | `2037x2037` | `-11W, -11H` | Round: Width + Height<br>Output -6W, -6H<br>Target -11W, -11H |
|  | `2.0x` | `1024x1024` | `2048x2048` | `2048x2048` | `0` | Exact |
| `2:3` | `1.0x` | `2560x1712` | `2560x1712` | `2560x1712` | `0` | Exact |
|  | `1.1x` | `2320x1552` | `2560x1712` | `2552x1707` | `-8W, -5H` | Round: Width + Height<br>Output -7W, -4H<br>Target -8W, -5H |
|  | `1.2x` | `2128x1424` | `2560x1712` | `2554x1709` | `-6W, -3H` | Round: Width + Height<br>Output -5W, -3H<br>Target -6W, -3H |
|  | `1.3x` | `1968x1312` | `2560x1712` | `2558x1706` | `-2W, -6H` | Round: Width + Height<br>Output -1W, -5H<br>Target -2W, -6H |
|  | `1.4x` | `1824x1216` | `2560x1712` | `2554x1702` | `-6W, -10H` | Round: Width + Height<br>Output -5W, -7H<br>Target -6W, -10H |
|  | `1.5x` | `1712x1136` | `2560x1712` | `2568x1704` | `+8W, -8H` | Round: Width + Height<br>Output +5W, -5H<br>Target +8W, -8H |
|  | `1.6x` | `1600x1072` | `2560x1712` | `2560x1715` | `+3H` | Round: Height<br>Output +2H<br>Target +3H |
|  | `1.7x` | `1504x1008` | `2560x1712` | `2557x1714` | `-3W, +2H` | Round: Width + Height<br>Output -2W, +1H<br>Target -3W, +2H |
|  | `1.8x` | `1424x944` | `2560x1712` | `2563x1699` | `+3W, -13H` | Round: Width + Height<br>Output +2W, -7H<br>Target +3W, -13H |
|  | `1.9x` | `1344x896` | `2560x1712` | `2554x1702` | `-6W, -10H` | Round: Width + Height<br>Output -3W, -5H<br>Target -6W, -10H |
|  | `2.0x` | `1280x864` | `2560x1712` | `2560x1728` | `+16H` | Round: Height<br>Output +8H<br>Target +16H |
| `3:4` | `1.0x` | `2560x1920` | `2560x1920` | `2560x1920` | `0` | Exact |
|  | `1.1x` | `2320x1744` | `2560x1920` | `2552x1918` | `-8W, -2H` | Round: Width + Height<br>Output -7W, -1H<br>Target -8W, -2H |
|  | `1.2x` | `2128x1600` | `2560x1920` | `2554x1920` | `-6W` | Round: Width<br>Output -5W<br>Target -6W |
|  | `1.3x` | `1968x1472` | `2560x1920` | `2558x1914` | `-2W, -6H` | Round: Width + Height<br>Output -1W, -5H<br>Target -2W, -6H |
|  | `1.4x` | `1824x1376` | `2560x1920` | `2554x1926` | `-6W, +6H` | Round: Width + Height<br>Output -5W, +5H<br>Target -6W, +6H |
|  | `1.5x` | `1712x1280` | `2560x1920` | `2568x1920` | `+8W` | Round: Width<br>Output +5W<br>Target +8W |
|  | `1.6x` | `1600x1200` | `2560x1920` | `2560x1920` | `0` | Exact |
|  | `1.7x` | `1504x1136` | `2560x1920` | `2557x1931` | `-3W, +11H` | Round: Width + Height<br>Output -2W, +7H<br>Target -3W, +11H |
|  | `1.8x` | `1424x1072` | `2560x1920` | `2563x1930` | `+3W, +10H` | Round: Width + Height<br>Output +2W, +5H<br>Target +3W, +10H |
|  | `1.9x` | `1344x1008` | `2560x1920` | `2554x1915` | `-6W, -5H` | Round: Width + Height<br>Output -3W, -3H<br>Target -6W, -5H |
|  | `2.0x` | `1280x960` | `2560x1920` | `2560x1920` | `0` | Exact |
| `16:9` | `1.0x` | `2560x1440` | `2560x1440` | `2560x1440` | `0` | Exact |
|  | `1.1x` | `2320x1312` | `2560x1440` | `2552x1443` | `-8W, +3H` | Round: Width + Height<br>Output -7W, +3H<br>Target -8W, +3H |
|  | `1.2x` | `2128x1200` | `2560x1440` | `2554x1440` | `-6W` | Round: Width<br>Output -5W<br>Target -6W |
|  | `1.3x` | `1968x1104` | `2560x1440` | `2558x1435` | `-2W, -5H` | Round: Width + Height<br>Output -1W, -4H<br>Target -2W, -5H |
|  | `1.4x` | `1824x1024` | `2560x1440` | `2554x1434` | `-6W, -6H` | Round: Width + Height<br>Output -5W, -5H<br>Target -6W, -6H |
|  | `1.5x` | `1712x960` | `2560x1440` | `2568x1440` | `+8W` | Round: Width<br>Output +5W<br>Target +8W |
|  | `1.6x` | `1600x896` | `2560x1440` | `2560x1434` | `-6H` | Round: Height<br>Output -4H<br>Target -6H |
|  | `1.7x` | `1504x848` | `2560x1440` | `2557x1442` | `-3W, +2H` | Round: Width + Height<br>Output -2W, +1H<br>Target -3W, +2H |
|  | `1.8x` | `1424x800` | `2560x1440` | `2563x1440` | `+3W` | Round: Width<br>Output +2W<br>Target +3W |
|  | `1.9x` | `1344x752` | `2560x1440` | `2554x1429` | `-6W, -11H` | Round: Width + Height<br>Output -3W, -6H<br>Target -6W, -11H |
|  | `2.0x` | `1280x720` | `2560x1440` | `2560x1440` | `0` | Exact |
| `21:9` | `1.0x` | `3440x1440` | `3440x1440` | `3440x1440` | `0` | Exact |
|  | `1.1x` | `3120x1312` | `3440x1440` | `3432x1443` | `-8W, +3H` | Round: Width + Height<br>Output -7W, +3H<br>Target -8W, +3H |
|  | `1.2x` | `2864x1200` | `3440x1440` | `3437x1440` | `-3W` | Round: Width<br>Output -3W<br>Target -3W |
|  | `1.3x` | `2640x1104` | `3440x1440` | `3432x1435` | `-8W, -5H` | Round: Width + Height<br>Output -6W, -4H<br>Target -8W, -5H |
|  | `1.4x` | `2464x1024` | `3440x1440` | `3450x1434` | `+10W, -6H` | Round: Width + Height<br>Output +7W, -5H<br>Target +10W, -6H |
|  | `1.5x` | `2288x960` | `3440x1440` | `3432x1440` | `-8W` | Round: Width<br>Output -5W<br>Target -8W |
|  | `1.6x` | `2144x896` | `3440x1440` | `3430x1434` | `-10W, -6H` | Round: Width + Height<br>Output -6W, -4H<br>Target -10W, -6H |
|  | `1.7x` | `2016x848` | `3440x1440` | `3427x1442` | `-13W, +2H` | Round: Width + Height<br>Output -8W, +1H<br>Target -13W, +2H |
|  | `1.8x` | `1904x800` | `3440x1440` | `3427x1440` | `-13W` | Round: Width<br>Output -7W<br>Target -13W |
|  | `1.9x` | `1808x752` | `3440x1440` | `3435x1429` | `-5W, -11H` | Round: Width + Height<br>Output -3W, -6H<br>Target -5W, -11H |
|  | `2.0x` | `1728x720` | `3440x1440` | `3456x1440` | `+16W` | Round: Width<br>Output +8W<br>Target +16W |

</details>

<a id="2k-portrait"></a>
### 2K Portrait

<details>
<summary><strong>2K Portrait lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `2048x2048` | `2048x2048` | `2048x2048` | `0` | Exact |
|  | `1.1x` | `1856x1856` | `2048x2048` | `2042x2042` | `-6W, -6H` | Round: Width + Height<br>Output -6W, -6H<br>Target -6W, -6H |
|  | `1.2x` | `1712x1712` | `2048x2048` | `2054x2054` | `+6W, +6H` | Round: Width + Height<br>Output +5W, +5H<br>Target +6W, +6H |
|  | `1.3x` | `1568x1568` | `2048x2048` | `2038x2038` | `-10W, -10H` | Round: Width + Height<br>Output -7W, -7H<br>Target -10W, -10H |
|  | `1.4x` | `1456x1456` | `2048x2048` | `2038x2038` | `-10W, -10H` | Round: Width + Height<br>Output -7W, -7H<br>Target -10W, -10H |
|  | `1.5x` | `1360x1360` | `2048x2048` | `2040x2040` | `-8W, -8H` | Round: Width + Height<br>Output -5W, -5H<br>Target -8W, -8H |
|  | `1.6x` | `1280x1280` | `2048x2048` | `2048x2048` | `0` | Exact |
|  | `1.7x` | `1200x1200` | `2048x2048` | `2040x2040` | `-8W, -8H` | Round: Width + Height<br>Output -5W, -5H<br>Target -8W, -8H |
|  | `1.8x` | `1136x1136` | `2048x2048` | `2045x2045` | `-3W, -3H` | Round: Width + Height<br>Output -2W, -2H<br>Target -3W, -3H |
|  | `1.9x` | `1072x1072` | `2048x2048` | `2037x2037` | `-11W, -11H` | Round: Width + Height<br>Output -6W, -6H<br>Target -11W, -11H |
|  | `2.0x` | `1024x1024` | `2048x2048` | `2048x2048` | `0` | Exact |
| `2:3` | `1.0x` | `1712x2560` | `1712x2560` | `1712x2560` | `0` | Exact |
|  | `1.1x` | `1552x2320` | `1712x2560` | `1707x2552` | `-5W, -8H` | Round: Width + Height<br>Output -4W, -7H<br>Target -5W, -8H |
|  | `1.2x` | `1424x2128` | `1712x2560` | `1709x2554` | `-3W, -6H` | Round: Width + Height<br>Output -3W, -5H<br>Target -3W, -6H |
|  | `1.3x` | `1312x1968` | `1712x2560` | `1706x2558` | `-6W, -2H` | Round: Width + Height<br>Output -5W, -1H<br>Target -6W, -2H |
|  | `1.4x` | `1216x1824` | `1712x2560` | `1702x2554` | `-10W, -6H` | Round: Width + Height<br>Output -7W, -5H<br>Target -10W, -6H |
|  | `1.5x` | `1136x1712` | `1712x2560` | `1704x2568` | `-8W, +8H` | Round: Width + Height<br>Output -5W, +5H<br>Target -8W, +8H |
|  | `1.6x` | `1072x1600` | `1712x2560` | `1715x2560` | `+3W` | Round: Width<br>Output +2W<br>Target +3W |
|  | `1.7x` | `1008x1504` | `1712x2560` | `1714x2557` | `+2W, -3H` | Round: Width + Height<br>Output +1W, -2H<br>Target +2W, -3H |
|  | `1.8x` | `944x1424` | `1712x2560` | `1699x2563` | `-13W, +3H` | Round: Width + Height<br>Output -7W, +2H<br>Target -13W, +3H |
|  | `1.9x` | `896x1344` | `1712x2560` | `1702x2554` | `-10W, -6H` | Round: Width + Height<br>Output -5W, -3H<br>Target -10W, -6H |
|  | `2.0x` | `864x1280` | `1712x2560` | `1728x2560` | `+16W` | Round: Width<br>Output +8W<br>Target +16W |
| `3:4` | `1.0x` | `1920x2560` | `1920x2560` | `1920x2560` | `0` | Exact |
|  | `1.1x` | `1744x2320` | `1920x2560` | `1918x2552` | `-2W, -8H` | Round: Width + Height<br>Output -1W, -7H<br>Target -2W, -8H |
|  | `1.2x` | `1600x2128` | `1920x2560` | `1920x2554` | `-6H` | Round: Height<br>Output -5H<br>Target -6H |
|  | `1.3x` | `1472x1968` | `1920x2560` | `1914x2558` | `-6W, -2H` | Round: Width + Height<br>Output -5W, -1H<br>Target -6W, -2H |
|  | `1.4x` | `1376x1824` | `1920x2560` | `1926x2554` | `+6W, -6H` | Round: Width + Height<br>Output +5W, -5H<br>Target +6W, -6H |
|  | `1.5x` | `1280x1712` | `1920x2560` | `1920x2568` | `+8H` | Round: Height<br>Output +5H<br>Target +8H |
|  | `1.6x` | `1200x1600` | `1920x2560` | `1920x2560` | `0` | Exact |
|  | `1.7x` | `1136x1504` | `1920x2560` | `1931x2557` | `+11W, -3H` | Round: Width + Height<br>Output +7W, -2H<br>Target +11W, -3H |
|  | `1.8x` | `1072x1424` | `1920x2560` | `1930x2563` | `+10W, +3H` | Round: Width + Height<br>Output +5W, +2H<br>Target +10W, +3H |
|  | `1.9x` | `1008x1344` | `1920x2560` | `1915x2554` | `-5W, -6H` | Round: Width + Height<br>Output -3W, -3H<br>Target -5W, -6H |
|  | `2.0x` | `960x1280` | `1920x2560` | `1920x2560` | `0` | Exact |
| `16:9` | `1.0x` | `1440x2560` | `1440x2560` | `1440x2560` | `0` | Exact |
|  | `1.1x` | `1312x2320` | `1440x2560` | `1443x2552` | `+3W, -8H` | Round: Width + Height<br>Output +3W, -7H<br>Target +3W, -8H |
|  | `1.2x` | `1200x2128` | `1440x2560` | `1440x2554` | `-6H` | Round: Height<br>Output -5H<br>Target -6H |
|  | `1.3x` | `1104x1968` | `1440x2560` | `1435x2558` | `-5W, -2H` | Round: Width + Height<br>Output -4W, -1H<br>Target -5W, -2H |
|  | `1.4x` | `1024x1824` | `1440x2560` | `1434x2554` | `-6W, -6H` | Round: Width + Height<br>Output -5W, -5H<br>Target -6W, -6H |
|  | `1.5x` | `960x1712` | `1440x2560` | `1440x2568` | `+8H` | Round: Height<br>Output +5H<br>Target +8H |
|  | `1.6x` | `896x1600` | `1440x2560` | `1434x2560` | `-6W` | Round: Width<br>Output -4W<br>Target -6W |
|  | `1.7x` | `848x1504` | `1440x2560` | `1442x2557` | `+2W, -3H` | Round: Width + Height<br>Output +1W, -2H<br>Target +2W, -3H |
|  | `1.8x` | `800x1424` | `1440x2560` | `1440x2563` | `+3H` | Round: Height<br>Output +2H<br>Target +3H |
|  | `1.9x` | `752x1344` | `1440x2560` | `1429x2554` | `-11W, -6H` | Round: Width + Height<br>Output -6W, -3H<br>Target -11W, -6H |
|  | `2.0x` | `720x1280` | `1440x2560` | `1440x2560` | `0` | Exact |
| `21:9` | `1.0x` | `1440x3440` | `1440x3440` | `1440x3440` | `0` | Exact |
|  | `1.1x` | `1312x3120` | `1440x3440` | `1443x3432` | `+3W, -8H` | Round: Width + Height<br>Output +3W, -7H<br>Target +3W, -8H |
|  | `1.2x` | `1200x2864` | `1440x3440` | `1440x3437` | `-3H` | Round: Height<br>Output -3H<br>Target -3H |
|  | `1.3x` | `1104x2640` | `1440x3440` | `1435x3432` | `-5W, -8H` | Round: Width + Height<br>Output -4W, -6H<br>Target -5W, -8H |
|  | `1.4x` | `1024x2464` | `1440x3440` | `1434x3450` | `-6W, +10H` | Round: Width + Height<br>Output -5W, +7H<br>Target -6W, +10H |
|  | `1.5x` | `960x2288` | `1440x3440` | `1440x3432` | `-8H` | Round: Height<br>Output -5H<br>Target -8H |
|  | `1.6x` | `896x2144` | `1440x3440` | `1434x3430` | `-6W, -10H` | Round: Width + Height<br>Output -4W, -6H<br>Target -6W, -10H |
|  | `1.7x` | `848x2016` | `1440x3440` | `1442x3427` | `+2W, -13H` | Round: Width + Height<br>Output +1W, -8H<br>Target +2W, -13H |
|  | `1.8x` | `800x1904` | `1440x3440` | `1440x3427` | `-13H` | Round: Height<br>Output -7H<br>Target -13H |
|  | `1.9x` | `752x1808` | `1440x3440` | `1429x3435` | `-11W, -5H` | Round: Width + Height<br>Output -6W, -3H<br>Target -11W, -5H |
|  | `2.0x` | `720x1728` | `1440x3440` | `1440x3456` | `+16H` | Round: Height<br>Output +8H<br>Target +16H |

</details>

<a id="4k-landscape"></a>
### 4K Landscape

<details>
<summary><strong>4K Landscape lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `2160x2160` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.1x` | `1968x1968` | `2160x2160` | `2165x2165` | `+5W, +5H` | Round: Width + Height<br>Output +4W, +4H<br>Target +5W, +5H |
|  | `1.2x` | `1792x1792` | `2160x2160` | `2150x2150` | `-10W, -10H` | Round: Width + Height<br>Output -8W, -8H<br>Target -10W, -10H |
|  | `1.3x` | `1664x1664` | `2160x2160` | `2163x2163` | `+3W, +3H` | Round: Width + Height<br>Output +2W, +2H<br>Target +3W, +3H |
|  | `1.4x` | `1536x1536` | `2160x2160` | `2150x2150` | `-10W, -10H` | Round: Width + Height<br>Output -7W, -7H<br>Target -10W, -10H |
|  | `1.5x` | `1440x1440` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.6x` | `1344x1344` | `2160x2160` | `2150x2150` | `-10W, -10H` | Round: Width + Height<br>Output -6W, -6H<br>Target -10W, -10H |
|  | `1.7x` | `1264x1264` | `2160x2160` | `2149x2149` | `-11W, -11H` | Round: Width + Height<br>Output -7W, -7H<br>Target -11W, -11H |
|  | `1.8x` | `1200x1200` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.9x` | `1136x1136` | `2160x2160` | `2158x2158` | `-2W, -2H` | Round: Width + Height<br>Output -1W, -1H<br>Target -2W, -2H |
|  | `2.0x` | `1088x1088` | `2160x2160` | `2176x2176` | `+16W, +16H` | Round: Width + Height<br>Output +8W, +8H<br>Target +16W, +16H |
| `2:3` | `1.0x` | `3840x2560` | `3840x2560` | `3840x2560` | `0` | Exact |
|  | `1.1x` | `3488x2320` | `3840x2560` | `3837x2552` | `-3W, -8H` | Round: Width + Height<br>Output -3W, -7H<br>Target -3W, -8H |
|  | `1.2x` | `3200x2128` | `3840x2560` | `3840x2554` | `-6H` | Round: Height<br>Output -5H<br>Target -6H |
|  | `1.3x` | `2960x1968` | `3840x2560` | `3848x2558` | `+8W, -2H` | Round: Width + Height<br>Output +6W, -1H<br>Target +8W, -2H |
|  | `1.4x` | `2736x1824` | `3840x2560` | `3830x2554` | `-10W, -6H` | Round: Width + Height<br>Output -7W, -5H<br>Target -10W, -6H |
|  | `1.5x` | `2560x1712` | `3840x2560` | `3840x2568` | `+8H` | Round: Height<br>Output +5H<br>Target +8H |
|  | `1.6x` | `2400x1600` | `3840x2560` | `3840x2560` | `0` | Exact |
|  | `1.7x` | `2256x1504` | `3840x2560` | `3835x2557` | `-5W, -3H` | Round: Width + Height<br>Output -3W, -2H<br>Target -5W, -3H |
|  | `1.8x` | `2128x1424` | `3840x2560` | `3830x2563` | `-10W, +3H` | Round: Width + Height<br>Output -5W, +2H<br>Target -10W, +3H |
|  | `1.9x` | `2016x1344` | `3840x2560` | `3830x2554` | `-10W, -6H` | Round: Width + Height<br>Output -5W, -3H<br>Target -10W, -6H |
|  | `2.0x` | `1920x1280` | `3840x2560` | `3840x2560` | `0` | Exact |
| `3:4` | `1.0x` | `3840x2880` | `3840x2880` | `3840x2880` | `0` | Exact |
|  | `1.1x` | `3488x2624` | `3840x2880` | `3837x2886` | `-3W, +6H` | Round: Width + Height<br>Output -3W, +6H<br>Target -3W, +6H |
|  | `1.2x` | `3200x2400` | `3840x2880` | `3840x2880` | `0` | Exact |
|  | `1.3x` | `2960x2208` | `3840x2880` | `3848x2870` | `+8W, -10H` | Round: Width + Height<br>Output +6W, -7H<br>Target +8W, -10H |
|  | `1.4x` | `2736x2064` | `3840x2880` | `3830x2890` | `-10W, +10H` | Round: Width + Height<br>Output -7W, +7H<br>Target -10W, +10H |
|  | `1.5x` | `2560x1920` | `3840x2880` | `3840x2880` | `0` | Exact |
|  | `1.6x` | `2400x1792` | `3840x2880` | `3840x2867` | `-13H` | Round: Height<br>Output -8H<br>Target -13H |
|  | `1.7x` | `2256x1696` | `3840x2880` | `3835x2883` | `-5W, +3H` | Round: Width + Height<br>Output -3W, +2H<br>Target -5W, +3H |
|  | `1.8x` | `2128x1600` | `3840x2880` | `3830x2880` | `-10W` | Round: Width<br>Output -5W<br>Target -10W |
|  | `1.9x` | `2016x1520` | `3840x2880` | `3830x2888` | `-10W, +8H` | Round: Width + Height<br>Output -5W, +4H<br>Target -10W, +8H |
|  | `2.0x` | `1920x1440` | `3840x2880` | `3840x2880` | `0` | Exact |
| `16:9` | `1.0x` | `3840x2160` | `3840x2160` | `3840x2160` | `0` | Exact |
|  | `1.1x` | `3488x1968` | `3840x2160` | `3837x2165` | `-3W, +5H` | Round: Width + Height<br>Output -3W, +4H<br>Target -3W, +5H |
|  | `1.2x` | `3200x1792` | `3840x2160` | `3840x2150` | `-10H` | Round: Height<br>Output -8H<br>Target -10H |
|  | `1.3x` | `2960x1664` | `3840x2160` | `3848x2163` | `+8W, +3H` | Round: Width + Height<br>Output +6W, +2H<br>Target +8W, +3H |
|  | `1.4x` | `2736x1536` | `3840x2160` | `3830x2150` | `-10W, -10H` | Round: Width + Height<br>Output -7W, -7H<br>Target -10W, -10H |
|  | `1.5x` | `2560x1440` | `3840x2160` | `3840x2160` | `0` | Exact |
|  | `1.6x` | `2400x1344` | `3840x2160` | `3840x2150` | `-10H` | Round: Height<br>Output -6H<br>Target -10H |
|  | `1.7x` | `2256x1264` | `3840x2160` | `3835x2149` | `-5W, -11H` | Round: Width + Height<br>Output -3W, -7H<br>Target -5W, -11H |
|  | `1.8x` | `2128x1200` | `3840x2160` | `3830x2160` | `-10W` | Round: Width<br>Output -5W<br>Target -10W |
|  | `1.9x` | `2016x1136` | `3840x2160` | `3830x2158` | `-10W, -2H` | Round: Width + Height<br>Output -5W, -1H<br>Target -10W, -2H |
|  | `2.0x` | `1920x1088` | `3840x2160` | `3840x2176` | `+16H` | Round: Height<br>Output +8H<br>Target +16H |
| `21:9` | `1.0x` | `5120x2160` | `5120x2160` | `5120x2160` | `0` | Exact |
|  | `1.1x` | `4656x1968` | `5120x2160` | `5122x2165` | `+2W, +5H` | Round: Width + Height<br>Output +1W, +4H<br>Target +2W, +5H |
|  | `1.2x` | `4272x1792` | `5120x2160` | `5126x2150` | `+6W, -10H` | Round: Width + Height<br>Output +5W, -8H<br>Target +6W, -10H |
|  | `1.3x` | `3936x1664` | `5120x2160` | `5117x2163` | `-3W, +3H` | Round: Width + Height<br>Output -2W, +2H<br>Target -3W, +3H |
|  | `1.4x` | `3664x1536` | `5120x2160` | `5130x2150` | `+10W, -10H` | Round: Width + Height<br>Output +7W, -7H<br>Target +10W, -10H |
|  | `1.5x` | `3408x1440` | `5120x2160` | `5112x2160` | `-8W` | Round: Width<br>Output -5W<br>Target -8W |
|  | `1.6x` | `3200x1344` | `5120x2160` | `5120x2150` | `-10H` | Round: Height<br>Output -6H<br>Target -10H |
|  | `1.7x` | `3008x1264` | `5120x2160` | `5114x2149` | `-6W, -11H` | Round: Width + Height<br>Output -4W, -7H<br>Target -6W, -11H |
|  | `1.8x` | `2848x1200` | `5120x2160` | `5126x2160` | `+6W` | Round: Width<br>Output +4W<br>Target +6W |
|  | `1.9x` | `2688x1136` | `5120x2160` | `5107x2158` | `-13W, -2H` | Round: Width + Height<br>Output -7W, -1H<br>Target -13W, -2H |
|  | `2.0x` | `2560x1088` | `5120x2160` | `5120x2176` | `+16H` | Round: Height<br>Output +8H<br>Target +16H |

</details>

<a id="4k-portrait"></a>
### 4K Portrait

<details>
<summary><strong>4K Portrait lookup</strong></summary>

| Aspect | Scale | Output | Expected Target | Actual Target | Difference | Rounding |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1:1` | `1.0x` | `2160x2160` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.1x` | `1968x1968` | `2160x2160` | `2165x2165` | `+5W, +5H` | Round: Width + Height<br>Output +4W, +4H<br>Target +5W, +5H |
|  | `1.2x` | `1792x1792` | `2160x2160` | `2150x2150` | `-10W, -10H` | Round: Width + Height<br>Output -8W, -8H<br>Target -10W, -10H |
|  | `1.3x` | `1664x1664` | `2160x2160` | `2163x2163` | `+3W, +3H` | Round: Width + Height<br>Output +2W, +2H<br>Target +3W, +3H |
|  | `1.4x` | `1536x1536` | `2160x2160` | `2150x2150` | `-10W, -10H` | Round: Width + Height<br>Output -7W, -7H<br>Target -10W, -10H |
|  | `1.5x` | `1440x1440` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.6x` | `1344x1344` | `2160x2160` | `2150x2150` | `-10W, -10H` | Round: Width + Height<br>Output -6W, -6H<br>Target -10W, -10H |
|  | `1.7x` | `1264x1264` | `2160x2160` | `2149x2149` | `-11W, -11H` | Round: Width + Height<br>Output -7W, -7H<br>Target -11W, -11H |
|  | `1.8x` | `1200x1200` | `2160x2160` | `2160x2160` | `0` | Exact |
|  | `1.9x` | `1136x1136` | `2160x2160` | `2158x2158` | `-2W, -2H` | Round: Width + Height<br>Output -1W, -1H<br>Target -2W, -2H |
|  | `2.0x` | `1088x1088` | `2160x2160` | `2176x2176` | `+16W, +16H` | Round: Width + Height<br>Output +8W, +8H<br>Target +16W, +16H |
| `2:3` | `1.0x` | `2560x3840` | `2560x3840` | `2560x3840` | `0` | Exact |
|  | `1.1x` | `2320x3488` | `2560x3840` | `2552x3837` | `-8W, -3H` | Round: Width + Height<br>Output -7W, -3H<br>Target -8W, -3H |
|  | `1.2x` | `2128x3200` | `2560x3840` | `2554x3840` | `-6W` | Round: Width<br>Output -5W<br>Target -6W |
|  | `1.3x` | `1968x2960` | `2560x3840` | `2558x3848` | `-2W, +8H` | Round: Width + Height<br>Output -1W, +6H<br>Target -2W, +8H |
|  | `1.4x` | `1824x2736` | `2560x3840` | `2554x3830` | `-6W, -10H` | Round: Width + Height<br>Output -5W, -7H<br>Target -6W, -10H |
|  | `1.5x` | `1712x2560` | `2560x3840` | `2568x3840` | `+8W` | Round: Width<br>Output +5W<br>Target +8W |
|  | `1.6x` | `1600x2400` | `2560x3840` | `2560x3840` | `0` | Exact |
|  | `1.7x` | `1504x2256` | `2560x3840` | `2557x3835` | `-3W, -5H` | Round: Width + Height<br>Output -2W, -3H<br>Target -3W, -5H |
|  | `1.8x` | `1424x2128` | `2560x3840` | `2563x3830` | `+3W, -10H` | Round: Width + Height<br>Output +2W, -5H<br>Target +3W, -10H |
|  | `1.9x` | `1344x2016` | `2560x3840` | `2554x3830` | `-6W, -10H` | Round: Width + Height<br>Output -3W, -5H<br>Target -6W, -10H |
|  | `2.0x` | `1280x1920` | `2560x3840` | `2560x3840` | `0` | Exact |
| `3:4` | `1.0x` | `2880x3840` | `2880x3840` | `2880x3840` | `0` | Exact |
|  | `1.1x` | `2624x3488` | `2880x3840` | `2886x3837` | `+6W, -3H` | Round: Width + Height<br>Output +6W, -3H<br>Target +6W, -3H |
|  | `1.2x` | `2400x3200` | `2880x3840` | `2880x3840` | `0` | Exact |
|  | `1.3x` | `2208x2960` | `2880x3840` | `2870x3848` | `-10W, +8H` | Round: Width + Height<br>Output -7W, +6H<br>Target -10W, +8H |
|  | `1.4x` | `2064x2736` | `2880x3840` | `2890x3830` | `+10W, -10H` | Round: Width + Height<br>Output +7W, -7H<br>Target +10W, -10H |
|  | `1.5x` | `1920x2560` | `2880x3840` | `2880x3840` | `0` | Exact |
|  | `1.6x` | `1792x2400` | `2880x3840` | `2867x3840` | `-13W` | Round: Width<br>Output -8W<br>Target -13W |
|  | `1.7x` | `1696x2256` | `2880x3840` | `2883x3835` | `+3W, -5H` | Round: Width + Height<br>Output +2W, -3H<br>Target +3W, -5H |
|  | `1.8x` | `1600x2128` | `2880x3840` | `2880x3830` | `-10H` | Round: Height<br>Output -5H<br>Target -10H |
|  | `1.9x` | `1520x2016` | `2880x3840` | `2888x3830` | `+8W, -10H` | Round: Width + Height<br>Output +4W, -5H<br>Target +8W, -10H |
|  | `2.0x` | `1440x1920` | `2880x3840` | `2880x3840` | `0` | Exact |
| `16:9` | `1.0x` | `2160x3840` | `2160x3840` | `2160x3840` | `0` | Exact |
|  | `1.1x` | `1968x3488` | `2160x3840` | `2165x3837` | `+5W, -3H` | Round: Width + Height<br>Output +4W, -3H<br>Target +5W, -3H |
|  | `1.2x` | `1792x3200` | `2160x3840` | `2150x3840` | `-10W` | Round: Width<br>Output -8W<br>Target -10W |
|  | `1.3x` | `1664x2960` | `2160x3840` | `2163x3848` | `+3W, +8H` | Round: Width + Height<br>Output +2W, +6H<br>Target +3W, +8H |
|  | `1.4x` | `1536x2736` | `2160x3840` | `2150x3830` | `-10W, -10H` | Round: Width + Height<br>Output -7W, -7H<br>Target -10W, -10H |
|  | `1.5x` | `1440x2560` | `2160x3840` | `2160x3840` | `0` | Exact |
|  | `1.6x` | `1344x2400` | `2160x3840` | `2150x3840` | `-10W` | Round: Width<br>Output -6W<br>Target -10W |
|  | `1.7x` | `1264x2256` | `2160x3840` | `2149x3835` | `-11W, -5H` | Round: Width + Height<br>Output -7W, -3H<br>Target -11W, -5H |
|  | `1.8x` | `1200x2128` | `2160x3840` | `2160x3830` | `-10H` | Round: Height<br>Output -5H<br>Target -10H |
|  | `1.9x` | `1136x2016` | `2160x3840` | `2158x3830` | `-2W, -10H` | Round: Width + Height<br>Output -1W, -5H<br>Target -2W, -10H |
|  | `2.0x` | `1088x1920` | `2160x3840` | `2176x3840` | `+16W` | Round: Width<br>Output +8W<br>Target +16W |
| `21:9` | `1.0x` | `2160x5120` | `2160x5120` | `2160x5120` | `0` | Exact |
|  | `1.1x` | `1968x4656` | `2160x5120` | `2165x5122` | `+5W, +2H` | Round: Width + Height<br>Output +4W, +1H<br>Target +5W, +2H |
|  | `1.2x` | `1792x4272` | `2160x5120` | `2150x5126` | `-10W, +6H` | Round: Width + Height<br>Output -8W, +5H<br>Target -10W, +6H |
|  | `1.3x` | `1664x3936` | `2160x5120` | `2163x5117` | `+3W, -3H` | Round: Width + Height<br>Output +2W, -2H<br>Target +3W, -3H |
|  | `1.4x` | `1536x3664` | `2160x5120` | `2150x5130` | `-10W, +10H` | Round: Width + Height<br>Output -7W, +7H<br>Target -10W, +10H |
|  | `1.5x` | `1440x3408` | `2160x5120` | `2160x5112` | `-8H` | Round: Height<br>Output -5H<br>Target -8H |
|  | `1.6x` | `1344x3200` | `2160x5120` | `2150x5120` | `-10W` | Round: Width<br>Output -6W<br>Target -10W |
|  | `1.7x` | `1264x3008` | `2160x5120` | `2149x5114` | `-11W, -6H` | Round: Width + Height<br>Output -7W, -4H<br>Target -11W, -6H |
|  | `1.8x` | `1200x2848` | `2160x5120` | `2160x5126` | `+6H` | Round: Height<br>Output +4H<br>Target +6H |
|  | `1.9x` | `1136x2688` | `2160x5120` | `2158x5107` | `-2W, -13H` | Round: Width + Height<br>Output -1W, -7H<br>Target -2W, -13H |
|  | `2.0x` | `1088x2560` | `2160x5120` | `2176x5120` | `+16W` | Round: Width<br>Output +8W<br>Target +16W |

</details>

## Compact Machine-Readable Files

The Markdown tables above are for reading. These CSV files are kept for verification and spreadsheet workflows.

| File | Purpose |
| --- | --- |
| [`dimension-size-reference.csv`](dimension-size-reference.csv) | Full 330-row reference table with expected target, actual target, target deltas, raw values, aligned output, rounded axes, and deltas. |
| [`manual-e2e-size-matrix.csv`](manual-e2e-size-matrix.csv) | Manual E2E checklist with expected output and target sizes. |
| [`comfy-api-rounded-combinations.csv`](comfy-api-rounded-combinations.csv) | Only combinations where width, height, or both axes were rounded by 16-alignment. |
| [`comfy-api-e2e-results.csv`](comfy-api-e2e-results.csv) | ComfyUI API E2E image-size verification results. |
