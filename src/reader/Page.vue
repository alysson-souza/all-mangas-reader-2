<template>
    <tr>
        <Scan :full="true" :src="scans[0]" :resize="resize" @loaded-scan="loadedScan" ref="solo"  v-if="scans.length === 1" />

        <Scan :full="false" :src="scans[direction === 'ltr' ? 0 : 1]" :resize="resize" @loaded-scan="loadedScan" class="amr-left-page" v-if="scans.length === 2" />
        <Scan :full="false" :src="scans[direction === 'ltr' ? 1 : 0]" :resize="resize" @loaded-scan="loadedScan" class="amr-right-page" v-if="scans.length === 2" />
    </tr>
</template>

<script>
import Scan from "./Scan"

export default {
    props: {
        scans: Array,
        direction: {
            type: String,
            default: "ltr"
        },
        resize: String
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
.amr-right-page {
    text-align: left;
    padding-left: 4px;
}
.amr-left-page {
    text-align: right;
    padding-right: 4px;
}
</style>
