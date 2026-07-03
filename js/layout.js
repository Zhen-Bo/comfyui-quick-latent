const DEFAULT_NODE_SLOT_HEIGHT = 20;
const QUICK_LATENT_MIN_WIDTH = 370;
const OUTPUT_LABEL_GAP = 12;
const OUTPUT_COLUMN_RESERVED_WIDTH = 53;
const OUTPUT_ROWS_PADDING = 6;
const CONTROL_START_Y = 6;
const CUSTOM_CONTROLS_HEIGHT = 294;
const BATCH_BUTTON_HIT_WIDTH = 30;

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

export function getOutputValueLabels(ds) {
    return [String(ds.width), String(ds.height), ds.scale.toFixed(2), "LAT", String(ds.batch)];
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
    if (x < control.x || x > control.x + control.w) return null;
    if (y < control.y || y > control.y + control.h) return null;

    const localX = x - control.x;
    if (localX < BATCH_BUTTON_HIT_WIDTH) return "decrement";
    if (localX > control.w - BATCH_BUTTON_HIT_WIDTH) return "increment";
    return null;
}

export function getSizeBoxClickAction(controls, x, y) {
    if (!controls) return null;
    const inside = (box) =>
        box && x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
    if (inside(controls.sizeW)) return "sizeW";
    if (inside(controls.sizeH)) return "sizeH";
    return null;
}

export function normalizeOutputSlots(outputs) {
    if (!outputs) return;

    for (const output of outputs) {
        output.name = "";
        output.localized_name = "";
        delete output.pos;
    }
}
