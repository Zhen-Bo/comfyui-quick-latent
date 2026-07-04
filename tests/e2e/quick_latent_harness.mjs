import { expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsRoot = path.join(repoRoot, "js");

const harnessHtml = String.raw`
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quick Latent E2E Harness</title>
    <style>
        html, body { margin: 0; padding: 0; background: #111; }
        canvas { display: block; width: 420px; height: 320px; }
    </style>
</head>
<body>
    <canvas id="quick-latent-canvas" width="420" height="320"></canvas>
    <script type="module">
        const canvas = document.getElementById("quick-latent-canvas");
        window.LiteGraph = { NODE_SLOT_HEIGHT: 20 };
        window.__quickLatentApp = {
            canvas: {
                ds: { scale: 1, offset: [0, 0] },
                canvas,
            },
            registerExtension(extension) {
                window.__quickLatentExtension = extension;
            },
        };

        await import("/extensions/ComfyUI-QuickLatent/quick_latent.js");

        const ctx = canvas.getContext("2d");
        const nativeFillText = ctx.fillText.bind(ctx);
        if (!ctx.roundRect) {
            ctx.roundRect = function (x, y, w, h) {
                this.rect(x, y, w, h);
                return this;
            };
        }

        window.__drawnText = [];
        ctx.fillText = function (text, x, y, maxWidth) {
            window.__drawnText.push({
                text: String(text),
                x,
                y,
                align: this.textAlign,
                font: this.font,
                color: this.fillStyle,
            });
            return nativeFillText(text, x, y, maxWidth);
        };

        function widget(name, value) {
            return { name, value, hidden: false, type: "number" };
        }

        function makeNode(widgetValues = {}) {
            const values = {
                preset_resolution: "1024",
                aspect_ratio: "1:1",
                orientation: "Landscape",
                batch_size: 1,
                custom_width: 1024,
                custom_height: 1024,
                ...widgetValues,
            };

            return {
                widgets: [
                    widget("preset_resolution", values.preset_resolution),
                    widget("aspect_ratio", values.aspect_ratio),
                    widget("orientation", values.orientation),
                    widget("batch_size", values.batch_size),
                    widget("custom_width", values.custom_width),
                    widget("custom_height", values.custom_height),
                ],
                inputs: [{ name: "legacy_input" }],
                outputs: [
                    { name: "WIDTH", localized_name: "WIDTH", type: "INT", pos: [370, 20] },
                    { name: "HEIGHT", localized_name: "HEIGHT", type: "INT", pos: [370, 40] },
                    { name: "LATENT", localized_name: "LATENT", type: "LATENT", pos: [370, 60] },
                    { name: "BATCH", localized_name: "BATCH", type: "INT", pos: [370, 80] },
                    { name: "SCALE", localized_name: "SCALE", type: "FLOAT", pos: [370, 100] },
                ],
                size: [370, 262],
                pos: [0, 0],
                flags: {},
                __dirtyCount: 0,
                setDirtyCanvas() {
                    this.__dirtyCount += 1;
                },
            };
        }

        async function setup(widgetValues = {}) {
            function QuickLatentNode() {}
            QuickLatentNode.prototype.onNodeCreated = function () {};

            await window.__quickLatentExtension.beforeRegisterNodeDef(
                QuickLatentNode,
                { name: "QuickLatent" },
                window.__quickLatentApp,
            );

            const node = makeNode(widgetValues);
            Object.setPrototypeOf(node, QuickLatentNode.prototype);
            QuickLatentNode.prototype.onNodeCreated.call(node);
            window.__node = node;
            render();
            return getState();
        }

        function render() {
            window.__drawnText = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            window.__node?.onDrawForeground?.(ctx);
        }

        function getWidgetValues() {
            return Object.fromEntries(window.__node.widgets.map((item) => [item.name, item.value]));
        }

        function getState() {
            return {
                widgets: getWidgetValues(),
                drawnText: [...window.__drawnText],
                computeSize: window.__node.computeSize?.(),
                outputNames: window.__node.outputs.map((output) => output.name),
                outputLocalizedNames: window.__node.outputs.map((output) => output.localized_name),
                outputPositions: window.__node.outputs.map((output) => output.pos ?? null),
                outputColors: window.__node.outputs.map((output) => output.color),
                outputOffColors: window.__node.outputs.map((output) => output.color_off),
                outputActiveColors: window.__node.outputs.map((output) => output.color_on),
                inputCount: window.__node.inputs.length,
                dirtyCount: window.__node.__dirtyCount,
            };
        }

        canvas.addEventListener("mousedown", (event) => {
            if (!window.__node) return;
            const rect = canvas.getBoundingClientRect();
            window.__node.onMouseDown(event, [event.clientX - rect.left, event.clientY - rect.top]);
            render();
        });

        window.__quickLatentHarness = {
            setup,
            render,
            getState,
            getWidgetValues,
            getDrawnText: () => [...window.__drawnText],
        };
        window.dispatchEvent(new Event("quick-latent-harness-ready"));
    </script>
</body>
</html>
`;

async function installHarnessRoutes(page) {
    await page.route("**/*", async (route) => {
        const url = new URL(route.request().url());

        if (url.pathname === "/harness.html") {
            await route.fulfill({ status: 200, contentType: "text/html", body: harnessHtml });
            return;
        }

        if (url.pathname === "/scripts/app.js") {
            await route.fulfill({
                status: 200,
                contentType: "application/javascript",
                body: "export const app = window.__quickLatentApp;\n",
            });
            return;
        }

        const extensionPrefix = "/extensions/ComfyUI-QuickLatent/";
        if (url.pathname.startsWith(extensionPrefix)) {
            const relativePath = url.pathname.slice(extensionPrefix.length);
            const extension = path.extname(relativePath);
            if (extension === ".js" || extension === ".json") {
                const source = await fs.readFile(path.join(jsRoot, relativePath), "utf8");
                const contentType = extension === ".json" ? "application/json" : "application/javascript";
                await route.fulfill({ status: 200, contentType, body: source });
                return;
            }
        }

        await route.fulfill({ status: 404, body: "Not found" });
    });
}

export async function openHarness(page, widgetValues = {}) {
    await installHarnessRoutes(page);
    await page.goto("http://quick-latent.test/harness.html");
    await page.waitForFunction(() => window.__quickLatentHarness);
    await page.evaluate((values) => window.__quickLatentHarness.setup(values), widgetValues);
}

export async function getState(page) {
    return page.evaluate(() => window.__quickLatentHarness.getState());
}

export async function clickDrawnText(page, text, { minY, maxY, index = -1 } = {}) {
    const point = await page.evaluate(
        ({ textValue, minYValue, maxYValue, indexValue }) => {
            const lower = Number.isFinite(minYValue) ? minYValue : -Infinity;
            const upper = Number.isFinite(maxYValue) ? maxYValue : Infinity;
            const matches = window.__quickLatentHarness
                .getDrawnText()
                .filter((item) => item.text === textValue && item.y >= lower && item.y <= upper);

            if (matches.length === 0) return null;

            const selected = indexValue >= 0
                ? matches[indexValue]
                : matches[matches.length + indexValue];
            const rect = document.getElementById("quick-latent-canvas").getBoundingClientRect();
            return { x: rect.left + selected.x, y: rect.top + selected.y };
        },
        { textValue: text, minYValue: minY, maxYValue: maxY, indexValue: index },
    );

    expect(point, `Expected canvas text "${text}" to be clickable`).not.toBeNull();
    await page.mouse.click(point.x, point.y);
}

export async function clickCustomSizeField(page, fieldName) {
    const point = await page.evaluate((targetFieldName) => {
        const drawnText = window.__quickLatentHarness.getDrawnText();
        const widthLabel = drawnText.find((item) => item.text === "Width");
        const heightLabel = drawnText.find((item) => item.text === "Height");
        if (!widthLabel || !heightLabel) return null;

        const label = targetFieldName === "width" ? widthLabel : heightLabel;
        const leftBound = label.x;
        const rightBound = targetFieldName === "width" ? heightLabel.x : Infinity;

        const valueText = drawnText
            .filter((item) => item.y > label.y && item.x >= leftBound && item.x < rightBound)
            .sort((a, b) => a.y - b.y)[0];
        if (!valueText) return null;

        const rect = document.getElementById("quick-latent-canvas").getBoundingClientRect();
        return { x: rect.left + valueText.x, y: rect.top + valueText.y };
    }, fieldName);

    expect(point, `Expected custom ${fieldName} field to be clickable`).not.toBeNull();
    await page.mouse.click(point.x, point.y);
}

export async function editCustomSizeField(page, fieldName, nextValue) {
    await clickCustomSizeField(page, fieldName);
    const input = page.locator("input");
    await expect(input).toBeVisible();
    await input.fill(String(nextValue));
    await input.press("Enter");
    await expect(input).toHaveCount(0);
    await page.evaluate(() => window.__quickLatentHarness.render());
}

export async function editBatchValue(page, nextValue) {
    await clickDrawnText(page, "1", { minY: 220, maxY: 270 });
    const input = page.locator("input");
    await expect(input).toBeVisible();
    await input.fill(String(nextValue));
    await input.press("Enter");
    await expect(input).toHaveCount(0);
    await page.evaluate(() => window.__quickLatentHarness.render());
}
