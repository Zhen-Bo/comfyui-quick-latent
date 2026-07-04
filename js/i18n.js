const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = new Set([DEFAULT_LOCALE, "zh-TW"]);

export function normalizeLocale(locale) {
    return matchLocale(locale) || DEFAULT_LOCALE;
}

export function resolveLocale(languageCandidates = browserLanguages()) {
    const candidates = Array.isArray(languageCandidates) ? languageCandidates : [languageCandidates];

    for (const candidate of candidates) {
        const locale = matchLocale(candidate);
        if (locale && SUPPORTED_LOCALES.has(locale)) return locale;
    }

    return DEFAULT_LOCALE;
}

export async function loadLocaleMessages(languageCandidates = browserLanguages()) {
    const locale = resolveLocale(languageCandidates);
    const defaultMessages = await fetchLocaleMessages(DEFAULT_LOCALE);
    if (locale === DEFAULT_LOCALE) return defaultMessages;

    const localeMessages = await fetchLocaleMessages(locale);
    return { ...defaultMessages, ...localeMessages };
}

export function createTranslator(messages = {}) {
    return (key) => messages[key] || key;
}

async function fetchLocaleMessages(locale) {
    if (typeof fetch !== "function") return {};

    try {
        const response = await fetch(new URL(`./locales/${locale}.json`, import.meta.url));
        if (!response.ok) return {};
        return response.json();
    } catch {
        return {};
    }
}

function matchLocale(locale) {
    if (!locale || typeof locale !== "string") return null;

    const normalized = locale.trim().replace("_", "-").toLowerCase();
    if (normalized === "zh" || normalized === "zh-tw" || normalized === "zh-hant") return "zh-TW";
    if (normalized === "zh-hk" || normalized === "zh-mo") return "zh-TW";
    if (normalized.startsWith("en")) return "en";

    return null;
}

function browserLanguages() {
    if (typeof navigator === "undefined") return [DEFAULT_LOCALE];
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) return navigator.languages;
    return [navigator.language || DEFAULT_LOCALE];
}
