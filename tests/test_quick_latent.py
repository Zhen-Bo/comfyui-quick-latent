"""Tests for the Quick Latent v3 node schema and generation behavior."""

from nodes import QuickLatent


def generate(**overrides):
    inputs = {
        "preset_resolution": "medium",
        "aspect_ratio": "photo",
        "orientation": "portrait",
        "batch_size": 1,
        "custom_width": 1024,
        "custom_height": 1024,
    }
    inputs.update(overrides)
    return QuickLatent().generate(**inputs)


def test_input_types():
    inputs = QuickLatent.INPUT_TYPES()["required"]
    custom_dimension = ("INT", {"default": 1024, "min": 512, "max": 4096, "step": 16})

    assert inputs == {
        "preset_resolution": (["small", "medium", "large"],),
        "aspect_ratio": (["square", "photo", "standard", "widescreen"],),
        "orientation": (["portrait", "landscape", "custom"],),
        "batch_size": ("INT", {"default": 1, "min": 1, "max": 64}),
        "custom_width": custom_dimension,
        "custom_height": custom_dimension,
    }


def test_outputs():
    assert QuickLatent.RETURN_TYPES == ("INT", "INT", "LATENT", "INT")
    assert QuickLatent.RETURN_NAMES == ("OUTPUT_WIDTH", "OUTPUT_HEIGHT", "LATENT", "BATCH_SIZE")


def test_generate_preset():
    width, height, latent, batch = generate(aspect_ratio="widescreen", orientation="landscape", batch_size=2)

    assert (width, height, batch) == (1920, 1072, 2)
    assert latent["samples"].shape == (2, 4, 1072 // 8, 1920 // 8)
    assert latent["downscale_ratio_spacial"] == 8


def test_generate_custom_ignores_preset_and_ratio():
    first = generate(orientation="custom", custom_width=2000, custom_height=1000)
    second = generate(orientation="custom", custom_width=2000, custom_height=1000, aspect_ratio="square")

    assert first[0:2] == second[0:2] == (2000, 992)


def test_generate_clamps_batch_size():
    assert generate(batch_size=0)[3] == 1
    assert generate(batch_size=99)[3] == 64
    assert generate(batch_size=17.5)[3] == 1
