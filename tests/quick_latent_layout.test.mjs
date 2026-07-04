import { test } from "vitest";
import assert from "node:assert/strict";

import { MIN_WIDTH } from "../js/config.js";
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
    const labels = getOutputValueLabels({ outputWidth: 1024, outputHeight: 1536, batchSize: 2 });

    assert.deepEqual(labels, ["1024", "1536", "LAT", "2"]);
});

test("output column reserves compact width", () => {
    assert.equal(getOutputColumnReservedWidth(), 53);
});

test("batch click ignores blank space outside the visible control", () => {
    const control = { left: 10, top: 100, width: 300, height: 26, buttonWidth: 26 };

    assert.equal(getBatchClickAction(control, 9, 113), null);
    assert.equal(getBatchClickAction(control, 311, 113), null);
    assert.equal(getBatchClickAction(control, 320, 113), null);
});

test("batch click maps square buttons and center value box to actions", () => {
    const control = {
        left: 10,
        top: 100,
        width: 300,
        height: 26,
        buttonWidth: 26,
        valueBox: { left: 40, top: 103, width: 240, height: 20 },
    };

    assert.equal(getBatchClickAction(control, 20, 113), "decrement");
    assert.equal(getBatchClickAction(control, 160, 113), "edit");
    assert.equal(getBatchClickAction(control, 270, 113), "edit");
    assert.equal(getBatchClickAction(control, 300, 113), "increment");
    assert.equal(getBatchClickAction(control, 38, 113), null);
});

test("preset-stack hit-test maps contiguous rows to preset values", () => {
    const control = {
        left: 10,
        top: 100,
        width: 300,
        height: 72,
        rowHeight: 24,
        rowGap: 0,
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
        sizeW: { left: 10, top: 122, width: 140, height: 26 },
        sizeH: { left: 160, top: 122, width: 140, height: 26 },
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
