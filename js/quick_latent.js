import { app } from "../../scripts/app.js";
import {
    PRESET_RESOLUTIONS, ASPECT_RATIOS, MIN_WIDTH,
    CUSTOM_MIN, CUSTOM_MAX,
    calculateDimensions, calculateCustomDimensions,
    buildRatioOptions, buildPresetOptions, clampCustomDimension,
} from "./config.js";
import {
    drawLabel, drawSegmented, drawPresetStack,
    drawBatch, drawOutputValues, drawSize,
} from "./draw.js";
import {
    getControlStartY,
    getOutputColumnReservedWidth,
    getQuickLatentMinWidth,
    getQuickLatentMinHeight,
    getBatchClickAction,
    getSizeBoxClickAction,
    getPresetStackClickValue,
    normalizeOutputSlots,
} from "./layout.js";
import { openNumberInput } from "./size_input.js";
import { createTranslator } from "./i18n.js";

const SELECTION_ANIMATION_MS = 170;

app.registerExtension({
    name: "QuickLatent",

    async beforeRegisterNodeDef(nodeType, nodeData, _app) {
        if (nodeData.name !== "QuickLatent") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            onNodeCreated?.apply(this, []);
            setupQuickLatentNode(this);
        };
    },
});

function setupQuickLatentNode(node) {
    const t = createTranslator();
    const orientationOptions = [
        { label: t("portrait"), value: "Portrait" },
        { label: t("landscape"), value: "Landscape" },
    ];
    const customSizeLabels = {
        width: t("width"),
        height: t("height"),
        hint: t("customRoundDownHint"),
    };
    const presetResolutionWidget = node.widgets.find((widget) => widget.name === "preset_resolution");
    const aspectRatioWidget = node.widgets.find((widget) => widget.name === "aspect_ratio");
    const orientationWidget = node.widgets.find((widget) => widget.name === "orientation");
    const batchSizeWidget = node.widgets.find((widget) => widget.name === "batch_size");
    const customWidthWidget = node.widgets.find((widget) => widget.name === "custom_width");
    const customHeightWidget = node.widgets.find((widget) => widget.name === "custom_height");

    [
        presetResolutionWidget,
        aspectRatioWidget,
        orientationWidget,
        batchSizeWidget,
        customWidthWidget,
        customHeightWidget,
    ].forEach((widget) => {
        if (widget) {
            widget.hidden = true;
            widget.type = "hidden";
            widget.computeSize = () => [0, -4];
        }
    });

    if (node.inputs) node.inputs.length = 0;
    normalizeOutputSlots(node.outputs);

    let presetVal = validPreset(presetResolutionWidget?.value);
    let orientVal = validOrientation(orientationWidget?.value);
    let ratioVal = validRatio(aspectRatioWidget?.value);
    let batchVal = validBatch(batchSizeWidget?.value);
    let customWidthVal = validCustom(customWidthWidget?.value);
    let customHeightVal = validCustom(customHeightWidget?.value);

    let ratioOptions = buildRatioOptions(orientVal, t("custom"));
    const controls = {};
    const animations = {};
    let animationFrame = null;
    const ds = { width: 0, height: 0, batch: 1 };
    const outputCount = node.outputs?.length || 4;
    let contentMinH = getQuickLatentMinHeight(outputCount);

    function widgetWidth() {
        return node.size[0] - getOutputColumnReservedWidth();
    }

    function recalculate() {
        const dimensions = ratioVal === "Custom"
            ? calculateCustomDimensions(customWidthVal, customHeightVal)
            : calculateDimensions(presetVal, ratioVal, orientVal);
        ds.width = dimensions.width;
        ds.height = dimensions.height;
        ds.batch = batchVal;
        node.setDirtyCanvas(true, false);
    }

    function easeOutCubic(progress) {
        return 1 - Math.pow(1 - progress, 3);
    }

    function animationPosition(name) {
        const animation = animations[name];
        if (!animation) return null;

        const elapsed = performance.now() - animation.startedAt;
        const progress = Math.min(1, elapsed / animation.duration);
        if (progress >= 1) {
            delete animations[name];
            return null;
        }

        const easedProgress = easeOutCubic(progress);
        return animation.fromIndex + (animation.toIndex - animation.fromIndex) * easedProgress;
    }

    function selectedIndex(options, value) {
        return options.findIndex((option) => option.value === value);
    }

    function startSelectionAnimation(name, options, fromValue, toValue) {
        const toIndex = selectedIndex(options, toValue);
        if (toIndex < 0) return;

        const currentPosition = animationPosition(name);
        const fromIndex = currentPosition ?? selectedIndex(options, fromValue);
        if (fromIndex < 0 || fromIndex === toIndex) return;

        animations[name] = {
            fromIndex,
            toIndex,
            startedAt: performance.now(),
            duration: SELECTION_ANIMATION_MS,
        };
        requestSelectionAnimationFrame();
    }

    function requestSelectionAnimationFrame() {
        if (animationFrame !== null || typeof requestAnimationFrame !== "function") return;
        animationFrame = requestAnimationFrame(stepSelectionAnimation);
    }

    function stepSelectionAnimation() {
        animationFrame = null;
        const now = performance.now();
        for (const [name, animation] of Object.entries(animations)) {
            if (now - animation.startedAt >= animation.duration) {
                delete animations[name];
            }
        }

        node.setDirtyCanvas(true, false);
        if (Object.keys(animations).length > 0) {
            requestSelectionAnimationFrame();
        }
    }

    function syncToHidden() {
        if (presetResolutionWidget) presetResolutionWidget.value = presetVal;
        if (aspectRatioWidget) aspectRatioWidget.value = ratioVal;
        if (orientationWidget) orientationWidget.value = orientVal;
        if (batchSizeWidget) batchSizeWidget.value = batchVal;
        if (customWidthWidget) customWidthWidget.value = customWidthVal;
        if (customHeightWidget) customHeightWidget.value = customHeightVal;
        recalculate();
    }

    const origDrawFG = node.onDrawForeground;
    node.onDrawForeground = function (ctx) {
        if (origDrawFG) origDrawFG.call(this, ctx);
        if (this.flags?.collapsed) return;

        const width = widgetWidth();
        drawOutputValues(ctx, ds, this);

        let y = getControlStartY();
        drawLabel(ctx, t("orientation"), y + 8, width);
        y += 18;
        drawSegmented(ctx, controls, "orient", orientationOptions, orientVal, y, width, animationPosition("orient"));
        y += 32;

        drawLabel(ctx, t("aspectRatio"), y + 8, width);
        y += 18;
        drawSegmented(ctx, controls, "ratio", ratioOptions, ratioVal, y, width, animationPosition("ratio"));
        y += 32;

        drawLabel(ctx, ratioVal === "Custom" ? t("customSize") : t("presetResolution"), y + 8, width);
        y += 18;
        if (ratioVal === "Custom") {
            drawSize(ctx, controls, customWidthVal, customHeightVal, y, width, customSizeLabels);
        } else {
            drawPresetStack(
                ctx,
                controls,
                "resolution",
                buildPresetOptions(ratioVal, orientVal),
                presetVal,
                y,
                width,
                animationPosition("resolution"),
            );
        }
        y += 84;

        drawLabel(ctx, t("batchSize"), y + 8, width);
        y += 18;
        drawBatch(ctx, controls, "batch", batchVal, y, width);
        y += 32;

        contentMinH = y;
    };

    node.onMouseDown = function (_event, localPos) {
        const x = localPos[0];
        const y = localPos[1];

        if (x > this.size[0] - 40) return false;

        const nextOrientation = getSegmentedValue(controls.orient, orientationOptions, x, y);
        if (nextOrientation) {
            if (nextOrientation !== orientVal) {
                startSelectionAnimation("orient", orientationOptions, orientVal, nextOrientation);
                orientVal = nextOrientation;
                ratioOptions = buildRatioOptions(orientVal, t("custom"));
                if (ratioVal === "Custom") {
                    const widthValue = customWidthVal;
                    customWidthVal = customHeightVal;
                    customHeightVal = widthValue;
                }
                syncToHidden();
            }
            return true;
        }

        const nextRatio = getSegmentedValue(controls.ratio, ratioOptions, x, y);
        if (nextRatio) {
            if (nextRatio !== ratioVal) {
                startSelectionAnimation("ratio", ratioOptions, ratioVal, nextRatio);
            }
            ratioVal = nextRatio;
            syncToHidden();
            return true;
        }

        if (ratioVal === "Custom") {
            const sizeAction = getSizeBoxClickAction(controls, x, y);
            if (sizeAction) {
                const isWidth = sizeAction === "sizeW";
                openNumberInput({
                    node: this,
                    box: isWidth ? controls.sizeW : controls.sizeH,
                    value: isWidth ? customWidthVal : customHeightVal,
                    min: CUSTOM_MIN,
                    max: CUSTOM_MAX,
                    onCommit: (value) => {
                        if (isWidth) customWidthVal = value;
                        else customHeightVal = value;
                        syncToHidden();
                    },
                });
                return true;
            }
        } else {
            const nextPreset = getPresetStackClickValue(controls.resolution, x, y);
            if (nextPreset) {
                if (nextPreset !== presetVal) {
                    startSelectionAnimation(
                        "resolution",
                        buildPresetOptions(ratioVal, orientVal),
                        presetVal,
                        nextPreset,
                    );
                }
                presetVal = nextPreset;
                syncToHidden();
                return true;
            }
        }

        const batchAction = getBatchClickAction(controls.batch, x, y);
        if (batchAction) {
            if (batchAction === "decrement") batchVal = Math.max(1, batchVal - 1);
            else if (batchAction === "increment") batchVal = Math.min(64, batchVal + 1);
            else if (batchAction === "edit") {
                openNumberInput({
                    node: this,
                    box: controls.batch.valueBox,
                    value: batchVal,
                    min: 1,
                    max: 64,
                    onCommit: (value) => {
                        batchVal = value;
                        syncToHidden();
                    },
                });
                return true;
            }
            syncToHidden();
            return true;
        }

        return false;
    };

    const origConfigure = node.onConfigure;
    node.onConfigure = function (config) {
        if (origConfigure) origConfigure.call(this, config);
        normalizeOutputSlots(this.outputs);
        setTimeout(() => {
            presetVal = validPreset(presetResolutionWidget?.value);
            orientVal = validOrientation(orientationWidget?.value);
            ratioVal = validRatio(aspectRatioWidget?.value);
            batchVal = validBatch(batchSizeWidget?.value);
            customWidthVal = validCustom(customWidthWidget?.value);
            customHeightVal = validCustom(customHeightWidget?.value);
            ratioOptions = buildRatioOptions(orientVal, t("custom"));
            if (node.inputs) node.inputs.length = 0;
            normalizeOutputSlots(node.outputs);
            syncToHidden();
        }, 100);
    };

    node.getInputs = function () { return []; };

    node.size[0] = Math.max(node.size[0], MIN_WIDTH);
    node.size[1] = Math.max(node.size[1], contentMinH);

    node.computeSize = function () {
        return [getQuickLatentMinWidth(), contentMinH];
    };

    const origResize = node.onResize;
    node.onResize = function (size) {
        size[0] = Math.max(size[0], MIN_WIDTH);
        size[1] = Math.max(size[1], contentMinH);
        if (origResize) origResize.call(this, size);
    };

    syncToHidden();
}

function getSegmentedValue(control, options, x, y) {
    if (!control) return null;
    if (x < control.x || x > control.x + control.w) return null;
    if (y < control.y || y > control.y + control.h) return null;

    const index = Math.floor((x - control.x) / control.segW);
    return options[index]?.value || null;
}

function validPreset(value) {
    return PRESET_RESOLUTIONS.includes(value) ? value : "1024";
}

function validRatio(value) {
    return ASPECT_RATIOS.includes(value) ? value : "1:1";
}

function validOrientation(value) {
    return value === "Portrait" || value === "Landscape" ? value : "Landscape";
}

function validBatch(value) {
    const batch = Number(value) || 1;
    return Math.max(1, Math.min(64, batch));
}

function validCustom(value) {
    return clampCustomDimension(value);
}
