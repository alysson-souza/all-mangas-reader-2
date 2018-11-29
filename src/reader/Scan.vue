<template>
    <td :class="{xs6: !full, xs12: full, 'res-w': resizeW(), 'res-h': resizeH()}" class='scanContainer' :colspan="full ? 2 : 1">
        <v-progress-circular
            indeterminate
            color="red"
            v-if="loading"
            ></v-progress-circular>
        <img :src="src" ref="scan" v-show="!loading" />
    </td>
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
        },
        resize: String
    },
    watch: {
        src: 'loadScan'
    },
    mounted() {
        this.loadScan()
    },
    methods: {
        resizeW() {
            return ["width", "container"].includes(this.resize)
        },
        resizeH() {
            return ["height", "container"].includes(this.resize)
        },
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
td.xs6 {
    width: 50%;
}
td.xs12 {
    width: 100%;
}
.scanContainer.res-w img {
    max-width: 100%;
}
.scanContainer.res-h img {
    max-height: 100vh;
}
</style>
