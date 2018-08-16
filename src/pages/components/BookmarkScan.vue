<template>
    <!-- Before mangas are loaded into popup -->
    <v-card-media
        :src="scanUrl"
        :height="height"
        @click="$emit('click-scan')"
        class="amr-scan"
    ></v-card-media>
</template>

<script>
import browser from "webextension-polyfill";

export default {
    data() {
        return {
            scanUrl: "",
        }
    },
    created() {
        if (this.bookmark.displayedUrl !== undefined) {
            this.scanUrl = this.bookmark.displayedUrl; // already loaded
        } else {
            this.scanUrl = this.bookmark.scanUrl; // default url to bookmark scanUrl
            this.$emit("change-url", {
                key: this.bookmark.key, 
                url: this.scanUrl
            });
            if ((this.scanUrl.match(/\.(jpeg|jpg|gif|png)$/) == null)) { // keep url matching image url
                this.getScanUrl(); // load the others
            }
        }
    },
    props: ["bookmark", "height"],
    name: "BookmarkScan",
    methods: {
        /**
         * Return the scan url computed from the mirror implementation
         * called on error while loading image scan
         */
        async getScanUrl() {
            let scan = await browser.runtime.sendMessage({
                action: "getScanUrl", 
                url: this.bookmark.scanUrl, 
                mirror: this.bookmark.mirror 
            });
            //set scan url on image
            this.scanUrl = scan;
            this.$emit("change-url", {
                key: this.bookmark.key, 
                url: this.scanUrl
            });
        }
    }
}
</script>

<style>
.amr-scan {
    cursor: pointer;
}
</style>
