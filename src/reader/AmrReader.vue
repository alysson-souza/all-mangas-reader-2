<template>
  <v-app id="inspire" :dark="darkreader">
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
      :class="'amr-drawer ' + backcolor()"
    >
      <v-card :color="backcolor()" class="white--text">
        <!-- Manga Title -->
        <v-card-title class="white--text amr-manga-title">
          <div>
            <div class="headline">
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
                    :color="(!darkreader ? 'grey ' : '') + (bookstate.booked ? 'yellow--text' : 'yellow--text text--lighten-4')">
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
                      :color="!darkreader ? (bookstate.booked ? 'yellow grey--text text--darken-3' : 'yellow grey--text') : (bookstate.booked ? 'yellow--text' : 'yellow--text text--lighten-4')">
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
                        <v-flex xs4 v-for="(scan, i) in bookedScans" :key="i" @click.stop="$refs.reader.goScan(scan.page)" class="amr-bookmarked-scan">
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
      <v-card :color="backcolor(1)" class="white--text">
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
            <v-flex xs12 text-xs-center mt-2>
              <v-tooltip bottom>
                <v-btn slot="activator" icon @click="saveOptionsAsDefault" color="primary--text" v-show="layoutDiffFromOptions" class="ma-0">
                  <v-icon>mdi-content-save</v-icon>
                </v-btn>
                <span>{{i18n("reader_button_saveoptions")}}</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn slot="activator" icon @click="resetOptionsToDefault" color="primary--text" v-show="layoutDiffFromOptions" class="ma-0">
                  <v-icon>mdi-reload</v-icon>
                </v-btn>
                <span>{{i18n("reader_button_resetoptions")}}</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn slot="activator" icon @click="toggleDark" :color="darkreader ? 'white--text' : 'black--text'" class="ma-0">
                  <v-icon>mdi-brightness-6</v-icon>
                </v-btn>
                <span>{{!darkreader ? i18n("reader_button_dark") : i18n("reader_button_light")}}</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn slot="activator" icon @click="toggleFullScreen" class="ma-0">
                  <v-icon>{{fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'}}</v-icon>
                </v-btn>
                <span>{{!fullscreen ? i18n("reader_button_fullscreen") : i18n("reader_button_exit_fullscreen")}}</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn slot="activator" icon @click="displayTips" color="blue--text" class="ma-0">
                  <v-icon>mdi-lightbulb-on</v-icon>
                </v-btn>
                <span>{{i18n("reader_button_tips")}}</span>
              </v-tooltip>
            </v-flex>
          </v-layout>
        </v-card-title>
      </v-card>
    </v-navigation-drawer>
    <!-- End AMR Reader Side bar -->
    <v-content>
      <Reader ref="reader"
              :images="images" 
              :book="book" 
              :direction="direction" 
              :fullchapter="fullchapter" 
              :resize="resize"
              :drawer="drawer" />
    </v-content>
  </v-app>
</template>

<script>
  import Vue from "vue"

  import browser from "webextension-polyfill";
  import {i18nmixin} from "../mixins/i18n-mixin"

  import mirrorImpl from '../content/mirrorimpl';
  import pageData from '../content/pagedata';
  import options from '../content/options';
  import util from "./util";

  import Reader from "./Reader";
  import Scan from "./Scan";
  import WizDialog from "./WizDialog";
  import BookmarkPopup from "./BookmarkPopup";
  import bookmarks from "./bookmarks";
  import EventBus from "./EventBus";

  /** Possible values for resize (readable), the stored value is the corresponding index */
  const resize_values = ['width', 'height', 'container', 'none']

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

      mangaExists: null, /* Does manga exists in reading list */
      mangaInfos: null, /* specific manga information (layout state, read top, latest read chapter) */

      nextchapLoading: false, /* Is next chapter prefetching */
      nextchapProgress: 0, /* Progress of next chap loading */

      bookstate: bookmarks.state, /* bookmarks state */
      thinscan: false, /* top telling that the chapter is containing thin scans (height >= 3 * width) */

      darkreader: options.darkreader === 1, /* Top for using dark background */
      options: options, /* Make it reactive so update to local options object will be reflected in computed properties */
      fullscreen: window.fullScreen, /* fullscreen window state */
    }),
    props: {
      images: Array /* List of scans to display, not necessarily pictures but urls that the implementation can handle to render a scan */
    },
    created() {
      /** Check if manga exists */
      this.checkExists()
      /** Load current manga informations */
      this.loadMangaInformations()
      /** Load current bar state (drawer visible or not) */
      this.loadBarState()
      /** Listen to global bus events */
      EventBus.$on('open-bookmarks', (obj) => { // request to open bookmarks popup
        this.$refs.book.open(obj)
      })
      EventBus.$on('thin-scan', (obj) => { // a thin scan (height >= 3 * width) has been detected
        this.handleThinScan()
      })
      EventBus.$on('go-next-chapter', (obj) => { // go to next chapter
        this.goNextChapter()
      })
      EventBus.$on('go-previous-chapter', (obj) => { // go to previous chapter
        this.goPreviousChapter()
      })
      EventBus.$on('temporary-dialog', (obj) => { // display a temporary message
        this.$refs.wizdialog.temporary(obj.message, obj.duration)
      })
      EventBus.$on('chapter-loaded', (obj) => { // consult current manga
        // Preload next chapter
        if (options.prefetch == 1) {
            this.preloadNextChapter();
        }
        // Mark current chapter as read if option mark as read when dowloaded checked
        if (options.markwhendownload === 1) {
            this.consultManga()
        }
      })
    },
    mounted() {
      /* Load chapters list */
      this.loadChapters()
      /* Load mirror */
      this.loadMirror()
      
      /** Handle first time reader is opened */
      this.handleFirstTime()
      /** Handle tips */
      this.handleTips()

      // mark manga as read
      if (options.markwhendownload === 0) {
          this.consultManga()
      }
    },
    watch: {
      /** Change resize value if passing from !fullchapter to fullchapter (height and container are no more available) */
      fullchapter(nVal, oVal) {
        if (nVal && !oVal) {
          if (['height', 'container'].includes(this.resize)) {
            this.resize = "width"
          }
        }
      },
      /** Keep drawer state */
      drawer(nVal, oVal) {
        browser.runtime.sendMessage({
            action: "setBarState",
            barstate: nVal ? 1 : 0
        })
      },
      /**
       * Update the specific layout value for the current manga
       */
      layoutValue(nVal, oVal) {
        // check if nVal <> options val ; if not reset layout to undefined
        let optVal = this.options.displayBook * 1000 + this.options.readingDirection * 100 + this.options.displayFullChapter * 10 + this.options.resizeMode
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
      // Current manga informations retrieved from implementation
      manga() {
        return pageData
      },
      // Current mirror implementation
      mirror() {
        return mirrorImpl.get()
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
          sc.page = this.$refs.reader.getPageIndexFromScanUrl(sc.url)
          return sc
        })
      },
      layoutDiffFromOptions() {
        if (this.book !== (this.options.displayBook === 1)) return true
        if (this.direction !== (this.options.readingDirection === 0 ? 'ltr' : 'rtl')) return true
        if (this.fullchapter !== (this.options.displayFullChapter === 1)) return true
        if (this.resize !== (resize_values[this.options.resizeMode])) return true
        return false
      },
    },
    components: { Reader, Scan, WizDialog, BookmarkPopup },
    methods: {
      /** Return drawer background color taking a light into account and the dark or not back */
      backcolor(light = 0) {
        return "grey " + (!this.darkreader ? 'lighten-' + (4 - light) : 'darken-' + (4 - light))
      },
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
        if (cbook === -1) cbook = this.options.displayBook
        if (cdirection === -1) cdirection = this.options.readingDirection
        if (cfullchapter === -1) cfullchapter = this.options.displayFullChapter
        if (cresize === -1) cresize = this.options.resizeMode
        // Set current layout
        this.book = cbook === 1
        this.direction = cdirection === 0 ? 'ltr': 'rtl'
        this.fullchapter = cfullchapter === 1
        this.resize = resize_values[cresize]
      },
      /** Load mirror description (containing icon and home page) */
      async loadMirror() {
        this.mirrorDesc = await browser.runtime.sendMessage({
            action: "mirrorInfos",
            name: this.mirror.mirrorName
        });
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
      /** Change updating mode for this manga (1 : stop updating, 0 : check updates) */
      async markReadTop(nTop) {
        await util.markReadTop(nTop)
        this.loadMangaInformations()
      },
      /** Mark current chapter as latest read in reading list */
      async markAsLatest() {
        if (await this.$refs.wizdialog.confirm(
            this.i18n("content_nav_mark_read"), 
            this.i18n("content_nav_mark_read_confirm"))) {
          await util.markAsLatest()
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
          await util.deleteManga()
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
        if (this.lastChapter) { // display an alert because there is no next chapter
            this.$refs.wizdialog.temporary(this.i18n("content_nav_last_chap"))
        }
        if (!this.nextChapter) return
        window.location.href = this.nextChapter
      },
      /** Go to previous chapter */
      goPreviousChapter() {
        if (this.selchap === null) return false
        if (this.firstChapter) { // display an alert because there is no previous chapter
          this.$refs.wizdialog.temporary(this.i18n("reader_alert_firstchapter"))
          return
        }
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
      /** Handle key shortcuts */
      handlekeys() {
        let registerKeys = (e) => {
          e = e || window.event;
          let t = e.target || e.srcElement;

          if (!((t.type && t.type === "text") || t.nodeName.toLowerCase() === "textarea")) {
            if (e.which === 66) { //b
                // previous chapter
                this.goPreviousChapter()
            }
            if (e.which === 78) { //n
                // next chapter
                this.goNextChapter()
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
      /** Save current layout options as the default ones */
      async saveOptionsAsDefault(force) {
        if (force || await this.$refs.wizdialog.confirm(
            this.i18n("reader_save_options_title"), 
            this.i18n("reader_save_options_confirm"))) {
              this.options.displayBook = this.book ? 1 : 0
              this.options.readingDirection = this.direction === "ltr" ? 0 : 1
              this.options.displayFullChapter = this.fullchapter ? 1 : 0
              this.options.resizeMode = resize_values.findIndex(val => val === this.resize)
              util.saveOption("displayBook", this.options.displayBook)
              util.saveOption("readingDirection", this.options.readingDirection)
              util.saveOption("displayFullChapter", this.options.displayFullChapter)
              util.saveOption("resizeMode", this.options.resizeMode)
              if (!force) this.$refs.wizdialog.temporary(this.i18n("action_done"))
        }
      },
      /** Reset current layout options to the default ones */
      resetOptionsToDefault() {
        this.book = this.options.displayBook === 1
        this.direction = this.options.readingDirection === 0 ? 'ltr' : 'rtl'
        this.fullchapter = this.options.displayFullChapter === 1
        this.resize = resize_values[this.options.resizeMode]
        this.$refs.wizdialog.temporary(this.i18n("action_done"))
      },
      /** Toggle dark / light theme and save option */
      toggleDark() {
        this.darkreader = !this.darkreader
        util.saveOption("darkreader", this.darkreader ? 1 : 0)
      },
      /** Display tips popup */
      displayTips() {
        this.handleTips(true)
      },
      /** Toggle full screen mode */
      toggleFullScreen() {
        if (this.fullscreen) { /** Exit full screen mode */
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) { /* Chrome, and Opera */
            document.webkitExitFullscreen();
          }
        } else { /** Request full screen mode */
          let elem = document.documentElement
          if (elem.requestFullscreen) {
            elem.requestFullscreen()
          } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen()
          } else if (elem.webkitRequestFullscreen) { /* Chrome, and Opera */
            elem.webkitRequestFullscreen()
          }
        }
        this.fullscreen = ! this.fullscreen        
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
          let butclose = {
            title: this.i18n("button_close"),
            color: "grey",
            click: ({ agree }) => {
              agree()
            }
          }
          await this.$refs.wizdialog.open(
            this.i18n("reader_tips_title"), 
            await nextTip(), { 
              cancel: false, 
              buttons: force ? [butclose, butnexttip] : [butstop, butnexttip, butnexttomorrow]
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
              this.saveOptionsAsDefault(true)
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
              this.saveOptionsAsDefault(true)
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
  color: #424242;
  text-decoration: none;
  vertical-align: middle;
  word-break: break-word;
  font-weight: bold;
}
.theme--dark .amr-manga-title a {
  color: white;
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
</style>
