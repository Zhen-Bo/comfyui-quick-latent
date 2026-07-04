import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsRoot = path.join(repoRoot, "js");
const presetValues = ["1024", "1536", "2048"];
const customHint = "Output rounds down to nearest multiple of 8";

const ratioLabels = {
    Landscape: { "1:1": "1:1", "2:3": "3:2", "3:4": "4:3", "16:9": "16:9" },
    Portrait: { "1:1": "1:1", "2:3": "2:3", "3:4": "3:4", "16:9": "9:16" },
};

const presetLabels = {
    Landscape: {
        "1:1": ["1024 x 1024", "1536 x 1536", "2048 x 2048"],
        "2:3": ["1536 x 1024", "1920 x 1280", "2304 x 1536"],
        "3:4": ["1536 x 1152", "1792 x 1344", "2048 x 1536"],
        "16:9": ["1536 x 864", "1920 x 1080", "2560 x 1440"],
    },
    Portrait: {
        "1:1": ["1024 x 1024", "1536 x 1536", "2048 x 2048"],
        "2:3": ["1024 x 1536", "1280 x 1920", "1536 x 2304"],
        "3:4": ["1152 x 1536", "1344 x 1792", "1536 x 2048"],
        "16:9": ["864 x 1536", "1080 x 1920", "1440 x 2560"],
    },
};

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
        if (url.pathname.startsWith(extensionPrefix) && url.pathname.endsWith(".js")) {
            const fileName = path.basename(url.pathname);
            const source = await fs.readFile(path.join(jsRoot, fileName), "utf8");
            await route.fulfill({ status: 200, contentType: "application/javascript", body: source });
            return;
        }

        await route.fulfill({ status: 404, body: "Not found" });
    });
}

async function openHarness(page, widgetValues = {}) {
    await installHarnessRoutes(page);
    await page.goto("http://quick-latent.test/harness.html");
    await page.waitForFunction(() => window.__quickLatentHarness);
    await page.evaluate((values) => window.__quickLatentHarness.setup(values), widgetValues);
}

async function getState(page) {
    return page.evaluate(() => window.__quickLatentHarness.getState());
}

async function clickDrawnText(page, text, { minY, maxY, index = -1 } = {}) {
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

async function clickCustomSizeField(page, fieldName) {
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

async function editCustomSizeField(page, fieldName, nextValue) {
    await clickCustomSizeField(page, fieldName);
    const input = page.locator("input");
    await expect(input).toBeVisible();
    await input.fill(String(nextValue));
    await input.press("Enter");
    await expect(input).toHaveCount(0);
    await page.evaluate(() => window.__quickLatentHarness.render());
}

async function editBatchValue(page, nextValue) {
    await clickDrawnText(page, "1", { minY: 220, maxY: 270 });
    const input = page.locator("input");
    await expect(input).toBeVisible();
    await input.fill(String(nextValue));
    await input.press("Enter");
    await expect(input).toHaveCount(0);
    await page.evaluate(() => window.__quickLatentHarness.render());
}

test("canvas controls expose and select the full curated preset matrix", async ({ page }) => {
    for (const orientation of ["Landscape", "Portrait"]) {
        await openHarness(page);
        if (orientation === "Portrait") {
            await clickDrawnText(page, "Portrait", { minY: 20, maxY: 50 });
        }

        for (const [ratio, labels] of Object.entries(presetLabels[orientation])) {
            await clickDrawnText(page, ratioLabels[orientation][ratio], { minY: 70, maxY: 100 });

            const drawnLabels = (await getState(page)).drawnText.map((item) => item.text);
            for (const label of labels) {
                expect(drawnLabels).toContain(label);
            }

            for (let index = 0; index < labels.length; index += 1) {
                await clickDrawnText(page, labels[index], { minY: 120, maxY: 210 });
                const state = await getState(page);
                expect(state.widgets.orientation).toBe(orientation);
                expect(state.widgets.aspect_ratio).toBe(ratio);
                expect(state.widgets.preset_resolution).toBe(presetValues[index]);
            }
        }
    }
});

test("custom size swaps width and height when orientation changes", async ({ page }) => {
    await openHarness(page);
    const initialHeight = (await getState(page)).computeSize[1];

    await clickDrawnText(page, "Custom", { minY: 70, maxY: 100 });
    expect((await getState(page)).computeSize[1]).toBe(initialHeight);

    await editCustomSizeField(page, "width", 2048);
    await editCustomSizeField(page, "height", 3120);

    let state = await getState(page);
    expect(state.widgets.aspect_ratio).toBe("Custom");
    expect(state.widgets.custom_width).toBe(2048);
    expect(state.widgets.custom_height).toBe(3120);

    await clickDrawnText(page, "Portrait", { minY: 20, maxY: 50 });
    state = await getState(page);
    expect(state.widgets.orientation).toBe("Portrait");
    expect(state.widgets.custom_width).toBe(3120);
    expect(state.widgets.custom_height).toBe(2048);
    expect(state.drawnText.map((item) => item.text)).toEqual(expect.arrayContaining(["3120", "2048"]));

    await clickDrawnText(page, "Landscape", { minY: 20, maxY: 50 });
    state = await getState(page);
    expect(state.widgets.orientation).toBe("Landscape");
    expect(state.widgets.custom_width).toBe(2048);
    expect(state.widgets.custom_height).toBe(3120);
});

test("custom editor preserves raw input while output labels use rounded-down dimensions", async ({ page }) => {
    await openHarness(page, { aspect_ratio: "Custom", custom_width: 1028, custom_height: 1031 });

    let state = await getState(page);
    expect(state.widgets.custom_width).toBe(1028);
    expect(state.widgets.custom_height).toBe(1031);
    expect(state.drawnText.map((item) => item.text)).toEqual(expect.arrayContaining(["1028", "1031"]));
    expect(state.drawnText.map((item) => item.text)).toContain(customHint);
    expect(state.drawnText.filter((item) => item.x > 300).map((item) => item.text)).toEqual(
        expect.arrayContaining(["1024", "1024", "LAT", "1"]),
    );

    await editCustomSizeField(page, "width", 100);
    state = await getState(page);
    expect(state.widgets.custom_width).toBe(512);

    await editCustomSizeField(page, "width", 513);
    state = await getState(page);
    expect(state.widgets.custom_width).toBe(513);
    expect(state.drawnText.map((item) => item.text)).toContain("513");
    expect(state.drawnText.filter((item) => item.x > 300).map((item) => item.text)).toContain("512");

    await clickCustomSizeField(page, "width");
    const input = page.locator("input");
    await expect(input).toBeVisible();
    await input.fill("2048");
    await input.press("Escape");
    await expect(input).toHaveCount(0);
    await page.evaluate(() => window.__quickLatentHarness.render());
    state = await getState(page);
    expect(state.widgets.custom_width).toBe(513);
});

test("batch control stays inside the schema limits through canvas clicks", async ({ page }) => {
    await openHarness(page, { batch_size: 64 });
    await clickDrawnText(page, "+", { minY: 220, maxY: 260 });
    expect((await getState(page)).widgets.batch_size).toBe(64);

    await openHarness(page, { batch_size: 1 });
    await clickDrawnText(page, "\u2212", { minY: 220, maxY: 260 });
    expect((await getState(page)).widgets.batch_size).toBe(1);

    await clickDrawnText(page, "+", { minY: 220, maxY: 260 });
    expect((await getState(page)).widgets.batch_size).toBe(2);
});

test("batch value box opens a direct numeric editor", async ({ page }) => {
    await openHarness(page, { batch_size: 1 });
    await editBatchValue(page, 17);

    let state = await getState(page);
    expect(state.widgets.batch_size).toBe(17);
    expect(state.drawnText.map((item) => item.text)).toContain("17");

    await clickDrawnText(page, "17", { minY: 220, maxY: 270 });
    const input = page.locator("input");
    await expect(input).toBeVisible();
    await input.fill("99");
    await input.press("Enter");
    await expect(input).toHaveCount(0);
    await page.evaluate(() => window.__quickLatentHarness.render());

    state = await getState(page);
    expect(state.widgets.batch_size).toBe(64);
});

test("node setup hides native widgets, removes inputs, and normalizes output slots", async ({ page }) => {
    await openHarness(page);
    const state = await getState(page);

    expect(state.inputCount).toBe(0);
    expect(state.outputNames).toEqual(["", "", "", ""]);
    expect(state.outputLocalizedNames).toEqual(["", "", "", ""]);
    expect(state.outputPositions).toEqual([null, null, null, null]);
    expect(state.outputColors).toEqual(["#8a8795", "#8a8795", "#8a8795", "#8a8795"]);
    expect(state.outputOffColors).toEqual(["#8a8795", "#8a8795", "#8a8795", "#8a8795"]);
    expect(state.outputActiveColors).toEqual(["#4fc3f7", "#ffb74d", "#ff69b4", "#9a7bdc"]);
});

test("batch output label uses the theme color instead of green", async ({ page }) => {
    await openHarness(page, { batch_size: 2 });
    const state = await getState(page);
    const batchOutputLabel = state.drawnText.find((item) => item.text === "2" && item.x > 300);

    expect(batchOutputLabel).toBeTruthy();
    expect(batchOutputLabel.color).toBe("#9a7bdc");
});

test.describe("zh-TW localization", () => {
    test.use({ locale: "zh-TW" });

    test("renders localized canvas labels without changing workflow values", async ({ page }) => {
        await openHarness(page, { aspect_ratio: "Custom" });
        const state = await getState(page);
        const labels = state.drawnText.map((item) => item.text);

        expect(labels).toEqual(expect.arrayContaining([
            "方向",
            "直向",
            "橫向",
            "長寬比",
            "自訂",
            "自訂尺寸",
            "寬度",
            "高度",
            "輸出會向下對齊到最接近的 8 倍數",
            "批次大小",
        ]));
        expect(state.widgets.orientation).toBe("Landscape");
        expect(state.widgets.aspect_ratio).toBe("Custom");
    });
});
