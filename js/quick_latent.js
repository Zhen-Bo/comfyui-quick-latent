import { app } from "../../scripts/app.js";
import {
    RESOLUTIONS, MIN_WIDTH,
    calculateDimensions, getTargetDimensions, buildRatioOptions,
    calculateCustomDimensions, getCustomTargetDimensions,
} from "./config.js";
import {
    drawLabel, drawSegmented, drawSlider, drawToggle,
    drawBatch, drawTargetInfo, drawOutputValues, drawSize,
} from "./draw.js";
import {
    getControlStartY,
    getOutputColumnReservedWidth,
    getQuickLatentMinWidth,
    getQuickLatentMinHeight,
    getBatchClickAction,
    getSizeBoxClickAction,
    normalizeOutputSlots,
} from "./layout.js";
import { openSizeInput } from "./size_input.js";

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
    const resolutionWidget = node.widgets.find((w) => w.name === "resolution");
    const aspectRatioWidget = node.widgets.find((w) => w.name === "aspect_ratio");
    const orientationWidget = node.widgets.find((w) => w.name === "orientation");
    const scaleFactorWidget = node.widgets.find((w) => w.name === "scale_factor");
    const batchSizeWidget = node.widgets.find((w) => w.name === "batch_size");
    const customWidthWidget = node.widgets.find((w) => w.name === "custom_width");
    const customHeightWidget = node.widgets.find((w) => w.name === "custom_height");

    // Hide all default widgets
    [resolutionWidget, aspectRatioWidget, orientationWidget, scaleFactorWidget, batchSizeWidget, customWidthWidget, customHeightWidget].forEach((w) => {
        if (w) {
            w.hidden = true;
            w.type = "hidden";
            w.computeSize = () => [0, -4];
        }
    });

    if (node.inputs) node.inputs.length = 0;

    // Keep LiteGraph's default slot layout and draw our value text separately.
    normalizeOutputSlots(node.outputs);

    // --- State ---
    let scaleVal = scaleFactorWidget ? Number(scaleFactorWidget.value) || 2.0 : 2.0;
    let orientVal = orientationWidget ? orientationWidget.value : "Landscape";
    let resVal = resolutionWidget ? resolutionWidget.value : "1K";
    let ratioVal = aspectRatioWidget ? aspectRatioWidget.value : "1:1";
    let batchVal = Number(batchSizeWidget ? batchSizeWidget.value : 1) || 1;
    // Custom W/H persist across preset<->Custom switches; never reset while a
    // preset is active (D-12).
    let customWidthVal = customWidthWidget ? Number(customWidthWidget.value) || 1024 : 1024;
    let customHeightVal = customHeightWidget ? Number(customHeightWidget.value) || 1024 : 1024;
    const resOptions = RESOLUTIONS.map((r) => ({ label: r, value: r }));
    let ratioOptions = buildRatioOptions(orientVal);
    const ds = { width: 0, height: 0, targetWidth: 0, targetHeight: 0, scale: 2.0, batch: 1 };
    const controls = {};
    const outputCount = node.outputs?.length || 5;
    let contentMinH = getQuickLatentMinHeight(outputCount);

    function widgetWidth() { return node.size[0] - getOutputColumnReservedWidth(); }

    function recalculate() {
        const sf = Number(scaleVal) || 2.0;
        let dims, target;
        if (resVal === "Custom") {
            dims = calculateCustomDimensions(customWidthVal, customHeightVal, sf);
            target = getCustomTargetDimensions(customWidthVal, customHeightVal, sf);
        } else {
            dims = calculateDimensions(resVal, ratioVal, orientVal, sf);
            target = getTargetDimensions(resVal, ratioVal, orientVal, sf);
        }
        ds.width = dims.width;
        ds.height = dims.height;
        ds.targetWidth = target.width;
        ds.targetHeight = target.height;
        ds.scale = sf;
        ds.batch = batchVal;
        node.setDirtyCanvas(true, false);
    }

    function syncToHidden() {
        if (resolutionWidget) resolutionWidget.value = resVal;
        if (aspectRatioWidget) aspectRatioWidget.value = ratioVal;
        if (orientationWidget) orientationWidget.value = orientVal;
        if (scaleFactorWidget) scaleFactorWidget.value = scaleVal;
        if (batchSizeWidget) batchSizeWidget.value = batchVal;
        if (customWidthWidget) customWidthWidget.value = customWidthVal;
        if (customHeightWidget) customHeightWidget.value = customHeightVal;
        recalculate();
    }

    // --- Main draw ---
    const origDrawFG = node.onDrawForeground;
    node.onDrawForeground = function (ctx) {
        if (origDrawFG) origDrawFG.call(this, ctx);
        if (this.flags?.collapsed) return;

        const ww = widgetWidth();

        drawOutputValues(ctx, ds, this);

        let y = getControlStartY();
        drawLabel(ctx, "Scale Factor", y + 8, ww, () => (Number(scaleVal) || 2.0).toFixed(1));
        y += 18;
        drawSlider(ctx, controls, "scale", scaleVal, y, ww);
        y += 28;

        drawLabel(ctx, "Orientation", y + 8, ww);
        y += 18;
        drawToggle(ctx, controls, "orient", orientVal, y, ww);
        y += 32;

        drawLabel(ctx, "Resolution", y + 8, ww);
        y += 18;
        drawSegmented(ctx, controls, "resolution", resOptions, resVal, y, ww);
        y += 32;

        drawLabel(ctx, resVal === "Custom" ? "Size" : "Aspect Ratio", y + 8, ww);
        y += 18;
        if (resVal === "Custom") {
            drawSize(ctx, controls, customWidthVal, customHeightVal, y, ww);
        } else {
            drawSegmented(ctx, controls, "ratio", ratioOptions, ratioVal, y, ww);
        }
        y += 32;

        drawLabel(ctx, "Batch Size", y + 8, ww);
        y += 18;
        drawBatch(ctx, controls, "batch", batchVal, y, ww);
        y += 32;

        drawLabel(ctx, "Target Size", y + 8, ww);
        y += 18;
        drawTargetInfo(ctx, ds, y, ww);
        y += 30;

        contentMinH = y;
    };

    // --- Mouse handling ---
    node.onMouseDown = function (e, localPos) {
        const x = localPos[0], y = localPos[1];

        // 保護區：保留右側 40px 的空間專門給端點使用，不要攔截點擊
        if (x > this.size[0] - 40) return false;

        const sc = controls.scale;
        if (sc && y >= sc.y && y <= sc.y + sc.h) {
            const pct = Math.max(0, Math.min(1, (x - sc.lx) / sc.trackW));
            let val = Math.round((1.0 + pct) * 10) / 10;
            scaleVal = Math.max(1.0, Math.min(2.0, val));
            syncToHidden();
            return true;
        }

        const oc = controls.orient;
        if (oc && y >= oc.y && y <= oc.y + oc.h) {
            orientVal = orientVal === "Landscape" ? "Portrait" : "Landscape";
            ratioOptions = buildRatioOptions(orientVal);
            // The frontend owns the Custom W/H swap (D-06/CUST-04); the backend
            // takes the values literally.
            if (resVal === "Custom") {
                const t = customWidthVal;
                customWidthVal = customHeightVal;
                customHeightVal = t;
            }
            syncToHidden();
            return true;
        }

        const rc = controls.resolution;
        if (rc && y >= rc.y && y <= rc.y + rc.h) {
            const idx = Math.floor((x - rc.x) / rc.segW);
            if (idx >= 0 && idx < rc.count) { resVal = resOptions[idx].value; syncToHidden(); }
            return true;
        }

        if (resVal !== "Custom") {
            const rac = controls.ratio;
            if (rac && y >= rac.y && y <= rac.y + rac.h) {
                const idx = Math.floor((x - rac.x) / rac.segW);
                if (idx >= 0 && idx < rac.count) { ratioVal = ratioOptions[idx].value; syncToHidden(); }
                return true;
            }
        } else {
            const sizeAction = getSizeBoxClickAction(controls, x, y);
            if (sizeAction) {
                const isWidth = sizeAction === "sizeW";
                const box = isWidth ? controls.sizeW : controls.sizeH;
                openSizeInput({
                    node: this,
                    box,
                    localPos,
                    event: e,
                    value: isWidth ? customWidthVal : customHeightVal,
                    min: 512,
                    max: 4096,
                    onCommit: (v) => {
                        if (isWidth) customWidthVal = v;
                        else customHeightVal = v;
                        syncToHidden();
                    },
                });
                return true;
            }
        }

        const bc = controls.batch;
        const batchAction = getBatchClickAction(bc, x, y);
        if (batchAction) {
            if (batchAction === "decrement") batchVal = Math.max(1, batchVal - 1);
            else if (batchAction === "increment") batchVal = Math.min(64, batchVal + 1);
            syncToHidden();
            return true;
        }

        return false;
    };

    node.onMouseMove = function (e, localPos) {
        const x = localPos[0], y = localPos[1];

        // 保護區：保留右側 40px 的空間專門給端點使用，不要攔截拖曳
        if (x > this.size[0] - 40) return false;

        const sc = controls.scale;
        if (sc && e.buttons && y >= sc.y && y <= sc.y + sc.h) {
            const pct = Math.max(0, Math.min(1, (x - sc.lx) / sc.trackW));
            let val = Math.round((1.0 + pct) * 10) / 10;
            val = Math.max(1.0, Math.min(2.0, val));
            if (scaleVal !== val) { scaleVal = val; syncToHidden(); }
            return true;
        }
        return false;
    };

    // --- Workflow load ---
    const origConfigure = node.onConfigure;
    node.onConfigure = function (config) {
        if (origConfigure) origConfigure.call(this, config);
        normalizeOutputSlots(this.outputs);
        setTimeout(() => {
            if (resolutionWidget) resVal = resolutionWidget.value;
            if (orientationWidget) {
                orientVal = orientationWidget.value;
                ratioOptions = buildRatioOptions(orientVal);
            }
            if (aspectRatioWidget) ratioVal = aspectRatioWidget.value;
            if (scaleFactorWidget) scaleVal = Number(scaleFactorWidget.value) || 2.0;
            if (batchSizeWidget) batchVal = Number(batchSizeWidget.value) || 1;
            if (customWidthWidget) customWidthVal = Number(customWidthWidget.value) || 1024;
            if (customHeightWidget) customHeightVal = Number(customHeightWidget.value) || 1024;
            if (node.inputs) node.inputs.length = 0;
            normalizeOutputSlots(node.outputs);
            recalculate();
        }, 100);
    };

    // --- Prevent phantom input slots ---
    node.getInputs = function () { return []; };

    // --- Node sizing ---
    node.size[0] = Math.max(node.size[0], MIN_WIDTH);
    node.size[1] = Math.max(node.size[1], contentMinH);

    // Override computeSize so LiteGraph never shrinks the node below our minimum
    node.computeSize = function () {
        return [getQuickLatentMinWidth(), contentMinH];
    };

    const origResize = node.onResize;
    node.onResize = function (size) {
        size[0] = Math.max(size[0], MIN_WIDTH);
        size[1] = Math.max(size[1], contentMinH);
        if (origResize) origResize.call(this, size);
    };

    recalculate();
}
