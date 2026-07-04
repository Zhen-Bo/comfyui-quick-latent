# ComfyUI Quick Latent

[English](README.md) | [繁體中文](README_zhTW.md)

一個精簡的 ComfyUI 自訂節點，用常用直接輸出尺寸快速建立 latent tensor。

Quick Latent 可以選擇方向、比例家族、常用輸出尺寸或自訂寬高，並輸出對應的寬度、高度、latent tensor 和批次大小。

## V2.0 Breaking Change

V2.0 移除縮放倍率控制和 `SCALE` 輸出。使用者選擇的尺寸現在就是直接輸出尺寸。升級後舊版 V1 workflow 需要重新選擇節點設定。

## 功能

| 功能 | 說明 |
| --- | --- |
| 直接尺寸預設 | 可選擇明確輸出尺寸，例如 `1024 x 1536`、`1920 x 1080` 或 `2048 x 2048`。 |
| 比例家族 | 支援 `1:1`、`2:3`、`3:4`、`16:9` 和 `Custom`。 |
| 方向 | 切換直向與橫向時，比例標籤和 preset/custom 寬高會一起交換。 |
| 自訂尺寸 | 直接輸入輸出寬高。輸入值會保留，範圍限制在 `512` 到 `4096`，實際輸出時向下對齊到 `8` 的倍數。 |
| 批次大小 | 可建立 1 到 64 張的 latent batch。 |
| 自訂介面 | 在 ComfyUI 節點內使用精簡的 canvas UI。 |

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

- Orientation：`Portrait` 或 `Landscape`
- Aspect Ratio：`1:1`、`2:3`、`3:4`、`16:9` 或 `Custom`
- Preset resolution 或自訂寬高
- Batch Size

節點會回傳一個 zero-filled latent tensor，以及可接到下游 ComfyUI workflow 的對應尺寸數值。Output width / height 是實際 8 對齊後送進 sampler 的 latent image 尺寸。

完整 V2.0 preset 尺寸表請參考 [尺寸參考](docs/dimensions.md)。

## 輸出

| 輸出 | 型別 | 說明 |
| --- | --- | --- |
| `OUTPUT_WIDTH` | `INT` | 實際 8 對齊後的 latent image 寬度。 |
| `OUTPUT_HEIGHT` | `INT` | 實際 8 對齊後的 latent image 高度。 |
| `LATENT` | `LATENT` | Zero-filled latent tensor。 |
| `BATCH_SIZE` | `INT` | 選擇的批次大小。 |

## 授權

MIT License。詳見 [LICENSE](LICENSE)。
