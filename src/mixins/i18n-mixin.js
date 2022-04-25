import amri18n from "../amr/i18n"

export const i18n = amri18n
export const i18nmixin = {
    methods: {
        /** Make i18n accessible from dom */
        i18n: (message, ...args) => amri18n(message, ...args)
    }
}
