<template>
    <v-tooltip top class='flag-container'>
        <template v-slot:activator="{ on }">
            <i v-on="on" :class='"flag flag-" + value + (big ? " big" : "")' @click="$emit('toggleLanguageSelection')" />
        </template>
        <span>{{i18n("language_" + value)}}</span>
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

<style>

</style>
