interface LoggerConfig {
    debug?: 0 | 1
}

export class AppLogger {
    constructor(private config: LoggerConfig) {}

    log(message: string) {
        console.log(this.getPrefix() + ": " + message)
    }

    debug(message: string) {
        if (this.config.debug === 1) {
            console.log(this.getPrefix() + ": " + message)
        }
    }

    private getPrefix() {
        const t = new Date()
        return `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()} ${t.getMilliseconds()}`
    }

    info(message: string) {
        this.log(message)
    }
}

let instance: AppLogger
export const getAppLogger = (config: LoggerConfig) => {
    if (!instance) {
        instance = new AppLogger(config)
    }
    return instance
}
