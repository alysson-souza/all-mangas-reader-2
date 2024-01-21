import browser from "webextension-polyfill"

const thisExtensionId: string = browser.i18n.getMessage("@@extension_id")

type RuleInfo = {
    action: browser.DeclarativeNetRequest.RuleActionType
    condition: browser.DeclarativeNetRequest.RuleConditionType
    priority?: number
}

const manhwaTopRule: RuleInfo = {
    action: {
        // Replaces Referer and Origin request headers to bypass site's protection
        type: "modifyHeaders" as const,
        requestHeaders: [
            {
                header: "Referer",
                operation: "set" as const,
                value: "https://manhwatop.com"
            },
            {
                header: "Origin",
                operation: "set" as const,
                value: "https://manhwatop.com"
            },
            {
                header: "sec-fetch-site",
                operation: "set" as const,
                value: "cross-site"
            }
        ]
    },
    condition: {
        // applies only to requests from this extension
        initiatorDomains: [thisExtensionId],
        // for URLs that match the following filter
        urlFilter: "|https://manhwatop.com/*",
        // and only for our fetch requests
        resourceTypes: ["xmlhttprequest" as const]
    }
}

const mangaHubRule: RuleInfo = {
    action: {
        // Replaces Referer and Origin request headers to bypass site's protection
        type: "modifyHeaders" as const,
        requestHeaders: [
            {
                header: "Referer",
                operation: "set" as const,
                value: "https://mangahub.io"
            },
            {
                header: "Origin",
                operation: "set" as const,
                value: "https://mangahub.io"
            }
        ]
    },
    condition: {
        // applies only to requests from this extension
        initiatorDomains: [thisExtensionId],
        // for URLs that match the following filter
        urlFilter: "|https://mangahub.io/*",
        // and only for our fetch requests
        resourceTypes: ["xmlhttprequest" as const]
    }
}

const mangaFoxRule: RuleInfo = {
    action: {
        // Replaces Referer and Origin request headers to bypass site's protection
        type: "modifyHeaders" as const,
        requestHeaders: [
            {
                header: "Referer",
                operation: "set" as const,
                value: "https://fanfox.net"
            },
            {
                header: "Origin",
                operation: "set" as const,
                value: "https://fanfox.net"
            }
        ]
    },
    condition: {
        // applies only to requests from this extension
        initiatorDomains: [thisExtensionId],
        // for URLs that match the following filter
        urlFilter: "|https://fanfox.net/*",
        // and only for our fetch requests
        resourceTypes: ["xmlhttprequest" as const]
    }
}

const amrNetRules: browser.DeclarativeNetRequest.Rule[] = [
    { id: 1, ...manhwaTopRule },
    { id: 2, ...mangaHubRule },
    { id: 3, ...mangaFoxRule }
]

export function getNetRulesForMirrors(): browser.DeclarativeNetRequest.Rule[] {
    return amrNetRules
}
