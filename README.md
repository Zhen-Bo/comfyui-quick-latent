# ComfyUI Quick Latent

[English](README.md) | [繁體中文](README_zhTW.md)

A streamlined ComfyUI custom node for creating latent tensors from direct output-size presets.

Quick Latent lets you choose an orientation, ratio family, curated output size, or custom width and height, then outputs the matching width, height, latent tensor, and batch size.

## V2.0 Breaking Change

V2.0 removes the scale factor control and the `SCALE` output. Selected dimensions are now the direct output size. Existing V1 workflows should be reselected after upgrading.

## Features

| Feature | Description |
| --- | --- |
| Direct presets | Choose explicit output sizes such as `1024 x 1536`, `1920 x 1080`, or `2048 x 2048`. |
| Ratio families | Supports `1:1`, `2:3`, `3:4`, `16:9`, and `Custom`. |
| Orientation | Switches labels and swaps preset/custom width and height between portrait and landscape. |
| Custom size | Enter direct output width and height. Input values are preserved, clamped to `512` through `4096`, then rounded down to multiples of `8` for the actual output. |
| Batch size | Create latent batches from 1 to 64. |
| Custom UI | Uses a compact canvas UI inside the ComfyUI node. |

## Installation

### Via ComfyUI Manager

Search for `comfyui-quick-latent` in ComfyUI Manager and click Install.

Restart ComfyUI after installation.

### Manual Installation

Clone this repository into your ComfyUI custom nodes directory:

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/Zhen-Bo/comfyui-quick-latent.git
```

Restart ComfyUI after installation.

## Usage

Add the `Quick Latent` node from the `QuickLatent` category.

Use the node controls to select:

- Orientation: `Portrait` or `Landscape`
- Aspect ratio: `1:1`, `2:3`, `3:4`, `16:9`, or `Custom`
- Preset resolution or custom width and height
- Batch size

The node returns a zero-filled latent tensor and matching dimension values for downstream ComfyUI workflows. Output width and height are the direct 8-aligned latent image dimensions used by the sampler.

For the full V2.0 preset table, see [Dimension Reference](docs/dimensions.md).

## Outputs

| Output | Type | Description |
| --- | --- | --- |
| `OUTPUT_WIDTH` | `INT` | Actual 8-aligned latent image width. |
| `OUTPUT_HEIGHT` | `INT` | Actual 8-aligned latent image height. |
| `LATENT` | `LATENT` | Zero-filled latent tensor. |
| `BATCH_SIZE` | `INT` | Selected batch size. |

## License

MIT License. See [LICENSE](LICENSE).
