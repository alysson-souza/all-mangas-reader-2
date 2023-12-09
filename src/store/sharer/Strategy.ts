export interface ShareStrategy {
    share: (message: unknown) => void
    addEventListener: (mutation) => string | void
}
