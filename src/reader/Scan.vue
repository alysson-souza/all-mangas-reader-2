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
        <!-- The Scan ! -->
        <v-hover>
            <div class="amr-scan" v-show="!loading && !error" slot-scope="{ hover }"> 
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
                <!-- The scan itself... -->
                <img ref="scan" />
            </div>
        </v-hover>
        <!-- Error try to reload button -->
        <v-container fill-height text-xs-center v-if="error && !loading">
            <v-layout>
                <v-flex xs12>
                    <v-tooltip bottom>
                        <v-btn slot="activator" icon large @click="loadScan" color="primary">
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
import mirrorImpl from '../content/mirrorimpl';
import pageData from '../content/pagedata';
import options from '../content/options';

import bookmarks from "./bookmarks";
import util from "./util";
import EventBus from "./EventBus";
import {i18nmixin} from "../mixins/i18n-mixin";

export default {
    mixins: [i18nmixin],
    data() {
        return {
            loading: true, /* is currently loading */
            error: false, /* is the scan rendering error */
            doublepage: false, /* is the scan a double page */

            bookstate: bookmarks.state, /* bookmarks state */
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
        src: 'loadScan', /* reload scan if src changes */
    },
    mounted() {
        if (this.autoLoad) { /* load scan if auto on mounted */
            this.loadScan()
        }
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
        /* Loads the scan */
        loadScan() {
            this.loading = true
            this.error = false

            return new Promise(async (resolve, reject) => {
                this.$refs.scan.addEventListener('load', () => {
                    let img = this.$refs.scan
                    if (!img) return
                    /** Check if scan is double page */
                    if (img.width > img.height) {
                        this.doublepage = true
                    }
                    if (img.height >= 3 * img.width) { // super thin scan, raise an event
                        EventBus.$emit("thin-scan")
                    }
                    this.loading = false
                    this.error = false
                    this.$emit("loaded-scan")
                    resolve()
                })
                let manageError = (e) => {
                    console.error("An error occurred while loading an image")
                    console.error(e)
                    this.loading = false
                    this.error = true
                    this.$emit("loaded-scan")
                    resolve()
                }
                this.$refs.scan.addEventListener('error', (e) => {
                    manageError(e)
                })
                try {
                    // Load the scan using implementation method
                    await mirrorImpl.get().getImageFromPageAndWrite(
                        this.src.replace(/(^\w+:|^)/, ''),
                        this.$refs.scan)
                } catch(e) {
                    console.error(e)
                    manageError(e)
                }
            })
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
