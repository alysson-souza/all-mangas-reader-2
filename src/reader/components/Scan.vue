<template>
    <td :class="{xs6: !full, xs12: full, 'res-w': resizeW(), 'res-h': resizeH()}" class='scanContainer' :colspan="full ? 2 : 1">
        <!-- Progress while loading -->
        <v-container fill-height text-xs-center v-show="loading">
            <v-layout>
                <v-flex xs12>
                    <v-progress-circular
                        indeterminate
                        color="red"
                        ></v-progress-circular>
                </v-flex>
            </v-layout>
        </v-container>
        <!-- The Scan container ! -->
        <v-hover>
            <div ref="scanDiv" class="amr-scan" v-show="!loading && !error" slot-scope="{ hover }"> 
                <!-- @dblclick="toggleBookmark" -->
                <!-- Top right triangle to show scan is bookmarked -->
                <v-tooltip right v-if="bookmark" class="amr-triangle-tooltip-cont">
                    <div slot="activator" 
                        class="amr-triangle" 
                        @click="bookmarkScan" 
                        :class="{'not-bookmarked-hover': hover, 'bookmarked': scanbooked}" />
                    <span>
                        {{scanbooked ? (
                                note ? i18n("reader_bookmarked_scan_note", note) : 
                                       i18n("reader_bookmarked_scan")
                            ) : i18n("reader_bookmark_scan_help")}}
                    </span>
                </v-tooltip>
            </div>
        </v-hover>
        <!-- Error try to reload button -->
        <v-container fill-height text-xs-center v-if="error && !loading">
            <v-layout>
                <v-flex xs12>
                    <v-tooltip bottom>
                        <v-btn slot="activator" icon large @click="reloadScan" color="primary">
                            <v-icon>mdi-image-broken</v-icon>
                        </v-btn>
                        <span>Click to try reloading scan</span>
                    </v-tooltip>
                </v-flex>
            </v-layout>
        </v-container>
    </td>
</template>

<script>
import browser from "webextension-polyfill";

import mirrorImpl from '../state/mirrorimpl';
import options from '../state/options';
import bookmarks from "../state/bookmarks";

import { scansProvider } from "../helpers/ScansProvider";
import util from "../helpers/util";
import EventBus from "../helpers/EventBus";

import {i18nmixin} from "../../mixins/i18n-mixin";

export default {
    mixins: [i18nmixin],
    data() {
        return {
            bookstate: bookmarks.state, /* bookmarks state */
            scansProvider: scansProvider.state, /* scans Provider, where the HTMLImage is loaded */
        }
    },
    props: {
        src: String, /* source url of the scan */
        name: String, /* name of the scan (it's 1-based index) */
        full: { /* is the scan displayed full page or half */
            type: Boolean,
            default: false
        },
        resize: String, /* resize mode (width, height, container, none) */
        autoLoad: { /* Does the scan starts loading image automatically */
            type: Boolean,
            default: true
        },
        bookmark: { /* Allow bookmarking */
            type: Boolean,
            default: true
        }
    },
    computed: {
        /* the scan (loaded through scansProvider) */
        scan() {
            return this.scansProvider.scans.find(sc => sc.url === this.src)
        },
        /* is currently loading */
        loading() {
            if (!this.scan) return true
            return this.scan.loading
        },
        /* is the scan rendering error */
        error() {
            if (!this.scan) return false
            return this.scan.error
        },
        /** we need to watch for loading, error and src and call the refreshing method once, so this property is here to detect changes for these three computed properties and call changes once */
        mixed() {
            return (this.loading ? "1" : "0") + (this.error ? "1" : "0") + this.src
        },
        /* is the scan bookmarked ? */
        scanbooked() {
            let sc = this.bookstate.scans.find(sc => sc.url === this.src)
            if (sc) return sc.booked
            return false
        }, 
        /* the bookmark note */
        note() {
            let sc = this.bookstate.scans.find(sc => sc.url === this.src)
            if (sc) return sc.note
            return undefined
        },
    },
    watch: {
        mixed() { /* watch if loading, error or src changed, reload image */
            this.$nextTick(() => this.insertScanInDOM())
        }
    },
    mounted() { /* Display image if already loaded */
        if (!this.loading) this.$nextTick(() => this.insertScanInDOM())
    },
    methods: {
        /* check if we need to fit width */
        resizeW() {
            return ["width", "container"].includes(this.resize)
        },
        /* check if we need to fit height */
        resizeH() {
            return ["height", "container"].includes(this.resize)
        },
        /** Tell scansProvider to retry scan */
        reloadScan() {
            this.scan.load()
        },
        /* Loads the scan, only called on nexttick so all computed properties have been refreshed */
        insertScanInDOM() {
            /** Do not load image in DOM if image is still loading, is in error or if we already loaded the same. This method is called **too much times** on purpose, here is the gatekeeper */
            if (this.loading) return
            // remove existing image
            let alreadyImg = this.$refs.scanDiv.getElementsByTagName('img')
            if (alreadyImg && alreadyImg.length > 0) {
                this.$refs.scanDiv.removeChild(alreadyImg[0])
            }
            if (this.error) return // remove image if error
            // clone the HTMLImage element
            let img = this.scan.scan.cloneNode(true)
            this.$refs.scanDiv.appendChild(img)
        },
        /** Delete the bookmark if bookmarked / create a bookmark if not */
        toggleBookmark() {
            if (!this.bookmark) return;
            if (this.scanbooked) {
                bookmarks.deleteBookmark({scanUrl: this.src})
            } else {
                bookmarks.saveBookmark({scanUrl: this.src, scanName: this.name})
            }
            util.clearSelection()
        },
        /** Open bookmarks dialog */
        bookmarkScan(e) {
            EventBus.$emit('open-bookmarks', {scanUrl: this.src})
            e.stopPropagation()
        }
    }
}
</script>

<style>
td.scanContainer.xs6 {
    width: 50%;
}
td.scanContainer.xs12 {
    width: 100%;
}
.scanContainer.res-w img {
    max-width: 100%;
}
.scanContainer.res-h img {
    max-height: 100vh;
}
/* Positioning bookmark button */
.amr-scan {
    position: relative;
    text-align: center;
    transition: all 0.2s;
}
.amr-triangle {
    border-left: 100px solid transparent;
    border-right: 100px solid #ffeb3b;
    border-bottom: 100px solid transparent;
    height: 0;
    width: 0;
    position: absolute;
    right: 0px;
    z-index: 2;
    opacity: 0;
    cursor: pointer;
    transition: all 0.5s;
}
.amr-triangle.not-bookmarked-hover {
    opacity: 0.2;
}
.amr-triangle.bookmarked {
    opacity: 0.5;
}
.amr-triangle-tooltip-cont {
    position: absolute;
    right: 0;
}
</style>
