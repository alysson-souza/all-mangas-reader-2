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
