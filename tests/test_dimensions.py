import pytest

from nodes import LONG_EDGES, RATIOS, SQUARE_LONG_EDGES, custom_dimensions, preset_dimensions


@pytest.mark.parametrize("size", LONG_EDGES)
@pytest.mark.parametrize("ratio", RATIOS)
def test_preset_follows_size_rules(size, ratio):
    width, height = preset_dimensions(size, ratio, "portrait")
    short_part, long_part = RATIOS[ratio]

    assert height == (SQUARE_LONG_EDGES if ratio == "square" else LONG_EDGES)[size]
    assert width % 16 == 0
    assert abs(width / height - short_part / long_part) < 0.01


@pytest.mark.parametrize("size", LONG_EDGES)
@pytest.mark.parametrize("ratio", RATIOS)
def test_landscape_swaps_portrait(size, ratio):
    width, height = preset_dimensions(size, ratio, "portrait")
    assert preset_dimensions(size, ratio, "landscape") == (height, width)


def test_preset_table():
    table = {
        ratio: [preset_dimensions(size, ratio, "portrait") for size in LONG_EDGES]
        for ratio in RATIOS
    }
    assert table == {
        "square": [(1024, 1024), (1536, 1536), (2048, 2048)],
        "photo": [(1024, 1536), (1280, 1920), (1696, 2560)],
        "standard": [(1152, 1536), (1440, 1920), (1920, 2560)],
        "widescreen": [(864, 1536), (1072, 1920), (1440, 2560)],
    }


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ((1000, 1000), (992, 992)),
        ((1024, 1040), (1024, 1040)),
        ((100, 9000), (512, 4096)),
        ((513.5, "2048"), (1024, 1024)),
    ],
)
def test_custom_size_clamps_and_floors_to_16(raw, expected):
    assert custom_dimensions(*raw) == expected
