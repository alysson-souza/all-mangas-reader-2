import colors from "vuetify/es5/util/colors"

export default {
    icons: {
        iconfont: "mdi"
    },
    theme: {
        themes: {
            light: {
                primary: colors.red.base,
                secondary: colors.grey.darken1,
                accent: colors.red.lighten1,
                error: colors.red.accent3
            },
            dark: {
                primary: colors.red.base
            }
        },
        options: {
            customProperties: true
        }
    }
}
