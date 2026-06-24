# Dimension Reference

Quick Latent treats the selected resolution as the intended final target, then
derives the sampler latent size from that target and the selected scale factor.

## Calculation

1. Start from the preset target size for `resolution + aspect_ratio`.
2. Apply `orientation` by swapping width and height when needed.
3. Divide width and height by `scale_factor`.
4. Align each divided value up to the next multiple of `8`.
5. Return the aligned values as `OUTPUT_WIDTH` and `OUTPUT_HEIGHT`.
6. Display `Target Size` as `OUTPUT_WIDTH * scale_factor` and `OUTPUT_HEIGHT * scale_factor`.

The Python backend and frontend both use round-up alignment. This keeps target
sizes from undershooting the selected preset target when a scale factor produces
fractional sampler dimensions.

## Output Meaning

| Value | Meaning |
| --- | --- |
| `OUTPUT_WIDTH` | Actual 8-aligned sampler width. |
| `OUTPUT_HEIGHT` | Actual 8-aligned sampler height. |
| `SCALE` | Selected scale factor. |
| `Target Size` | Expected final size after applying `SCALE` to the aligned output size. |

Example:

| Setting | Output | Target |
| --- | --- | --- |
| `4K / 3:4 / Portrait / 2.0x` | `1440 x 1920` | `2880 x 3840` |
| `4K / 16:9 / Portrait / 2.0x` | `1080 x 1920` | `2160 x 3840` |
| `1K / 1:1 / Landscape / 1.1x` | `936 x 936` | `1030 x 1030` |

## Rounding Summary

Each scale has 30 combinations: `3 resolutions * 5 aspect ratios * 2 orientations`.

| Scale | Rounded-up combinations | Exact combinations |
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

If you exclude `1.0x`, `1.3x`, `1.5x`, `1.7x`, and `2.0x`, the remaining scales
still contain rounded-up dimensions:

| Remaining scale | Rounded-up combinations |
| --- | ---: |
| `1.1x` | 30 |
| `1.2x` | 22 |
| `1.4x` | 30 |
| `1.6x` | 16 |
| `1.8x` | 28 |
| `1.9x` | 30 |

On the excluded scales themselves:

| Excluded scale | Rounded-up combinations |
| --- | ---: |
| `1.0x` | 0 |
| `1.3x` | 30 |
| `1.5x` | 20 |
| `1.7x` | 30 |
| `2.0x` | 2 |

## Tables

Use the Markdown table when you want to look up a setting by eye:

| File | Purpose |
| --- | --- |
| [`dimension-tables.md`](dimension-tables.md) | Human-readable Markdown lookup tables. Each row shows output, expected target, actual target, difference, and rounded-up axes. |

Use these CSV files for auditing, scripts, or spreadsheet filtering:

| File | Purpose |
| --- | --- |
| [`dimension-size-reference.csv`](dimension-size-reference.csv) | Full 330-row reference table. Includes expected target, actual target, target delta, `rounded`, `rounded_axes`, and raw alignment delta columns. |
| [`manual-e2e-size-matrix.csv`](manual-e2e-size-matrix.csv) | Manual E2E checklist with expected output and target sizes. |
| [`comfy-api-rounded-combinations.csv`](comfy-api-rounded-combinations.csv) | Only combinations where width, height, or both were rounded up by 8-alignment. |
| [`comfy-api-e2e-results.csv`](comfy-api-e2e-results.csv) | ComfyUI API E2E results for all 330 combinations. |

Important columns in `dimension-size-reference.csv`:

| Column | Meaning |
| --- | --- |
| `expected_target_width`, `expected_target_height` | Original preset target after applying orientation. |
| `raw_width_after_scale`, `raw_height_after_scale` | Size before 8-alignment. |
| `output_width`, `output_height` | Actual aligned sampler size. |
| `actual_target_width`, `actual_target_height` | Output size multiplied by scale. |
| `target_delta_width`, `target_delta_height`, `target_delta` | Actual target minus expected target. |
| `rounded` | `yes` when at least one axis changed during 8-alignment. |
| `rounded_axes` | `width`, `height`, or `width+height`. |
| `width_delta`, `height_delta` | Aligned output minus raw size. Non-zero values mark rounding. |

## Verification

The ComfyUI API E2E test generated an image for each combination and checked the
actual PNG dimensions against the expected dimensions:

| Check | Result |
| --- | --- |
| Total combinations | 330 |
| Output/target size failures | 0 |
| Rounded-up combinations | 238 |
