import { PORT_COLORS } from "./config.js";
import { getOutputValueLabelPosition, getOutputValueLabels } from "./layout.js";

const PAD = 10;
const CHOICE_FILL = "#252538";
const CHOICE_BORDER = "#3f3b5a";
const SELECTED_FILL = "#815fc8";
const SELECTED_BORDER = "rgba(229, 219, 255, 0.58)";
const SELECTED_TEXT = "#ffffff";
const OPTION_TEXT = "#918da3";
const INPUT_FILL = "#252538";
const INPUT_BORDER = "#4d496a";
const CUSTOM_ROW_HEIGHT = 26;
const CUSTOM_ROW_COUNT = 3;
const DEFAULT_SIZE_LABELS = {
    width: "Width",
    height: "Height",
    hint: "Output rounds down to nearest multiple of 8",
};

function drawSelectedPill(ctx, x, y, w, h, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = SELECTED_FILL;
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, radius);
    ctx.strokeStyle = SELECTED_BORDER;
    ctx.lineWidth = 1.25;
    ctx.stroke();
}

function drawControlFrame(ctx, x, y, w, h, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = CHOICE_FILL;
    ctx.fill();
    ctx.strokeStyle = CHOICE_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawInputFrame(ctx, x, y, w, h, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = INPUT_FILL;
    ctx.fill();
    ctx.strokeStyle = INPUT_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();
}

export function drawLabel(ctx, text, y, widgetWidth, valueFn) {
    ctx.fillStyle = "#8d899f";
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

export function drawSegmented(ctx, controls, name, options, selected, y, widgetWidth, animationPosition = null) {
    const w = widgetWidth - PAD * 2;
    const h = 26;
    const x0 = PAD;
    const count = options.length;
    const segW = w / count;

    drawControlFrame(ctx, x0, y, w, h, 5);

    const selectedIndex = options.findIndex((option) => option.value === selected);
    const pillIndex = animationPosition ?? selectedIndex;
    if (pillIndex >= 0) {
        const pillX = x0 + pillIndex * segW + 2;
        drawSelectedPill(ctx, pillX, y + 2, segW - 4, h - 4, 4);
    }

    for (let i = 0; i < count; i++) {
        const sx = x0 + i * segW;
        const sel = selected === options[i].value;
        ctx.fillStyle = sel ? SELECTED_TEXT : OPTION_TEXT;
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(options[i].label, sx + segW / 2, y + h / 2);
    }
    controls[name] = { x: x0, y, w, h, count, segW };
}

export function drawPresetStack(ctx, controls, name, options, selected, y, widgetWidth, animationPosition = null) {
    const w = widgetWidth - PAD * 2;
    const rowH = 26;
    const gap = 0;
    const x0 = PAD;
    const h = options.length * rowH;

    drawInputFrame(ctx, x0, y, w, h, 5);

    const selectedIndex = options.findIndex((option) => option.value === selected);
    const pillIndex = animationPosition ?? selectedIndex;
    if (pillIndex >= 0) {
        const pillY = y + pillIndex * rowH + 2;
        drawSelectedPill(ctx, x0 + 2, pillY, w - 4, rowH - 4, 4);
    }

    for (let index = 0; index < options.length; index++) {
        const option = options[index];
        const rowY = y + index * (rowH + gap);
        const isSelected = selected === option.value;

        ctx.fillStyle = isSelected ? SELECTED_TEXT : OPTION_TEXT;
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(option.label, x0 + w / 2, rowY + rowH / 2);
    }

    controls[name] = {
        x: x0,
        y,
        w,
        h,
        rowH,
        gap,
        options,
    };
}

export function drawBatch(ctx, controls, name, value, y, widgetWidth) {
    const w = widgetWidth - PAD * 2;
    const h = 26;
    const x0 = PAD;
    const buttonW = h;
    const valueX = x0 + buttonW;
    const valueW = w - buttonW * 2;

    drawInputFrame(ctx, x0, y, w, h, 5);

    ctx.fillStyle = "#918da3";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("−", x0 + buttonW / 2, y + h / 2);
    ctx.fillText("+", x0 + w - buttonW / 2, y + h / 2);

    ctx.fillStyle = "#e8e8f0";
    ctx.font = "bold 12px monospace";
    ctx.fillText(String(value), x0 + w / 2, y + h / 2);

    controls[name] = {
        x: x0,
        y,
        w,
        h,
        buttonW,
        valueBox: { x: valueX, y, w: valueW, h },
    };
}

export function drawSize(ctx, controls, widthVal, heightVal, y, widgetWidth, labels = DEFAULT_SIZE_LABELS) {
    const w = widgetWidth - PAD * 2;
    const x0 = PAD;
    const h = CUSTOM_ROW_HEIGHT * CUSTOM_ROW_COUNT;
    const inputH = 22;
    const xW = 20;
    const gap = 8;
    const row1Y = y;
    const row2Y = y + CUSTOM_ROW_HEIGHT;
    const row3Y = y + CUSTOM_ROW_HEIGHT * 2;
    const boxY = row2Y + (CUSTOM_ROW_HEIGHT - inputH) / 2;
    const boxW = (w - gap * 2 - xW) / 2;
    const leftX = x0;
    const xCenter = leftX + boxW + gap + xW / 2;
    const rightX = leftX + boxW + gap + xW + gap;

    ctx.fillStyle = "#8d899f";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(labels.width, leftX + 1, row1Y + CUSTOM_ROW_HEIGHT - 7);
    ctx.fillText(labels.height, rightX + 1, row1Y + CUSTOM_ROW_HEIGHT - 7);

    const boxes = [
        { key: "sizeW", value: widthVal, x: leftX },
        { key: "sizeH", value: heightVal, x: rightX },
    ];

    for (const box of boxes) {
        drawInputFrame(ctx, box.x, boxY, boxW, inputH, 5);

        ctx.fillStyle = "#e8e8f0";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(box.value), box.x + boxW / 2, boxY + inputH / 2);

        controls[box.key] = { x: box.x, y: boxY, w: boxW, h: inputH };
    }

    ctx.fillStyle = "#6e6e85";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("x", xCenter, row2Y + CUSTOM_ROW_HEIGHT / 2);

    ctx.fillStyle = "#7f7a90";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(labels.hint, leftX + 1, row3Y + CUSTOM_ROW_HEIGHT / 2);
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
