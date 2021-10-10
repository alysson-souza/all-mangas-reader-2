<template>
    <v-tooltip top class='flag-container'>
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
        big: Boolean
    },
    computed: {
        country () {
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
