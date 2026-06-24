# ComfyUI Quick Latent

[English](README.md) | [繁體中文](README_zhTW.md)

一個精簡的 ComfyUI 自訂節點，用常用解析度預設快速建立 latent tensor。

<table>
  <tr>
    <td><img src="docs/images/quick-latent-node.png" alt="Quick Latent 節點介面" /></td>
    <td><img src="docs/images/quick-latent-workflow.png" alt="Quick Latent 工作流程範例" /></td>
  </tr>
</table>

Quick Latent 可以選擇解析度等級、長寬比、方向、縮放倍率和批次大小，並輸出計算後的寬度、高度、縮放倍率、latent tensor 和批次大小。

## 功能

| 功能 | 說明 |
| --- | --- |
| 解析度預設 | 可選擇 1K、2K、4K 目標尺寸。 |
| 長寬比 | 支援 1:1、2:3、3:4、16:9、21:9。 |
| 方向 | 可切換橫向與直向。 |
| 縮放倍率 | 以 1.0x 到 2.0x 的 downscale factor 產生 latent 尺寸。 |
| 批次大小 | 可建立 1 到 64 張的 latent batch。 |
| 自訂介面 | 在 ComfyUI 節點內使用精簡的 canvas UI。 |
| 輸出 | 回傳寬度、高度、縮放倍率、latent 和批次大小。 |

## 安裝

### 透過 ComfyUI Manager

在 ComfyUI Manager 搜尋 `comfyui-quick-latent`，然後點選安裝。

安裝後重新啟動 ComfyUI。

### 手動安裝

將此 repository clone 到 ComfyUI 的 custom nodes 目錄：

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/Zhen-Bo/comfyui-quick-latent.git
```

安裝後重新啟動 ComfyUI。

## 使用方式

從 `QuickLatent` 分類新增 `Quick Latent` 節點。

在節點中選擇：

- Resolution：`1K`、`2K` 或 `4K`
- Aspect Ratio
- Orientation
- Scale Factor
- Batch Size

節點會回傳一個 zero-filled latent tensor，以及可接到下游 ComfyUI workflow 的對應尺寸數值。

## 輸出

| 輸出 | 型別 | 說明 |
| --- | --- | --- |
| `OUTPUT_WIDTH` | `INT` | 計算後的 latent image 寬度。 |
| `OUTPUT_HEIGHT` | `INT` | 計算後的 latent image 高度。 |
| `SCALE` | `FLOAT` | 選擇的縮放倍率。 |
| `LATENT` | `LATENT` | Zero-filled latent tensor。 |
| `BATCH_SIZE` | `INT` | 選擇的批次大小。 |

## Roadmap

- 新增 `Custom` 解析度模式
- 讓 output width / height label 可以直接點選編輯
- 手動編輯尺寸後，自動切換為 custom mode
- 使用 custom dimensions 時，停用並灰化 aspect ratio 選項

## 授權

MIT License。詳見 [LICENSE](LICENSE)。
