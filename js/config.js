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
export const RATIO_LABELS = {
    Landscape: { "1:1": "1:1", "2:3": "3:2", "3:4": "4:3", "16:9": "16:9", Custom: "Custom" },
    Portrait: { "1:1": "1:1", "2:3": "2:3", "3:4": "3:4", "16:9": "9:16", Custom: "Custom" },
};
export const PORT_COLORS = ["#4fc3f7", "#ffb74d", "#ff69b4", "#9a7bdc"];
export const MIN_WIDTH = 370;
export const DIMENSION_ALIGNMENT = 8;
export const CUSTOM_MIN = 512;
export const CUSTOM_MAX = 4096;

export function roundToAlignment(value) {
    return Math.ceil(value / DIMENSION_ALIGNMENT) * DIMENSION_ALIGNMENT;
}

export function floorToAlignment(value) {
    return Math.floor(value / DIMENSION_ALIGNMENT) * DIMENSION_ALIGNMENT;
}

export function clampCustomDimension(value, fallback = 1024) {
    const numericValue = Number(value);
    const safeValue = Number.isFinite(numericValue) ? numericValue : fallback;
    return Math.trunc(Math.max(CUSTOM_MIN, Math.min(CUSTOM_MAX, safeValue)));
}

export function orientDimensions(width, height, orientation) {
    if (orientation === "Landscape" && width < height) return [height, width];
    if (orientation === "Portrait" && height < width) return [height, width];
    return [width, height];
}

export function calculateDimensions(presetResolution, aspectRatio, orientation) {
    const [baseWidth, baseHeight] = PRESET_RESOLUTION_TABLE[aspectRatio][presetResolution];
    const [width, height] = orientDimensions(baseWidth, baseHeight, orientation);
    return { width: roundToAlignment(width), height: roundToAlignment(height) };
}

export function calculateCustomDimensions(customWidth, customHeight) {
    return {
        width: floorToAlignment(clampCustomDimension(customWidth)),
        height: floorToAlignment(clampCustomDimension(customHeight)),
    };
}

export function buildRatioOptions(orientation) {
    return ASPECT_RATIOS.map((ratio) => ({
        label: RATIO_LABELS[orientation]?.[ratio] || ratio,
        value: ratio,
    }));
}

export function buildPresetOptions(aspectRatio, orientation) {
    return PRESET_RESOLUTIONS.map((presetResolution) => {
        const dimensions = calculateDimensions(presetResolution, aspectRatio, orientation);
        return {
            label: `${dimensions.width} x ${dimensions.height}`,
            value: presetResolution,
        };
    });
}
