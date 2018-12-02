import i18n from "../amr/i18n"

export default {
    methods: {
        /** Make i18n accessible from dom */
        i18n: (message, ...args) => i18n(message, ...args),
    }
}