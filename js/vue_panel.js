import {
    CUSTOM_MAX,
    CUSTOM_MIN,
    ALIGNMENT,
    BATCH_SIZE_MAX,
    BATCH_SIZE_MIN,
    PORT_COLORS,
    buildPresetOptions,
    buildRatioOptions,
    normalizeBatchSizeValue,
    normalizeCustomDimensionValue,
} from "./config.js";
import { getOutputColumnReservedWidth } from "./layout.js";
import { EASE_OUT_CUBIC_CSS, SELECTION_ANIMATION_MS } from "./selection_animation.js";

const LABEL_HEIGHT = 18;
const CONTROL_HEIGHT = 26;
const CONTROL_GAP = 6;
const FRAME_PADDING = 2;
const PRESET_ROW_COUNT = 3;
const SIZE_SECTION_HEIGHT = PRESET_ROW_COUNT * CONTROL_HEIGHT + CONTROL_GAP;
const SECTION_COUNT = 4;
const SINGLE_ROW_SECTION_COUNT = 3;
export const PANEL_HEIGHT = SECTION_COUNT * LABEL_HEIGHT
    + SINGLE_ROW_SECTION_COUNT * (CONTROL_HEIGHT + CONTROL_GAP)
    + SIZE_SECTION_HEIGHT;
const VUE_WIDGET_GRID_PADDING = 12;
const OUTPUT_COLUMN_WIDTH = getOutputColumnReservedWidth() - VUE_WIDGET_GRID_PADDING;

// Nodes 2.0 puts output slots above the widgets; these rules float them to the top right like the classic canvas.
const NODE_BODY = '[data-testid^="node-body-"]:has(.ql-panel)';
const OUTPUT_SLOT_STYLE = `
${NODE_BODY} { position: relative; }
${NODE_BODY} > div:first-child { position: absolute; top: 4px; right: 0; z-index: 1; }
${NODE_BODY} .lg-slot--output span { font: bold 13px monospace; }
${PORT_COLORS.map((color, index) => `${NODE_BODY} .lg-slot--output:nth-child(${index + 1}) span { color: ${color}; }`).join("\n")}
`;

const STYLE_ID = "quick-latent-panel-style";
const STYLE = `
.ql-panel { box-sizing: border-box; height: ${PANEL_HEIGHT}px; padding-right: ${OUTPUT_COLUMN_WIDTH}px;
    display: flex; flex-direction: column; font-family: sans-serif; color: #e8e8f0; user-select: none; }
.ql-panel * { box-sizing: border-box; }
.ql-label { height: ${LABEL_HEIGHT}px; line-height: 16px; font-size: 10px; color: #8d899f; white-space: nowrap; }
.ql-gap { margin-bottom: ${CONTROL_GAP}px; }
.ql-frame { position: relative; display: flex; padding: ${FRAME_PADDING}px; border: 1px solid #3f3b5a; border-radius: 5px; background: #252538; }
.ql-pill { position: absolute; border-radius: 4px; background: #815fc8; box-shadow: inset 0 0 0 1.25px rgba(229, 219, 255, 0.58);
    transition: left ${SELECTION_ANIMATION_MS}ms ${EASE_OUT_CUBIC_CSS}, top ${SELECTION_ANIMATION_MS}ms ${EASE_OUT_CUBIC_CSS}; }
.ql-seg .ql-pill { top: ${FRAME_PADDING}px; bottom: ${FRAME_PADDING}px; }
.ql-stack .ql-pill { left: ${FRAME_PADDING}px; right: ${FRAME_PADDING}px; }
.ql-frame.ql-input-frame { border-color: #4d496a; }
.ql-seg { height: ${CONTROL_HEIGHT}px; }
.ql-stack { height: ${PRESET_ROW_COUNT * CONTROL_HEIGHT}px; flex-direction: column; }
.ql-choice { position: relative; flex: 1; min-width: 0; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #918da3;
    font: bold 12px sans-serif; cursor: pointer; }
.ql-stack .ql-choice { font-family: monospace; }
.ql-choice:hover:not(.ql-on):not(:disabled) { color: #c9c5d8; }
.ql-choice.ql-on { color: #fff; }
.ql-locked { position: relative; }
.ql-locked .ql-frame { opacity: 0.4; }
.ql-locked .ql-choice { cursor: not-allowed; }
.ql-locked::after { content: ""; position: absolute; inset: 0; border-radius: 5px; pointer-events: none;
    background: repeating-linear-gradient(135deg, transparent 0 7px, rgba(110, 110, 133, 0.22) 7px 8px); }
.ql-size { height: ${SIZE_SECTION_HEIGHT}px; }
.ql-custom { display: grid; grid-template-columns: 1fr 20px 1fr; grid-template-rows: repeat(3, ${CONTROL_HEIGHT}px); column-gap: 8px; }
.ql-custom .ql-label { align-self: end; height: auto; line-height: 14px; padding-left: 1px; }
.ql-custom .ql-x { align-self: center; text-align: center; color: #6e6e85; font: bold 14px sans-serif; }
.ql-custom .ql-hint { grid-column: 1 / -1; align-self: center; padding-left: 1px; font-size: 10px; color: #7f7a90; }
.ql-number { width: 100%; height: 22px; align-self: center; padding: 0 4px; border: 1px solid #4d496a; border-radius: 5px;
    background: #252538; color: #e8e8f0; font: bold 12px monospace; text-align: center;
    -moz-appearance: textfield; appearance: textfield; }
.ql-number::-webkit-inner-spin-button, .ql-number::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.ql-number:focus { outline: none; border-color: #9c7ee0; }
.ql-batch { height: ${CONTROL_HEIGHT}px; padding: 0; display: grid;
    grid-template-columns: ${CONTROL_HEIGHT}px 1fr ${CONTROL_HEIGHT}px; }
.ql-batch .ql-step { padding: 0; border: 0; background: transparent; color: #918da3; font: bold 14px sans-serif; cursor: pointer; }
.ql-batch .ql-step:hover { color: #e8e8f0; }
.ql-batch .ql-number { height: 24px; border-color: transparent; background: transparent; }
.ql-batch .ql-number:focus { border-color: #9c7ee0; }
${OUTPUT_SLOT_STYLE}`;

function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = STYLE;
    document.head.appendChild(style);
}

function el(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function section(labelText, control, gap = true) {
    if (gap) control.classList.add("ql-gap");
    return [el("div", "ql-label", labelText), control];
}

function placePill(pill, vertical, index, count) {
    const innerLength = `(100% - ${2 * FRAME_PADDING}px)`;
    const offset = `calc(${FRAME_PADDING}px + ${innerLength} * ${index} / ${count})`;
    const length = `calc(${innerLength} / ${count})`;
    if (vertical) Object.assign(pill.style, { top: offset, height: length });
    else Object.assign(pill.style, { left: offset, width: length });
}

function afterFirstPaint(callback) {
    requestAnimationFrame(() => requestAnimationFrame(callback));
}

function slidingSelectionPill(vertical, fromIndex, toIndex, count) {
    const pill = el("div", "ql-pill");
    placePill(pill, vertical, fromIndex ?? toIndex, count);
    if (fromIndex !== null && fromIndex !== toIndex) {
        afterFirstPaint(() => placePill(pill, vertical, toIndex, count));
    }
    return pill;
}

function choiceButtons(frameClass, options, selectedValue, onSelect, locked = false, fromIndex = null) {
    const frame = el("div", `ql-frame ${frameClass}`);
    const selectedIndex = options.findIndex((option) => option.value === selectedValue);
    if (selectedIndex >= 0) {
        frame.append(slidingSelectionPill(frameClass.includes("ql-stack"), fromIndex, selectedIndex, options.length));
    }
    for (const option of options) {
        const button = el("button", option.value === selectedValue ? "ql-choice ql-on" : "ql-choice", option.label);
        button.type = "button";
        button.disabled = locked;
        button.addEventListener("click", () => onSelect(option.value));
        frame.append(button);
    }
    if (!locked) return frame;
    const lock = el("div", "ql-locked");
    lock.append(frame);
    return lock;
}

// Commit on Enter or blur; keep keystrokes away from ComfyUI shortcuts.
function numberInput(value, min, max, step, onCommit) {
    const input = el("input", "ql-number");
    Object.assign(input, { type: "number", min, max, step, value: String(value) });
    input.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "Enter") input.blur();
    });
    input.addEventListener("change", () => onCommit(input.value));
    return input;
}

/**
 * Builds the Nodes 2.0 panel. `onChange(patch)` receives a partial widget state.
 * Call `render(state)` after every state change; it rebuilds the controls.
 */
export function createVuePanel({ translate, onChange }) {
    ensureStyle();
    const element = el("div", "ql-panel");
    const orientationOptions = ["portrait", "landscape", "custom"].map((value) => ({ label: translate(value), value }));
    const previousSelectedIndex = {};

    function trackedChoice(key, frameClass, options, selectedValue, onSelect, locked = false) {
        const fromIndex = previousSelectedIndex[key] ?? null;
        previousSelectedIndex[key] = options.findIndex((option) => option.value === selectedValue);
        return choiceButtons(frameClass, options, selectedValue, onSelect, locked, fromIndex);
    }

    function sizeSection(state) {
        const size = el("div", "ql-size");
        if (state.orientation !== "custom") {
            size.append(trackedChoice(
                "resolution",
                "ql-input-frame ql-stack",
                buildPresetOptions(state.aspectRatio, state.orientation),
                state.presetResolution,
                (presetResolution) => onChange({ presetResolution }),
            ));
            return section(translate("presetResolution"), size, false);
        }

        // The preset stack is gone in custom mode; do not slide from a stale row when it comes back.
        delete previousSelectedIndex.resolution;
        const custom = el("div", "ql-custom");
        custom.append(
            el("div", "ql-label", translate("width")),
            el("span"),
            el("div", "ql-label", translate("height")),
            numberInput(state.customWidth, CUSTOM_MIN, CUSTOM_MAX, ALIGNMENT,
                (value) => onChange({ customWidth: normalizeCustomDimensionValue(value) })),
            el("span", "ql-x", "x"),
            numberInput(state.customHeight, CUSTOM_MIN, CUSTOM_MAX, ALIGNMENT,
                (value) => onChange({ customHeight: normalizeCustomDimensionValue(value) })),
            el("div", "ql-hint", translate("customRoundDownHint")),
        );
        size.append(custom);
        return section(translate("customSize"), size, false);
    }

    function batchSection(state) {
        const batch = el("div", "ql-frame ql-input-frame ql-batch");
        const decrement = el("button", "ql-step", "−");
        const increment = el("button", "ql-step", "+");
        decrement.type = increment.type = "button";
        decrement.addEventListener("click", () => onChange({ batchSize: normalizeBatchSizeValue(state.batchSize - 1) }));
        increment.addEventListener("click", () => onChange({ batchSize: normalizeBatchSizeValue(state.batchSize + 1) }));
        batch.append(
            decrement,
            numberInput(state.batchSize, BATCH_SIZE_MIN, BATCH_SIZE_MAX, 1,
                (value) => onChange({ batchSize: normalizeBatchSizeValue(value) })),
            increment,
        );
        return section(translate("batchSize"), batch, false);
    }

    function render(state) {
        element.replaceChildren(
            ...section(translate("orientation"), trackedChoice(
                "orient", "ql-seg", orientationOptions, state.orientation, (orientation) => onChange({ orientation }),
            )),
            ...section(translate("aspectRatio"), trackedChoice(
                "ratio",
                "ql-seg",
                buildRatioOptions(state.orientation),
                state.aspectRatio,
                (aspectRatio) => onChange({ aspectRatio }),
                state.orientation === "custom",
            )),
            ...sizeSection(state),
            ...batchSection(state),
        );
    }

    return { element, render };
}
