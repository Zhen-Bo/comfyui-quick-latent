"""Tests for the Quick Latent V2 direct-size calculation engine and node class."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

from nodes import (
    ASPECT_RATIOS,
    PRESET_RESOLUTION_TABLE,
    PRESET_RESOLUTIONS,
    QuickLatent,
    calculate_dimensions,
    orient_dimensions,
    round_to_alignment,
)


EXPECTED_PORTRAIT_PRESETS = {
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
        "1024": (864, 1536),
        "1536": (1080, 1920),
        "2048": (1440, 2560),
    },
}

EXPECTED_LANDSCAPE_PRESETS = {
    "1:1": {
        "1024": (1024, 1024),
        "1536": (1536, 1536),
        "2048": (2048, 2048),
    },
    "2:3": {
        "1024": (1536, 1024),
        "1536": (1920, 1280),
        "2048": (2304, 1536),
    },
    "3:4": {
        "1024": (1536, 1152),
        "1536": (1792, 1344),
        "2048": (2048, 1536),
    },
    "16:9": {
        "1024": (1536, 864),
        "1536": (1920, 1080),
        "2048": (2560, 1440),
    },
}


class TestPresetResolutionTable:
    def test_has_curated_v2_ratio_families(self):
        assert ASPECT_RATIOS == ["1:1", "2:3", "3:4", "16:9", "Custom"]
        assert PRESET_RESOLUTIONS == ["1024", "1536", "2048"]

    def test_table_contains_only_non_custom_ratios(self):
        assert set(PRESET_RESOLUTION_TABLE.keys()) == {"1:1", "2:3", "3:4", "16:9"}

    def test_table_values_are_portrait_or_natural_base_values(self):
        assert PRESET_RESOLUTION_TABLE == {
            "1:1": EXPECTED_PORTRAIT_PRESETS["1:1"],
            "2:3": EXPECTED_PORTRAIT_PRESETS["2:3"],
            "3:4": EXPECTED_PORTRAIT_PRESETS["3:4"],
            "16:9": EXPECTED_LANDSCAPE_PRESETS["16:9"],
        }


@pytest.mark.parametrize("ratio", ["1:1", "2:3", "3:4", "16:9"])
@pytest.mark.parametrize("preset", PRESET_RESOLUTIONS)
def test_portrait_presets(ratio, preset):
    assert calculate_dimensions(preset, ratio, "Portrait") == EXPECTED_PORTRAIT_PRESETS[ratio][preset]


@pytest.mark.parametrize("ratio", ["1:1", "2:3", "3:4", "16:9"])
@pytest.mark.parametrize("preset", PRESET_RESOLUTIONS)
def test_landscape_presets(ratio, preset):
    assert calculate_dimensions(preset, ratio, "Landscape") == EXPECTED_LANDSCAPE_PRESETS[ratio][preset]


@pytest.mark.parametrize("ratio", ["1:1", "2:3", "3:4", "16:9"])
@pytest.mark.parametrize("preset", PRESET_RESOLUTIONS)
@pytest.mark.parametrize("orientation", ["Landscape", "Portrait"])
def test_preset_outputs_are_divisible_by_8(ratio, preset, orientation):
    width, height = calculate_dimensions(preset, ratio, orientation)
    assert width % 8 == 0
    assert height % 8 == 0


class TestOrientation:
    def test_landscape_swaps_tall_dimensions(self):
        assert orient_dimensions(1024, 1536, "Landscape") == (1536, 1024)

    def test_portrait_swaps_wide_dimensions(self):
        assert orient_dimensions(1536, 864, "Portrait") == (864, 1536)

    def test_square_dimensions_do_not_change(self):
        assert orient_dimensions(1024, 1024, "Portrait") == (1024, 1024)


class TestRoundToAlignment:
    def test_already_multiple(self):
        assert round_to_alignment(960) == 960

    def test_rounds_up(self):
        assert round_to_alignment(1081) == 1088

    def test_zero(self):
        assert round_to_alignment(0) == 0


class TestQuickLatentInputTypes:
    def test_input_types_has_required(self):
        assert "required" in QuickLatent.INPUT_TYPES()

    def test_preset_resolution_combo(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["preset_resolution"] == (["1024", "1536", "2048"],)

    def test_aspect_ratio_combo(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["aspect_ratio"] == (["1:1", "2:3", "3:4", "16:9", "Custom"],)

    def test_scale_factor_is_removed(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert "scale_factor" not in inputs

    def test_batch_size_int(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["batch_size"] == ("INT", {"default": 1, "min": 1, "max": 64})


class TestQuickLatentClassAttributes:
    def test_return_types(self):
        assert QuickLatent.RETURN_TYPES == ("INT", "INT", "LATENT", "INT")

    def test_return_names(self):
        assert QuickLatent.RETURN_NAMES == ("OUTPUT_WIDTH", "OUTPUT_HEIGHT", "LATENT", "BATCH_SIZE")

    def test_function(self):
        assert QuickLatent.FUNCTION == "generate"

    def test_category(self):
        assert QuickLatent.CATEGORY == "QuickLatent"


class TestQuickLatentGenerate:
    def test_generate_returns_tuple_of_4(self):
        node = QuickLatent()
        result = node.generate(
            preset_resolution="1024",
            aspect_ratio="1:1",
            orientation="Landscape",
            batch_size=1,
        )
        assert isinstance(result, tuple)
        assert len(result) == 4

    def test_generate_output_types(self):
        node = QuickLatent()
        result = node.generate(
            preset_resolution="1024",
            aspect_ratio="1:1",
            orientation="Landscape",
            batch_size=1,
        )
        width, height, latent, batch = result
        assert isinstance(width, int)
        assert isinstance(height, int)
        assert isinstance(latent, dict)
        assert isinstance(batch, int)

    def test_generate_latent_tensor_shape(self):
        node = QuickLatent()
        result = node.generate(
            preset_resolution="1536",
            aspect_ratio="16:9",
            orientation="Portrait",
            batch_size=2,
        )
        width, height, latent, batch = result
        assert (width, height) == (1080, 1920)
        assert batch == 2
        assert latent["samples"].shape == (2, 4, height // 8, width // 8)

    @pytest.mark.parametrize(
        ("orientation", "expected_presets"),
        [
            ("Landscape", EXPECTED_LANDSCAPE_PRESETS),
            ("Portrait", EXPECTED_PORTRAIT_PRESETS),
        ],
    )
    @pytest.mark.parametrize("ratio", ["1:1", "2:3", "3:4", "16:9"])
    @pytest.mark.parametrize("preset", PRESET_RESOLUTIONS)
    def test_generate_matches_all_curated_presets(self, orientation, expected_presets, ratio, preset):
        node = QuickLatent()
        width, height, latent, batch = node.generate(
            preset_resolution=preset,
            aspect_ratio=ratio,
            orientation=orientation,
            batch_size=3,
        )

        assert (width, height) == expected_presets[ratio][preset]
        assert batch == 3
        assert latent["samples"].shape == (3, 4, height // 8, width // 8)

    def test_generate_batch_size_zero_clamps_to_1(self):
        node = QuickLatent()
        width, height, latent, batch = node.generate(
            preset_resolution="1024",
            aspect_ratio="1:1",
            orientation="Landscape",
            batch_size=0,
        )
        assert (width, height) == (1024, 1024)
        assert batch == 1
        assert latent["samples"].shape[0] == 1

    def test_generate_batch_size_above_schema_max_clamps_to_64(self):
        node = QuickLatent()
        width, height, latent, batch = node.generate(
            preset_resolution="1024",
            aspect_ratio="1:1",
            orientation="Landscape",
            batch_size=99,
        )
        assert (width, height) == (1024, 1024)
        assert batch == 64
        assert latent["samples"].shape[0] == 64

    def test_generate_correct_dimensions(self):
        node = QuickLatent()
        width, height, latent, batch = node.generate(
            preset_resolution="2048",
            aspect_ratio="2:3",
            orientation="Landscape",
            batch_size=1,
        )
        assert (width, height) == (2304, 1536)
        assert batch == 1
        assert "samples" in latent
