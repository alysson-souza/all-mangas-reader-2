interface LoggerConfig {
    debug?: number
}

type Message = string | undefined | Error | unknown

export class AppLogger {
    constructor(private config: LoggerConfig) {}

    log(level: "log" | "info" | "error" | "debug", message: Message) {
        if (typeof message === "string") {
            console[level](this.getPrefix() + ": " + message)
        }

        console[level](this.getPrefix(), message)
    }

    private getPrefix() {
        const t = new Date()
        return `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()} ${t.getMilliseconds()}`
    }

    debug(message: Message) {
        if (this.config.debug === 1) {
            this.log("debug", message)
        }
    }

    info(message: Message) {
        this.log("info", message)
    }

    error(message: Message) {
        this.log("error", message)
    }
}

let instance: AppLogger
export const getAppLogger = (config: LoggerConfig) => {
    if (!instance) {
        instance = new AppLogger(config)
    }
    return instance
}
