"""Tests for the Custom resolution mode of the Quick Latent node (Phase 4, CUST-07).

Covers the locked decisions from 04-CONTEXT.md:
1. D-01: Custom width/height are TARGET sizes; latent = round8(custom / scale_factor)
   per axis, mirroring the divide+round8 tail of the preset path (no table lookup).
2. D-05: Never raise. Each axis is clamped to [512, 4096] then rounded up to a
   multiple of 8 (out-of-range and non-aligned inputs are tolerated).
3. D-06: Custom mode does NOT swap width/height by orientation (the frontend owns
   the Portrait/Landscape swap in Phase 5, so swapping here would double-swap).
4. Integration: Custom generate() returns all 5 outputs with the correct LATENT
   tensor shape [batch, 4, h//8, w//8].
5. D-02/D-03/D-04: back-compat — preset calls without custom args behave identically,
   and INPUT_TYPES exposes the Custom combo value and custom_width/custom_height config.

conftest.py already mocks comfy.model_management and preloads the `nodes` module,
so no extra setup is needed here.
"""

import sys
import os

# Add parent directory to path so we can import nodes.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from nodes import calculate_custom_dimensions, calculate_dimensions, QuickLatent


# ===========================================================================
# D-01: Custom target ÷ scale + round-up-to-8 (no table lookup)
# ===========================================================================

class TestCustomDimensionsScaleDivide:
    """D-01: latent output for each axis is round8(custom / scale_factor)."""

    def test_2048x1024_scale2(self):
        # 2048/2 = 1024 (8-aligned); 1024/2 = 512 (8-aligned)
        assert calculate_custom_dimensions(2048, 1024, 2.0) == (1024, 512)

    def test_1024x1024_scale1_identity(self):
        # scale 1.0, both already 8-aligned -> unchanged
        assert calculate_custom_dimensions(1024, 1024, 1.0) == (1024, 1024)

    def test_1920x1080_scale2_rounds_up(self):
        # 1920/2 = 960 (8-aligned); 1080/2 = 540 -> round_to_alignment -> 544
        assert calculate_custom_dimensions(1920, 1080, 2.0) == (960, 544)


# ===========================================================================
# D-05: Clamp to [512, 4096] then round up to 8; never raise
# ===========================================================================

class TestCustomDimensionsClampAndRound:
    """D-05: out-of-range and non-multiple-of-8 inputs are clamped+aligned, never raise."""

    def test_below_min_clamps_to_512(self):
        assert calculate_custom_dimensions(100, 100, 1.0) == (512, 512)

    def test_blank_zero_clamps_to_512(self):
        # Blank / 0 is treated as below-min and clamped up to the minimum.
        assert calculate_custom_dimensions(0, 0, 1.0) == (512, 512)

    def test_above_max_clamps_to_4096(self):
        assert calculate_custom_dimensions(9000, 9000, 1.0) == (4096, 4096)

    def test_non_multiple_of_8_rounds_up(self):
        # 513 is in range but not 8-aligned -> round_to_alignment -> 520
        assert calculate_custom_dimensions(513, 513, 1.0) == (520, 520)

    def test_mixed_clamp_then_scale(self):
        # 5000 -> clamp 4096 -> /2 = 2048; 300 -> clamp 512 -> /2 = 256
        assert calculate_custom_dimensions(5000, 300, 2.0) == (2048, 256)


# Spread of raw custom widths/heights (below-min, boundaries, non-aligned,
# typical, above-max) crossed with the supported scale factors.
CUSTOM_RAW_DIMS = [0, 100, 512, 513, 700, 1024, 1920, 3000, 4096, 9000]
CUSTOM_SCALE_FACTORS = [1.0, 1.1, 1.25, 1.5, 1.7, 2.0]


@pytest.mark.parametrize("width", CUSTOM_RAW_DIMS)
@pytest.mark.parametrize("height", CUSTOM_RAW_DIMS)
@pytest.mark.parametrize("scale", CUSTOM_SCALE_FACTORS)
def test_custom_divisible_by_8(width, height, scale):
    """Every Custom output must be divisible by 8 and the call must never raise."""
    w, h = calculate_custom_dimensions(width, height, scale)
    assert w % 8 == 0, f"Width {w} not divisible by 8 for {width}x{height}@{scale}"
    assert h % 8 == 0, f"Height {h} not divisible by 8 for {width}x{height}@{scale}"


# ===========================================================================
# D-06: No orientation swap in Custom mode
# ===========================================================================

class TestCustomNoOrientationSwap:
    """D-06: Custom generate() output is identical under Landscape and Portrait."""

    def test_landscape_and_portrait_identical(self):
        node = QuickLatent()
        landscape = node.generate(
            resolution="Custom", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=1, custom_width=2048, custom_height=1024
        )
        portrait = node.generate(
            resolution="Custom", aspect_ratio="1:1", orientation="Portrait",
            scale_factor=2.0, batch_size=1, custom_width=2048, custom_height=1024
        )
        # A wide 2048x1024 target must NOT flip to 512x1024 under Portrait.
        assert landscape[0] == 1024
        assert landscape[1] == 512
        assert portrait[0] == 1024
        assert portrait[1] == 512
        # Width/height outputs are identical regardless of orientation.
        assert (landscape[0], landscape[1]) == (portrait[0], portrait[1])


# ===========================================================================
# Custom generate() integration: all 5 outputs + tensor shape
# ===========================================================================

class TestCustomGenerateIntegration:
    """Custom generate() returns the 5-tuple with a correctly shaped LATENT tensor."""

    def test_custom_generate_five_outputs(self):
        node = QuickLatent()
        result = node.generate(
            resolution="Custom", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=1, custom_width=2048, custom_height=1024
        )
        assert isinstance(result, tuple)
        assert len(result) == 5
        width, height, scale, latent, batch = result
        assert width == 1024
        assert height == 512
        assert scale == 2.0
        assert batch == 1
        assert isinstance(latent, dict)
        assert "samples" in latent

    def test_custom_generate_tensor_shape(self):
        node = QuickLatent()
        result = node.generate(
            resolution="Custom", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=1, custom_width=2048, custom_height=1024
        )
        latent = result[3]
        # [batch, 4, height // 8, width // 8] == (1, 4, 512 // 8, 1024 // 8)
        assert latent["samples"].shape == (1, 4, 64, 128)


# ===========================================================================
# D-02/D-03/D-04: back-compat + INPUT_TYPES widget config
# ===========================================================================

class TestCustomBackCompatAndInputTypes:
    """Preset back-compat (D-03) and Custom INPUT_TYPES exposure (D-02/D-04)."""

    def test_preset_call_without_custom_args(self):
        """Old-style preset call (no custom_width/custom_height) still returns the 5-tuple."""
        node = QuickLatent()
        result = node.generate(
            resolution="1K", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=1
        )
        width, height, scale, latent, batch = result
        assert width == 512
        assert height == 512
        assert scale == 2.0
        assert batch == 1
        assert "samples" in latent

    def test_resolution_combo_includes_custom(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["resolution"] == (["1K", "2K", "4K", "Custom"],)

    def test_custom_width_widget_config(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["custom_width"] == ("INT", {"default": 1024, "min": 512, "max": 4096, "step": 8})

    def test_custom_height_widget_config(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["custom_height"] == ("INT", {"default": 1024, "min": 512, "max": 4096, "step": 8})
