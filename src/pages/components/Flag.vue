<template>
    <v-tooltip v-if="country" top class='flag-container'>
        <template v-slot:activator="{ on }">
            <i
            v-on="on"
            :class='"flag flag-" + country + isBig + isDisabled'
            />
        </template>
        <span>{{i18n("language_" + country )}}</span>
    </v-tooltip>
</template>

<script>
import i18n from "../../amr/i18n";
import '../flags.css';

export default {
    props: {
        value: undefined,
        big: Boolean,
        mirrorName: String  // not needed atm
    },
    computed: {
        country () {
            // if(mirrorName !== 'MangaDex V5') return
            let value = this.value
            if(Array.isArray(this.value)) {
                value = this.value[0]
            }
            if(value === 'pt-br') return 'br'
            if(value === 'es-la') return 'mx'
            if(value === 'fa') return 'ir'
            if(value === 'cs') return 'cz'
            if(value === 'zh-hk') return 'hk'
            if(value === 'zh') return 'cn'
            if(value === 'uk') return 'ua'
            if(value === 'vi') return 'vn'
            if(value === 'he') return 'il'
            if(value === 'ms') return 'my'
            if(value === 'tl') return 'ph'
            if(value === 'ja') return 'jp'
            if(value === 'ko') return 'kr'
            if(value === 'hi') return 'in'
            if(value === 'bn') return 'bd'
            if(value === 'sv') return 'se'
            if(value === 'el') return 'gr'
            if(value === 'sr') return 'ba'
            if(value === 'da') return 'dk'
            if(value === 'ca') return 'ct'
            if(value === 'null' || value === 'NULL') return '_United-Nations'
            return value
        },
        isBig() {
            if(this.big) return ' big'
            else return ''
        },
        isDisabled() {
            if(Array.isArray(this.value)) {
                if(typeof this.value[1] !== 'undefined') {
                    return this.value[1] ? '' : ' flag-disabled'
                } else {
                    return ''
                }
            } else {
                return ''
            }
        }
    },
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
    }
}
</script>
