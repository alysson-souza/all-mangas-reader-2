interface LoggerConfig {
    debug?: 0 | 1
}

class Logger {
    constructor(private config: LoggerConfig) {}

    debug(message) {
        if (this.config.debug !== 1) {
            return
        }

        let t = new Date()
        const timePrefix = `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()} ${t.getMilliseconds()}`
        console.log(timePrefix + ": " + message)
    }
}

let instance: Logger
export const getLogger = (config: LoggerConfig) => {
    if (!instance) {
        instance = new Logger(config)
    }
    return instance
}
