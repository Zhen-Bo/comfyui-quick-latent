"""Tests for the V2 Custom size mode of the Quick Latent node."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

from nodes import calculate_custom_dimensions, QuickLatent


class TestCustomDimensionsRawOutput:
    def test_2048x1024_is_output_size(self):
        assert calculate_custom_dimensions(2048, 1024) == (2048, 1024)

    def test_1024x1024_identity(self):
        assert calculate_custom_dimensions(1024, 1024) == (1024, 1024)

    def test_1920x1080_already_aligned(self):
        assert calculate_custom_dimensions(1920, 1080) == (1920, 1080)


class TestCustomDimensionsClampAndRound:
    def test_below_min_clamps_to_512(self):
        assert calculate_custom_dimensions(100, 100) == (512, 512)

    def test_blank_zero_clamps_to_512(self):
        assert calculate_custom_dimensions(0, 0) == (512, 512)

    def test_above_max_clamps_to_4096(self):
        assert calculate_custom_dimensions(9000, 9000) == (4096, 4096)

    def test_non_multiple_of_8_rounds_down(self):
        assert calculate_custom_dimensions(513, 513) == (512, 512)

    def test_user_examples_round_down(self):
        assert calculate_custom_dimensions(1028, 1031) == (1024, 1024)
        assert calculate_custom_dimensions(1032, 1032) == (1032, 1032)

    def test_mixed_clamp_both_axes(self):
        assert calculate_custom_dimensions(5000, 300) == (4096, 512)

    def test_non_integer_values_fall_back_before_alignment(self):
        assert calculate_custom_dimensions(513.5, "2048") == (1024, 1024)


CUSTOM_RAW_DIMS = [0, 100, 512, 513, 700, 1024, 1920, 3000, 4096, 9000]


@pytest.mark.parametrize("width", CUSTOM_RAW_DIMS)
@pytest.mark.parametrize("height", CUSTOM_RAW_DIMS)
def test_custom_divisible_by_8(width, height):
    output_width, output_height = calculate_custom_dimensions(width, height)
    assert output_width % 8 == 0
    assert output_height % 8 == 0


class TestCustomGenerateIntegration:
    def test_custom_generate_four_outputs(self):
        node = QuickLatent()
        result = node.generate(
            preset_resolution="1024",
            aspect_ratio="Custom",
            orientation="Landscape",
            batch_size=1,
            custom_width=2048,
            custom_height=1024,
        )
        assert isinstance(result, tuple)
        assert len(result) == 4
        width, height, latent, batch = result
        assert (width, height) == (2048, 1024)
        assert batch == 1
        assert isinstance(latent, dict)
        assert "samples" in latent

    def test_custom_generate_tensor_shape(self):
        node = QuickLatent()
        width, height, latent, batch = node.generate(
            preset_resolution="1024",
            aspect_ratio="Custom",
            orientation="Landscape",
            batch_size=1,
            custom_width=2048,
            custom_height=1024,
        )
        assert (width, height, batch) == (2048, 1024, 1)
        assert latent["samples"].shape == (1, 4, 128, 256)


class TestCustomInputTypes:
    def test_custom_width_widget_config(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["custom_width"] == ("INT", {"default": 1024, "min": 512, "max": 4096, "step": 8})

    def test_custom_height_widget_config(self):
        inputs = QuickLatent.INPUT_TYPES()["required"]
        assert inputs["custom_height"] == ("INT", {"default": 1024, "min": 512, "max": 4096, "step": 8})
