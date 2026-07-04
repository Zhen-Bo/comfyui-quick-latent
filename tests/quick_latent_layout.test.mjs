import { test } from "vitest";
import assert from "node:assert/strict";

import {
    MIN_WIDTH,
    PRESET_RESOLUTIONS,
    ASPECT_RATIOS,
    buildPresetOptions,
    buildRatioOptions,
    calculateCustomDimensions,
    calculateDimensions,
    clampCustomDimension,
    floorToAlignment,
    orientDimensions,
} from "../js/config.js";
import { createTranslator, normalizeLocale, resolveLocale } from "../js/i18n.js";
import {
    getBatchClickAction,
    getControlStartY,
    getDefaultOutputSlotLocalPosition,
    getOutputColumnReservedWidth,
    getOutputRowsHeight,
    getOutputValueLabelPosition,
    getOutputValueLabels,
    getPresetStackClickValue,
    getQuickLatentMinHeight,
    getQuickLatentMinWidth,
    getSizeBoxClickAction,
    normalizeOutputSlots,
} from "../js/layout.js";

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

test("default output slot positions track node width without output.pos", () => {
    const slotA = getDefaultOutputSlotLocalPosition({ size: [370, 320] }, 0);
    const slotB = getDefaultOutputSlotLocalPosition({ size: [500, 320] }, 0);

    assert.deepEqual(slotA, [361, 14]);
    assert.deepEqual(slotB, [491, 14]);
});

test("output value labels align to LiteGraph default output rows", () => {
    const node = { size: [370, 320] };

    assert.deepEqual(getOutputValueLabelPosition(node, 0), [349, 14]);
    assert.deepEqual(getOutputValueLabelPosition(node, 3), [349, 74]);
});

test("default output slot positions honor LiteGraph slot_start_y", () => {
    const node = {
        size: [370, 320],
        constructor: { slot_start_y: 12 },
    };

    assert.deepEqual(getDefaultOutputSlotLocalPosition(node, 0), [361, 26]);
});

test("output rows keep their LiteGraph height", () => {
    assert.equal(getOutputRowsHeight(4), 86);
});

test("custom controls share vertical space with output labels", () => {
    assert.equal(getControlStartY(), 6);
});

test("node minimum height fits the V2 controls", () => {
    assert.equal(getQuickLatentMinHeight(4), 258);
});

test("node minimum width does not grow after horizontal resize", () => {
    assert.equal(getQuickLatentMinWidth(), 370);
    assert.equal(MIN_WIDTH, getQuickLatentMinWidth());
});

test("latent output labels use compact V2 text", () => {
    const labels = getOutputValueLabels({ width: 1024, height: 1536, batch: 2 });

    assert.deepEqual(labels, ["1024", "1536", "LAT", "2"]);
});

test("output column reserves compact width", () => {
    assert.equal(getOutputColumnReservedWidth(), 53);
});

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

test("orientation swaps dimensions without changing ratio family", () => {
    assert.deepEqual(orientDimensions(1024, 1536, "Landscape"), [1536, 1024]);
    assert.deepEqual(orientDimensions(1536, 864, "Portrait"), [864, 1536]);
});

test("frontend preset calculation mirrors V2 direct-size table", () => {
    assert.deepEqual(
        calculateDimensions("1024", "2:3", "Portrait"),
        { width: 1024, height: 1536 },
    );
    assert.deepEqual(
        calculateDimensions("1536", "3:4", "Landscape"),
        { width: 1792, height: 1344 },
    );
    assert.deepEqual(
        calculateDimensions("2048", "16:9", "Portrait"),
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
    assert.equal(clampCustomDimension(100), 512);
    assert.equal(clampCustomDimension(513), 513);
    assert.equal(clampCustomDimension(4095), 4095);
    assert.equal(clampCustomDimension(9000), 4096);
    assert.equal(clampCustomDimension("not-a-number"), 1024);
});

test("aspect ratio custom label can be localized without changing option values", () => {
    const t = createTranslator("zh-TW");
    const options = buildRatioOptions("Portrait", t("custom"));

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

test("i18n resolves supported browser language variants", () => {
    assert.equal(normalizeLocale("zh-TW"), "zh-TW");
    assert.equal(normalizeLocale("zh-Hant"), "zh-TW");
    assert.equal(normalizeLocale("en-US"), "en");
    assert.equal(resolveLocale(["fr-FR", "zh-TW"]), "zh-TW");

    const t = createTranslator("zh-TW");
    assert.equal(t("orientation"), "方向");
    assert.equal(t("customRoundDownHint"), "輸出會向下對齊到最接近的 8 倍數");
});

test("custom output dimensions round down to the nearest multiple of 8", () => {
    assert.equal(floorToAlignment(1028), 1024);
    assert.equal(floorToAlignment(1031), 1024);
    assert.equal(floorToAlignment(1032), 1032);
});

test("client custom calc clamps each axis to [512, 4096] like the backend", () => {
    assert.deepEqual(calculateCustomDimensions(100, 100), { width: 512, height: 512 });
    assert.deepEqual(calculateCustomDimensions(9000, 9000), { width: 4096, height: 4096 });
    assert.deepEqual(calculateCustomDimensions(513, 513), { width: 512, height: 512 });
    assert.deepEqual(calculateCustomDimensions(1028, 1031), { width: 1024, height: 1024 });
    assert.deepEqual(calculateCustomDimensions(1032, 1032), { width: 1032, height: 1032 });
    assert.deepEqual(calculateCustomDimensions(5000, 300), { width: 4096, height: 512 });
});

test("batch click ignores blank space outside the visible control", () => {
    const control = { x: 10, y: 100, w: 300, h: 26, buttonW: 26 };

    assert.equal(getBatchClickAction(control, 9, 113), null);
    assert.equal(getBatchClickAction(control, 311, 113), null);
    assert.equal(getBatchClickAction(control, 320, 113), null);
});

test("batch click maps square buttons and center value box to actions", () => {
    const control = {
        x: 10,
        y: 100,
        w: 300,
        h: 26,
        buttonW: 26,
        valueBox: { x: 40, y: 103, w: 240, h: 20 },
    };

    assert.equal(getBatchClickAction(control, 20, 113), "decrement");
    assert.equal(getBatchClickAction(control, 160, 113), "edit");
    assert.equal(getBatchClickAction(control, 270, 113), "edit");
    assert.equal(getBatchClickAction(control, 300, 113), "increment");
    assert.equal(getBatchClickAction(control, 38, 113), null);
});

test("preset-stack hit-test maps contiguous rows to preset values", () => {
    const control = {
        x: 10,
        y: 100,
        w: 300,
        h: 72,
        rowH: 24,
        gap: 0,
        options: [
            { value: "1024" },
            { value: "1536" },
            { value: "2048" },
        ],
    };

    assert.equal(getPresetStackClickValue(control, 20, 110), "1024");
    assert.equal(getPresetStackClickValue(control, 20, 126), "1536");
    assert.equal(getPresetStackClickValue(control, 20, 150), "2048");
    assert.equal(getPresetStackClickValue(control, 20, 171), "2048");
    assert.equal(getPresetStackClickValue(control, 20, 172), null);
    assert.equal(getPresetStackClickValue(control, 320, 110), null);
});

test("size-box hit-test maps clicks to the width or height box; the central gap returns null", () => {
    const controls = {
        sizeW: { x: 10, y: 122, w: 140, h: 26 },
        sizeH: { x: 160, y: 122, w: 140, h: 26 },
    };
    assert.equal(getSizeBoxClickAction(controls, 20, 130), "sizeW");
    assert.equal(getSizeBoxClickAction(controls, 170, 130), "sizeH");
    assert.equal(getSizeBoxClickAction(controls, 155, 130), null);
    assert.equal(getSizeBoxClickAction(controls, 20, 200), null);
});

test("normalizing output slots removes stale manual positions, stale slots, and native text", () => {
    const outputs = [
        { name: "WIDTH", localized_name: "WIDTH", type: "INT", links: [1], pos: [370, 30] },
        { name: "HEIGHT", localized_name: "HEIGHT", type: "INT", links: null, pos: new Float32Array([370, 60]) },
        { name: "LATENT", localized_name: "LATENT", type: "LATENT" },
        { name: "BATCH", localized_name: "BATCH", type: "INT" },
        { name: "SCALE", localized_name: "SCALE", type: "FLOAT", links: [99] },
    ];

    normalizeOutputSlots(outputs);

    assert.deepEqual(outputs, [
        {
            name: "",
            localized_name: "",
            type: "INT",
            links: [1],
            color: "#8a8795",
            color_off: "#8a8795",
            color_on: "#4fc3f7",
        },
        {
            name: "",
            localized_name: "",
            type: "INT",
            links: null,
            color: "#8a8795",
            color_off: "#8a8795",
            color_on: "#ffb74d",
        },
        {
            name: "",
            localized_name: "",
            type: "LATENT",
            color: "#8a8795",
            color_off: "#8a8795",
            color_on: "#ff69b4",
        },
        {
            name: "",
            localized_name: "",
            type: "INT",
            color: "#8a8795",
            color_off: "#8a8795",
            color_on: "#9a7bdc",
        },
    ]);
});
