import { PORT_COLORS } from "./config.js";

const DEFAULT_NODE_SLOT_HEIGHT = 20;
const QUICK_LATENT_MIN_WIDTH = 370;
const OUTPUT_LABEL_GAP = 12;
const OUTPUT_COLUMN_RESERVED_WIDTH = 53;
const OUTPUT_ROWS_PADDING = 6;
const CONTROL_START_Y = 6;
const CUSTOM_CONTROLS_HEIGHT = 252;
const QUICK_LATENT_OUTPUT_COUNT = 4;
const OUTPUT_SLOT_OFF_COLOR = "#8a8795";

export function getNodeSlotHeight() {
    return (typeof LiteGraph !== "undefined" && LiteGraph.NODE_SLOT_HEIGHT) || DEFAULT_NODE_SLOT_HEIGHT;
}

export function getQuickLatentMinWidth() {
    return QUICK_LATENT_MIN_WIDTH;
}

export function getDefaultOutputSlotLocalPosition(node, index) {
    const slotH = getNodeSlotHeight();
    const offset = slotH * 0.5;
    const slotStartY = node.constructor?.slot_start_y || 0;
    return [
        node.size[0] + 1 - offset,
        (index + 0.7) * slotH + slotStartY,
    ];
}

export function getOutputValueLabelPosition(node, index) {
    const [slotX, slotY] = getDefaultOutputSlotLocalPosition(node, index);
    return [slotX - OUTPUT_LABEL_GAP, slotY];
}

export function getOutputValueLabels(outputState) {
    return [
        String(outputState.outputWidth),
        String(outputState.outputHeight),
        "LAT",
        String(outputState.batchSize),
    ];
}

export function getQuickLatentOutputCount() {
    return QUICK_LATENT_OUTPUT_COUNT;
}

export function getOutputColumnReservedWidth() {
    return OUTPUT_COLUMN_RESERVED_WIDTH;
}

export function getOutputRowsHeight(outputCount) {
    return outputCount * getNodeSlotHeight() + OUTPUT_ROWS_PADDING;
}

export function getControlStartY() {
    return CONTROL_START_Y;
}

export function getQuickLatentMinHeight(outputCount) {
    return Math.max(getOutputRowsHeight(outputCount), CONTROL_START_Y + CUSTOM_CONTROLS_HEIGHT);
}

export function getBatchClickAction(control, x, y) {
    if (!control) return null;
    if (!containsPoint(control, x, y)) return null;

    const localX = x - control.left;
    const buttonWidth = control.buttonWidth || control.height;
    if (localX < buttonWidth) return "decrement";
    if (localX > control.width - buttonWidth) return "increment";

    const valueBox = control.valueBox;
    if (containsPoint(valueBox, x, y)) {
        return "edit";
    }

    return null;
}

export function getSizeBoxClickAction(controls, x, y) {
    if (!controls) return null;
    if (containsPoint(controls.sizeW, x, y)) return "sizeW";
    if (containsPoint(controls.sizeH, x, y)) return "sizeH";
    return null;
}

export function getPresetStackClickValue(control, x, y) {
    if (!control) return null;
    if (x < control.left || x > control.left + control.width) return null;
    if (y < control.top || y >= control.top + control.height) return null;

    const rowStride = control.rowHeight + control.rowGap;
    const index = Math.floor((y - control.top) / rowStride);
    const rowOffset = (y - control.top) - index * rowStride;
    if (index < 0 || index >= control.options.length) return null;
    if (rowOffset >= control.rowHeight) return null;
    return control.options[index].value;
}

function containsPoint(rect, x, y) {
    return Boolean(
        rect
        && x >= rect.left
        && x <= rect.left + rect.width
        && y >= rect.top
        && y <= rect.top + rect.height,
    );
}

export function normalizeOutputSlots(outputs) {
    if (!outputs) return;
    outputs.length = Math.min(outputs.length, QUICK_LATENT_OUTPUT_COUNT);

    for (let index = 0; index < outputs.length; index++) {
        const output = outputs[index];
        output.name = "";
        output.localized_name = "";
        output.color = OUTPUT_SLOT_OFF_COLOR;
        output.color_off = OUTPUT_SLOT_OFF_COLOR;
        output.color_on = PORT_COLORS[index];
        delete output.pos;
    }
}
