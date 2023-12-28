interface LoggerConfig {
    debug?: number
}

type Message = string | undefined | Error | unknown

export class AppLogger {
    constructor(private config: LoggerConfig) {}

    log(level: "log" | "info" | "error" | "debug", message: Message) {
        if (typeof message === "string") {
            console[level](this.getPrefix() + ": " + message)
            return
        }

        console[level](this.getPrefix(), message)
    }

    private getPrefix() {
        const t = new Date()
        return `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()} ${t.getMilliseconds()}`
    }

    public debug = (message: Message) => {
        if (this.config.debug === 1) {
            this.log("debug", message)
        }
    }

    public info = (message: Message) => {
        this.log("info", message)
    }

    public error = (message: Message) => {
        this.log("error", message)
    }

    public setConfig(config: LoggerConfig) {
        this.config = config
    }
}

let instance: AppLogger
export const getAppLogger = (config: LoggerConfig) => {
    if (!instance) {
        instance = new AppLogger(config)
    }
    return instance
}
