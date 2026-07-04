import { test } from "vitest";
import assert from "node:assert/strict";

import {
    PRESET_RESOLUTIONS,
    ASPECT_RATIOS,
    alignDownToMultiple,
    buildPresetOptions,
    buildRatioOptions,
    calculateCustomDimensions,
    calculatePresetDimensions,
    normalizeBatchSizeValue,
    normalizeCustomDimensionValue,
    orientDimensions,
} from "../js/config.js";

const EXPECTED_PRESET_LABELS = {
    Landscape: {
        "1:1": ["1024 x 1024", "1536 x 1536", "2048 x 2048"],
        "2:3": ["1536 x 1024", "1920 x 1280", "2304 x 1536"],
        "3:4": ["1536 x 1152", "1792 x 1344", "2048 x 1536"],
        "16:9": ["1536 x 864", "1920 x 1080", "2560 x 1440"],
    },
    Portrait: {
        "1:1": ["1024 x 1024", "1536 x 1536", "2048 x 2048"],
        "2:3": ["1024 x 1536", "1280 x 1920", "1536 x 2304"],
        "3:4": ["1152 x 1536", "1344 x 1792", "1536 x 2048"],
        "16:9": ["864 x 1536", "1080 x 1920", "1440 x 2560"],
    },
};

test("V2 preset and ratio options expose the curated choices", () => {
    assert.deepEqual(PRESET_RESOLUTIONS, ["1024", "1536", "2048"]);
    assert.deepEqual(ASPECT_RATIOS, ["1:1", "2:3", "3:4", "16:9", "Custom"]);
});

test("aspect ratio labels reflect the effective orientation", () => {
    assert.deepEqual(
        buildRatioOptions("Landscape").map((option) => option.label),
        ["1:1", "3:2", "4:3", "16:9", "Custom"],
    );
    assert.deepEqual(
        buildRatioOptions("Portrait").map((option) => option.label),
        ["1:1", "2:3", "3:4", "9:16", "Custom"],
    );
});

test("aspect ratio custom label can be localized without changing option values", () => {
    const options = buildRatioOptions("Portrait", "自訂");

    assert.deepEqual(
        options,
        [
            { label: "1:1", value: "1:1" },
            { label: "2:3", value: "2:3" },
            { label: "3:4", value: "3:4" },
            { label: "9:16", value: "16:9" },
            { label: "自訂", value: "Custom" },
        ],
    );
});

test("orientation swaps dimensions without changing ratio family", () => {
    assert.deepEqual(orientDimensions(1024, 1536, "Landscape"), [1536, 1024]);
    assert.deepEqual(orientDimensions(1536, 864, "Portrait"), [864, 1536]);
});

test("frontend preset calculation mirrors V2 direct-size table", () => {
    assert.deepEqual(
        calculatePresetDimensions("1024", "2:3", "Portrait"),
        { width: 1024, height: 1536 },
    );
    assert.deepEqual(
        calculatePresetDimensions("1536", "3:4", "Landscape"),
        { width: 1792, height: 1344 },
    );
    assert.deepEqual(
        calculatePresetDimensions("2048", "16:9", "Portrait"),
        { width: 1440, height: 2560 },
    );
});

test("preset option labels show actual output dimensions", () => {
    assert.deepEqual(
        buildPresetOptions("2:3", "Landscape").map((option) => option.label),
        ["1536 x 1024", "1920 x 1280", "2304 x 1536"],
    );
});

for (const orientation of ["Landscape", "Portrait"]) {
    for (const ratio of ["1:1", "2:3", "3:4", "16:9"]) {
        test(`${orientation} ${ratio} preset labels show explicit V2 output sizes`, () => {
            assert.deepEqual(
                buildPresetOptions(ratio, orientation).map((option) => option.label),
                EXPECTED_PRESET_LABELS[orientation][ratio],
            );
        });
    }
}

test("custom input values clamp to schema bounds without 8px alignment", () => {
    assert.equal(normalizeCustomDimensionValue(100), 512);
    assert.equal(normalizeCustomDimensionValue(513), 513);
    assert.equal(normalizeCustomDimensionValue(4095), 4095);
    assert.equal(normalizeCustomDimensionValue(9000), 4096);
    assert.equal(normalizeCustomDimensionValue("not-a-number"), 1024);
    assert.equal(normalizeCustomDimensionValue(513.5), 1024);
});

test("batch values clamp to schema bounds and reject floats", () => {
    assert.equal(normalizeBatchSizeValue(0), 1);
    assert.equal(normalizeBatchSizeValue(17), 17);
    assert.equal(normalizeBatchSizeValue(99), 64);
    assert.equal(normalizeBatchSizeValue(17.5), 1);
    assert.equal(normalizeBatchSizeValue("not-a-number"), 1);
});

test("custom output dimensions round down to the nearest multiple of 8", () => {
    assert.equal(alignDownToMultiple(1028), 1024);
    assert.equal(alignDownToMultiple(1031), 1024);
    assert.equal(alignDownToMultiple(1032), 1032);
});

test("client custom calc clamps each axis to [512, 4096] like the backend", () => {
    assert.deepEqual(calculateCustomDimensions(100, 100), { width: 512, height: 512 });
    assert.deepEqual(calculateCustomDimensions(9000, 9000), { width: 4096, height: 4096 });
    assert.deepEqual(calculateCustomDimensions(513, 513), { width: 512, height: 512 });
    assert.deepEqual(calculateCustomDimensions(1028, 1031), { width: 1024, height: 1024 });
    assert.deepEqual(calculateCustomDimensions(1032, 1032), { width: 1032, height: 1032 });
    assert.deepEqual(calculateCustomDimensions(5000, 300), { width: 4096, height: 512 });
});
