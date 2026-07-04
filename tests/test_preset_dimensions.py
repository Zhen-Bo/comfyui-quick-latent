"""Tests for the Quick Latent V2 preset dimension table."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

from nodes import (
    ASPECT_RATIOS,
    PRESET_RESOLUTION_TABLE,
    PRESET_RESOLUTIONS,
    align_down_to_multiple,
    calculate_preset_dimensions,
    orient_dimensions,
)
from tests.preset_expectations import EXPECTED_LANDSCAPE_PRESETS, EXPECTED_PORTRAIT_PRESETS


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
    assert calculate_preset_dimensions(preset, ratio, "Portrait") == EXPECTED_PORTRAIT_PRESETS[ratio][preset]


@pytest.mark.parametrize("ratio", ["1:1", "2:3", "3:4", "16:9"])
@pytest.mark.parametrize("preset", PRESET_RESOLUTIONS)
def test_landscape_presets(ratio, preset):
    assert calculate_preset_dimensions(preset, ratio, "Landscape") == EXPECTED_LANDSCAPE_PRESETS[ratio][preset]


@pytest.mark.parametrize("ratio", ["1:1", "2:3", "3:4", "16:9"])
@pytest.mark.parametrize("preset", PRESET_RESOLUTIONS)
@pytest.mark.parametrize("orientation", ["Landscape", "Portrait"])
def test_preset_outputs_are_divisible_by_8(ratio, preset, orientation):
    width, height = calculate_preset_dimensions(preset, ratio, orientation)
    assert width % 8 == 0
    assert height % 8 == 0


class TestOrientation:
    def test_landscape_swaps_tall_dimensions(self):
        assert orient_dimensions(1024, 1536, "Landscape") == (1536, 1024)

    def test_portrait_swaps_wide_dimensions(self):
        assert orient_dimensions(1536, 864, "Portrait") == (864, 1536)

    def test_square_dimensions_do_not_change(self):
        assert orient_dimensions(1024, 1024, "Portrait") == (1024, 1024)


class TestAlignDownToMultiple:
    def test_already_multiple(self):
        assert align_down_to_multiple(960) == 960

    def test_aligns_down(self):
        assert align_down_to_multiple(1081) == 1080

    def test_zero(self):
        assert align_down_to_multiple(0) == 0
