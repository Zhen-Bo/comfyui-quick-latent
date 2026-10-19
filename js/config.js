// Size rules mirror nodes.py; keep both in sync.
export const ALIGNMENT = 16;
export const LONG_EDGES = { small: 1536, medium: 1920, large: 2560 };
export const SQUARE_LONG_EDGES = { small: 1024, medium: 1536, large: 2048 };
export const RATIOS = {
    square: { shortPart: 1, longPart: 1 },
    photo: { shortPart: 2, longPart: 3 },
    standard: { shortPart: 3, longPart: 4 },
    widescreen: { shortPart: 9, longPart: 16 },
};
export const ORIENTATIONS = ["portrait", "landscape", "custom"];

export const PORT_COLORS = ["#4fc3f7", "#ffb74d", "#ff69b4", "#9a7bdc"];
export const CUSTOM_MIN = 512;
export const CUSTOM_MAX = 4096;
export const BATCH_SIZE_MIN = 1;
export const BATCH_SIZE_MAX = 64;

export function floorToAlignment(value) {
    return value - (value % ALIGNMENT);
}

function clampInt(value, low, high, fallback) {
    const numericValue = Number(value);
    const integerValue = Number.isInteger(numericValue) ? numericValue : fallback;
    return Math.max(low, Math.min(high, integerValue));
}

export function normalizeCustomDimensionValue(value) {
    return clampInt(value, CUSTOM_MIN, CUSTOM_MAX, 1024);
}

export function normalizeBatchSizeValue(value) {
    return clampInt(value, BATCH_SIZE_MIN, BATCH_SIZE_MAX, BATCH_SIZE_MIN);
}

export function normalizeChoice(value, choices) {
    return choices.includes(value) ? value : choices[0];
}

export function presetDimensions(size, ratio, orientation) {
    const { shortPart, longPart } = RATIOS[ratio];
    const longEdge = (ratio === "square" ? SQUARE_LONG_EDGES : LONG_EDGES)[size];
    const shortEdge = floorToAlignment(Math.floor((longEdge * shortPart) / longPart));
    return orientation === "landscape"
        ? { width: longEdge, height: shortEdge }
        : { width: shortEdge, height: longEdge };
}

export function customDimensions(customWidth, customHeight) {
    return {
        width: floorToAlignment(normalizeCustomDimensionValue(customWidth)),
        height: floorToAlignment(normalizeCustomDimensionValue(customHeight)),
    };
}

export function ratioLabel(ratio, orientation) {
    const { shortPart, longPart } = RATIOS[ratio];
    return orientation === "landscape" ? `${longPart}:${shortPart}` : `${shortPart}:${longPart}`;
}

export function buildRatioOptions(orientation) {
    return Object.keys(RATIOS).map((ratio) => ({ label: ratioLabel(ratio, orientation), value: ratio }));
}

export function buildPresetOptions(ratio, orientation) {
    return Object.keys(LONG_EDGES).map((size) => {
        const { width, height } = presetDimensions(size, ratio, orientation);
        return { label: `${width} x ${height}`, value: size };
    });
}
