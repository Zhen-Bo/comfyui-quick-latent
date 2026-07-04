import { app } from "../../scripts/app.js";
import {
    MIN_WIDTH,
    CUSTOM_MIN, CUSTOM_MAX,
    calculatePresetDimensions, calculateCustomDimensions,
    buildRatioOptions, buildPresetOptions,
    normalizeBatchSizeValue,
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
import { createTranslator, loadLocaleMessages } from "./i18n.js";
import { SelectionAnimationController } from "./selection_animation.js";
import {
    getQuickLatentWidgets,
    hideNativeWidgets,
    readWidgetState,
    writeWidgetState,
} from "./widget_state.js";

const SELECTION_ANIMATION_MS = 170;

app.registerExtension({
    name: "QuickLatent",

    async beforeRegisterNodeDef(nodeType, nodeData, _app) {
        if (nodeData.name !== "QuickLatent") return;
        const translate = createTranslator(await loadLocaleMessages());

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            onNodeCreated?.apply(this, []);
            setupQuickLatentNode(this, translate);
        };
    },
});

function setupQuickLatentNode(node, translate) {
    const orientationOptions = [
        { label: translate("portrait"), value: "Portrait" },
        { label: translate("landscape"), value: "Landscape" },
    ];
    const customSizeLabels = {
        width: translate("width"),
        height: translate("height"),
        hint: translate("customRoundDownHint"),
    };
    const widgets = getQuickLatentWidgets(node);
    hideNativeWidgets(widgets);

    if (node.inputs) node.inputs.length = 0;
    normalizeOutputSlots(node.outputs);

    let widgetState = readWidgetState(widgets);
    let ratioOptions = buildRatioOptions(widgetState.orientation, translate("custom"));
    const controls = {};
    const outputState = { outputWidth: 0, outputHeight: 0, batchSize: 1 };
    const outputCount = node.outputs?.length || 4;
    let contentMinHeight = getQuickLatentMinHeight(outputCount);
    const selectionAnimations = new SelectionAnimationController({
        durationMs: SELECTION_ANIMATION_MS,
        onFrame: () => node.setDirtyCanvas(true, false),
    });

    function getControlAreaWidth() {
        return node.size[0] - getOutputColumnReservedWidth();
    }

    function updateOutputState() {
        const dimensions = widgetState.aspectRatio === "Custom"
            ? calculateCustomDimensions(widgetState.customWidth, widgetState.customHeight)
            : calculatePresetDimensions(
                widgetState.presetResolution,
                widgetState.aspectRatio,
                widgetState.orientation,
            );
        outputState.outputWidth = dimensions.width;
        outputState.outputHeight = dimensions.height;
        outputState.batchSize = widgetState.batchSize;
        node.setDirtyCanvas(true, false);
    }

    function syncHiddenWidgetsAndRecalculate() {
        writeWidgetState(widgets, widgetState);
        updateOutputState();
    }

    const origDrawFG = node.onDrawForeground;
    node.onDrawForeground = function (ctx) {
        if (origDrawFG) origDrawFG.call(this, ctx);
        if (this.flags?.collapsed) return;

        const controlAreaWidth = getControlAreaWidth();
        drawOutputValues(ctx, outputState, this);

        let y = getControlStartY();
        drawLabel(ctx, translate("orientation"), y + 8, controlAreaWidth);
        y += 18;
        drawSegmented(
            ctx,
            controls,
            "orient",
            orientationOptions,
            widgetState.orientation,
            y,
            controlAreaWidth,
            selectionAnimations.position("orient"),
        );
        y += 32;

        drawLabel(ctx, translate("aspectRatio"), y + 8, controlAreaWidth);
        y += 18;
        drawSegmented(
            ctx,
            controls,
            "ratio",
            ratioOptions,
            widgetState.aspectRatio,
            y,
            controlAreaWidth,
            selectionAnimations.position("ratio"),
        );
        y += 32;

        drawLabel(
            ctx,
            widgetState.aspectRatio === "Custom" ? translate("customSize") : translate("presetResolution"),
            y + 8,
            controlAreaWidth,
        );
        y += 18;
        if (widgetState.aspectRatio === "Custom") {
            drawSize(ctx, controls, widgetState.customWidth, widgetState.customHeight, y, controlAreaWidth, customSizeLabels);
        } else {
            drawPresetStack(
                ctx,
                controls,
                "resolution",
                buildPresetOptions(widgetState.aspectRatio, widgetState.orientation),
                widgetState.presetResolution,
                y,
                controlAreaWidth,
                selectionAnimations.position("resolution"),
            );
        }
        y += 84;

        drawLabel(ctx, translate("batchSize"), y + 8, controlAreaWidth);
        y += 18;
        drawBatch(ctx, controls, "batch", widgetState.batchSize, y, controlAreaWidth);
        y += 32;

        contentMinHeight = y;
    };

    node.onMouseDown = function (_event, localPos) {
        const pointerX = localPos[0];
        const pointerY = localPos[1];

        if (pointerX > this.size[0] - 40) return false;

        const nextOrientation = getSegmentedValue(controls.orient, orientationOptions, pointerX, pointerY);
        if (nextOrientation) {
            if (nextOrientation !== widgetState.orientation) {
                selectionAnimations.start("orient", orientationOptions, widgetState.orientation, nextOrientation);
                widgetState.orientation = nextOrientation;
                ratioOptions = buildRatioOptions(widgetState.orientation, translate("custom"));
                if (widgetState.aspectRatio === "Custom") {
                    const previousCustomWidth = widgetState.customWidth;
                    widgetState.customWidth = widgetState.customHeight;
                    widgetState.customHeight = previousCustomWidth;
                }
                syncHiddenWidgetsAndRecalculate();
            }
            return true;
        }

        const nextRatio = getSegmentedValue(controls.ratio, ratioOptions, pointerX, pointerY);
        if (nextRatio) {
            if (nextRatio !== widgetState.aspectRatio) {
                selectionAnimations.start("ratio", ratioOptions, widgetState.aspectRatio, nextRatio);
            }
            widgetState.aspectRatio = nextRatio;
            syncHiddenWidgetsAndRecalculate();
            return true;
        }

        if (widgetState.aspectRatio === "Custom") {
            const sizeAction = getSizeBoxClickAction(controls, pointerX, pointerY);
            if (sizeAction) {
                const isWidth = sizeAction === "sizeW";
                openNumberInput({
                    node: this,
                    box: isWidth ? controls.sizeW : controls.sizeH,
                    value: isWidth ? widgetState.customWidth : widgetState.customHeight,
                    min: CUSTOM_MIN,
                    max: CUSTOM_MAX,
                    onCommit: (value) => {
                        if (isWidth) widgetState.customWidth = value;
                        else widgetState.customHeight = value;
                        syncHiddenWidgetsAndRecalculate();
                    },
                });
                return true;
            }
        } else {
            const nextPreset = getPresetStackClickValue(controls.resolution, pointerX, pointerY);
            if (nextPreset) {
                if (nextPreset !== widgetState.presetResolution) {
                    selectionAnimations.start(
                        "resolution",
                        buildPresetOptions(widgetState.aspectRatio, widgetState.orientation),
                        widgetState.presetResolution,
                        nextPreset,
                    );
                }
                widgetState.presetResolution = nextPreset;
                syncHiddenWidgetsAndRecalculate();
                return true;
            }
        }

        const batchAction = getBatchClickAction(controls.batch, pointerX, pointerY);
        if (batchAction) {
            if (batchAction === "decrement") widgetState.batchSize = normalizeBatchSizeValue(widgetState.batchSize - 1);
            else if (batchAction === "increment") widgetState.batchSize = normalizeBatchSizeValue(widgetState.batchSize + 1);
            else if (batchAction === "edit") {
                openNumberInput({
                    node: this,
                    box: controls.batch.valueBox,
                    value: widgetState.batchSize,
                    min: 1,
                    max: 64,
                    onCommit: (value) => {
                        widgetState.batchSize = normalizeBatchSizeValue(value);
                        syncHiddenWidgetsAndRecalculate();
                    },
                });
                return true;
            }
            syncHiddenWidgetsAndRecalculate();
            return true;
        }

        return false;
    };

    const origConfigure = node.onConfigure;
    node.onConfigure = function (config) {
        if (origConfigure) origConfigure.call(this, config);
        normalizeOutputSlots(this.outputs);
        setTimeout(() => {
            widgetState = readWidgetState(widgets);
            ratioOptions = buildRatioOptions(widgetState.orientation, translate("custom"));
            if (node.inputs) node.inputs.length = 0;
            normalizeOutputSlots(node.outputs);
            syncHiddenWidgetsAndRecalculate();
        }, 100);
    };

    node.getInputs = function () { return []; };

    node.size[0] = Math.max(node.size[0], MIN_WIDTH);
    node.size[1] = Math.max(node.size[1], contentMinHeight);

    node.computeSize = function () {
        return [getQuickLatentMinWidth(), contentMinHeight];
    };

    const origResize = node.onResize;
    node.onResize = function (size) {
        size[0] = Math.max(size[0], MIN_WIDTH);
        size[1] = Math.max(size[1], contentMinHeight);
        if (origResize) origResize.call(this, size);
    };

    syncHiddenWidgetsAndRecalculate();
}

function getSegmentedValue(control, options, pointerX, pointerY) {
    if (!control) return null;
    if (pointerX < control.left || pointerX > control.left + control.width) return null;
    if (pointerY < control.top || pointerY > control.top + control.height) return null;

    const index = Math.floor((pointerX - control.left) / control.segmentWidth);
    return options[index]?.value || null;
}
