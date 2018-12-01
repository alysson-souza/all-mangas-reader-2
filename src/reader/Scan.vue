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
        <img :src="src" ref="scan" v-show="!loading && !error" />
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

export default {
    data() {
        return {
            loading: true,
            error: false,
            doublepage: false
        }
    },
    props: {
        src: String, /* source url of the scan */
        full: { /* is the scan displayed full page or half */
            type: Boolean,
            default: false
        },
        resize: String, /* resize mode (width, height, container, none) */
        autoLoad: { /* Does the scan starts loading image automatically */
            type: Boolean,
            default: true
        }
    },
    watch: {
        src: 'loadScan' /* reload scan if src changes */
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
                this.$refs.scan.onload = () => {
                    let img = this.$refs.scan
                    if (img.width > img.height) {
                        this.doublepage = true
                    }
                    this.loading = false
                    this.$emit("loaded-scan")
                    resolve()
                }
                let manageError = () => {
                    this.loading = false
                    this.error = true
                    this.$emit("loaded-scan")
                    resolve()
                }
                this.$refs.scan.onerror = () => {
                    manageError()
                }
                try {
                    await mirrorImpl.get().getImageFromPageAndWrite(
                        this.src.replace(/(^\w+:|^)/, ''),
                        this.$refs.scan)
                } catch(e) {
                    console.error(e)
                    manageError()
                }
            })
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
.scanContainer.amr-animate-once.bookmarked {
    animation: amr-heartbeat 1s
}
@keyframes amr-heartbeat
{
  0%
  {
    transform: scale( .9 );
  }
  20%
  {
    transform: scale( 1 );
  }
  40%
  {
    transform: scale( .9 );
  }
  60%
  {
    transform: scale( 1 );
  }
  80%
  {
    transform: scale( .9 );
  }
  100%
  {
    transform: scale( .9 );
  }
}
</style>
