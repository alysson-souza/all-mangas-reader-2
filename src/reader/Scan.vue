<template>
    <v-flex :class="{xs6: !full, xs12: full}" class='scanContainer'>
        <v-progress-circular
            indeterminate
            color="red"
            v-if="loading"
            ></v-progress-circular>
        <img :src="src" ref="scan" v-show="!loading" />
    </v-flex>
</template>

<script>
import browser from "webextension-polyfill";
import mirrorImpl from '../content/mirrorimpl';
import pageData from '../content/pagedata';
import options from '../content/options';

export default {
    data() {
        return {
            loading: true,
            doublepage: false
        }
    },
    props: {
        src: String,
        full: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        src: 'loadScan'
    },
    mounted() {
        this.loadScan()
    },
    methods: {
        loadScan() {
            this.loading = true
            this.$refs.scan.onload = () => {
                let img = this.$refs.scan
                if (img.width >= img.height) {
                    this.doublepage = true
                }
                this.loading = false
                this.$emit("loaded-scan")
            }
            (async () => await mirrorImpl.get().getImageFromPageAndWrite(
                this.src.replace(/(^\w+:|^)/, ''),
                this.$refs.scan))()
        }
    }
}
</script>

<style>
.scanContainer img {
    max-width: 100%;
}
</style>
