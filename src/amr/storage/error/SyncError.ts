export class SyncError extends Error {
    constructor(message: string, public response?: Response, public cause?: Error) {
        super(message)
        this.name = "SyncError"
    }
}
