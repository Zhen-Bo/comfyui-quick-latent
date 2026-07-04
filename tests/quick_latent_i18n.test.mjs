import { test } from "vitest";
import assert from "node:assert/strict";

import { createTranslator, loadLocaleMessages, normalizeLocale, resolveLocale } from "../js/i18n.js";

test("i18n resolves supported browser language variants", () => {
    assert.equal(normalizeLocale("zh-TW"), "zh-TW");
    assert.equal(normalizeLocale("zh-Hant"), "zh-TW");
    assert.equal(normalizeLocale("en-US"), "en");
    assert.equal(resolveLocale(["fr-FR", "zh-TW"]), "zh-TW");

    const t = createTranslator({
        orientation: "方向",
        customRoundDownHint: "輸出會向下對齊到最接近的 8 倍數",
    });
    assert.equal(t("orientation"), "方向");
    assert.equal(t("customRoundDownHint"), "輸出會向下對齊到最接近的 8 倍數");
});

test("i18n loads locale JSON and falls back to English keys", async () => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    globalThis.fetch = async (url) => {
        requestedUrls.push(String(url));
        if (String(url).endsWith("/locales/en.json")) {
            return {
                ok: true,
                json: async () => ({ orientation: "Orientation", width: "Width" }),
            };
        }
        if (String(url).endsWith("/locales/zh-TW.json")) {
            return {
                ok: true,
                json: async () => ({ orientation: "方向" }),
            };
        }
        return { ok: false, json: async () => ({}) };
    };

    try {
        const messages = await loadLocaleMessages(["fr-FR", "zh-TW"]);
        const t = createTranslator(messages);

        assert.equal(t("orientation"), "方向");
        assert.equal(t("width"), "Width");
        assert.equal(t("missingKey"), "missingKey");
        assert.equal(requestedUrls.some((url) => url.endsWith("/locales/en.json")), true);
        assert.equal(requestedUrls.some((url) => url.endsWith("/locales/zh-TW.json")), true);
    } finally {
        globalThis.fetch = originalFetch;
    }
});
