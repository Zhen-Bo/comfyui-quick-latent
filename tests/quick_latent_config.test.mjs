import { test } from "vitest";
import assert from "node:assert/strict";

import {
    buildPresetOptions,
    buildRatioOptions,
    customDimensions,
    normalizeBatchSizeValue,
    normalizeChoice,
    normalizeCustomDimensionValue,
    presetDimensions,
} from "../js/config.js";

// Same table as tests/test_dimensions.py; the frontend must match the backend.
const PORTRAIT_PRESET_LABELS = {
    square: ["1024 x 1024", "1536 x 1536", "2048 x 2048"],
    photo: ["1024 x 1536", "1280 x 1920", "1696 x 2560"],
    standard: ["1152 x 1536", "1440 x 1920", "1920 x 2560"],
    widescreen: ["864 x 1536", "1072 x 1920", "1440 x 2560"],
};

test("portrait preset labels match the backend table", () => {
    for (const [ratio, labels] of Object.entries(PORTRAIT_PRESET_LABELS)) {
        assert.deepEqual(buildPresetOptions(ratio, "portrait").map((option) => option.label), labels);
    }
});

test("landscape swaps width and height", () => {
    assert.deepEqual(presetDimensions("medium", "widescreen", "landscape"), { width: 1920, height: 1072 });
});

test("ratio labels follow the orientation", () => {
    assert.deepEqual(buildRatioOptions("portrait").map((option) => option.label), ["1:1", "2:3", "3:4", "9:16"]);
    assert.deepEqual(buildRatioOptions("landscape").map((option) => option.label), ["1:1", "3:2", "4:3", "16:9"]);
});

test("custom size clamps to [512, 4096] and floors to 16", () => {
    assert.deepEqual(customDimensions(1000, 1000), { width: 992, height: 992 });
    assert.deepEqual(customDimensions(100, 9000), { width: 512, height: 4096 });
    assert.equal(normalizeCustomDimensionValue("not-a-number"), 1024);
});

test("batch size clamps to [1, 64] and rejects floats", () => {
    assert.equal(normalizeBatchSizeValue(0), 1);
    assert.equal(normalizeBatchSizeValue(99), 64);
    assert.equal(normalizeBatchSizeValue(17.5), 1);
});

test("unknown widget values fall back to the first choice", () => {
    assert.equal(normalizeChoice("2:3", ["square", "photo"]), "square");
    assert.equal(normalizeChoice("photo", ["square", "photo"]), "photo");
});
