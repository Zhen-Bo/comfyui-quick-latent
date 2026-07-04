"""Quick Latent node - ComfyUI custom node for direct latent size selection."""

import math

import torch
import comfy.model_management


PRESET_RESOLUTION_TABLE = {
    "1:1": {
        "1024": (1024, 1024),
        "1536": (1536, 1536),
        "2048": (2048, 2048),
    },
    "2:3": {
        "1024": (1024, 1536),
        "1536": (1280, 1920),
        "2048": (1536, 2304),
    },
    "3:4": {
        "1024": (1152, 1536),
        "1536": (1344, 1792),
        "2048": (1536, 2048),
    },
    "16:9": {
        "1024": (1536, 864),
        "1536": (1920, 1080),
        "2048": (2560, 1440),
    },
}

PRESET_RESOLUTIONS = ["1024", "1536", "2048"]
ASPECT_RATIOS = ["1:1", "2:3", "3:4", "16:9", "Custom"]
DIMENSION_ALIGNMENT = 8

CUSTOM_DIMENSION_MIN = 512
CUSTOM_DIMENSION_MAX = 4096
BATCH_SIZE_MIN = 1
BATCH_SIZE_MAX = 64


def round_to_alignment(value):
    """Round a numeric value up to the configured dimension alignment."""
    return math.ceil(value / DIMENSION_ALIGNMENT) * DIMENSION_ALIGNMENT


def floor_to_alignment(value):
    """Round a numeric value down to the configured dimension alignment."""
    return math.floor(value / DIMENSION_ALIGNMENT) * DIMENSION_ALIGNMENT


def orient_dimensions(width, height, orientation):
    """Return dimensions matching the requested orientation."""
    if orientation == "Landscape" and width < height:
        return (height, width)
    if orientation == "Portrait" and height < width:
        return (height, width)
    return (width, height)


def calculate_dimensions(preset_resolution, aspect_ratio, orientation):
    """Calculate direct output dimensions from a curated preset."""
    width, height = PRESET_RESOLUTION_TABLE[aspect_ratio][preset_resolution]
    width, height = orient_dimensions(width, height, orientation)
    return (round_to_alignment(width), round_to_alignment(height))


def calculate_custom_dimensions(custom_width, custom_height):
    """Calculate direct output dimensions from a user-supplied custom size."""
    width = max(CUSTOM_DIMENSION_MIN, min(CUSTOM_DIMENSION_MAX, custom_width))
    height = max(CUSTOM_DIMENSION_MIN, min(CUSTOM_DIMENSION_MAX, custom_height))
    return (floor_to_alignment(width), floor_to_alignment(height))


class QuickLatent:
    """ComfyUI node for quick direct latent image size generation."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "preset_resolution": (PRESET_RESOLUTIONS,),
                "aspect_ratio": (ASPECT_RATIOS,),
                "orientation": (["Landscape", "Portrait"],),
                "batch_size": ("INT", {"default": 1, "min": BATCH_SIZE_MIN, "max": BATCH_SIZE_MAX}),
                "custom_width": (
                    "INT",
                    {"default": 1024, "min": CUSTOM_DIMENSION_MIN, "max": CUSTOM_DIMENSION_MAX, "step": 8},
                ),
                "custom_height": (
                    "INT",
                    {"default": 1024, "min": CUSTOM_DIMENSION_MIN, "max": CUSTOM_DIMENSION_MAX, "step": 8},
                ),
            }
        }

    RETURN_TYPES = ("INT", "INT", "LATENT", "INT")
    RETURN_NAMES = ("OUTPUT_WIDTH", "OUTPUT_HEIGHT", "LATENT", "BATCH_SIZE")
    FUNCTION = "generate"
    CATEGORY = "QuickLatent"

    def generate(
        self,
        preset_resolution,
        aspect_ratio,
        orientation,
        batch_size,
        custom_width=1024,
        custom_height=1024,
    ):
        """Generate a zero-filled latent tensor at the selected output size."""
        batch_size = max(BATCH_SIZE_MIN, min(BATCH_SIZE_MAX, batch_size))

        if aspect_ratio == "Custom":
            width, height = calculate_custom_dimensions(custom_width, custom_height)
        else:
            width, height = calculate_dimensions(preset_resolution, aspect_ratio, orientation)

        latent = torch.zeros(
            [batch_size, 4, height // 8, width // 8],
            device=comfy.model_management.intermediate_device(),
        )

        return (width, height, {"samples": latent}, batch_size)


NODE_CLASS_MAPPINGS = {"QuickLatent": QuickLatent}
NODE_DISPLAY_NAME_MAPPINGS = {"QuickLatent": "Quick Latent"}
