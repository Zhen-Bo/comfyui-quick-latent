# Dimension Reference

Quick Latent treats the selected size as the direct output size. There is no scale factor and no target-size calculation.

## Rules

1. Each preset size fixes the long edge: `small` = `1536`, `medium` = `1920`, `large` = `2560`. `square` uses its own sizes: `1024`, `1536`, `2048`.
2. The short edge is `long edge x ratio`, rounded down to a multiple of `16`.
3. `landscape` swaps width and height. `portrait` keeps the long edge as the height.
4. `custom` ignores the preset size and ratio. Each custom axis is clamped to `512..4096`, then rounded down to a multiple of `16`.

Every output dimension is a multiple of `16`, which suits SDXL, FLUX, FLUX.2, Qwen-Image, and other models whose latent or patch grid needs 16 px steps.

## Preset Table

Portrait sizes (width x height). Landscape swaps the two numbers.

| Ratio | Label | `small` | `medium` | `large` |
| --- | --- | --- | --- | --- |
| `square` | `1:1` | `1024 x 1024` | `1536 x 1536` | `2048 x 2048` |
| `photo` | `2:3` / `3:2` | `1024 x 1536` | `1280 x 1920` | `1696 x 2560` |
| `standard` | `3:4` / `4:3` | `1152 x 1536` | `1440 x 1920` | `1920 x 2560` |
| `widescreen` | `9:16` / `16:9` | `864 x 1536` | `1072 x 1920` | `1440 x 2560` |

## Output Meaning

| Value | Meaning |
| --- | --- |
| `OUTPUT_WIDTH` | Actual 16-aligned latent image width. |
| `OUTPUT_HEIGHT` | Actual 16-aligned latent image height. |
| `LATENT` | Zero-filled latent tensor shaped as `[batch, 4, height // 8, width // 8]`, with `downscale_ratio_spacial: 8` so ComfyUI rescales it for 16x models such as FLUX.2 and Qwen-Image 2.1. |
| `BATCH_SIZE` | Selected batch size after clamping to `1..64`. |

## V3.0 Breaking Change

V3.0 does not read V2 workflow settings. Delete old Quick Latent nodes and add a new one after upgrading.
