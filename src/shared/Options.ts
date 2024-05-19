import { AppOptions } from "./OptionStorage"

export const THINSCAN = {
    default: 0,
    ask: 0, // Default
    adjust: 1,
    no_adjust: 2
}

export const isFirefox = function () {
    // Firefox 1.0+ (tested on Firefox 45 - 53)
    return "InstallTrigger" in globalThis
}

export const getSyncOptions = (options: Partial<AppOptions>) => {
    return Object.keys(options)
        .filter(x => x.toLowerCase().indexOf("sync") > -1)
        .reduce((obj, key) => {
            obj[key] = options[key]
            return obj
        }, {} as Record<string, any>)
}
