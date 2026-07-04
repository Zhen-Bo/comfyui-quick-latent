const DEFAULT_LOCALE = "en";

const TRANSLATIONS = {
    en: {
        orientation: "Orientation",
        portrait: "Portrait",
        landscape: "Landscape",
        aspectRatio: "Aspect Ratio",
        custom: "Custom",
        customSize: "Custom Size",
        presetResolution: "Preset Resolution",
        batchSize: "Batch Size",
        width: "Width",
        height: "Height",
        customRoundDownHint: "Output rounds down to nearest multiple of 8",
    },
    "zh-TW": {
        orientation: "方向",
        portrait: "直向",
        landscape: "橫向",
        aspectRatio: "長寬比",
        custom: "自訂",
        customSize: "自訂尺寸",
        presetResolution: "預設解析度",
        batchSize: "批次大小",
        width: "寬度",
        height: "高度",
        customRoundDownHint: "輸出會向下對齊到最接近的 8 倍數",
    },
};

export function normalizeLocale(locale) {
    return matchLocale(locale) || DEFAULT_LOCALE;
}

export function resolveLocale(languageCandidates = browserLanguages()) {
    const candidates = Array.isArray(languageCandidates) ? languageCandidates : [languageCandidates];

    for (const candidate of candidates) {
        const locale = matchLocale(candidate);
        if (locale && TRANSLATIONS[locale]) return locale;
    }

    return DEFAULT_LOCALE;
}

function matchLocale(locale) {
    if (!locale || typeof locale !== "string") return null;

    const normalized = locale.trim().replace("_", "-").toLowerCase();
    if (normalized === "zh" || normalized === "zh-tw" || normalized === "zh-hant") return "zh-TW";
    if (normalized === "zh-hk" || normalized === "zh-mo") return "zh-TW";
    if (normalized.startsWith("en")) return "en";

    return null;
}

export function createTranslator(locale = resolveLocale()) {
    const messages = TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];

    return (key) => messages[key] || TRANSLATIONS[DEFAULT_LOCALE][key] || key;
}

function browserLanguages() {
    if (typeof navigator === "undefined") return [DEFAULT_LOCALE];
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) return navigator.languages;
    return [navigator.language || DEFAULT_LOCALE];
}
