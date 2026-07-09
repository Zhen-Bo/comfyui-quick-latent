"""Tests for the Quick Latent V2 node schema and generation behavior."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

from nodes import PRESET_RESOLUTIONS, QuickLatent, clamp_batch_size
from tests.preset_expectations import EXPECTED_LANDSCAPE_PRESETS, EXPECTED_PORTRAIT_PRESETS


class TestQuickLatentInputTypes:
    def test_input_types_has_required(self):
        assert "required" in QuickLatent.INPUT_TYPES()

    def test_preset_resolution_combo(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["preset_resolution"] == (["1024", "1536", "2048"],)

    def test_aspect_ratio_combo(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["aspect_ratio"] == (["1:1", "2:3", "3:4", "16:9"],)

    def test_orientation_combo(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["orientation"] == (["Landscape", "Portrait", "Custom"],)

    def test_scale_factor_is_removed(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert "scale_factor" not in inputs

    def test_batch_size_int(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["batch_size"] == ("INT", {"default": 1, "min": 1, "max": 64})

    def test_aspect_ratio_ignored_under_custom_orientation(self):
        node = QuickLatent()
        first = node.generate(
            preset_resolution="1024",
            aspect_ratio="1:1",
            orientation="Custom",
            batch_size=1,
            custom_width=2048,
            custom_height=1024,
        )
        second = node.generate(
            preset_resolution="1024",
            aspect_ratio="16:9",
            orientation="Custom",
            batch_size=1,
            custom_width=2048,
            custom_height=1024,
        )
        assert first[0:2] == second[0:2]
        assert first[0:2] == (2048, 1024)


class TestBatchSizeClamp:
    def test_rejects_non_integer_values(self):
        assert clamp_batch_size(17.5) == 1
        assert clamp_batch_size("17") == 1

    def test_clamps_integer_values_to_schema_bounds(self):
        assert clamp_batch_size(0) == 1
        assert clamp_batch_size(17) == 17
        assert clamp_batch_size(99) == 64


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
