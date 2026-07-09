import { PORT_COLORS } from "./config.js";
import { getOutputValueLabelPosition, getOutputValueLabels } from "./layout.js";

const CONTROL_PADDING = 10;
const CHOICE_FILL = "#252538";
const CHOICE_BORDER = "#3f3b5a";
const SELECTED_FILL = "#815fc8";
const SELECTED_BORDER = "rgba(229, 219, 255, 0.58)";
const SELECTED_TEXT = "#ffffff";
const OPTION_TEXT = "#918da3";
const INPUT_FILL = "#252538";
const INPUT_BORDER = "#4d496a";
const LOCK_DIM_ALPHA = 0.4;
const LOCK_STRIPE_COLOR = "#6e6e85";
const LOCK_STRIPE_ALPHA = 0.22;
const LOCK_STRIPE_SPACING = 8;
const LOCK_STRIPE_WIDTH = 1;
const CUSTOM_ROW_HEIGHT = 26;
const CUSTOM_ROW_COUNT = 3;
const DEFAULT_SIZE_LABELS = {
    width: "Width",
    height: "Height",
    hint: "Output rounds down to nearest multiple of 8",
};

function drawSelectedPill(canvasContext, pillX, pillY, pillWidth, pillHeight, cornerRadius) {
    canvasContext.beginPath();
    canvasContext.roundRect(pillX, pillY, pillWidth, pillHeight, cornerRadius);
    canvasContext.fillStyle = SELECTED_FILL;
    canvasContext.fill();

    canvasContext.beginPath();
    canvasContext.roundRect(pillX + 0.75, pillY + 0.75, pillWidth - 1.5, pillHeight - 1.5, cornerRadius);
    canvasContext.strokeStyle = SELECTED_BORDER;
    canvasContext.lineWidth = 1.25;
    canvasContext.stroke();
}

function drawFrame(canvasContext, frameX, frameY, frameWidth, frameHeight, cornerRadius, fillColor, borderColor) {
    canvasContext.beginPath();
    canvasContext.roundRect(frameX, frameY, frameWidth, frameHeight, cornerRadius);
    canvasContext.fillStyle = fillColor;
    canvasContext.fill();
    canvasContext.strokeStyle = borderColor;
    canvasContext.lineWidth = 1;
    canvasContext.stroke();
}

function drawChoiceFrame(canvasContext, frameX, frameY, frameWidth, frameHeight, cornerRadius) {
    drawFrame(canvasContext, frameX, frameY, frameWidth, frameHeight, cornerRadius, CHOICE_FILL, CHOICE_BORDER);
}

function drawInputFrame(canvasContext, frameX, frameY, frameWidth, frameHeight, cornerRadius) {
    drawFrame(canvasContext, frameX, frameY, frameWidth, frameHeight, cornerRadius, INPUT_FILL, INPUT_BORDER);
}

export function drawLabel(canvasContext, text, labelY, widgetWidth, valueFn) {
    canvasContext.fillStyle = "#8d899f";
    canvasContext.font = "10px sans-serif";
    canvasContext.textAlign = "left";
    canvasContext.textBaseline = "middle";
    canvasContext.fillText(text, CONTROL_PADDING, labelY);
    if (valueFn) {
        canvasContext.fillStyle = "#e8e8f0";
        canvasContext.font = "bold 11px monospace";
        canvasContext.textAlign = "right";
        canvasContext.fillText(valueFn(), widgetWidth - CONTROL_PADDING, labelY);
    }
}

export function drawSegmented(
    canvasContext,
    controls,
    controlName,
    options,
    selectedValue,
    controlY,
    widgetWidth,
    animationPosition = null,
    locked = false,
) {
    const controlX = CONTROL_PADDING;
    const controlWidth = widgetWidth - CONTROL_PADDING * 2;
    const controlHeight = 26;
    const segmentCount = options.length;
    const segmentWidth = controlWidth / segmentCount;

    const selectedIndex = options.findIndex((option) => option.value === selectedValue);
    const selectedPillIndex = animationPosition ?? selectedIndex;

    if (locked) {
        canvasContext.save();
        canvasContext.globalAlpha = LOCK_DIM_ALPHA;
        drawChoiceFrame(canvasContext, controlX, controlY, controlWidth, controlHeight, 5);
        if (selectedPillIndex >= 0) {
            const selectedPillX = controlX + selectedPillIndex * segmentWidth + 2;
            drawSelectedPill(canvasContext, selectedPillX, controlY + 2, segmentWidth - 4, controlHeight - 4, 4);
        }
        for (let optionIndex = 0; optionIndex < segmentCount; optionIndex++) {
            const option = options[optionIndex];
            const segmentX = controlX + optionIndex * segmentWidth;
            const isSelected = selectedValue === option.value;
            canvasContext.fillStyle = isSelected ? SELECTED_TEXT : OPTION_TEXT;
            canvasContext.font = "bold 12px sans-serif";
            canvasContext.textAlign = "center";
            canvasContext.textBaseline = "middle";
            canvasContext.fillText(option.label, segmentX + segmentWidth / 2, controlY + controlHeight / 2);
        }
        canvasContext.restore();

        canvasContext.save();
        canvasContext.beginPath();
        canvasContext.roundRect(controlX, controlY, controlWidth, controlHeight, 5);
        canvasContext.clip();
        canvasContext.globalAlpha = LOCK_STRIPE_ALPHA;
        canvasContext.strokeStyle = LOCK_STRIPE_COLOR;
        canvasContext.lineWidth = LOCK_STRIPE_WIDTH;
        for (let stripeX = controlX - controlHeight; stripeX < controlX + controlWidth; stripeX += LOCK_STRIPE_SPACING) {
            canvasContext.beginPath();
            canvasContext.moveTo(stripeX, controlY + controlHeight);
            canvasContext.lineTo(stripeX + controlHeight, controlY);
            canvasContext.stroke();
        }
        canvasContext.restore();
    } else {
        drawChoiceFrame(canvasContext, controlX, controlY, controlWidth, controlHeight, 5);

        if (selectedPillIndex >= 0) {
            const selectedPillX = controlX + selectedPillIndex * segmentWidth + 2;
            drawSelectedPill(canvasContext, selectedPillX, controlY + 2, segmentWidth - 4, controlHeight - 4, 4);
        }

        for (let optionIndex = 0; optionIndex < segmentCount; optionIndex++) {
            const option = options[optionIndex];
            const segmentX = controlX + optionIndex * segmentWidth;
            const isSelected = selectedValue === option.value;
            canvasContext.fillStyle = isSelected ? SELECTED_TEXT : OPTION_TEXT;
            canvasContext.font = "bold 12px sans-serif";
            canvasContext.textAlign = "center";
            canvasContext.textBaseline = "middle";
            canvasContext.fillText(option.label, segmentX + segmentWidth / 2, controlY + controlHeight / 2);
        }
    }

    controls[controlName] = {
        left: controlX,
        top: controlY,
        width: controlWidth,
        height: controlHeight,
        count: segmentCount,
        segmentWidth,
    };
}

export function drawPresetStack(
    canvasContext,
    controls,
    controlName,
    options,
    selectedValue,
    controlY,
    widgetWidth,
    animationPosition = null,
) {
    const controlX = CONTROL_PADDING;
    const controlWidth = widgetWidth - CONTROL_PADDING * 2;
    const rowHeight = 26;
    const rowGap = 0;
    const controlHeight = options.length * rowHeight;

    drawInputFrame(canvasContext, controlX, controlY, controlWidth, controlHeight, 5);

    const selectedIndex = options.findIndex((option) => option.value === selectedValue);
    const selectedPillIndex = animationPosition ?? selectedIndex;
    if (selectedPillIndex >= 0) {
        const selectedPillY = controlY + selectedPillIndex * rowHeight + 2;
        drawSelectedPill(canvasContext, controlX + 2, selectedPillY, controlWidth - 4, rowHeight - 4, 4);
    }

    for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
        const option = options[optionIndex];
        const rowY = controlY + optionIndex * (rowHeight + rowGap);
        const isSelected = selectedValue === option.value;

        canvasContext.fillStyle = isSelected ? SELECTED_TEXT : OPTION_TEXT;
        canvasContext.font = "bold 12px monospace";
        canvasContext.textAlign = "center";
        canvasContext.textBaseline = "middle";
        canvasContext.fillText(option.label, controlX + controlWidth / 2, rowY + rowHeight / 2);
    }

    controls[controlName] = {
        left: controlX,
        top: controlY,
        width: controlWidth,
        height: controlHeight,
        rowHeight,
        rowGap,
        options,
    };
}

export function drawBatch(canvasContext, controls, controlName, value, controlY, widgetWidth) {
    const controlX = CONTROL_PADDING;
    const controlWidth = widgetWidth - CONTROL_PADDING * 2;
    const controlHeight = 26;
    const buttonWidth = controlHeight;
    const valueBoxX = controlX + buttonWidth;
    const valueBoxWidth = controlWidth - buttonWidth * 2;

    drawInputFrame(canvasContext, controlX, controlY, controlWidth, controlHeight, 5);

    canvasContext.fillStyle = "#918da3";
    canvasContext.font = "bold 14px sans-serif";
    canvasContext.textAlign = "center";
    canvasContext.textBaseline = "middle";
    canvasContext.fillText("−", controlX + buttonWidth / 2, controlY + controlHeight / 2);
    canvasContext.fillText("+", controlX + controlWidth - buttonWidth / 2, controlY + controlHeight / 2);

    canvasContext.fillStyle = "#e8e8f0";
    canvasContext.font = "bold 12px monospace";
    canvasContext.fillText(String(value), controlX + controlWidth / 2, controlY + controlHeight / 2);

    controls[controlName] = {
        left: controlX,
        top: controlY,
        width: controlWidth,
        height: controlHeight,
        buttonWidth,
        valueBox: { left: valueBoxX, top: controlY, width: valueBoxWidth, height: controlHeight },
    };
}

export function drawSize(
    canvasContext,
    controls,
    customWidthValue,
    customHeightValue,
    controlY,
    widgetWidth,
    labels = DEFAULT_SIZE_LABELS,
) {
    const controlX = CONTROL_PADDING;
    const controlWidth = widgetWidth - CONTROL_PADDING * 2;
    const inputHeight = 22;
    const separatorWidth = 20;
    const columnGap = 8;
    const labelRowY = controlY;
    const inputRowY = controlY + CUSTOM_ROW_HEIGHT;
    const hintRowY = controlY + CUSTOM_ROW_HEIGHT * 2;
    const inputY = inputRowY + (CUSTOM_ROW_HEIGHT - inputHeight) / 2;
    const inputWidth = (controlWidth - columnGap * 2 - separatorWidth) / 2;
    const widthInputX = controlX;
    const separatorCenterX = widthInputX + inputWidth + columnGap + separatorWidth / 2;
    const heightInputX = widthInputX + inputWidth + columnGap + separatorWidth + columnGap;

    canvasContext.fillStyle = "#8d899f";
    canvasContext.font = "10px sans-serif";
    canvasContext.textAlign = "left";
    canvasContext.textBaseline = "middle";
    canvasContext.fillText(labels.width, widthInputX + 1, labelRowY + CUSTOM_ROW_HEIGHT - 7);
    canvasContext.fillText(labels.height, heightInputX + 1, labelRowY + CUSTOM_ROW_HEIGHT - 7);

    const inputBoxes = [
        { key: "sizeW", value: customWidthValue, left: widthInputX },
        { key: "sizeH", value: customHeightValue, left: heightInputX },
    ];

    for (const inputBox of inputBoxes) {
        drawInputFrame(canvasContext, inputBox.left, inputY, inputWidth, inputHeight, 5);

        canvasContext.fillStyle = "#e8e8f0";
        canvasContext.font = "bold 12px monospace";
        canvasContext.textAlign = "center";
        canvasContext.textBaseline = "middle";
        canvasContext.fillText(String(inputBox.value), inputBox.left + inputWidth / 2, inputY + inputHeight / 2);

        controls[inputBox.key] = { left: inputBox.left, top: inputY, width: inputWidth, height: inputHeight };
    }

    canvasContext.fillStyle = "#6e6e85";
    canvasContext.font = "bold 14px sans-serif";
    canvasContext.textAlign = "center";
    canvasContext.textBaseline = "middle";
    canvasContext.fillText("x", separatorCenterX, inputRowY + CUSTOM_ROW_HEIGHT / 2);

    canvasContext.fillStyle = "#7f7a90";
    canvasContext.font = "10px sans-serif";
    canvasContext.textAlign = "left";
    canvasContext.textBaseline = "middle";
    canvasContext.fillText(labels.hint, widthInputX + 1, hintRowY + CUSTOM_ROW_HEIGHT / 2);
}

export function drawOutputValues(canvasContext, outputState, node) {
    canvasContext.font = "bold 13px monospace";
    canvasContext.textAlign = "right";
    canvasContext.textBaseline = "middle";
    const labels = getOutputValueLabels(outputState);

    for (let outputIndex = 0; outputIndex < labels.length; outputIndex++) {
        if (!node.outputs[outputIndex]) continue;
        const [labelX, labelY] = getOutputValueLabelPosition(node, outputIndex);

        canvasContext.fillStyle = PORT_COLORS[outputIndex];
        canvasContext.fillText(labels[outputIndex], labelX, labelY);
    }
}
