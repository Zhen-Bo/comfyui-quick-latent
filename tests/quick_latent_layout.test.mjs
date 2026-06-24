import test from "node:test";
import assert from "node:assert/strict";

import { MIN_WIDTH, buildRatioOptions, calculateDimensions, getTargetDimensions } from "../js/config.js";
import {
    getDefaultOutputSlotLocalPosition,
    getControlStartY,
    getOutputRowsHeight,
    getOutputValueLabelPosition,
    getQuickLatentMinWidth,
    getQuickLatentMinHeight,
    getOutputValueLabels,
    getOutputColumnReservedWidth,
    getBatchClickAction,
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
    assert.deepEqual(getOutputValueLabelPosition(node, 4), [349, 94]);
});

test("default output slot positions honor LiteGraph slot_start_y", () => {
    const node = {
        size: [370, 320],
        constructor: { slot_start_y: 12 },
    };

    assert.deepEqual(getDefaultOutputSlotLocalPosition(node, 0), [361, 26]);
});

test("output rows keep their LiteGraph height", () => {
    assert.equal(getOutputRowsHeight(5), 106);
});

test("custom controls share vertical space with output labels", () => {
    assert.equal(getControlStartY(), 6);
});

test("node minimum height fits the visible controls without reserving blank output-only space", () => {
    assert.equal(getQuickLatentMinHeight(5), 300);
});

test("node minimum width does not grow after horizontal resize", () => {
    assert.equal(getQuickLatentMinWidth(), 370);
    assert.equal(MIN_WIDTH, getQuickLatentMinWidth());
});

test("latent output label uses compact text", () => {
    const labels = getOutputValueLabels({ width: 512, height: 512, scale: 2, batch: 1 });

    assert.deepEqual(labels, ["512", "512", "2.00", "LAT", "1"]);
});

test("output column reserves compact width", () => {
    assert.equal(getOutputColumnReservedWidth(), 53);
});

test("aspect ratio labels reflect the effective orientation", () => {
    assert.deepEqual(
        buildRatioOptions("Landscape").map((option) => option.label),
        ["1:1", "3:2", "4:3", "16:9", "21:9"],
    );
    assert.deepEqual(
        buildRatioOptions("Portrait").map((option) => option.label),
        ["1:1", "2:3", "3:4", "9:16", "9:21"],
    );
});

test("4K 3:4 portrait at 2x previews the exact aligned sampler size", () => {
    assert.deepEqual(
        calculateDimensions("4K", "3:4", "Portrait", 2.0),
        { width: 1440, height: 1920 },
    );
});

test("target preview is derived from aligned sampler size times scale", () => {
    assert.deepEqual(
        calculateDimensions("4K", "1:1", "Landscape", 1.5),
        { width: 1440, height: 1440 },
    );
    assert.deepEqual(
        getTargetDimensions("4K", "1:1", "Landscape", 1.5),
        { width: 2160, height: 2160 },
    );
});

test("frontend alignment rounds up to the next 8-pixel boundary", () => {
    assert.deepEqual(
        calculateDimensions("4K", "1:1", "Landscape", 1.2),
        { width: 1800, height: 1800 },
    );
});

test("target preview does not undershoot the selected preset target", () => {
    assert.deepEqual(
        calculateDimensions("1K", "1:1", "Landscape", 1.1),
        { width: 936, height: 936 },
    );
    assert.deepEqual(
        getTargetDimensions("1K", "1:1", "Landscape", 1.1),
        { width: 1030, height: 1030 },
    );
});

test("batch click ignores blank space outside the visible control", () => {
    const control = { x: 10, y: 100, w: 300, h: 26 };

    assert.equal(getBatchClickAction(control, 9, 113), null);
    assert.equal(getBatchClickAction(control, 311, 113), null);
    assert.equal(getBatchClickAction(control, 320, 113), null);
});

test("batch click only changes value inside the visible minus and plus zones", () => {
    const control = { x: 10, y: 100, w: 300, h: 26 };

    assert.equal(getBatchClickAction(control, 20, 113), "decrement");
    assert.equal(getBatchClickAction(control, 160, 113), null);
    assert.equal(getBatchClickAction(control, 300, 113), "increment");
});

test("normalizing output slots removes stale manual positions and hides native text", () => {
    const outputs = [
        { name: "WIDTH", localized_name: "WIDTH", type: "INT", links: [1], pos: [370, 30] },
        { name: "HEIGHT", localized_name: "HEIGHT", type: "INT", links: null, pos: new Float32Array([370, 60]) },
    ];

    normalizeOutputSlots(outputs);

    assert.deepEqual(outputs, [
        { name: "", localized_name: "", type: "INT", links: [1] },
        { name: "", localized_name: "", type: "INT", links: null },
    ]);
});
