/**
 * Convert language to country
 */
export function mdFixLang(languages: string | undefined) {
    const results = []
    if (typeof languages !== "string") {
        return "_United-Nations"
    }

    for (const lang of languages.split(",")) {
        switch (lang) {
            case "pt-br":
                results.push("br")
                break
            case "es-la":
                results.push("mx")
                break
            case "fa":
                results.push("ir")
                break
            case "cs":
                results.push("cz")
                break
            case "zh-hk":
                results.push("hk")
                break
            case "zh":
                results.push("cn")
                break
            case "uk":
                results.push("ua")
                break
            case "vi":
                results.push("vn")
                break
            case "he":
                results.push("il")
                break
            case "ms":
                results.push("my")
                break
            case "tl":
                results.push("ph")
                break
            case "ja":
                results.push("jp")
                break
            case "ko":
                results.push("ko")
                break
            case "hi":
                results.push("in")
                break
            case "bn":
                results.push("bd")
                break
            case "sv":
                results.push("se")
                break
            case "el":
                results.push("gr")
                break
            case "sr":
                results.push("ba")
                break
            case "da":
                results.push("dk")
                break
            case "ca":
                results.push("ct")
                break
            case "null":
                results.push("_United-Nations")
                break
            case "NULL":
                results.push("_United-Nations")
                break
            default:
                results.push(lang)
                break
        }
    }
    return results.join(",")
}
export function mdFixLangKey(key: string) {
    return key.replace(/.*_(.*)$/, function (a, b) {
        return a.replace(b, "") + mdFixLang(b)
    })
}
const mdFixLangsList = [
    "pt-br",
    "es-la",
    "fa",
    "cs",
    "zh-hk",
    "zh",
    "uk",
    "vi",
    "he",
    "ms",
    "tl",
    "ja",
    "ko",
    "hi",
    "bn",
    "sv",
    "sv",
    "el",
    "sr",
    "da",
    "ca",
    "null",
    "NULL"
]
export const mdFixLangsListPrefix = mdFixLangsList.map(e => "_" + e)
