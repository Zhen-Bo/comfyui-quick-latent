export const PRESET_RESOLUTION_TABLE = {
    "1:1": {
        "1024": [1024, 1024],
        "1536": [1536, 1536],
        "2048": [2048, 2048],
    },
    "2:3": {
        "1024": [1024, 1536],
        "1536": [1280, 1920],
        "2048": [1536, 2304],
    },
    "3:4": {
        "1024": [1152, 1536],
        "1536": [1344, 1792],
        "2048": [1536, 2048],
    },
    "16:9": {
        "1024": [1536, 864],
        "1536": [1920, 1080],
        "2048": [2560, 1440],
    },
};

export const PRESET_RESOLUTIONS = ["1024", "1536", "2048"];
export const ASPECT_RATIOS = ["1:1", "2:3", "3:4", "16:9", "Custom"];
export const ORIENTATIONS = ["Landscape", "Portrait"];
export const RATIO_LABELS = {
    Landscape: { "1:1": "1:1", "2:3": "3:2", "3:4": "4:3", "16:9": "16:9", Custom: "Custom" },
    Portrait: { "1:1": "1:1", "2:3": "2:3", "3:4": "3:4", "16:9": "9:16", Custom: "Custom" },
};
export const PORT_COLORS = ["#4fc3f7", "#ffb74d", "#ff69b4", "#9a7bdc"];
export const MIN_WIDTH = 370;
export const DIMENSION_ALIGNMENT = 8;
export const CUSTOM_MIN = 512;
export const CUSTOM_MAX = 4096;
export const BATCH_SIZE_MIN = 1;
export const BATCH_SIZE_MAX = 64;

export function alignDownToMultiple(value) {
    return value - (value % DIMENSION_ALIGNMENT);
}

export function normalizeCustomDimensionValue(value, fallback = 1024) {
    const numericValue = Number(value);
    const integerValue = Number.isInteger(numericValue) ? numericValue : fallback;
    return Math.max(CUSTOM_MIN, Math.min(CUSTOM_MAX, integerValue));
}

export function orientDimensions(width, height, orientation) {
    if (orientation === "Landscape" && width < height) return [height, width];
    if (orientation === "Portrait" && height < width) return [height, width];
    return [width, height];
}

export function calculatePresetDimensions(presetResolution, aspectRatio, orientation) {
    const [baseWidth, baseHeight] = PRESET_RESOLUTION_TABLE[aspectRatio][presetResolution];
    const [width, height] = orientDimensions(baseWidth, baseHeight, orientation);
    return { width, height };
}

export function calculateCustomDimensions(customWidth, customHeight) {
    return {
        width: alignDownToMultiple(normalizeCustomDimensionValue(customWidth)),
        height: alignDownToMultiple(normalizeCustomDimensionValue(customHeight)),
    };
}

export function buildRatioOptions(orientation, customLabel = "Custom") {
    return ASPECT_RATIOS.map((ratio) => ({
        label: ratio === "Custom" ? customLabel : RATIO_LABELS[orientation]?.[ratio] || ratio,
        value: ratio,
    }));
}

export function buildPresetOptions(aspectRatio, orientation) {
    return PRESET_RESOLUTIONS.map((presetResolution) => {
        const dimensions = calculatePresetDimensions(presetResolution, aspectRatio, orientation);
        return {
            label: `${dimensions.width} x ${dimensions.height}`,
            value: presetResolution,
        };
    });
}

export function normalizePresetResolution(value) {
    return PRESET_RESOLUTIONS.includes(value) ? value : PRESET_RESOLUTIONS[0];
}

export function normalizeAspectRatio(value) {
    return ASPECT_RATIOS.includes(value) ? value : ASPECT_RATIOS[0];
}

export function normalizeOrientation(value) {
    return ORIENTATIONS.includes(value) ? value : ORIENTATIONS[0];
}

export function normalizeBatchSizeValue(value) {
    const numericValue = Number(value);
    const integerValue = Number.isInteger(numericValue) ? numericValue : BATCH_SIZE_MIN;
    return Math.max(BATCH_SIZE_MIN, Math.min(BATCH_SIZE_MAX, integerValue));
}
