<template>
    <Scan :full="true" :src="scans[0]" @loaded-scan="loadedScan" v-if="scans.length === 1" ref="solo" />
    <v-flex xs12 v-else>
        <v-layout row wrap>
            <Scan :full="false" :src="scans[direction === 'ltr' ? 0 : 1]" @loaded-scan="loadedScan" />
            <Scan :full="false" :src="scans[direction === 'ltr' ? 1 : 0]" @loaded-scan="loadedScan" />
        </v-layout>
    </v-flex>
</template>

<script>
import Scan from "./Scan"

export default {
    props: {
        scans: Array,
        direction: {
            type: String,
            default: "ltr"
        }
    },
    name: "Page",
    components: { Scan },
    methods: {
        loadedScan() {
            this.$emit("loaded-scan")
        },
        isSoloDoublePage() {
            return this.$refs.solo && this.$refs.solo.doublepage
        },
        isSoloLoading() {
            return this.$refs.solo && this.$refs.solo.loading
        }
    }
}
</script>

<style>

</style>
