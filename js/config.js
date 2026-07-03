export const RESOLUTION_TABLE = {
    "1K": {
        "1:1": [1024, 1024],
        "2:3": [1280, 1920],
        "3:4": [1440, 1920],
        "16:9": [1920, 1080],
        "21:9": [2560, 1088],
    },
    "2K": {
        "1:1": [2048, 2048],
        "2:3": [1712, 2560],
        "3:4": [1920, 2560],
        "16:9": [2560, 1440],
        "21:9": [3440, 1440],
    },
    "4K": {
        "1:1": [2160, 2160],
        "2:3": [2560, 3840],
        "3:4": [2880, 3840],
        "16:9": [3840, 2160],
        "21:9": [5120, 2160],
    },
};

export const RESOLUTIONS = ["1K", "2K", "4K", "Custom"];
export const ASPECT_RATIOS = ["1:1", "2:3", "3:4", "16:9", "21:9"];
export const RATIO_LABELS = {
    Landscape: { "1:1": "1:1", "2:3": "3:2", "3:4": "4:3", "16:9": "16:9", "21:9": "21:9" },
    Portrait: { "1:1": "1:1", "2:3": "2:3", "3:4": "3:4", "16:9": "9:16", "21:9": "9:21" },
};
export const PORT_COLORS = ["#4fc3f7", "#ffb74d", "#66ff88", "#ff69b4", "#ff69b4"];
export const MIN_WIDTH = 370;
export const DIMENSION_ALIGNMENT = 8;

// Custom-mode dimension bounds (D-04/D-13). Kept equal to nodes.py
// CUSTOM_DIMENSION_MIN / CUSTOM_DIMENSION_MAX so the client preview clamps
// exactly like the server-side calculate_custom_dimensions.
export const CUSTOM_MIN = 512;
export const CUSTOM_MAX = 4096;

export function roundToAlignment(value) {
    return Math.ceil(value / DIMENSION_ALIGNMENT) * DIMENSION_ALIGNMENT;
}

export function calculateDimensions(resolution, aspectRatio, orientation, scaleFactor) {
    let [w, h] = RESOLUTION_TABLE[resolution][aspectRatio];
    if (orientation === "Landscape") { if (w < h) [w, h] = [h, w]; }
    else if (orientation === "Portrait") { if (h < w) [w, h] = [h, w]; }
    return { width: roundToAlignment(w / scaleFactor), height: roundToAlignment(h / scaleFactor) };
}

export function getTargetDimensions(resolution, aspectRatio, orientation, scaleFactor) {
    const dims = calculateDimensions(resolution, aspectRatio, orientation, scaleFactor);
    return {
        width: Math.round(dims.width * scaleFactor),
        height: Math.round(dims.height * scaleFactor),
    };
}

// Client mirror of nodes.py calculate_custom_dimensions (D-01/D-13): clamp each
// axis to [CUSTOM_MIN, CUSTOM_MAX] then round8(value / scaleFactor). Takes NO
// orientation argument and does NOT swap width/height — the frontend owns the
// Portrait/Landscape swap (D-06), so swapping here would double-swap.
export function calculateCustomDimensions(customW, customH, scaleFactor) {
    const clamp = (v) => Math.max(CUSTOM_MIN, Math.min(CUSTOM_MAX, v));
    return {
        width: roundToAlignment(clamp(customW) / scaleFactor),
        height: roundToAlignment(clamp(customH) / scaleFactor),
    };
}

// Custom-aware target (D-09): the achievable target after 8-alignment is the
// aligned latent size times the scale factor (may differ slightly from the
// typed value, e.g. 1000 @ 2x -> latent 504 -> target 1008).
export function getCustomTargetDimensions(customW, customH, scaleFactor) {
    const dims = calculateCustomDimensions(customW, customH, scaleFactor);
    return {
        width: Math.round(dims.width * scaleFactor),
        height: Math.round(dims.height * scaleFactor),
    };
}

export function buildRatioOptions(orient) {
    return ASPECT_RATIOS.map((r) => ({
        label: RATIO_LABELS[orient]?.[r] || r,
        value: r,
    }));
}
