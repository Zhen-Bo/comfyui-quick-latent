import { PORT_COLORS } from "./config.js";
import { getOutputValueLabelPosition, getOutputValueLabels } from "./layout.js";

const PAD = 10;
const SLIDER_EDGE_LABEL_OFFSET = 4;
const SLIDER_TRACK_INSET = 27;

export function drawLabel(ctx, text, y, widgetWidth, valueFn) {
    ctx.fillStyle = "#6e6e85";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, PAD, y);
    if (valueFn) {
        ctx.fillStyle = "#e8e8f0";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "right";
        ctx.fillText(valueFn(), widgetWidth - PAD, y);
    }
}

export function drawSegmented(ctx, controls, name, options, selected, y, widgetWidth) {
    const w = widgetWidth - PAD * 2;
    const h = 26;
    const x0 = PAD;
    const count = options.length;
    const segW = w / count;

    ctx.beginPath();
    ctx.roundRect(x0, y, w, h, 5);
    ctx.fillStyle = "#252538";
    ctx.fill();
    ctx.strokeStyle = "#3a3a52";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x0, y, w, h, 5);
    ctx.stroke();

    for (let i = 0; i < count; i++) {
        const sx = x0 + i * segW;
        const sel = selected === options[i].value;
        if (sel) {
            ctx.beginPath();
            ctx.roundRect(sx + 2, y + 2, segW - 4, h - 4, 4);
            ctx.fillStyle = "#7c5cbf";
            ctx.fill();
        }
        ctx.fillStyle = sel ? "#ffffff" : "#6e6e85";
        ctx.font = sel ? "bold 11px sans-serif" : "11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(options[i].label, sx + segW / 2, y + h / 2);
    }
    controls[name] = { x: x0, y, w, h, count, segW };
}

export function drawSlider(ctx, controls, name, value, y, widgetWidth) {
    const val = Number(value) || 2.0;
    const cy = y + 12;
    const lx = PAD + SLIDER_TRACK_INSET;
    const rx = widgetWidth - PAD - SLIDER_TRACK_INSET;
    const trackW = rx - lx;

    ctx.fillStyle = "#6e6e85";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("1x", PAD + SLIDER_EDGE_LABEL_OFFSET, cy);
    ctx.fillText("2x", widgetWidth - PAD - SLIDER_EDGE_LABEL_OFFSET, cy);

    ctx.beginPath();
    ctx.roundRect(lx, cy - 2, trackW, 4, 2);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();

    const pct = Math.max(0, Math.min(1, (val - 1.0)));
    if (pct > 0) {
        ctx.beginPath();
        ctx.roundRect(lx, cy - 2, trackW * pct, 4, 2);
        ctx.fillStyle = "#7c5cbf";
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    const tx = lx + trackW * pct;
    ctx.beginPath();
    ctx.arc(tx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#9b7fd4";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx, cy, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    controls[name] = { lx, rx, trackW, y, h: 24 };
}

export function drawToggle(ctx, controls, name, value, y, widgetWidth) {
    const cy = y + 14;
    const trackW = 40;
    const trackH = 20;
    const trackX = (widgetWidth - trackW) / 2;
    const isLandscape = value === "Landscape";

    ctx.textBaseline = "middle";
    ctx.fillStyle = !isLandscape ? "#e8e8f0" : "#6e6e85";
    ctx.font = !isLandscape ? "bold 11px sans-serif" : "11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Portrait", trackX - 8, cy);

    ctx.fillStyle = isLandscape ? "#e8e8f0" : "#6e6e85";
    ctx.font = isLandscape ? "bold 11px sans-serif" : "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Landscape", trackX + trackW + 8, cy);

    ctx.beginPath();
    ctx.roundRect(trackX, cy - trackH / 2, trackW, trackH, trackH / 2);
    ctx.fillStyle = isLandscape ? "#7c5cbf" : "#353548";
    ctx.fill();

    const thumbCX = isLandscape ? trackX + trackW - trackH / 2 : trackX + trackH / 2;
    ctx.beginPath();
    ctx.arc(thumbCX, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    controls[name] = { x: 0, y, w: widgetWidth, h: 28 };
}

export function drawBatch(ctx, controls, name, value, y, widgetWidth) {
    const w = widgetWidth - PAD * 2;
    const h = 26;
    const x0 = PAD;

    ctx.beginPath();
    ctx.roundRect(x0, y, w, h, 5);
    ctx.fillStyle = "#252538";
    ctx.fill();
    ctx.strokeStyle = "#3a3a52";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x0, y, w, h, 5);
    ctx.stroke();

    ctx.fillStyle = "#6e6e85";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("−", x0 + 15, y + h / 2);
    ctx.fillText("+", x0 + w - 15, y + h / 2);

    ctx.fillStyle = "#e8e8f0";
    ctx.font = "bold 12px monospace";
    ctx.fillText(String(value), x0 + w / 2, y + h / 2);

    controls[name] = { x: x0, y, w, h };
}

export function drawTargetInfo(ctx, ds, y, widgetWidth) {
    const w = widgetWidth - PAD * 2;
    const x0 = PAD;
    ctx.beginPath();
    ctx.roundRect(x0, y, w, 24, 5);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
    ctx.fillStyle = "#6e6e85";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Target", x0 + 8, y + 12);
    ctx.fillStyle = "#7c5cbf";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "right";
    ctx.fillText(ds.targetWidth + " × " + ds.targetHeight, x0 + w - 8, y + 12);
}

export function drawOutputValues(ctx, ds, node) {
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const labels = getOutputValueLabels(ds);

    for (let i = 0; i < labels.length; i++) {
        if (!node.outputs[i]) continue;
        const [labelX, labelY] = getOutputValueLabelPosition(node, i);

        ctx.fillStyle = PORT_COLORS[i];
        ctx.fillText(labels[i], labelX, labelY);
    }
}
