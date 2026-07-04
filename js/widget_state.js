import {
    normalizeAspectRatio,
    normalizeBatchSizeValue,
    normalizeCustomDimensionValue,
    normalizeOrientation,
    normalizePresetResolution,
} from "./config.js";

export function getQuickLatentWidgets(node) {
    return {
        presetResolution: node.widgets.find((widget) => widget.name === "preset_resolution"),
        aspectRatio: node.widgets.find((widget) => widget.name === "aspect_ratio"),
        orientation: node.widgets.find((widget) => widget.name === "orientation"),
        batchSize: node.widgets.find((widget) => widget.name === "batch_size"),
        customWidth: node.widgets.find((widget) => widget.name === "custom_width"),
        customHeight: node.widgets.find((widget) => widget.name === "custom_height"),
    };
}

export function hideNativeWidgets(widgets) {
    Object.values(widgets).forEach((widget) => {
        if (!widget) return;

        widget.hidden = true;
        widget.type = "hidden";
        widget.computeSize = () => [0, -4];
    });
}

export function readWidgetState(widgets) {
    return {
        presetResolution: normalizePresetResolution(widgets.presetResolution?.value),
        aspectRatio: normalizeAspectRatio(widgets.aspectRatio?.value),
        orientation: normalizeOrientation(widgets.orientation?.value),
        batchSize: normalizeBatchSizeValue(widgets.batchSize?.value),
        customWidth: normalizeCustomDimensionValue(widgets.customWidth?.value),
        customHeight: normalizeCustomDimensionValue(widgets.customHeight?.value),
    };
}

export function writeWidgetState(widgets, state) {
    if (widgets.presetResolution) widgets.presetResolution.value = state.presetResolution;
    if (widgets.aspectRatio) widgets.aspectRatio.value = state.aspectRatio;
    if (widgets.orientation) widgets.orientation.value = state.orientation;
    if (widgets.batchSize) widgets.batchSize.value = state.batchSize;
    if (widgets.customWidth) widgets.customWidth.value = state.customWidth;
    if (widgets.customHeight) widgets.customHeight.value = state.customHeight;
}
