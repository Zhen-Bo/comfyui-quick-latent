# Dimension Reference

Quick Latent V2 treats the selected size as the direct output size. There is no scale factor and no target-size calculation.

## Calculation

1. Select a ratio family.
2. Select `Portrait` or `Landscape`.
3. Select a preset resolution or enter a custom width and height.
4. Preserve custom input values in the UI.
5. Clamp custom dimensions to `512..4096` for output.
6. Align each custom output axis down to the previous multiple of `8`.
7. Preset dimensions are already aligned to multiples of `8`.
8. Return the aligned values as `OUTPUT_WIDTH` and `OUTPUT_HEIGHT`.

## Preset Table

| Ratio family | Portrait label | Portrait presets | Landscape label | Landscape presets |
| --- | --- | --- | --- | --- |
| `1:1` | `1:1` | `1024 x 1024`, `1536 x 1536`, `2048 x 2048` | `1:1` | `1024 x 1024`, `1536 x 1536`, `2048 x 2048` |
| `2:3` | `2:3` | `1024 x 1536`, `1280 x 1920`, `1536 x 2304` | `3:2` | `1536 x 1024`, `1920 x 1280`, `2304 x 1536` |
| `3:4` | `3:4` | `1152 x 1536`, `1344 x 1792`, `1536 x 2048` | `4:3` | `1536 x 1152`, `1792 x 1344`, `2048 x 1536` |
| `16:9` | `9:16` | `864 x 1536`, `1080 x 1920`, `1440 x 2560` | `16:9` | `1536 x 864`, `1920 x 1080`, `2560 x 1440` |
| `Custom` | `Custom` | User width and height | `Custom` | User width and height, swapped when orientation changes |

## Output Meaning

| Value | Meaning |
| --- | --- |
| `OUTPUT_WIDTH` | Actual 8-aligned latent image width. |
| `OUTPUT_HEIGHT` | Actual 8-aligned latent image height. |
| `LATENT` | Zero-filled latent tensor shaped as `[batch, 4, height // 8, width // 8]`. |
| `BATCH_SIZE` | Selected batch size after clamping to `1..64`. |

## V2.0 Breaking Change

V2.0 intentionally does not migrate V1 workflow settings. V1 `1K`/`2K`/`4K`, scale factor, `SCALE` output, and `21:9` preset choices should be reselected manually in V2.
