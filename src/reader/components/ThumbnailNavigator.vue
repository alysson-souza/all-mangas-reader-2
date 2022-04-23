<template>
    <div class="amr-thumbs-scrollable">
        <v-tooltip v-for="(scans, i) in thumbnails()" :key="i" top>
            <template v-slot:activator="{ on }">
                <table
                    v-on="on"
                    :class="{ current: scans.index === currentPage }"
                    class="amr-pages-page-cont"
                    @click.stop="goScan(scans.index)">
                    <Page
                        ref="thumbnail"
                        :bookmark="false"
                        :direction="direction"
                        :index="scans.index"
                        :scans="scans.page"
                        resize="container" />
                </table>
            </template>
            <span>{{ displayPageScansIndexes(scans.index) }}</span>
        </v-tooltip>
    </div>
</template>
<script>
import Page from "./Page"

export default {
    name: "ThumbnailNavigator",
    components: { Page },
    props: {
        currentPage: {},
        direction: String,
        displayPageScansIndexes: Function,
        goScan: Function,
        invertKeys: Boolean,
        pages: Array,
        shouldInvertKeys: Boolean
    },
    methods: {
        /**
         * Sorts the thumbnails respecting the Invert Keys option
         */
        thumbnails() {
            const res = new Array(this.pages.length)

            for (let i = 0; i < this.pages.length; i++) {
                res[i] = {
                    index: i,
                    page: this.pages[i]
                }
            }

            return this.shouldInvertKeys ? res.reverse() : res
        }
    }
}
</script>
<style data-amr="true">
/** Pages navigator */
.amr-thumbs-scrollable {
    /* navigator container is horizontally scrollable for long chapters */
    overflow: hidden;
    white-space: nowrap;
}

.amr-pages-page-cont {
    margin: 0px 5px;
    display: inline-block;
    background-color: #424242;
    border-radius: 2px;
    opacity: 0.9;
    cursor: pointer;
    vertical-align: middle;
    width: auto !important;
}

.amr-pages-page-cont td {
    vertical-align: middle;
}

.amr-pages-page-cont td img {
    max-height: 80px !important;
    max-width: 110px !important;
}

.amr-pages-page-cont:hover {
    background-color: #ef5350;
}

.amr-pages-page-cont:hover td img {
    max-height: 90px !important;
}

.amr-pages-page-cont.current td img {
    max-height: 100px !important;
}
</style>
