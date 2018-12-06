<template>
    <v-container fluid text-xs-center pa-0 
        :class="{'no-full-chapter': !fullchapter}">
        <!-- Scans -->
        <table ref="scantable" class="amr-scan-container" border="0" cellspacing="0" cellpadding="0">
          <Page v-for="(scans, i) in pages" :key="i"
              :index="i" 
              :scans="scans" 
              @loaded-scan="loadedScan" 
              :direction="direction"
              :resize="resize"
              :autoLoad="options.imgorder === 0"
              ref="page" 
              v-show="isVisible(i)"
              @become-current="becomeCurrent" />
        </table>
        <!-- Pages navigator -->
        <v-hover>
          <div class="amr-pages-nav" v-show="chaploaded" 
            :class="{display: hover, 'shrink-draw': drawer}"
            slot-scope="{ hover }">
            <div class="amr-thumbs-scrollable" ref="thumbs-scrollable">
              <v-tooltip top v-for="(scans, i) in pages" :key="i">
                <table slot="activator" class="amr-pages-page-cont"  
                  :class="{current: i === currentPage}" 
                  @click.stop="goScan(i)">
                  <Page :index="i" 
                    :scans="scans" 
                    :direction="direction"
                    resize="container" 
                    ref="thumb" 
                    :bookmark="false" />
                </table>
                <span>{{displayPageScansIndexes(i)}}</span>
              </v-tooltip>
            </div>
          </div>
        </v-hover>
    </v-container>
</template>

<script>
import options from '../content/options';

import Page from "./Page";
import EventBus from "./EventBus";
import { i18nmixin } from "../mixins/i18n-mixin"
import { scroller } from 'vue-scrollto/src/scrollTo'

/** Create a custom scroller (alias of $scrollTo method) to enable multiple scrollings (thumbs scroll simultaneously page scroll) */
const thumbsScroller = scroller()
let currentlyThumbsScrolling = false

export default {
    mixins: [i18nmixin],
    data() {
        return {
            chaploaded: false, /* True if all scans have been loaded */
            regroupablePages: [], /* How to regroup pages to make a book */
            visible: [0], /* List of indexes of visible pages, used when not fullchapter, one one in list except for transitions */
            currentPage: 0, /* Current displayed page */

            originalTitle: document.title, /* Original title of the page */
            
            animationDuration: 250, /* Duration of scrolls animation when navigating with keys */
            scrollStepWithKeys: 50, /* Scroll step with keys when need to scroll by steps */
            lastKeyPressTime: 0, /* Last time a key was pressed (to detect double tap) */
            lastKeyPress: 0, /* Last key pressed */
            doubleTapDuration: 250, /* Laps of time between two events to be considered as doubletap */
            scrollRatio: 0, /* Keep the scroll ratio (scrollY / total) to restore position when resizing display zone */

            options: options, /* Make it reactive so update to local options object will be reflected in computed properties */
        }
    },
    props: {
        images: Array, /* List of scans to display, not necessarily pictures but urls that the implementation can handle to render a scan */
        direction: String, /* Reading from left to right or right to left */
        book: Boolean, /* Do we display side by side pages */
        resize: String, /* Mode of resize : width, height, container */
        fullchapter: Boolean, /* Do we display whole chapter or just current page */
        drawer: Boolean, /* Is the drawer opened ? (adjust some css) */
    },
    created() {
        /** Initialize key handlers */
        this.handlekeys()
        /** Keep scroll ratio */
        window.addEventListener('scroll', () => {
            this.scrollRatio = window.pageYOffset / document.documentElement.scrollHeight
        });
        /** Keep scroll ratio when resizing */
        window.addEventListener('resize', () => {
            this.keepScrollPos(10)
        });
    },
    watch: {
        /** Adjust the scroll in the thumbnails bar to have at most the currentPage centered and at least visible */
        currentPage(nVal, oVal) {
            // while scrolling main page to go to selected page, currentPage is updated multiple times, do not rescroll if currently scrolling
            if (currentlyThumbsScrolling) return
            currentlyThumbsScrolling = true
            thumbsScroller(this.$refs.thumb[nVal].$el, this.animationDuration, {
                container: this.$refs["thumbs-scrollable"],
                offset: (-(window.innerWidth - (this.drawer ? 300 : 0 )) + this.$refs.thumb[nVal].$el.clientWidth) / 2,
                x: true,
                y: false,
                onDone: () => {currentlyThumbsScrolling = false}
            })
        },
        resize(nVal, oVal) {
            this.keepScrollPos(100) // keep the scrolling ratio when changing resize mode
            if (nVal !== 'none') {
                this.$refs.scantable.style.zoom = 1
            }
            /* Check if page can scroll vertically */
            this.checkResizeOverflow()
        },
        book(nVal, oVal) { // keep the scrolling ratio when changing book mode / not really relevant but better than nothing...
            this.keepScrollPos(100)
            let furl // url of the first viewable scan on currentpage
            if (nVal) {
                furl = this.images[this.currentPage] // retrieve it from images cause old book value was false, so one page per image
            } else {
                if (this.regroupablePages[this.currentPage] && this.regroupablePages[this.currentPage].length > 0) {
                    furl = this.regroupablePages[this.currentPage][0].src // retrieve it from rearrange pages cause old book value was true 
                }
            }
            if (furl) {
                // calculate new currentPage and go to it after new arrangement has been calculated
                this.$nextTick(() => {
                    let ncur = this.getPageIndexFromScanUrl(furl)
                    this.goScan(ncur)
                })
            }
        },
        /** Keep drawer state */
        drawer(nVal, oVal) {
            this.keepScrollPos() // keep the scrolling ratio when opening / closing drawer !
        },
        /** Change resize value if passing from !fullchapter to fullchapter (height and container are no more available) */
        fullchapter(nVal, oVal) {
            if (nVal && !oVal) {
                this.$nextTick(() => {
                    this.$scrollTo(this.$refs.page[this.currentPage].$el, -1) /* use -1 cause 0 not taken into account */
                })
            } else {
                window.scroll(0, 0)
            }
            /* Check if page can scroll vertically */
            this.checkResizeOverflow()
        },
    },
    mounted() {
        /* Check if page can scroll vertically */
        this.checkResizeOverflow()
        /* Load scans in order if option is set */
        if (options.imgorder === 1) {
            this.loadScansInOrder()
        }
    },
    computed: {
        /* Current displayed pages */
        pages() {
            /* First, list of pages is single scan pages with all the chapter's scans */
            if (!this.chaploaded || !this.book) {
                return this.images.map((img, i) => [{src: img, name: '' + (i + 1)}])
            } else {
                return this.regroupablePages
            }
        }, 
    },
    components: { Page },
    methods: {
        /** 
         * Determine if a page should be shown.
         * Always true if fullChapter mode, just current page if not
         */
        isVisible(page_index) {
            return this.fullchapter || this.visible.includes(page_index)
        },
        /** Load scans in their natural order (slower) */
        async loadScansInOrder() {
            for (let i = 0; i < this.$refs.page.length; i++) {
                await this.$refs.page[i].loadScan()
            }
        },
        /** Called when a scan has been loaded */
        loadedScan() {
            // Count how many scans have been loaded
            let nbloaded = 0
            for (let sc of this.$refs.page) {
                if (!sc.isSoloLoading()) nbloaded++
            }
            
            // display progression
            if (options.load == 1 && !this.chaploaded) {
                if (this.images.length !== 0 && nbloaded !== this.images.length) {
                    document.title = Math.floor(nbloaded / this.images.length * 100) + " % - " + this.originalTitle
                } else {
                    document.title = this.originalTitle
                }
            }

            // All scans loaded. Build the book (regroup scans that can be read side by side, depending on double page scans (width > height) position)
            if (nbloaded === this.images.length && !this.chaploaded) {
                let scans = []
                let lastfull = 0
                for (let i = 0; i < this.images.length; i++) {
                    let full = false
                    if (this.$refs.page[i].isSoloDoublePage()) {
                        full = true
                        if ((i - lastfull) % 2 !== 0) {
                            // Change display of scan which is after the previous double page scan
                            scans[lastfull].full = true
                        }
                        lastfull = i + 1
                    }
                    scans.push({url: this.images[i], full: full})
                }
                if ((this.images.length - 1 - lastfull - 1) % 2 !== 0) {
                    // Set last page full width because alone
                    scans[this.images.length - 1].full = true
                }
                // Calculates how to regroup pages
                let curPage = 0
                let regrouped = []
                let curScan = 0;
                for (let sc of scans) {
                    let toadd = {src: sc.url, name: '' + (curScan + 1)}
                    if (!regrouped[curPage]) {
                        regrouped[curPage] = [toadd]
                    } else {
                        regrouped[curPage].push(toadd)
                    }
                    if (sc.full || regrouped[curPage].length === 2) {
                        curPage++
                    }
                    curScan++
                }
                this.regroupablePages.length = 0;
                this.regroupablePages.push(...regrouped)

                // Set loaded top
                this.chaploaded = true
                // Reset document title
                document.title = this.originalTitle
                EventBus.$emit("chapter-loaded")
            }
        },
        /** Return a string containing the scan indexes (1-based) contained in the page of index page_index in the right order (using direction ltr or rtl) */
        displayPageScansIndexes(page_index) {
            let scs = this.pages[page_index]
            if (scs.length === 1) return scs[0].name
            else {
                if (this.direction === 'ltr') return scs[0].name + " - " + scs[1].name
                else return scs[1].name + " - " + scs[0].name
            }
        },
        /** Go to scan */
        goScan(index) {
            if (!this.fullchapter) {
                // just change the visibility of current page and next page
                if (index === this.currentPage) return

                this.currentPage = index
                this.visible = [index]
                window.scroll(0, 0)
            } else {
                /* We set currentScan first so the horizontal Scroller in thumbs bar will go to the right scan. It is not necessary cause scrolling will update currentScan on it's own but if we don't, scrolling in thumbs bar is glitchy... */
                this.currentPage = index
                this.visible = [index]
                this.$scrollTo(this.$refs.page[index].$el, this.animationDuration)
            }
        },
        /** Go to next scan */
        goNextScan(doubletap) {
            let cur = this.currentPage, n = cur
            if (cur + 1 < this.pages.length) n = cur + 1

            if (doubletap && n === cur) {
                EventBus.$emit('go-next-chapter')
                return
            }
            
            if (!this.fullchapter) {
                // just change the visibility of current page and next page
                if (cur === n) {
                    // this is latest scan of the chapter
                    EventBus.$emit('temporary-dialog', { message: this.i18n("reader_alert_lastscan"), duration: 2000})
                    return
                }

                this.currentPage = n
                this.visible = [n]
                window.scroll(0, 0)
            } else {
                // if current page top is visible, go to top of the page, if not and bottom not visible, go to bottom, else and if there is a next page go to top of next page
                let curpage = this.$refs.page[this.currentPage]
                if (curpage.topInViewport && !curpage.atTop) { // go to top of the current page
                    this.$scrollTo(curpage.$el, this.animationDuration)
                } else if (!curpage.bottomInViewport) { // go to bottom of the current page
                    this.$scrollTo(curpage.$el, this.animationDuration, {
                    offset: curpage.$el.offsetHeight - window.innerHeight
                    })
                } else if (n !== cur) { // go to top of the next page
                    this.$scrollTo(this.$refs.page[n].$el, this.animationDuration)
                }
            }
        },
        /** Go to previous scan */
        goPreviousScan(doubletap) {
            let cur = this.currentPage, n = cur
            if (cur - 1 >= 0) n = cur - 1

            if (doubletap && n === cur) {
                EventBus.$emit('go-previous-chapter')
                return
            }

            if (!this.fullchapter) {
                // just change the visibility of current page and previous page
                if (cur === n) {
                    // this is first scan of the chapter
                    EventBus.$emit('temporary-dialog', { message: this.i18n("reader_alert_firstscan"), duration: 2000})
                    return
                }

                this.currentPage = n
                this.visible = [n]
                window.scroll(0, 0)
                } else {
                // if current page bottom is visible, go to bottom of the current page, if not and top not visible, go to top, else and if there is a previous page go to bottom of previous page
                let curpage = this.$refs.page[this.currentPage]
                if (curpage.bottomInViewport && !curpage.atBottom) { // go to top of the current page
                    this.$scrollTo(curpage.$el, this.animationDuration, {
                    offset: curpage.$el.offsetHeight - window.innerHeight
                    })
                } else if (!curpage.topInViewport) { // go to bottom of the current page
                    this.$scrollTo(curpage.$el, this.animationDuration)
                } else if (n !== cur) { // go to top of the next page
                    this.$scrollTo(this.$refs.page[n].$el, this.animationDuration, {
                    offset: this.$refs.page[n].$el.offsetHeight - window.innerHeight
                    })
                }
            }
        },
        /** Keep the scroll ratio in vertical scrollbar while resizing scans (open drawer, resize window, change layout options...) */
        keepScrollPos(duration = 500) {
            let ratio = this.scrollRatio
            let start = Date.now()
            let keepScrollPosAnime = () => {
                window.scroll(0, document.documentElement.scrollHeight * ratio)
                if (Date.now() - start < duration) {
                    requestAnimationFrame(keepScrollPosAnime)
                }
            }
            keepScrollPosAnime()
        },
        /** Called when a page becomes the new current page (more than half of the viewport) */
        becomeCurrent({index}) {
            this.currentPage = index
            this.visible = [index]
        },
        /** Handle key shortcuts */
        handlekeys() {
            let registerKeys = (e) => {
                e = e || window.event;
                let t = e.target || e.srcElement;
                let prevent = () => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                }
                if (!((t.type && t.type === "text") || t.nodeName.toLowerCase() === "textarea")) {
                    if (!e.shiftKey && !e.altKey) {
                        // Handle double tap events
                        let doubletap = false
                        if (this.lastKeyPress === e.which && 
                        Date.now() - this.lastKeyPressTime <= this.doubleTapDuration) {
                            doubletap = true
                        }
                        this.lastKeyPress = e.which
                        this.lastKeyPressTime = Date.now()

                        if (e.which === 87) { //W
                            window.scrollBy(0, -this.scrollStepWithKeys)
                            prevent()
                        }
                        if (e.which === 83) { //S
                            window.scrollBy(0, this.scrollStepWithKeys)
                            prevent()
                        }
                        if (e.which === 107 || e.which === 187) { //+
                            // keep the scrolling ratio when zooming in
                            this.keepScrollPos(100)
                            this.resize = "none"
                            if (!this.$refs.scantable.style.zoom || this.$refs.scantable.style.zoom === 0) {
                                this.$refs.scantable.style.zoom = 1
                            } else {
                                this.$refs.scantable.style.zoom = this.$refs.scantable.style.zoom * 1.1
                            }
                            prevent()
                        }
                        if (e.which === 109 || e.which === 189) { //-
                            // keep the scrolling ratio when zooming out
                            this.keepScrollPos(100)
                            this.resize = "none"
                            if (!this.$refs.scantable.style.zoom || this.$refs.scantable.style.zoom === 0) {
                                this.$refs.scantable.style.zoom = 1
                            } else {
                                this.$refs.scantable.style.zoom = this.$refs.scantable.style.zoom * 0.9
                            }
                            prevent()
                        }
                        //Left key or A
                        if ((e.which === 37) || (e.which === 65)) {
                            if (window.pageXOffset > 0) { 
                                // scroll horizontally if it is possible
                                window.scrollBy(-this.scrollStepWithKeys, 0);
                            } else {
                                // go to previous scan
                                try {
                                this.goPreviousScan(doubletap)
                                } catch (e) {} // prevent default in any case
                            }
                            prevent()
                        }
                        //Right key or D
                        if ((e.which === 39) || (e.which === 68)) {
                            // go to next scan
                            if ((window.innerWidth + window.pageXOffset) < this.$refs.scantable.offsetWidth) { 
                                // scroll horizontally if it is possible
                                window.scrollBy(this.scrollStepWithKeys, 0);
                            } else {
                                try {
                                this.goNextScan(doubletap)
                                } catch (e) {} // prevent default in any case
                            }
                            prevent()
                        }
                    }
                    if (e.altKey && !e.shiftKey) {
                        // Display current state in the chapter
                        if (e.which === 83) { // alt + s
                            if (this.pages.length > 0) {
                                EventBus.$emit('temporary-dialog', { message: (this.currentPage + 1) + " / " + this.pages.length + "\n**" + Math.floor((this.currentPage + 1) / this.pages.length * 100) + "%**"})
                            }
                            prevent()
                        }
                        // Jump to last scan
                        if ((e.which === 39) || (e.which === 68)) { // alt + d or alt + right arrow
                            this.goScan(this.pages.length - 1)
                            prevent()
                        }
                        // Jump to first scan
                        if ((e.which === 37) || (e.which === 65)) { // alt + a or alt + left arrow
                            this.goScan(0)
                            prevent()
                        }
                        // Jump to random page
                        if (e.which === 82) { // alt + r
                            this.goScan(Math.floor(Math.random() * this.pages.length))
                            prevent()
                        }
                    }
                }
            }
            window.addEventListener('keydown', registerKeys, true);

            //disable default websites shortcuts
            let stopProp = (e) => e.stopImmediatePropagation();
            window.addEventListener('keyup', stopProp, true);
            window.addEventListener('keypress', stopProp, true);
        },
        /** Return page index from scan url */
        getPageIndexFromScanUrl(url) {
            return this.pages.findIndex(scans => scans.find(s => s.src === url))
        },
        /** add overflow:hidden on body if resize in [height, container] and !fullchapter */
        checkResizeOverflow() {
            if (["height", "container"].includes(this.resize) && !this.fullchapter) {
                document.documentElement.style.overflow = "hidden"
                window.scroll(0, 0)
            } else {
                document.documentElement.style.overflow = "auto"
            }
        }
    }
}
</script>

<style>
/** Scans container table */
.amr-scan-container {
  margin-left: auto;
  margin-right: auto;
  min-height: 100vh;
}
.amr-scan-container td {
  padding-bottom: 4px;
  padding-top: 4px;
  line-height: 0;
}
.no-full-chapter .amr-scan-container td {
  padding-bottom: 0px;
  padding-top: 0px;
}
.no-full-chapter, .no-full-chapter > table {
    height: 100%
}
.amr-scan-container td {
  text-align: center;
  vertical-align: middle;
}
/** Create an horizontal scrollbar overflowing the side drawer when necessary (resize=none) */
html {
  max-height:100vh;
  overflow: auto;
}
/** Pages navigator */
.amr-pages-nav {
  height: 110px;
  position: fixed;
  bottom: 0;
  width: 100%;
  padding-bottom: 5px;
  padding-top: 5px;
  opacity: 0;
}
.amr-pages-nav.shrink-draw {
  width: calc(100% - 300px); /* Adjust size of navigator if drawer is opened */
}
.amr-pages-nav.display {
  opacity: 1; /* display navigator when hovered */
}
.amr-thumbs-scrollable { /* navigator container is horizontally scrollable for long chapters */
  overflow: hidden;
  white-space: nowrap;
}
.amr-pages-nav, .amr-pages-nav * {
  transition: all 0.2s;
  line-height: 0;
}
.amr-pages-page-cont {
  margin: 0px 5px;
  display: inline-block;
  background-color: #424242;
  border-radius: 2px;
  opacity: 0.9;
  cursor: pointer;
  vertical-align: middle;
}
.amr-pages-page-cont td {
  vertical-align: middle;
}
.amr-pages-page-cont td img {
  max-height: 80px!important;
}
.amr-pages-page-cont:hover {
  background-color: #ef5350;
}
.amr-pages-page-cont:hover td img {
  max-height: 90px!important;
}
.amr-pages-page-cont.current {
  margin-top:0px;
  background-color: #d32f2f;
}
.amr-pages-page-cont.current td img {
  max-height: 100px!important;
}
.amr-bookmarked-scan {
  cursor: pointer;
}
.amr-bookmarked-scans-cont {
  max-width: 400px;
}
.amr-bookmarked-scans-cont > .layout {
  align-items: center;
  justify-content: center;
}
/* do not force 50% width on thumbs so we don't have vast spaces with background if scans are not the same width */
.amr-pages-nav td.scanContainer.xs6 {
    width: auto;
}
</style>
