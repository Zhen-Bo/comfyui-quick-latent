import { expect, test } from "@playwright/test";
import {
    clickCustomSizeField,
    clickDrawnText,
    editBatchValue,
    editCustomSizeField,
    getState,
    openHarness,
} from "./quick_latent_harness.mjs";

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

test("custom W/H are preserved, not swapped, on orientation change", async ({ page }) => {
    await openHarness(page);

    await clickDrawnText(page, "Custom", { minY: 20, maxY: 50 });
    let state = await getState(page);
    expect(state.widgets.orientation).toBe("Custom");

    await editCustomSizeField(page, "width", 2048);
    await editCustomSizeField(page, "height", 3120);

    state = await getState(page);
    expect(state.widgets.custom_width).toBe(2048);
    expect(state.widgets.custom_height).toBe(3120);

    await clickDrawnText(page, "Portrait", { minY: 20, maxY: 50 });
    state = await getState(page);
    expect(state.widgets.orientation).toBe("Portrait");
    expect(state.widgets.custom_width).toBe(2048);
    expect(state.widgets.custom_height).toBe(3120);
    expect(state.drawnText.map((item) => item.text)).toEqual(
        expect.arrayContaining(presetLabels.Portrait["1:1"]),
    );
});

test("selecting Custom orientation locks the ratio bar (clicks ignored)", async ({ page }) => {
    await openHarness(page);

    await clickDrawnText(page, "Custom", { minY: 20, maxY: 50 });
    expect((await getState(page)).widgets.orientation).toBe("Custom");

    // While Custom is active the ratio bar is locked; buildRatioOptions("Custom")
    // renders the raw ratio keys (no orientation label map), so target "2:3" directly.
    await clickDrawnText(page, "2:3", { minY: 70, maxY: 100 });
    expect((await getState(page)).widgets.aspect_ratio).toBe("1:1");
});

test("switch-back from Custom restores the recorded ratio + preset stack", async ({ page }) => {
    await openHarness(page);

    await clickDrawnText(page, ratioLabels.Landscape["3:4"], { minY: 70, maxY: 100 });
    expect((await getState(page)).widgets.aspect_ratio).toBe("3:4");

    await clickDrawnText(page, "Custom", { minY: 20, maxY: 50 });
    expect((await getState(page)).widgets.orientation).toBe("Custom");

    await clickDrawnText(page, "Landscape", { minY: 20, maxY: 50 });
    const state = await getState(page);
    expect(state.widgets.orientation).toBe("Landscape");
    expect(state.widgets.aspect_ratio).toBe("3:4");
    expect(state.drawnText.map((item) => item.text)).toEqual(
        expect.arrayContaining(presetLabels.Landscape["3:4"]),
    );
});

test("custom editor preserves raw input while output labels use rounded-down dimensions", async ({ page }) => {
    await openHarness(page, { orientation: "Custom", custom_width: 1028, custom_height: 1031 });

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
    await input.fill("513.5");
    await input.press("Enter");
    await expect(input).toHaveCount(0);
    await page.evaluate(() => window.__quickLatentHarness.render());
    state = await getState(page);
    expect(state.widgets.custom_width).toBe(513);

    await clickCustomSizeField(page, "width");
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
        await openHarness(page, { orientation: "Custom" });
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
        expect(state.widgets.orientation).toBe("Custom");
        expect(["1:1", "2:3", "3:4", "16:9"]).toContain(state.widgets.aspect_ratio);
    });
});
