# ComfyUI Quick Latent

Quick Latent is a ComfyUI node for choosing an image latent output size with minimal calculation burden on the user.

## Language

**Direct Output Size**:
The width and height that Quick Latent emits to the workflow. In V2.0 discussions, the selected size is the output size, not a target that is divided by a scale factor.
_Avoid_: Target size, scaled size

**Ratio Family**:
A stable aspect-ratio choice whose displayed label changes with orientation. For example, the same family may display as `2:3` in portrait and `3:2` in landscape.
_Avoid_: Aspect label as identity

**Orientation**:
The selected display direction for the current ratio family or custom size. Changing orientation swaps width and height while preserving the selected ratio family.
_Avoid_: Separate landscape preset, separate portrait preset

**Preset Resolution**:
A curated direct output size offered by Quick Latent for the active ratio family. It is displayed as an explicit `width x height` value.
_Avoid_: Small, medium, large

**Custom Size**:
A user-entered direct output width and height. When orientation changes, the custom width and height swap so the user's selected orientation remains reflected in the numbers.
_Avoid_: Custom ratio
