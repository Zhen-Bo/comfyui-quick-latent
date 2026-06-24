"""Quick Latent node - ComfyUI custom node for preset-based latent image generation.

Provides a resolution lookup table, dimension calculator, and QuickLatent node class
for ComfyUI latent generation. All dimensions are rounded up to the nearest multiple of 8
for clean latent alignment.
"""

import math
import torch
import comfy.model_management

# Resolution table: landscape-native (W, H) pairs keyed by tier and aspect ratio.
# These are TARGET resolutions (what the user wants after upscaling).
# Values sourced from PROJECT.md - exact, not computed from ratios.
RESOLUTION_TABLE = {
    "1K": {
        "1:1": (1024, 1024),
        "2:3": (1280, 1920),
        "3:4": (1440, 1920),
        "16:9": (1920, 1080),
        "21:9": (2560, 1088),
    },
    "2K": {
        "1:1": (2048, 2048),
        "2:3": (1712, 2560),
        "3:4": (1920, 2560),
        "16:9": (2560, 1440),
        "21:9": (3440, 1440),
    },
    "4K": {
        "1:1": (2160, 2160),
        "2:3": (2560, 3840),
        "3:4": (2880, 3840),
        "16:9": (3840, 2160),
        "21:9": (5120, 2160),
    },
}

DIMENSION_ALIGNMENT = 8


def round_to_alignment(value):
    """Round a numeric value up to the configured dimension alignment.

    Examples:
        round_to_alignment(540)  -> 544  (ceil(540/8) = 68)
        round_to_alignment(960)  -> 960  (already a multiple of 8)
        round_to_alignment(1080) -> 1080 (already a multiple of 8)
    """
    return math.ceil(value / DIMENSION_ALIGNMENT) * DIMENSION_ALIGNMENT


def calculate_dimensions(resolution, aspect_ratio, orientation, scale_factor):
    """Calculate latent-aligned dimensions from resolution parameters.

    Args:
        resolution: Tier key ("1K", "2K", or "4K")
        aspect_ratio: Ratio key ("1:1", "2:3", "3:4", "16:9", or "21:9")
        orientation: "Landscape" or "Portrait"
        scale_factor: Division factor (1.0 to 2.0)

    Returns:
        Tuple of (width, height) as integers, both divisible by 8.

    Algorithm:
        1. Look up (w, h) from RESOLUTION_TABLE
        2. If Portrait: swap to (h, w)
        3. Divide both by scale_factor
        4. Apply round_to_alignment to both
        5. Return as integer tuple
    """
    w, h = RESOLUTION_TABLE[resolution][aspect_ratio]

    if orientation == "Landscape":
        if w < h:
            w, h = h, w
    elif orientation == "Portrait":
        if h < w:
            w, h = h, w

    w = w / scale_factor
    h = h / scale_factor

    w = round_to_alignment(w)
    h = round_to_alignment(h)

    return (int(w), int(h))


class QuickLatent:
    """ComfyUI node for quick preset-based latent image generation.

    Users select resolution tier, aspect ratio, orientation, and scale factor.
    The node calculates correct latent dimensions and outputs ready-to-use tensors.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "resolution": (["1K", "2K", "4K"],),
                "aspect_ratio": (["1:1", "2:3", "3:4", "16:9", "21:9"],),
                "orientation": (["Landscape", "Portrait"],),
                "scale_factor": ("FLOAT", {"default": 2.0, "min": 1.0, "max": 2.0, "step": 0.1}),
                "batch_size": ("INT", {"default": 1, "min": 1, "max": 64}),
            }
        }

    RETURN_TYPES = ("INT", "INT", "FLOAT", "LATENT", "INT")
    RETURN_NAMES = ("OUTPUT_WIDTH", "OUTPUT_HEIGHT", "SCALE", "LATENT", "BATCH_SIZE")
    FUNCTION = "generate"
    CATEGORY = "QuickLatent"

    def generate(self, resolution, aspect_ratio, orientation, scale_factor, batch_size):
        """Generate a latent tensor with calculated dimensions.

        Args:
            resolution: Tier key ("1K", "2K", or "4K")
            aspect_ratio: Ratio key ("1:1", "2:3", "3:4", "16:9", or "21:9")
            orientation: "Landscape" or "Portrait"
            scale_factor: Division factor (1.0 to 2.0)
            batch_size: Number of latent images to generate

        Returns:
            Tuple of (scale_factor, width, height, batch_size, {"samples": tensor})
        """
        # Clamp batch_size to minimum 1 (per D-11)
        batch_size = max(1, batch_size)

        # Calculate output dimensions
        width, height = calculate_dimensions(resolution, aspect_ratio, orientation, scale_factor)

        # Create latent tensor: [batch, 4, h//8, w//8] on intermediate device
        latent = torch.zeros(
            [batch_size, 4, height // 8, width // 8],
            device=comfy.model_management.intermediate_device()
        )

        return (width, height, scale_factor, {"samples": latent}, batch_size)


# Node registration mappings for ComfyUI
NODE_CLASS_MAPPINGS = {"QuickLatent": QuickLatent}
NODE_DISPLAY_NAME_MAPPINGS = {"QuickLatent": "Quick Latent"}
