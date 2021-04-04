<template>
  <td :class="{xs6: !full, xs12: full, 'res-w': resizeW(), 'res-h': resizeH(), 'scale-up': scaleUp}" class="scanContainer" :colspan="full ? 2 : 1">
    <!-- Progress while loading -->
    <v-container class="fill-height text-center" v-show="loading">
      <v-row>
        <v-col cols="12">
          <v-progress-circular indeterminate color="red"></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
    <!-- The Scan container ! -->
    <div ref="scanDiv" class="amr-scan" v-show="!loading && !error" @contextmenu="show"></div>

    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute offset-y>
      <v-list>
        <v-list-item link>
          <v-list-item-title @click="bookmarkScan">
            {{ scanbooked ? i18n('reader_context_menu_manage_bookmark') : i18n('reader_context_menu_add_bookmark') }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item link>
          <v-list-item-title v-clipboard="src" v-clipboard:success="copySuccess" v-clipboard:error="copyError">
            {{ i18n('reader_context_menu_copy_url') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Error try to reload button -->
    <v-container class="fill-height text-center" v-if="error && !loading">
      <v-row>
        <v-col cols="12">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon large @click="reloadScan" color="primary">
                <v-icon v-bind:data-src="src">mdi-image-broken</v-icon>
              </v-btn>
            </template>
            <span>Click to try reloading scan</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snackbarShow" :timeout="snackbarTimeout" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </td>
</template>

<script>
import browser from 'webextension-polyfill'

import mirrorImpl from '../state/mirrorimpl'
import options from '../state/options'
import bookmarks from '../state/bookmarks'

import { scansProvider } from '../helpers/ScansProvider'
import util from '../helpers/util'
import EventBus from '../helpers/EventBus'
import i18n from '../../amr/i18n'

import { i18nmixin } from '../../mixins/i18n-mixin'

export default {
  mixins: [i18nmixin],
  data() {
    return {
      bookstate: bookmarks.state, /* bookmarks state */
      scansProvider: scansProvider.state, /* scans Provider, where the HTMLImage is loaded */
      showMenu: false,
      x: 0,
      y: 0,
      snackbarShow: false,
      snackbarText: '',
      snackbarColor: '',
      snackbarTimeout: 1500
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
    },
    scaleUp: {
      type: Boolean,
      default: false
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
    /* watch if loading, error or src changed, reload image */
    mixed() {
      this.$nextTick(() => this.insertScanInDOM())
    }
  },
  mounted() {
    /* Display image if already loaded */
    if (!this.loading) this.$nextTick(() => this.insertScanInDOM())
  },
  created() {
    /* Event from side bar to reload all errored scans */
    EventBus.$on('reload-all-errors', this.reloadScan)
  },
  beforeDestroy() {
    EventBus.$off('reload-all-errors', this.reloadScan)
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
      if (this.error) this.scan.load()
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
    /** Open bookmarks dialog */
    bookmarkScan(e) {
      EventBus.$emit('open-bookmarks', { scanUrl: this.src })
      // e.stopPropagation();
    },
    show (e) {
      e.preventDefault()
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    copySuccess() {
      this.snackbarText = i18n('reader_snackbar_copyurl_success')
      this.snackbarColor = 'success'
      this.snackbarShow = true
    },
    copyError() {
      this.snackbarText = i18n('reader_snackbar_copyurl_error')
      this.snackbarColor = 'error'
      this.snackbarShow = true
    }
  }
};
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
.scanContainer.scale-up img {
  object-fit: contain;
}
.scanContainer.res-w.scale-up img {
  width: 100%;
}
.scanContainer.res-h.scale-up img {
  height: 100vh;
}
/* Positioning bookmark button */
.amr-scan {
  position: relative;
  text-align: center;
  transition: all 0.2s;
}
</style>
