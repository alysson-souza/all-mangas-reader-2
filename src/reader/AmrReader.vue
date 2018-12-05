<template>
  <v-app id="inspire" dark>
    <!-- Global component to show confirmation dialogs, alert dialogs / other -->
    <WizDialog ref="wizdialog"></WizDialog>
    <!-- Global component to show bookmarks dialog -->
    <BookmarkPopup ref="book"></BookmarkPopup>
    <!-- Global always visible buttons -->
    <v-hover>
      <v-layout column class="fab-container" slot-scope="{ hover }">
        <!-- Button to open side drawer -->
        <v-btn 
          :class="`elevation-${hover ? 12 : 2} opacity-${hover || drawer ? 'full':'transparent'}`"
          color="red darken-2" dark small fab @click.stop="drawer = !drawer">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <!-- Quick button to go to next chapter -->
        <v-tooltip left v-show="!lastChapter">
          <v-progress-circular slot="activator" class="amr-floting-progress"
            :rotate="90"
            :size="42"
            :width="3"
            :value="nextchapProgress"
            color="red darken-2"
            v-show="nextchapLoading && hover && !drawer"
          >
            <v-btn small fab @click.stop="goNextChapter">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-progress-circular>
          <v-btn slot="activator" small fab v-show="!nextchapLoading && hover && !drawer" @click.stop="goNextChapter">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <span>{{i18n("list_mg_act_next")}} {{nextchapLoading ? i18n("reader_loading", Math.floor(nextchapProgress)) : ""}}</span>
        </v-tooltip>
        <v-tooltip left v-show="lastChapter">
          <v-btn slot="activator" small fab v-show="hover && !drawer" color="orange--text">
            <v-icon>mdi-alert</v-icon>
          </v-btn>
          <span>{{i18n("content_nav_last_chap")}}</span>
        </v-tooltip>
        <!-- Quick button to add a manga to reading list -->
        <v-tooltip left v-show="!mangaExists && options.addauto === 0">
          <v-btn slot="activator" small fab v-show="hover && !drawer" color="green--text" @click.stop="addManga">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <span>{{i18n("content_nav_add_list")}}</span>
        </v-tooltip>
      </v-layout>
    </v-hover>
    <!-- AMR Reader side bar -->
    <v-navigation-drawer
      v-model="drawer"
      clipped
      right
      fixed
      app
      class="amr-drawer grey darken-4"
    >
      <v-card color="grey darken-4" class="white--text">
        <!-- Manga Title -->
        <v-card-title class="white--text amr-manga-title">
          <div>
            <div class="headline white--text">
              <v-tooltip bottom>
                <a slot="activator" :href="mirrorDesc.home" v-if="mirrorDesc !== null" target="_blank">
                  <img :src="mirrorDesc.mirrorIcon" ma-1 />
                </a>
                <span>{{i18n("reader_click_go_mirror")}}</span>
              </v-tooltip>
              <v-tooltip bottom>
                <a slot="activator" :href="manga.currentMangaURL" target="_blank">{{manga.name}}</a>
                <span>{{i18n("reader_click_go_manga")}}</span>
              </v-tooltip>
            </div>
          </div>
        </v-card-title>
        <!-- Chapters navigation -->
        <v-card-actions>
          <v-layout row wrap>
            <v-flex xs12>
              <v-toolbar flat class="pa-0" my-1>
                <!-- Previous chapter button -->
                <v-tooltip bottom>
                  <v-btn slot="activator" icon v-show="!firstChapter" @click.stop="goPreviousChapter">
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  <span>{{i18n("list_mg_act_prev")}}</span>
                </v-tooltip>
                <!-- List of chapters -->
                <v-select
                  v-model="selchap"
                  :items="chapters"
                  item-text="title"
                  item-value="url"
                  menu-props="auto"
                  solo dense single-line hide-details class="amr-chapter-select"
                  loading="chapters.length === 0 ? 'primary' : false"
                  @change="goToChapter"
                ></v-select>
                <v-spacer></v-spacer>
                <v-tooltip bottom v-show="!lastChapter">
                  <!-- Next chapter button -->
                  <v-btn slot="activator" icon @click.stop="goNextChapter">
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                  <span>{{i18n("list_mg_act_next")}} {{nextchapLoading ? i18n("reader_loading", Math.floor(nextchapProgress)) : ""}}</span>
                </v-tooltip>
              </v-toolbar>
            </v-flex>
            <!-- Next chapter preloading progression bar -->
            <v-flex xs12 class="amr-chapter-progress-cont">
              <v-tooltip bottom v-show="nextchapLoading">
                <v-progress-linear slot="activator" class="amr-floting-progress"
                  :height="3"
                  :value="nextchapProgress"
                  color="red darken-2"
                ></v-progress-linear>
                <span>{{i18n("reader_next_chap", Math.floor(nextchapProgress))}}</span>
              </v-tooltip>
            </v-flex>
            <!-- Action buttons -->
            <v-flex xs12 text-xs-center pa-2>
              <v-menu offset-y>
                <!-- Bookmarks button -->
                <v-tooltip bottom slot="activator" class="ml-1">
                  <v-btn slot="activator" icon 
                    :color="bookstate.booked ? 'yellow--text' : 'yellow--text text--lighten-4'">
                      <v-icon>mdi-star</v-icon>
                  </v-btn>
                  <span>{{i18n("content_nav_click_bm")}}</span>
                </v-tooltip>
                <!-- Menu displayed when bookmarks button activate -->
                <v-card>
                  <!-- Bookmark note of the chapter -->
                  <v-card-title v-if="bookstate.note">
                    {{i18n("reader_bookmarked_note", bookstate.note)}}
                  </v-card-title>
                  <v-card-actions>
                    <!-- Action to update / delete bookmark for chapter > open popup -->
                    <v-btn @click="bookmarkChapter" 
                      :color="bookstate.booked ? 'yellow--text' : 'yellow--text text--lighten-4'">
                      <v-icon>mdi-star</v-icon>&nbsp;
                      {{ bookstate.booked ? 
                        i18n("reader_bookmark_update") :  
                        i18n("reader_bookmark_create") }}
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom>
                      <v-btn slot="activator" icon @click="openBookmarksTab" color="blue">
                        <v-icon>mdi-open-in-new</v-icon>
                      </v-btn>
                      <span>{{i18n("reader_open_bookmarks_tab")}}</span>
                    </v-tooltip>
                  </v-card-actions>
                  <v-card-text>
                    <!-- No bookmarked scans in chapter -->
                    <div v-if="bookedScans.length === 0">
                      {{i18n("reader_no_bookmarked_scans")}}
                    </div>
                    <!-- List of bookmarked scans -->
                    <v-container pa-0 grid-list-md v-else class="amr-bookmarked-scans-cont">
                      <v-layout row wrap>
                        <v-flex xs4 v-for="(scan, i) in bookedScans" :key="i" @click.stop="goScan(scan.page)" class="amr-bookmarked-scan">
                          <v-tooltip bottom v-if="scan.note">
                            <Scan slot="activator" :full="false" 
                              :src="scan.url"
                              resize="container"
                              :bookmark="false" />
                              <span>{{scan.note}}</span>
                          </v-tooltip>
                          <Scan v-else slot="activator" :full="false" 
                              :src="scan.url"
                              resize="container"
                              :bookmark="false" />
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-menu>
              <!-- Mark as latest chapter read button -->
              <v-tooltip bottom class="ml-1">
                <v-btn slot="activator" icon color="orange--text" 
                  v-show="showLatestRead" @click.stop="markAsLatest">
                    <v-icon>mdi-page-last</v-icon>
                </v-btn>
                <span>{{i18n("content_nav_mark_read")}}</span>
              </v-tooltip>
              <!-- Add to reading list button -->
              <v-tooltip bottom class="ml-1">
                <v-btn slot="activator" icon color="green--text" 
                  v-show="!mangaExists && options.addauto === 0" @click.stop="addManga">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <span>{{i18n("content_nav_add_list")}}</span>
              </v-tooltip>
              <!-- Remove from reading list button -->
              <v-tooltip bottom class="ml-1">
                <v-btn slot="activator" icon color="red--text" 
                  v-show="mangaExists" @click.stop="deleteManga">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <span>{{i18n("reader_delete_manga")}}</span>
              </v-tooltip>
              <!-- Pause following updates on manga -->
              <v-tooltip bottom v-show="mangaExists && mangaInfos && mangaInfos.read === 0" class="ml-1">
                <v-btn slot="activator" icon color="blue--text" @click.stop="markReadTop(1)">
                    <v-icon>mdi-pause</v-icon>
                </v-btn>
                <span>{{i18n("content_nav_stopfollow")}}</span>
              </v-tooltip>
              <!-- Follow updates on manga -->
              <v-tooltip bottom v-show="mangaExists && mangaInfos && mangaInfos.read === 1" class="ml-1">
                <v-btn slot="activator" icon color="blue--text" @click.stop="markReadTop(0)">
                    <v-icon>mdi-play</v-icon>
                </v-btn>
                <span>{{i18n("content_nav_follow")}}</span>
              </v-tooltip>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
      <!-- Display options -->
      <v-card color="grey darken-3" class="white--text">
        <v-card-title>
          <v-layout row wrap>
            <v-flex xs12>
              <!-- Display book checkbox -->
              <v-switch v-model="book" :label="i18n('option_read_book')"></v-switch>
            </v-flex>
            <!-- Reading direction -->
            <v-flex xs12 v-show="book" text-xs-center>
              <v-btn-toggle v-model="direction">
                <v-tooltip bottom>
                  <v-btn slot="activator" flat value="ltr">
                    <!--<span>Left to right</span>-->
                    <v-icon>mdi-arrow-right</v-icon>
                  </v-btn>
                  <span>{{i18n("option_read_book_ltr")}}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn flat slot="activator" value="rtl">
                    <!--<span>Right to left</span>-->
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                  <span>{{i18n("option_read_book_rtl")}}</span>
                </v-tooltip>
              </v-btn-toggle>
            </v-flex>
            <v-flex xs12>
              <!-- Display full chapter checkbox -->
              <v-switch v-model="fullchapter" :label="i18n('option_read_fullchapter')"></v-switch>
            </v-flex>
            <!-- Resize mode -->
            <v-flex xs12 text-xs-center>
              <v-btn-toggle v-model="resize">
                <v-tooltip bottom>
                  <v-btn slot="activator" flat value="width">
                    <!--<span>Width</span>-->
                    <v-icon>mdi-arrow-expand-horizontal</v-icon>
                  </v-btn>
                  <span>{{i18n("option_read_resize_w")}}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn slot="activator" flat value="height" v-show="!fullchapter">
                    <!--<span>Height</span>-->
                    <v-icon>mdi-arrow-expand-vertical</v-icon>
                  </v-btn>
                  <span>{{i18n("option_read_resize_h")}}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn slot="activator" flat value="container" v-show="!fullchapter">
                    <!--<span>Container</span>-->
                    <v-icon>mdi-arrow-expand-all</v-icon>
                  </v-btn>
                  <span>{{i18n("option_read_resize_c")}}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn slot="activator" flat value="none">
                    <!--<span>None</span>-->
                    <v-icon>mdi-border-none-variant</v-icon>
                  </v-btn>
                  <span>{{i18n("option_read_resize_n")}}</span>
                </v-tooltip>
              </v-btn-toggle>
            </v-flex>
          </v-layout>
        </v-card-title>
      </v-card>
    </v-navigation-drawer>
    <!-- End AMR Reader Side bar -->
    <v-content>
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
    </v-content>
  </v-app>
</template>

<script>
  import Vue from "vue"
  import {scroller} from 'vue-scrollto/src/scrollTo'

  import browser from "webextension-polyfill";
  import {i18nmixin} from "../mixins/i18n-mixin"

  import mirrorImpl from '../content/mirrorimpl';
  import pageData from '../content/pagedata';
  import options from '../content/options';
  import util from "./util";

  import Page from "./Page";
  import Scan from "./Scan";
  import WizDialog from "./WizDialog";
  import BookmarkPopup from "./BookmarkPopup";
  import bookmarks from "./bookmarks";
  import EventBus from "./EventBus";

  /** Possible values for resize (readable), the stored value is the corresponding index */
  const resize_values = ['width', 'height', 'container', 'none']
  /** Create a custom scroller (alias of $scrollTo method) to enable multiple scrollings (thumbs scroll simultaneously page scroll) */
  const thumbsScroller = scroller()
  let currentlyThumbsScrolling = false

  export default {
    mixins: [i18nmixin],
    data: () => ({
      drawer: false, /* Display the side drawer or not */

      chapters: [], /* List of chapters */
      selchap: null, /* Current chapter */
      mirrorDesc: null, /* Current mirror description */

      direction: 'ltr', /* Reading from left to right or right to left */
      book: true, /* Do we display side by side pages */
      resize: 'width', /* Mode of resize : width, height, container */
      fullchapter: true, /* Do we display whole chapter or just current page */

      chaploaded: false, /* True if all scans have been loaded */
      regroupablePages: [], /* How to regroup pages to make a book */
      visible: [0], /* List of indexes of visible pages, used when not fullchapter, one one in list except for transitions */
      currentPage: 0, /* Current displayed page */

      originalTitle: document.title, /* Original title of the page */
      mangaExists: null, /* Does manga exists in reading list */
      mangaInfos: null, /* specific manga information (layout state, read top, latest read chapter) */

      nextchapLoading: false, /* Is next chapter prefetching */
      nextchapProgress: 0, /* Progress of next chap loading */

      animationDuration: 250, /* Duration of scrolls animation when navigating with keys */
      scrollStepWithKeys: 50, /* Scroll step with keys when need to scroll by steps */
      lastKeyPressTime: 0, /* Last time a key was pressed (to detect double tap) */
      lastKeyPress: 0, /* Last key pressed */
      doubleTapDuration: 250, /* Laps of time between two events to be considered as doubletap */
      scrollRatio: 0, /* Keep the scroll ratio (scrollY / total) to restore position when resizing display zone */

      bookstate: bookmarks.state, /* bookmarks state */
      thinscan: false, /* top telling that the chapter is containing thin scans (height >= 3 * width) */
    }),
    props: {
      images: Array /* List of scans to display, not necessarily pictures but urls that the implementation can handle to render a scan */
    },
    created() {
      /** Check if manga exists */
      this.checkExists()
      /** Initialize key handlers */
      this.handlekeys()
      /** Load current manga informations */
      this.loadMangaInformations()
      /** Load current bar state (drawer visible or not) */
      this.loadBarState()
      /** Keep scroll ratio */
      window.addEventListener('scroll', () => {
        this.scrollRatio = window.pageYOffset / document.documentElement.scrollHeight
      });
      /** Keep scroll ratio when resizing */
      window.addEventListener('resize', () => {
        this.keepScrollPos(10)
      });
      /** Listen to global bus events */
      EventBus.$on('open-bookmarks', (obj) => { // request to open bookmarks popup
        this.$refs.book.open(obj)
      })
      EventBus.$on('thin-scan', (obj) => { // a thin scan (height >= 3 * width) has been detected
        this.handleThinScan()
      })
      /** Handle first time reader is opened */
      this.handleFirstTime()
      /** Handle tips */
      this.handleTips()
    },
    mounted() {
      /* Load chapters list */
      this.loadChapters()
      /* Load mirror */
      this.loadMirror()
      
      /* Load scans in order if option is set */
      if (options.imgorder === 1) {
        this.loadScansInOrder()
      }

      // mark manga as read
      if (options.markwhendownload === 0) {
          this.consultManga()
      }
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
      /** Change resize value if passing from !fullchapter to fullchapter (height and container are no more available) */
      fullchapter(nVal, oVal) {
        if (nVal && !oVal) {
          if (['height', 'container'].includes(this.resize)) {
            this.resize = "width"
          }
          this.$nextTick(() => {
            this.$scrollTo(this.$refs.page[this.currentPage].$el, -1) /* use -1 cause 0 not taken into account */
          })
        } else {
          window.scroll(0, 0)
        }
      },
      /** Keep drawer state */
      drawer(nVal, oVal) {
        this.keepScrollPos() // keep the scrolling ratio when opening / closing drawer !
        browser.runtime.sendMessage({
            action: "setBarState",
            barstate: nVal ? 1 : 0
        })
      },
      resize(nVal, oVal) {
        this.keepScrollPos(100) // keep the scrolling ratio when changing resize mode
        if (nVal !== 'none') {
          this.$refs.scantable.style.zoom = 1
        }
      },
      book(nVal, oVal) { // keep the scrolling ratio when changing book mode / not really relevant but better than nothing...
        this.keepScrollPos(100)
      },
      /**
       * Update the specific layout value for the current manga
       */
      layoutValue(nVal, oVal) {
        // check if nVal <> options val ; if not reset layout to undefined
        let optVal = options.displayBook * 1000 + options.readingDirection * 100 + options.displayFullChapter * 10 + options.resizeMode
        if (optVal === nVal) {
          nVal = undefined
        }
        // Update current value only if manga is in reading list
        if (this.mangaExists) {
          browser.runtime.sendMessage({
              action: "setLayoutMode",
              url: pageData.currentMangaURL,
              layout: nVal,
              language: pageData.language,
              mirror: this.mirror.mirrorName
          })
        }
      }
    },
    computed: {
      /** Options made accessible in dom */
      options() {
        return options
      },
      // Current manga informations retrieved from implementation
      manga() {
        return pageData
      },
      // Current mirror implementation
      mirror() {
        return mirrorImpl.get()
      },
      /* Current displayed pages */
      pages() {
        /* First, list of pages is single scan pages with all the chapter's scans */
        if (!this.chaploaded || !this.book) {
          return this.images.map((img, i) => [{src: img, name: '' + (i + 1)}])
        } else {
          return this.regroupablePages
        }
      }, 
      /** True if latest published chapter */
      lastChapter() {
        if (this.selchap === null || this.chapters.length === 0) return true
        return this.chapters.findIndex(el => el.url === this.selchap) === 0
      },
      /** Next chapter url */
      nextChapter() {
        if (this.selchap === null) return
        if (this.lastChapter) return
        let cur = this.chapters.findIndex(el => el.url === this.selchap)
        return this.chapters[cur - 1].url
      },
      /** True if first published chapter */
      firstChapter() {
        if (this.selchap === null || this.chapters.length === 0) return true
        return this.chapters.findIndex(el => el.url === this.selchap) === this.chapters.length - 1
      },
      /** The layout value for this manga, a value containing all specific reading options */
      layoutValue() {
        let cbook = this.book ? 1 : 0, 
            cdirection = this.direction === 'ltr' ? 0 : 1,
            cfullchapter = this.fullchapter ? 1 : 0,
            cresize = resize_values.findIndex(r => r === this.resize)
        
        return 1000 * cbook + 100 * cdirection + 10 * cfullchapter + cresize
      },
      /** can you mark this chapter as latest read */
      showLatestRead() {
        return this.mangaExists && (this.mangaInfos && !util.matchChapUrl(this.mangaInfos.lastchapter, pageData.currentChapterURL))
      },
      /** list of bookmarked scans urls */
      bookedScans() {
        return this.bookstate.scans.filter(sc => sc.booked).map(sc => {
          sc.page = this.pages.findIndex(scans => scans.find(s => s.src === sc.url))
          return sc
        })
      }
    },
    components: { Page, Scan, WizDialog, BookmarkPopup },
    methods: {
      /** Inform background that current chapter has been read (will update reading state and eventually add manga to list) */
      async consultManga(force) {
        await util.consultManga(force)
        await this.loadMangaInformations() // reload last chapter read
      },
      /** Check if current manga is in reading list */
      async checkExists() {
        this.mangaExists = await util.mangaExists()
      },
      /** Load the state of the side bar (hidden / shown) */
      async loadBarState() {
        let barState = await browser.runtime.sendMessage({action: "barState"})
        if (barState) {
          this.drawer = parseInt(barState.barVis) === 1
        }
      },
      /** Load current manga preferences (layout mode, read top, latest read chapter) */
      async loadMangaInformations() {
        //Get specific informations for currentManga (layout mode, reading mode, lastest read chapter)
        let cbook = -1, cdirection = -1, cfullchapter = -1, cresize = -1
        let specific = await browser.runtime.sendMessage({ 
            action: "mangaInfos", 
            url: pageData.currentMangaURL, 
            language: pageData.language 
        });
        // Save returned manga informations in state
        this.mangaInfos = specific
        // Compute current layout
        if (specific && specific.layout) { // check specific layout for the current manga
            let l = specific.layout;
            cbook = Math.floor(l / 1000)
            l -= 1000 * cbook
            cdirection = Math.floor(l / 100)
            l -= 100 * cdirection
            cfullchapter = Math.floor(l / 10)
            l -= 10 * cfullchapter
            cresize = l
        }
        //If not use default options mode
        if (cbook === -1) cbook = options.displayBook
        if (cdirection === -1) cdirection = options.readingDirection
        if (cfullchapter === -1) cfullchapter = options.displayFullChapter
        if (cresize === -1) cresize = options.resizeMode
        // Set current layout
        this.book = cbook === 1
        this.direction = cdirection === 0 ? 'ltr': 'rtl'
        this.fullchapter = cfullchapter === 1
        this.resize = resize_values[cresize]
      },
      /** 
       * Determine if a page should be shown.
       * Always true if fullChapter mode, just current page if not
       */
      isVisible(page_index) {
        return this.fullchapter || this.visible.includes(page_index)
      },
      /** Load mirror description (containing icon and home page) */
      async loadMirror() {
        this.mirrorDesc = await browser.runtime.sendMessage({
            action: "mirrorInfos",
            name: this.mirror.mirrorName
        });
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
              if ((i - lastfull) % 2 !== 0)  {
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
          // Preload next chapter
          if (options.prefetch == 1) {
              this.preloadNextChapter();
          }
          // Mark current chapter as read if option mark as read when dowloaded checked
          if (options.markwhendownload === 1) {
              this.consultManga()
          }
        }
      },
      /** Load chapters list for current manga */
      async loadChapters() {
        // try to get list chap from background (already loaded in local db)
        let alreadyLoadedListChaps = await browser.runtime.sendMessage({
            action: "getListChaps",
            url: pageData.currentMangaURL, 
            language: pageData.language 
        });
        if (alreadyLoadedListChaps && alreadyLoadedListChaps.length > 0) {
            this.chapters = alreadyLoadedListChaps.map(arr => { return { url: arr[1], title: arr[0] } })
        } else {
            // Change currentMangaURL so no conflict in http over https
            let list = await mirrorImpl.get().getListChaps(
                pageData.currentMangaURL.replace(/(^\w+:|^)/, '')
            )
            this.chapters = list.map(arr => { return { url: arr[1], title: arr[0] } })
        }
        this.chapters.forEach(chap => {
          if (util.matchChapUrl(pageData.currentChapterURL, chap.url)) {
              this.selchap = chap.url
              pageData.add("currentChapter", chap.title);
              return false
          }
        })
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
      /** Change updating mode for this manga (1 : stop updating, 0 : check updates) */
      async markReadTop(nTop) {
        await browser.runtime.sendMessage({
            action: "markReadTop",
            url: pageData.currentMangaURL,
            read: nTop,
            updatesamemangas: true, 
            language: pageData.language
        })
        this.loadMangaInformations()
      },
      /** Mark current chapter as latest read in reading list */
      async markAsLatest() {
        if (await this.$refs.wizdialog.confirm(
            this.i18n("content_nav_mark_read"), 
            this.i18n("content_nav_mark_read_confirm"))) {
          await browser.runtime.sendMessage({
            action: "setMangaChapter",
            url: pageData.currentMangaURL,
            mirror: mirrorImpl.get().mirrorName,
            lastChapterReadName: pageData.currentChapter,
            lastChapterReadURL: pageData.currentChapterURL,
            name: pageData.name, 
            language: pageData.language
          })
          this.loadMangaInformations()
        }
      },
      /** Add the current manga to reading list */
      async addManga() {
        await this.consultManga(true)
        this.mangaExists = true
      },
      /** Remove the current manga from reading list */
      async deleteManga() {
        if (await this.$refs.wizdialog.confirm(
          this.i18n("list_mg_act_delete"), 
          this.i18n("list_mg_delete_question", pageData.name, mirrorImpl.get().mirrorName))) {
          await browser.runtime.sendMessage({
            action: "deleteManga", 
            url: pageData.currentMangaURL,
            mirror: mirrorImpl.get().mirrorName,
            language: pageData.language
          })
          this.mangaExists = false
        }
      },
      
      /** Go read a specific chapter */
      goToChapter() {
        if (this.selchap === null) return
        let cur = this.chapters.findIndex(el => el.url === this.selchap)
        window.location.href = this.chapters[cur].url
      },
      /** Go to next chapter */
      goNextChapter() {
        if (!this.nextChapter) return
        window.location.href = this.nextChapter
      },
      /** Go to previous chapter */
      goPreviousChapter() {
        if (this.selchap === null) return false
        if (this.firstChapter) return
        let cur = this.chapters.findIndex(el => el.url === this.selchap)
        window.location.href = this.chapters[cur + 1].url
      },
      /** Preloads the next chapter scans */
      async preloadNextChapter() {
          if (!this.nextChapter) return
          util.debug("Loading next chapter...");
          // load an iframe with urlNext and get list of images
          let resp = await browser.runtime.sendMessage({
              action: "getNextChapterImages",
              url: this.nextChapter,
              mirrorName: mirrorImpl.get().mirrorName, 
              language: pageData.language 
          });
          let lst = resp.images
          if (lst !== null) {
              let nbloaded = 0
              let nextChapterImageLoaded = (e) => {
                nbloaded++
                this.nextchapProgress = nbloaded / lst.length * 100
              }
              this.nextchapLoading = true
              util.debug(lst.length + "... scans to load");
              for (let i = 0; i < lst.length; i++) {
                  let img = new Image();
                  img.addEventListener('load', nextChapterImageLoaded, false);
                  img.addEventListener('error', nextChapterImageLoaded, false);
                  (async () => await mirrorImpl.get().getImageFromPageAndWrite(lst[i], img))()
              }
          } else {
              util.debug("no scans found for next chapter...");
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
          if (this.lastChapter) { // display an alert because there is no next chapter
            this.$refs.wizdialog.temporary(this.i18n("content_nav_last_chap"))
          }
          this.goNextChapter()
          return
        }
        
        if (!this.fullchapter) {
          // just change the visibility of current page and next page
          if (cur === n) {
            // this is latest scan of the chapter
            this.$refs.wizdialog.temporary(this.i18n("reader_alert_lastscan"), 2000)
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
          if (this.firstChapter) { // display an alert because there is no previous chapter
            this.$refs.wizdialog.temporary(this.i18n("reader_alert_firstchapter"))
          }
          this.goPreviousChapter()
          return
        }

        if (!this.fullchapter) {
          // just change the visibility of current page and previous page
          if (cur === n) {
            // this is first scan of the chapter
            this.$refs.wizdialog.temporary(this.i18n("reader_alert_firstscan"), 2000)
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

          if (!((t.type && t.type === "text") || t.nodeName.toLowerCase() === "textarea")) {
            // Handle double tap events
            let doubletap = false
            if (this.lastKeyPress === e.which && 
              Date.now() - this.lastKeyPressTime <= this.doubleTapDuration) {
                doubletap = true
            }
            this.lastKeyPress = e.which
            this.lastKeyPressTime = Date.now()

            if (e.which === 87) { //W
              window.scrollBy(0, -this.scrollStepWithKeys);
            }
            if (e.which === 83) { //S
              window.scrollBy(0, this.scrollStepWithKeys);
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
            }
            if (e.which === 66) { //b
              // previous chapter
              this.goPreviousChapter()
            }
            if (e.which === 78) { //n
              // next chapter
              this.goNextChapter()
            }
            //Left key or A
            if ((e.which === 37) || (e.which === 65)) {
              if (window.pageXOffset > 0) {
                window.scrollBy(-this.scrollStepWithKeys, 0);
              } else {
                // go to previous scan
                try {
                  this.goPreviousScan(doubletap)
                } catch (e) {} // prevent default in any case
              }

              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation()
            }
            //Right key or D
            if ((e.which === 39) || (e.which === 68)) {
              // go to next scan
              if ((window.innerWidth + window.pageXOffset) < this.$refs.scantable.offsetWidth) {
                window.scrollBy(this.scrollStepWithKeys, 0);
              } else {
                try {
                  this.goNextScan(doubletap)
                } catch (e) {} // prevent default in any case
              }
              
              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation()
            }
          }
        }
        window.addEventListener('keydown', registerKeys, true);

        //disable default websites shortcuts
        let stopProp = (e) => e.stopImmediatePropagation();
        window.addEventListener('keyup', stopProp, true);
        window.addEventListener('keypress', stopProp, true);
      },
      /** Open popup to bookmark chapter with note */
      bookmarkChapter() {
        this.$refs.book.open()
      },
      /** Open AMR bookmarks in a new tab */
      openBookmarksTab() {
        browser.runtime.sendMessage({
            action: "opentab",
            url: "/pages/bookmarks/bookmarks.html"
        });
      },
      /** 
       * Display tips
       *  - user can choose to display tips once a day or to stop it
       *  - button next go to next tip
       *  - saves previous tip and user preferences
       *  - force : force to display the popup (called on tips action button)
       * All the tips are retrieved from i18n starting by reader_tips_ followed with numbers starting from 1. Numbers must be consecutive
       */
      async handleTips(force = false) {
        let display = true
        if (!force) {
          let lasttime = await util.getStorage("reader_tips_ts")
          let stopped = await util.getStorage("reader_tips_stop")
          if (stopped) display = false
          if (lasttime && Date.now() - parseInt(lasttime) < 24 * 60 * 60 * 1000) {
            display = false
          }
        }
        if (force) display = true
        if (display) {
          let lasttip = await util.getStorage("reader_tips_last")
          if (lasttip !== null) lasttip = parseInt(lasttip)
          let tips = [], tip
          while (tip = this.i18n("reader_tips_" + (tips.length + 1))) {
            tips.push(tip)
          }
          let nextTip = async () => {
            if (lasttip === null || lasttip + 1 >= tips.length) lasttip = -1
            let nxttip = lasttip + 1
            await util.setStorage("reader_tips_last", ""+nxttip)
            lasttip = nxttip
            return tips[nxttip]
          }
          // Button to stop displaying tips
          let butstop = {
            title: this.i18n("reader_tips_stop"),
            color: "grey",
            click: async ({ agree }) => {
              await util.setStorage("reader_tips_stop", "true")
              agree()
            }
          }
          let butnexttip = {
            title: this.i18n("reader_tips_next"),
            color: "primary",
            click: async ({ changeMessage }) => {
              changeMessage(await nextTip())
            }
          }
          let butnexttomorrow = {
            title: this.i18n("reader_tips_next_tomorrow"),
            color: "primary",
            click: ({ agree }) => {
              agree()
            }
          }
          await this.$refs.wizdialog.open(
            this.i18n("reader_tips_title"), 
            await nextTip(), { 
              cancel: false, 
              buttons: [butstop, butnexttip, butnexttomorrow],
              important: true
            })
          await util.setStorage("reader_tips_ts", "" + Date.now())
        }
      },
      /** Called on reader's creation, display a welcome message first time reader is opened */
      async handleFirstTime() {
        let isfirst = await util.getStorage("reader_firsttime")
        if (!isfirst) {
          // Button to set default layout with preferde choice : long strip 
          let butlongstrip = {
            title: this.i18n("reader_firsttime_but_longstrip"),
            color: "primary",
            click: ({ agree }) => {
              this.fullchapter = true
              this.resize = "width"
              this.book = window.innerWidth >= 1200 // display as a book is screen is wide enough
              agree()
            }
          }
          // Button to set default layout with preferde choice : single page
          let butsingle = {
            title: this.i18n("reader_firsttime_but_single"),
            color: "primary",
            click: ({ agree }) => {
              this.fullchapter = false
              this.resize = window.innerHeight >= 800 ? "container" : "width" // resize container if screen is tall enough
              this.book = window.innerWidth >= 1200 // display as a book is screen is wide enough
              agree()
            }
          }
          await this.$refs.wizdialog.open(
            this.i18n("reader_firsttime_title"), 
            this.i18n("reader_firsttime_description"), { 
              cancel: false, 
              buttons: [butlongstrip, butsingle],
              important: true
            })
          await util.setStorage("reader_firsttime", "true")
        }
      },
      /** Called when a thin scan (height >= 3 * width) is detected */
      async handleThinScan() {
        if (this.thinscan) return // already handled
        this.thinscan = true
        if (!this.book && !["height", "container"].includes(this.resize)) return // parameters are already adapted for thin scans
        if (await this.$refs.wizdialog.yesno(
          this.i18n("reader_thinscan_title"), 
          this.i18n("reader_thinscan_description"))) {
            this.book = false
            if (["height", "container"].includes(this.resize)) {
              this.resize = "width"
            }
        }
      }
    }
  }
</script>

<style>
/** Drawer content below menu button */
.amr-drawer {
  padding-top:36px;
}
/** Center manga title */
.amr-manga-title div {
 margin-left: auto;
 margin-right: auto;
 text-align: center;
}
/** Align mirror icon */
.amr-manga-title img {
  vertical-align: middle;
}
/** Manga title link */
.amr-manga-title a { 
  color: white;
  text-decoration: none;
  vertical-align: middle;
  word-break: break-word;
}
/** To prevent select to be too small due to large padding */
.v-toolbar.pa-0 .v-toolbar__content {
  padding: 0px 5px;
}
.opacity-full {
  opacity: 1;
}
.opacity-transparent {
  opacity: 0.7;
}
/** Floating buttons */
.fab-container {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 4;
}
.fab-container .amr-floting-progress {
  margin-top: 6px;
  margin-left: 6px;
}
/** Progress bars for next chapter loading */
.amr-floting-progress .v-btn {
  width: 36px;
  height: 36px;
}
.amr-chapter-progress-cont {
  height: 3px;
}
.amr-chapter-progress-cont .v-progress-linear {
  margin: 0px;
}
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
</style>
