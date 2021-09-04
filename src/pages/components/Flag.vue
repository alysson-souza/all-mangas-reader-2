<template>
    <v-tooltip top class='flag-container'>
        <template v-slot:activator="{ on }">
            <i
            v-on="on"
            :class='"align-self-center flag flag-" + (Array.isArray(value) ? value[0] : value) + (big ? " big" : "") + ((Array.isArray(value) ? value[1] : value) ? "" : " flag-disabled")'
            @click="$emit('toggleLanguageSelection')" />
        </template>
        <span>{{i18n("language_" +  (Array.isArray(value) ? value[0] : value))}}</span>
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
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
    }
}
</script>
