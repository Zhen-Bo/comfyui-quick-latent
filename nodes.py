from collections import namedtuple

import torch
import comfy.model_management


Ratio = namedtuple("Ratio", ["short_part", "long_part"])

ALIGNMENT = 16
LONG_EDGES = {"small": 1536, "medium": 1920, "large": 2560}
SQUARE_LONG_EDGES = {"small": 1024, "medium": 1536, "large": 2048}
RATIOS = {
    "square": Ratio(1, 1),
    "photo": Ratio(2, 3),
    "standard": Ratio(3, 4),
    "widescreen": Ratio(9, 16),
}
ORIENTATIONS = ["portrait", "landscape", "custom"]

CUSTOM_MIN = 512
BATCH_SIZE_MIN = 1
LATENT_DOWNSCALE_RATIO = 8


def floor_to_alignment(value):
    return value - value % ALIGNMENT


def require_int(name, value, low):
    if type(value) is not int or value < low:
        raise ValueError(f"{name} must be an integer of at least {low}, got {value!r}")
    return value


def preset_dimensions(size, ratio, orientation):
    short_part, long_part = RATIOS[ratio]
    long_edge = (SQUARE_LONG_EDGES if ratio == "square" else LONG_EDGES)[size]
    short_edge = floor_to_alignment(long_edge * short_part // long_part)
    if orientation == "landscape":
        return (long_edge, short_edge)
    return (short_edge, long_edge)


def custom_dimensions(custom_width, custom_height):
    width = require_int("custom_width", custom_width, CUSTOM_MIN)
    height = require_int("custom_height", custom_height, CUSTOM_MIN)
    return (floor_to_alignment(width), floor_to_alignment(height))


class QuickLatent:
    @classmethod
    def INPUT_TYPES(cls):
        custom_dimension = ("INT", {"default": 1024, "min": CUSTOM_MIN, "step": ALIGNMENT})
        return {
            "required": {
                "preset_resolution": (list(LONG_EDGES),),
                "aspect_ratio": (list(RATIOS),),
                "orientation": (ORIENTATIONS,),
                "batch_size": ("INT", {"default": 1, "min": BATCH_SIZE_MIN}),
                "custom_width": custom_dimension,
                "custom_height": custom_dimension,
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
        batch_size = require_int("batch_size", batch_size, BATCH_SIZE_MIN)

        if orientation == "custom":
            width, height = custom_dimensions(custom_width, custom_height)
        else:
            width, height = preset_dimensions(preset_resolution, aspect_ratio, orientation)

        latent = torch.zeros(
            [batch_size, 4, height // LATENT_DOWNSCALE_RATIO, width // LATENT_DOWNSCALE_RATIO],
            device=comfy.model_management.intermediate_device(),
        )

        # ComfyUI uses the declared ratio to resize this latent for 16x models (FLUX.2, Qwen-Image 2.1).
        return (width, height, {"samples": latent, "downscale_ratio_spacial": LATENT_DOWNSCALE_RATIO}, batch_size)


NODE_CLASS_MAPPINGS = {"QuickLatent": QuickLatent}
NODE_DISPLAY_NAME_MAPPINGS = {"QuickLatent": "Quick Latent"}
