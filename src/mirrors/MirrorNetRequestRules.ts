import browser from "webextension-polyfill"

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
                value: "https://manhwatop.com/"
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
        //initiatorDomains: [browser.runtime.id],
        // for URLs that match the followinf expression
        urlFilter: "https://manhwatop.com/*",
        // and only for our fetch requests
        resourceTypes: ["xmlhttprequest" as const]
    }
}

const amrNetRules: browser.DeclarativeNetRequest.Rule[] = [{ id: 1, ...manhwaTopRule }]

export function getNetRulesForMirrors(): browser.DeclarativeNetRequest.Rule[] {
    return amrNetRules
}
