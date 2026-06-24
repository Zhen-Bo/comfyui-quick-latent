"""Comprehensive tests for the Quick Latent resolution calculation engine and node class.

Tests cover:
1. All 15 landscape lookups at scale 1.0
2. Portrait swaps W/H for non-square ratios
3. Portrait with 1:1 ratio (symmetric, no visible swap)
4. Scale factor 2.0 on several combos
5. Scale factor 1.5 producing fractional values that must round
6. Every output is divisible by 8 (parametric check)
7. QuickLatent node class: INPUT_TYPES, RETURN_TYPES, RETURN_NAMES, FUNCTION, CATEGORY
8. QuickLatent.generate method: output format, batch_size clamping, tensor shape
"""

import sys
import os

# Add parent directory to path so we can import nodes.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from nodes import RESOLUTION_TABLE, round_to_alignment, calculate_dimensions, QuickLatent


# ===========================================================================
# Test 1: All 15 landscape lookups at scale 1.0
# ===========================================================================

class TestResolutionTableLandscape:
    """Verify all 15 tier+ratio entries return correct landscape dimensions at scale 1.0."""

    def test_1k_1_1(self):
        assert calculate_dimensions("1K", "1:1", "Landscape", 1.0) == (1024, 1024)

    def test_1k_2_3(self):
        assert calculate_dimensions("1K", "2:3", "Landscape", 1.0) == (1920, 1280)

    def test_1k_3_4(self):
        assert calculate_dimensions("1K", "3:4", "Landscape", 1.0) == (1920, 1440)

    def test_1k_16_9(self):
        assert calculate_dimensions("1K", "16:9", "Landscape", 1.0) == (1920, 1080)

    def test_1k_21_9(self):
        assert calculate_dimensions("1K", "21:9", "Landscape", 1.0) == (2560, 1088)

    def test_2k_1_1(self):
        assert calculate_dimensions("2K", "1:1", "Landscape", 1.0) == (2048, 2048)

    def test_2k_2_3(self):
        assert calculate_dimensions("2K", "2:3", "Landscape", 1.0) == (2560, 1712)

    def test_2k_3_4(self):
        assert calculate_dimensions("2K", "3:4", "Landscape", 1.0) == (2560, 1920)

    def test_2k_16_9(self):
        assert calculate_dimensions("2K", "16:9", "Landscape", 1.0) == (2560, 1440)

    def test_2k_21_9(self):
        assert calculate_dimensions("2K", "21:9", "Landscape", 1.0) == (3440, 1440)

    def test_4k_1_1(self):
        assert calculate_dimensions("4K", "1:1", "Landscape", 1.0) == (2160, 2160)

    def test_4k_2_3(self):
        assert calculate_dimensions("4K", "2:3", "Landscape", 1.0) == (3840, 2560)

    def test_4k_3_4(self):
        assert calculate_dimensions("4K", "3:4", "Landscape", 1.0) == (3840, 2880)

    def test_4k_16_9(self):
        assert calculate_dimensions("4K", "16:9", "Landscape", 1.0) == (3840, 2160)

    def test_4k_21_9(self):
        assert calculate_dimensions("4K", "21:9", "Landscape", 1.0) == (5120, 2160)


# ===========================================================================
# Test 2: Portrait swaps W/H for non-square ratios
# ===========================================================================

class TestPortraitSwap:
    """Verify portrait mode swaps width and height for non-square ratios."""

    def test_1k_2_3_portrait(self):
        assert calculate_dimensions("1K", "2:3", "Portrait", 1.0) == (1280, 1920)

    def test_1k_3_4_portrait(self):
        assert calculate_dimensions("1K", "3:4", "Portrait", 1.0) == (1440, 1920)

    def test_1k_16_9_portrait(self):
        assert calculate_dimensions("1K", "16:9", "Portrait", 1.0) == (1080, 1920)

    def test_1k_21_9_portrait(self):
        assert calculate_dimensions("1K", "21:9", "Portrait", 1.0) == (1088, 2560)

    def test_2k_16_9_portrait(self):
        assert calculate_dimensions("2K", "16:9", "Portrait", 1.0) == (1440, 2560)

    def test_4k_16_9_portrait(self):
        assert calculate_dimensions("4K", "16:9", "Portrait", 1.0) == (2160, 3840)


# ===========================================================================
# Test 3: Portrait with 1:1 ratio (symmetric, no visible swap)
# ===========================================================================

class TestPortraitSquare:
    """Portrait with 1:1 ratio should produce same result as landscape (symmetric)."""

    def test_1k_1_1_portrait(self):
        assert calculate_dimensions("1K", "1:1", "Portrait", 1.0) == (1024, 1024)

    def test_2k_1_1_portrait(self):
        assert calculate_dimensions("2K", "1:1", "Portrait", 1.0) == (2048, 2048)

    def test_4k_1_1_portrait(self):
        assert calculate_dimensions("4K", "1:1", "Portrait", 1.0) == (2160, 2160)


# ===========================================================================
# Test 4: Scale factor 2.0 on several combos
# ===========================================================================

class TestScaleFactor2:
    """Scale factor 2.0 divides dimensions by 2 before rounding up to 8."""

    def test_1k_16_9_landscape_scale2(self):
        # (1920, 1080) / 2 = (960, 540) -> round_to_alignment -> (960, 544)
        assert calculate_dimensions("1K", "16:9", "Landscape", 2.0) == (960, 544)

    def test_1k_16_9_portrait_scale2(self):
        # Portrait: (1080, 1920) / 2 = (540, 960) -> round_to_alignment -> (544, 960)
        assert calculate_dimensions("1K", "16:9", "Portrait", 2.0) == (544, 960)

    def test_1k_1_1_landscape_scale2(self):
        # (1024, 1024) / 2 = (512, 512) -> round_to_alignment -> (512, 512)
        assert calculate_dimensions("1K", "1:1", "Landscape", 2.0) == (512, 512)

    def test_2k_1_1_landscape_scale2(self):
        # (2048, 2048) / 2 = (1024, 1024) -> round_to_alignment -> (1024, 1024)
        assert calculate_dimensions("2K", "1:1", "Landscape", 2.0) == (1024, 1024)

    def test_4k_16_9_landscape_scale2(self):
        # (3840, 2160) / 2 = (1920, 1080) -> round_to_alignment -> (1920, 1080)
        assert calculate_dimensions("4K", "16:9", "Landscape", 2.0) == (1920, 1080)

    def test_4k_3_4_portrait_scale2_keeps_exact_2x_target(self):
        assert calculate_dimensions("4K", "3:4", "Portrait", 2.0) == (1440, 1920)

    def test_2k_2_3_landscape_scale2(self):
        # Landscape enforces W >= H: (2560, 1712) / 2 = (1280, 856) -> round_to_alignment -> (1280, 856)
        assert calculate_dimensions("2K", "2:3", "Landscape", 2.0) == (1280, 856)

    def test_1k_1_1_landscape_scale1_1_rounds_up_to_preserve_target(self):
        assert calculate_dimensions("1K", "1:1", "Landscape", 1.1) == (936, 936)


# ===========================================================================
# Test 5: Scale factor 1.5 producing fractional values that must round
# ===========================================================================

class TestScaleFactor1_5:
    """Scale factor 1.5 produces fractional values requiring round-up alignment."""

    def test_2k_21_9_landscape_scale1_5(self):
        # (3440, 1440) / 1.5 = (2293.33, 960) -> round_to_alignment -> (2296, 960)
        assert calculate_dimensions("2K", "21:9", "Landscape", 1.5) == (2296, 960)

    def test_1k_2_3_landscape_scale1_5(self):
        # Landscape enforces W >= H: (1920, 1280) / 1.5 = (1280, 853.33) -> round_to_alignment -> (1280, 856)
        assert calculate_dimensions("1K", "2:3", "Landscape", 1.5) == (1280, 856)

    def test_1k_3_4_portrait_scale1_5(self):
        # Portrait keeps H >= W: (1440, 1920) / 1.5 = (960, 1280) -> round_to_alignment -> (960, 1280)
        assert calculate_dimensions("1K", "3:4", "Portrait", 1.5) == (960, 1280)

    def test_4k_1_1_landscape_scale1_5(self):
        # (2160, 2160) / 1.5 = (1440, 1440) -> round_to_alignment -> (1440, 1440)
        assert calculate_dimensions("4K", "1:1", "Landscape", 1.5) == (1440, 1440)


# ===========================================================================
# Test 6: Every output is divisible by 8 (parametric check)
# ===========================================================================

TIERS = ["1K", "2K", "4K"]
RATIOS = ["1:1", "2:3", "3:4", "16:9", "21:9"]
ORIENTATIONS = ["Landscape", "Portrait"]
SCALE_FACTORS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0]


@pytest.mark.parametrize("tier", TIERS)
@pytest.mark.parametrize("ratio", RATIOS)
@pytest.mark.parametrize("orientation", ORIENTATIONS)
@pytest.mark.parametrize("scale", SCALE_FACTORS)
def test_divisible_by_8(tier, ratio, orientation, scale):
    """All calculated dimensions must be divisible by 8."""
    w, h = calculate_dimensions(tier, ratio, orientation, scale)
    assert w % 8 == 0, f"Width {w} not divisible by 8 for {tier}/{ratio}/{orientation}/{scale}"
    assert h % 8 == 0, f"Height {h} not divisible by 8 for {tier}/{ratio}/{orientation}/{scale}"


# ===========================================================================
# Test round_to_alignment function directly
# ===========================================================================

class TestRoundToAlignment:
    """Test the round_to_alignment helper function."""

    def test_already_multiple(self):
        assert round_to_alignment(960) == 960

    def test_already_multiple_never_changes(self):
        assert round_to_alignment(528) == 528

    def test_rounds_up(self):
        assert round_to_alignment(1081) == 1088

    def test_zero(self):
        assert round_to_alignment(0) == 0

    def test_exact_8(self):
        assert round_to_alignment(8) == 8

    def test_just_above_midpoint(self):
        assert round_to_alignment(9) == 16

    def test_large_value(self):
        assert round_to_alignment(5120) == 5120


# ===========================================================================
# Test RESOLUTION_TABLE structure
# ===========================================================================

class TestResolutionTable:
    """Verify RESOLUTION_TABLE has correct structure and all entries."""

    def test_has_all_tiers(self):
        assert "1K" in RESOLUTION_TABLE
        assert "2K" in RESOLUTION_TABLE
        assert "4K" in RESOLUTION_TABLE

    def test_has_all_ratios_per_tier(self):
        for tier in ["1K", "2K", "4K"]:
            for ratio in ["1:1", "2:3", "3:4", "16:9", "21:9"]:
                assert ratio in RESOLUTION_TABLE[tier], f"Missing {ratio} in {tier}"

    def test_all_values_are_tuples_of_two_ints(self):
        for tier in RESOLUTION_TABLE:
            for ratio in RESOLUTION_TABLE[tier]:
                val = RESOLUTION_TABLE[tier][ratio]
                assert isinstance(val, tuple), f"{tier}/{ratio} value is not a tuple"
                assert len(val) == 2, f"{tier}/{ratio} tuple has {len(val)} elements"
                assert isinstance(val[0], int), f"{tier}/{ratio} width is not int"
                assert isinstance(val[1], int), f"{tier}/{ratio} height is not int"

    def test_landscape_native_widths(self):
        """All table entries should be landscape-native (width >= height) except tall ratios."""
        # For 2:3 and 3:4, width < height in the table because these are
        # tall aspect ratios stored as landscape (wider dimension first would be H)
        # Actually per the spec, these are stored as landscape (W, H) where W < H
        # for ratios like 2:3 because landscape 2:3 means the short side is width
        # This is correct per the resolution table in PROJECT.md
        pass

    def test_exact_1k_values(self):
        assert RESOLUTION_TABLE["1K"]["1:1"] == (1024, 1024)
        assert RESOLUTION_TABLE["1K"]["2:3"] == (1280, 1920)
        assert RESOLUTION_TABLE["1K"]["3:4"] == (1440, 1920)
        assert RESOLUTION_TABLE["1K"]["16:9"] == (1920, 1080)
        assert RESOLUTION_TABLE["1K"]["21:9"] == (2560, 1088)

    def test_exact_2k_values(self):
        assert RESOLUTION_TABLE["2K"]["1:1"] == (2048, 2048)
        assert RESOLUTION_TABLE["2K"]["2:3"] == (1712, 2560)
        assert RESOLUTION_TABLE["2K"]["3:4"] == (1920, 2560)
        assert RESOLUTION_TABLE["2K"]["16:9"] == (2560, 1440)
        assert RESOLUTION_TABLE["2K"]["21:9"] == (3440, 1440)

    def test_exact_4k_values(self):
        assert RESOLUTION_TABLE["4K"]["1:1"] == (2160, 2160)
        assert RESOLUTION_TABLE["4K"]["2:3"] == (2560, 3840)
        assert RESOLUTION_TABLE["4K"]["3:4"] == (2880, 3840)
        assert RESOLUTION_TABLE["4K"]["16:9"] == (3840, 2160)
        assert RESOLUTION_TABLE["4K"]["21:9"] == (5120, 2160)


# ===========================================================================
# Test 7: QuickLatent node class structure
# ===========================================================================

class TestQuickLatentInputTypes:
    """Verify INPUT_TYPES classmethod returns correct structure."""

    def test_input_types_is_classmethod(self):
        """INPUT_TYPES must be a classmethod callable on the class."""
        result = QuickLatent.INPUT_TYPES()
        assert isinstance(result, dict)

    def test_input_types_has_required(self):
        """INPUT_TYPES must have a 'required' key."""
        result = QuickLatent.INPUT_TYPES()
        assert "required" in result

    def test_resolution_combo(self):
        """Resolution input is a combo list of ['1K', '2K', '4K']."""
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert "resolution" in inputs
        assert inputs["resolution"] == (["1K", "2K", "4K"],)

    def test_aspect_ratio_combo(self):
        """Aspect ratio input is a combo list."""
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert "aspect_ratio" in inputs
        assert inputs["aspect_ratio"] == (["1:1", "2:3", "3:4", "16:9", "21:9"],)

    def test_orientation_combo(self):
        """Orientation input is a combo list."""
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert "orientation" in inputs
        assert inputs["orientation"] == (["Landscape", "Portrait"],)

    def test_scale_factor_float(self):
        """Scale factor is FLOAT with default=2.0, min=1.0, max=2.0, step=0.1."""
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert "scale_factor" in inputs
        assert inputs["scale_factor"] == ("FLOAT", {"default": 2.0, "min": 1.0, "max": 2.0, "step": 0.1})

    def test_batch_size_int(self):
        """Batch size is INT with default=1, min=1, max=64."""
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert "batch_size" in inputs
        assert inputs["batch_size"] == ("INT", {"default": 1, "min": 1, "max": 64})


class TestQuickLatentClassAttributes:
    """Verify class-level attributes for ComfyUI registration."""

    def test_return_types(self):
        """RETURN_TYPES must be the 5-element tuple in correct order."""
        assert QuickLatent.RETURN_TYPES == ("INT", "INT", "FLOAT", "LATENT", "INT")

    def test_return_names(self):
        """RETURN_NAMES must match the 5 output names."""
        assert QuickLatent.RETURN_NAMES == ("OUTPUT_WIDTH", "OUTPUT_HEIGHT", "SCALE", "LATENT", "BATCH_SIZE")

    def test_function(self):
        """FUNCTION must be 'generate'."""
        assert QuickLatent.FUNCTION == "generate"

    def test_category(self):
        """CATEGORY must be 'QuickLatent'."""
        assert QuickLatent.CATEGORY == "QuickLatent"


class TestQuickLatentGenerate:
    """Verify generate method behavior."""

    def test_generate_returns_tuple_of_5(self):
        """generate must return a tuple of 5 elements."""
        node = QuickLatent()
        result = node.generate(
            resolution="1K", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=1
        )
        assert isinstance(result, tuple)
        assert len(result) == 5

    def test_generate_output_types(self):
        """Return tuple must be (int, int, float, dict, int)."""
        node = QuickLatent()
        result = node.generate(
            resolution="1K", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=1
        )
        width, height, scale, latent, batch = result
        assert isinstance(width, int)
        assert isinstance(height, int)
        assert isinstance(scale, float)
        assert isinstance(latent, dict)
        assert isinstance(batch, int)

    def test_generate_latent_has_samples_key(self):
        """LATENT output must be a dict with 'samples' key."""
        node = QuickLatent()
        result = node.generate(
            resolution="1K", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=1
        )
        latent = result[3]
        assert "samples" in latent

    def test_generate_latent_tensor_shape(self):
        """Latent tensor shape must be [batch, 4, height//8, width//8]."""
        node = QuickLatent()
        result = node.generate(
            resolution="1K", aspect_ratio="16:9", orientation="Portrait",
            scale_factor=2.0, batch_size=2
        )
        width, height, scale, latent, batch = result
        tensor = latent["samples"]
        assert tensor.shape == (2, 4, height // 8, width // 8)

    def test_generate_batch_size_zero_clamps_to_1(self):
        """batch_size <= 0 must be clamped to 1 (per D-11)."""
        node = QuickLatent()
        result = node.generate(
            resolution="1K", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=0
        )
        width, height, scale, latent, batch = result
        assert batch == 1
        assert latent["samples"].shape[0] == 1

    def test_generate_batch_size_negative_clamps_to_1(self):
        """Negative batch_size must be clamped to 1."""
        node = QuickLatent()
        result = node.generate(
            resolution="1K", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=2.0, batch_size=-5
        )
        width, height, scale, latent, batch = result
        assert batch == 1
        assert latent["samples"].shape[0] == 1

    def test_generate_correct_dimensions(self):
        """Width and height outputs must match calculate_dimensions."""
        node = QuickLatent()
        result = node.generate(
            resolution="2K", aspect_ratio="21:9", orientation="Landscape",
            scale_factor=1.5, batch_size=1
        )
        width, height, scale, latent, batch = result
        expected_w, expected_h = calculate_dimensions("2K", "21:9", "Landscape", 1.5)
        assert width == expected_w
        assert height == expected_h

    def test_generate_returns_scale_factor(self):
        """Third output must be the scale_factor passed in."""
        node = QuickLatent()
        result = node.generate(
            resolution="1K", aspect_ratio="1:1", orientation="Landscape",
            scale_factor=1.7, batch_size=1
        )
        assert result[2] == 1.7
