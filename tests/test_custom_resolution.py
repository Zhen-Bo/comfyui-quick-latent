"""Tests for the Custom resolution mode of the Quick Latent node (CUST-07).

Covers the locked decisions from 04-CONTEXT.md (D-01 revised 2026-07-04 after
Phase 5 UAT):
1. D-01: Custom width/height are the RAW OUTPUT (latent) size; latent =
   round8(clamp(custom)) per axis. scale_factor does NOT divide — the entered
   size IS the output; scale is display-only (UI target = output x scale).
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
# D-01: Custom entered size IS the raw output latent (round8, no scale divide)
# ===========================================================================

class TestCustomDimensionsRawOutput:
    """D-01: latent output for each axis is round8(clamp(custom)) — no scale divide."""

    def test_2048x1024_is_output_size(self):
        # The entered size is the output size (already 8-aligned) -> unchanged.
        assert calculate_custom_dimensions(2048, 1024) == (2048, 1024)

    def test_1024x1024_identity(self):
        assert calculate_custom_dimensions(1024, 1024) == (1024, 1024)

    def test_1920x1080_already_aligned(self):
        # Both already multiples of 8 -> unchanged (no scale divide).
        assert calculate_custom_dimensions(1920, 1080) == (1920, 1080)


# ===========================================================================
# D-05: Clamp to [512, 4096] then round up to 8; never raise
# ===========================================================================

class TestCustomDimensionsClampAndRound:
    """D-05: out-of-range and non-multiple-of-8 inputs are clamped+aligned, never raise."""

    def test_below_min_clamps_to_512(self):
        assert calculate_custom_dimensions(100, 100) == (512, 512)

    def test_blank_zero_clamps_to_512(self):
        # Blank / 0 is treated as below-min and clamped up to the minimum.
        assert calculate_custom_dimensions(0, 0) == (512, 512)

    def test_above_max_clamps_to_4096(self):
        assert calculate_custom_dimensions(9000, 9000) == (4096, 4096)

    def test_non_multiple_of_8_rounds_up(self):
        # 513 is in range but not 8-aligned -> round_to_alignment -> 520
        assert calculate_custom_dimensions(513, 513) == (520, 520)

    def test_mixed_clamp_both_axes(self):
        # 5000 -> clamp 4096; 300 -> clamp 512 (no scale divide).
        assert calculate_custom_dimensions(5000, 300) == (4096, 512)


# Spread of raw custom widths/heights (below-min, boundaries, non-aligned,
# typical, above-max). The output must always be divisible by 8 and never raise.
CUSTOM_RAW_DIMS = [0, 100, 512, 513, 700, 1024, 1920, 3000, 4096, 9000]


@pytest.mark.parametrize("width", CUSTOM_RAW_DIMS)
@pytest.mark.parametrize("height", CUSTOM_RAW_DIMS)
def test_custom_divisible_by_8(width, height):
    """Every Custom output must be divisible by 8 and the call must never raise."""
    w, h = calculate_custom_dimensions(width, height)
    assert w % 8 == 0, f"Width {w} not divisible by 8 for {width}x{height}"
    assert h % 8 == 0, f"Height {h} not divisible by 8 for {width}x{height}"


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
        # A wide 2048x1024 output must NOT flip to 1024x2048 under Portrait.
        assert landscape[0] == 2048
        assert landscape[1] == 1024
        assert portrait[0] == 2048
        assert portrait[1] == 1024
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
        # Entered size is the output size (no scale divide); scale still passed through.
        assert width == 2048
        assert height == 1024
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
        # [batch, 4, height // 8, width // 8] == (1, 4, 1024 // 8, 2048 // 8)
        assert latent["samples"].shape == (1, 4, 128, 256)


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
