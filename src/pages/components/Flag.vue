<template>
    <v-tooltip v-if="country" top class="flag-container">
        <template v-slot:activator="{ on }">
            <i v-on="on" :class="'flag flag-' + country + isBig + isDisabled" @click="toggleLanguageSelection" />
        </template>
        <span>{{ i18n("language_" + country) }}</span>
    </v-tooltip>
</template>

<script>
import i18n from "../../amr/i18n"
import("../flags.css")

export default {
    props: {
        value: undefined,
        big: Boolean,
        mirrorName: String // not needed atm
    },
    computed: {
        country() {
            if (Array.isArray(this.value)) {
                return this.value[0]
            }
            return this.value
        },
        isBig() {
            if (this.big) return " big"
            else return ""
        },
        isDisabled() {
            if (Array.isArray(this.value)) {
                if (typeof this.value[1] !== "undefined") {
                    return this.value[1] ? "" : " flag-disabled"
                } else {
                    return ""
                }
            } else {
                return ""
            }
        }
    },
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        toggleLanguageSelection() {
            this.$emit("toggleLanguageSelection")
        }
    }
}
</script>
