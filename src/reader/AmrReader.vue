<template>
  <v-app id="amrapp" :dark="darkreader">
    <!-- Global cover for loading when transition from a chapter to another one -->
    <div v-show="loading" class="amr-transition-cover" :class="darkreader ? 'grey darken-4' : 'grey lighten-5'">
      <v-progress-circular
          indeterminate
          color="primary"
          :size="128"
          :width="12"
          ></v-progress-circular>
    </div>
    <!-- Global component to show confirmation dialogs, alert dialogs / other -->
    <WizDialog ref="wizdialog"></WizDialog>
    <!-- Global component to show bookmarks dialog -->
    <BookmarkPopup ref="book"></BookmarkPopup>
    <!-- Popup displaying shortcuts -->
    <ShortcutsPopup ref="shortcuts"></ShortcutsPopup>
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
            v-if="nextchapLoading && hover && !drawer"
          >
            <v-btn small fab @click.stop="goNextChapter" class="btn-huge">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-progress-circular>
          <v-btn slot="activator" small fab v-if="!nextchapLoading && hover && !drawer" @click.stop="goNextChapter">
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
      ref="navdrawer"
    >
      <v-card :color="backcolor()" class="white--text">
        <!-- Manga Title -->
        <v-card-title class="white--text amr-manga-title">
          <div>
            <div class="headline">
              <v-tooltip bottom>
                <a slot="activator" :href="mirrorDesc.home" v-if="mirrorDesc !== null" target="_blank">
                  <!-- Mirror icon -->
                  <img :src="mirrorDesc.mirrorIcon" ma-1 />
                </a>
                <span>{{i18n("reader_click_go_mirror")}}</span>
              </v-tooltip>
              <v-tooltip bottom>
                <!-- Manga name -->
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
              <v-toolbar flat class="pa-0 amr-chapters-toolbar" my-1>
                <!-- Previous chapter button -->
                <v-tooltip bottom>
                  <v-btn slot="activator" icon v-show="!firstChapter" @click.stop="goPreviousChapter" class="btn-huge">
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
                  :menu-props="{auto: true}"
                  solo dense single-line hide-details class="amr-chapter-select"
                  loading="chapters.length === 0 ? 'primary' : false"
                  @change="goToChapter"
                  attach='.amr-chapter-select'
                ></v-select>
                <v-spacer></v-spacer>
                <v-tooltip bottom v-show="!lastChapter">
                  <!-- Next chapter button -->
                  <v-btn slot="activator" icon @click.stop="goNextChapter" class="btn-huge">
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
              <!-- Reload all scan errors -->
              <v-tooltip bottom class="ml-1">
                <v-btn slot="activator" icon color="red--text" @click.stop="reloadErrors">
                    <v-icon>mdi-replay</v-icon>
                </v-btn>
                <span>{{i18n("content_nav_reload")}}</span>
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
              <v-switch v-model="book" :label="i18n('option_read_book')" hide-details class="pb-1"></v-switch>
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
              <v-switch v-model="fullchapter" :label="i18n('option_read_fullchapter')" hide-details class="pb-1"></v-switch>
            </v-flex>
            <v-flex xs12>
              <!-- Scale Up Image checkbox -->
              <v-switch v-model="scaleUp" :label="i18n('option_read_scaleup')" hide-details class="pb-1"></v-switch>
            </v-flex>
            <v-flex xs12>
              <!-- Webtoon Mode checkbox -->
              <v-switch v-model="webtoonMode" :label="i18n('option_read_webtoon')" hide-details class="pb-1" v-show="fullchapter"></v-switch>
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
              <v-tooltip top>
                <v-btn slot="activator" icon @click="saveOptionsAsDefault(false)" color="primary--text" v-show="layoutDiffFromOptions" class="ma-0">
                  <v-icon>mdi-content-save</v-icon>
                </v-btn>
                <span>{{i18n("reader_button_saveoptions")}}</span>
              </v-tooltip>
              <v-tooltip top>
                <v-btn slot="activator" icon @click="resetOptionsToDefault" color="primary--text" v-show="layoutDiffFromOptions" class="ma-0">
                  <v-icon>mdi-reload</v-icon>
                </v-btn>
                <span>{{i18n("reader_button_resetoptions")}}</span>
              </v-tooltip>
              <v-tooltip top>
                <v-btn slot="activator" icon @click="toggleDark" :color="darkreader ? 'white--text' : 'black--text'" class="ma-0">
                  <v-icon>mdi-brightness-6</v-icon>
                </v-btn>
                <span>{{!darkreader ? i18n("reader_button_dark") : i18n("reader_button_light")}}</span>
              </v-tooltip>
              <v-tooltip top>
                <v-btn slot="activator" icon @click="toggleFullScreen" class="ma-0">
                  <v-icon>{{fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'}}</v-icon>
                </v-btn>
                <span>{{!fullscreen ? i18n("reader_button_fullscreen") : i18n("reader_button_exit_fullscreen")}}</span>
              </v-tooltip>
              <v-tooltip top>
                <v-btn slot="activator" icon @click="openShortcuts" class="ma-0">
                  <v-icon>mdi-keyboard</v-icon>
                </v-btn>
                <span>{{i18n("reader_shortcuts_tooltip")}}</span>
              </v-tooltip>
              <v-tooltip top>
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
    <SocialBar v-show="drawer" />
    <!-- End AMR Reader Side bar -->
    <v-content>
      <Reader ref="reader"
              :book="book" 
              :direction="direction" 
              :fullchapter="fullchapter" 
              :resize="resize"
              :drawer="drawer"
              :webtoonMode="webtoonMode"
              :scaleUp="scaleUp" />
    </v-content>
  </v-app>
</template>

<script>
  import Vue from "vue"
  import browser from "webextension-polyfill";
  import { i18nmixin } from "../mixins/i18n-mixin"

  import mirrorImpl from './state/mirrorimpl';
  import pageData from './state/pagedata';
  import options from './state/options';
  import bookmarks from "./state/bookmarks";

  import util from "./helpers/util";
  import * as dialogs from "./helpers/dialogs";
  import ChapterLoader from "./helpers/ChapterLoader";
  import EventBus from "./helpers/EventBus";

  import Reader from "./components/Reader";
  import Scan from "./components/Scan";
  import WizDialog from "./components/WizDialog";
  import BookmarkPopup from "./components/BookmarkPopup";
  import ShortcutsPopup from "./components/ShortcutsPopup";
  import SocialBar from "./components/SocialBar";
  import { THINSCAN } from '../amr/options';
  
  /** Possible values for resize (readable), the stored value is the corresponding index */
  const resize_values = ['width', 'height', 'container', 'none']

  export default {
    mixins: [i18nmixin],
    data: () => ({
      drawer: false, /* Display the side drawer or not */
      loading: false, /* Display the loading cover */

      chapters: [], /* List of chapters */
      selchap: null, /* Current chapter */
      mirrorDesc: null, /* Current mirror description */

      direction: 'ltr', /* Reading from left to right or right to left */
      book: true, /* Do we display side by side pages */
      resize: 'width', /* Mode of resize : width, height, container */
      fullchapter: true, /* Do we display whole chapter or just current page */
      scaleUp: false, /* Does the image scale up larger than its native size */
      webtoonMode: false, /* Removes whitespace between images for webtoons */

      mangaExists: null, /* Does manga exists in reading list */
      mangaInfos: null, /* specific manga information (layout state, read top, latest read chapter) */

      nextChapterLoader: null, /* A ChapterLoader object to preload next chapter scans */
      nextchapProgress: 0, /* Progression of next chapter loading */

      bookstate: bookmarks.state, /* bookmarks state */
      thinscan: options.thinscan, /* top telling that the chapter is containing thin scans (height >= 3 * width) */

      darkreader: options.darkreader === 1, /* Top for using dark background */
      options: options, /* Make it reactive so update to local options object will be reflected in computed properties */
      fullscreen: window.fullScreen, /* fullscreen window state */

      chaploaded: false, /* Top telling if all scans have been loaded */
      pageData: pageData.state, /* reactive data from pageData */
    }),
    created() {
      /** Register keys */
      this.handlekeys()
      /** Check if manga exists */
      this.checkExists()
      /** Load current manga informations */
      this.loadMangaInformations().then(() => {
        /* retrieve current page if current chapter was the last opened */
        if (util.matchChapUrl(this.pageData.currentChapterURL, this.mangaInfos.currentChapter) && this.mangaInfos.currentScanUrl) {
          // set current page to last currentScanUrl
          EventBus.$emit("go-to-scanurl", this.mangaInfos.currentScanUrl)
        }
      })
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
        this.chaploaded = true
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
      dialogs.handleTips(this.$refs.wizdialog)
      /** Handle help us dialogs once in a while */
      dialogs.handleHelps(this.$refs.wizdialog)

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
              url: this.pageData.currentMangaURL,
              layout: nVal,
              language: this.pageData.language,
              mirror: this.mirror.mirrorName
          })
        }
      },
      webtoonMode(nVal, oVal) {
        if (this.mangaExists) {
          browser.runtime.sendMessage({
              action: "setWebtoonMode",
              url: this.pageData.currentMangaURL,
              webtoon: nVal,
              language: this.pageData.language,
              mirror: this.mirror.mirrorName
          })
        }
      }
    },
    computed: {
      // Current manga informations retrieved from implementation
      manga() {
        return this.pageData
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
        return this.mangaExists && (this.mangaInfos && !util.matchChapUrl(this.mangaInfos.lastchapter, this.pageData.currentChapterURL))
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
      /* Top telling if we already tried loading next chapter */
      nextchapLoading() {
        return this.nextChapterLoader && this.nextChapterLoader.scansProvider
      }
    },
    components: { Reader, Scan, WizDialog, BookmarkPopup, ShortcutsPopup, SocialBar },
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
            url: this.pageData.currentMangaURL, 
            mirror: mirrorImpl.get().mirrorName,
            language: this.pageData.language 
        });
        // Save returned manga informations in state
        this.mangaInfos = specific
        if (specific) this.mangaExists = true
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

        /** Set webtoon option */
        if (specific)
          this.webtoonMode = specific.webtoon || false
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
            url: this.pageData.currentMangaURL, 
            language: this.pageData.language 
        });
        if (alreadyLoadedListChaps && alreadyLoadedListChaps.length > 0) {
            this.chapters = alreadyLoadedListChaps.map(arr => { return { url: arr[1], title: arr[0] } })
        } else {
            let list = []
            // we need to load chapters using background page
            list = await browser.runtime.sendMessage({
                action: "loadListChaps",
                mirror: this.mirror.mirrorName,
                url: this.pageData.currentMangaURL, 
                language: this.pageData.language 
            });
            if (list !== undefined && !Array.isArray(list)) { // case of returned list is an object keys are languages and values are list of mangas
              if (list[this.manga.language] && list[this.manga.language].length > 0) {
                  this.chapters = list[this.manga.language].map(arr => { return { url: arr[1], title: arr[0] } })
              } else { // current language chapter does not exist in returned chapter list... shrödinger case...
                this.chapters = []
              }
            } else if (list.length > 0) { // normal use case, one language
              this.chapters = list.map(arr => { return { url: arr[1], title: arr[0] } })
            } else { // no chapters
              this.chapters = []
            }
        }
        this.chapters.forEach(chap => {
          if (util.matchChapUrl(this.pageData.currentChapterURL, chap.url)) {
              this.selchap = chap.url
              pageData.add("currentChapter", chap.title);
              return false
          }
        })
        if (!this.nextchapLoading && this.chaploaded) {
          // chapters list loading took longer than scans loading... o_O but possible...
          // Preload next chapter
          if (options.prefetch == 1) {
              this.preloadNextChapter();
          }
        }
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
          this.i18n("list_mg_delete_question", this.manga.name, mirrorImpl.get().mirrorName))) {
          await util.deleteManga()
          this.mangaExists = false
        }
      },
      /** Try to delete a chapter loader scans from RAM. Will be effectively deleted later by garbage collector */
      deleteChapterLoader(obj) { // encapsulate chaploader in object to be able to delete it in sctrict mode
        if (obj.chaploader) {
          if (obj.chaploader.scansLoader) delete obj.chaploader.scansLoader
          delete obj.chaploader
        }
      },
      /**
       * Switch the current loaded chapter in the reader to another one
       *  - url : the url of the chapter to load
       */
      async loadChapterInReader(url) {
        // add a covering loader
        this.loading = true
        console.log("Change Reader chapter : load chapter " + url)
        let chap = new ChapterLoader(url)
        await chap.checkAndLoadInfos() // get is a chapter ?, infos (current manga, chapter) and scans urls 
        this.loadChapterInReaderUsingChapterLoader(chap)
      },
      /**
       * Switch the current loaded chapter in the reader to another one
       *  - chapterloader : the chapterloader to load in reader
       */
      async loadChapterInReaderUsingChapterLoader(chapterloader) {
        // delete references to the old chapter loader
        if (window["__current_chapterloader__"] && window["__current_chapterloader__"].url !== chapterloader.url) {
          this.deleteChapterLoader({chaploader: window["__current_chapterloader__"]})
        }
        if (this.nextChapterLoader && this.nextChapterLoader.url !== chapterloader.url) {
          this.deleteChapterLoader({chaploader: this.nextChapterLoader}) // delete loaded next chapter reference if not navigating to this one
        }

        //keep a reference to the one loading
        window["__current_chapterloader__"] = chapterloader

        // reinitialize state of the reader
        this.loading = true
        this.nextChapterLoader = null
        this.nextchapProgress = 0
        this.thinscan = options.thinscan
        this.chaploaded = false
        // change current chapter --> do it now, if not, loadInReader will trigger nextChapterLoad and it will be the current one...
        this.selchap = chapterloader.url
        this.chapters.forEach(chap => {
          if (util.matchChapUrl(this.selchap, chap.url)) {
              pageData.add("currentChapter", chap.title); // actualize chapter name in pageData from chapters list
              return false
          }
        })

        let done = chapterloader.loadInReader(options)
        if (!done) { // loading chapter failed
            // reload chapter so it will be the first time and the restorePage will work properly
            window.location.href = chapterloader.url
        } else {
          // that worked ! scans state and bookmarks state are correctly initialized with new chapter data, pageData with manga url, name and current chapter url too, we now need to tweak the ui

          // prevent pushState from triggering AMR reload
          window["__AMR_IS_LOADING_CHAPTER__"] = true
          // update window history so navigation bar has the right url
          window.history.pushState({title: chapterloader.title}, chapterloader.title, chapterloader.url);

          // reinitialize all $data props so everything goes well
          this.loadMangaInformations()

          // Reader 
          let reader = this.$refs.reader
          reader.originalTitle = chapterloader.title
          document.title = chapterloader.title
          reader.goScan(0)

          /** Handle help us dialogs once in a while */
          dialogs.handleHelps(this.$refs.wizdialog)

          // mark manga as read
          if (options.markwhendownload === 0) {
              this.consultManga()
          }
        }
        this.loading = false
      },
      /** Go read a specific chapter */
      goToChapter() {
        if (this.selchap === null) return
        let cur = this.chapters.findIndex(el => el.url === this.selchap)
        this.loadChapterInReader(this.chapters[cur].url)
      },
      /** Go to next chapter */
      goNextChapter() {
        if (this.lastChapter) { // display an alert because there is no next chapter
            this.$refs.wizdialog.temporary(this.i18n("content_nav_last_chap"), 1000, {important: true})
        }
        if (!this.nextChapter) return
        if (this.nextchapLoading) {
          this.loadChapterInReaderUsingChapterLoader(this.nextChapterLoader)
        } else {
          this.loadChapterInReader(this.nextChapter)
        }
      },
      /** Go to previous chapter */
      goPreviousChapter() {
        if (this.selchap === null) return false
        if (this.firstChapter) { // display an alert because there is no previous chapter
          this.$refs.wizdialog.temporary(this.i18n("reader_alert_firstchapter"), 1000, {important: true})
          return
        }
        let cur = this.chapters.findIndex(el => el.url === this.selchap)
        this.loadChapterInReader(this.chapters[cur + 1].url)
      },
      /** Preloads the next chapter scans */
      async preloadNextChapter() {
          if (!this.nextChapter) return
          util.debug("Loading next chapter...");
          // instanciate a chapter loader for the next chapter
          this.nextChapterLoader = new ChapterLoader(this.nextChapter)
          await this.nextChapterLoader.checkAndLoadInfos() // get is a chapter ?, infos (current manga, chapter) and scans urls 
          if (!this.nextChapterLoader.isAChapter) {
            this.nextChapterLoader = null // next is not recognized as a chapter
          } else {
            // preload the scans
            let scansProvider = this.nextChapterLoader.loadScans()
            /** Compute scans loading progress when a scan is loaded */
            scansProvider.onloadscan = () => {
              let nbloaded = scansProvider.scans.reduce((acc, sc) => acc + (sc.loading ? 0 : 1), 0)
              this.nextchapProgress = Math.floor(nbloaded / scansProvider.scans.length * 100)
            }
          }
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
              if (e.which === 66) { //b
                // previous chapter
                this.goPreviousChapter()
                prevent()
              }
              if (e.which === 78) { //n
                // next chapter
                this.goNextChapter()
                prevent()
              }
              if (e.which === 112) { //F1
                this.openShortcuts()
                prevent()
              }
            }
            if (e.shiftKey && !e.altKey) {
              // Go to next chapter
              if ((e.which === 39) || (e.which === 68)) { // shift + d or shift + right arrow
                  this.goNextChapter()
                  prevent()
              }
              // Go to previous chapter
              if ((e.which === 37) || (e.which === 65)) { // shift + a or shift + left arrow
                  this.goPreviousChapter()
                  prevent()
              }
              // Toggle drawer
              if (e.which === 77) { // shift + m
                this.drawer = !this.drawer
                prevent()
              }
              // Switch resizes mode
              if (e.which === 67) { // shift + c
                if (!this.fullchapter) this.resize = "container"
                prevent()
              }
              if (e.which === 87) { // shift + w
                this.resize = "width"
                prevent()
              }
              if (e.which === 72) { // shift + h
                if (!this.fullchapter) this.resize = "height"
                prevent()
              }
              // Switch fullchapter
              if (e.which === 70) { // shift + f
                this.fullchapter = !this.fullchapter
                prevent()
              }
              // Switch book
              if (e.which === 66) { // shift + b
                this.book = !this.book
                prevent()
              }
              // Switch direction
              if (e.which === 68) { // shift + d
                this.direction = this.direction === 'ltr' ? 'rtl' : 'ltr'
                prevent()
              }
              // Add manga to reading list
              if (e.which === 107 || e.which === 187) { // shift + '+'
                if (!this.mangaExists && this.options.addauto === 0) this.addManga()
                prevent()
              }
              // Remove manga from reading list
              if (e.which === 109 || e.which === 54) { // shift + '-'
                if (this.mangaExists) this.deleteManga()
                prevent()
              }
              // Pause / Play notifications on manga
              if (e.which === 80) { // shift + p
                if (this.mangaExists && this.mangaInfos) {
                  if (this.mangaInfos.read === 1) this.markReadTop(0)
                  else this.markReadTop(1)
                  prevent()
                }
              }
              // Mark current chapter as latest read
              if (e.which === 76) { // shift + l
                if (this.showLatestRead) this.markAsLatest()
                prevent()
              }
              // Reload all errored scans
              if (e.which === 82) { // alt + r
                this.reloadErrors()
                prevent()
              }
            }
            if (e.altKey && !e.shiftKey) {
              // Display current manga name, chapter name and progression in the manga
              if (e.which === 67) { // alt + c
                let chapName = "", chapPos = 0
                if (this.selchap !== null && this.chapters.length !== 0) {
                  let chap = this.chapters.findIndex(el => el.url === this.selchap)
                  if (chap >= 0) {
                    chapName = this.chapters[chap].title
                    chapPos = this.chapters.length - chap
                  }
                }

                let str = "**" + this.manga.name + "**\n"
                str += (chapName === "" ? this.i18n("reader_display_chapname_none") : chapName) + "\n"
                if (this.chapters.length > 0) {
                  str += this.i18n("reader_display_chap_progression", 
                    chapPos, 
                    this.chapters.length, 
                    Math.floor(chapPos / this.chapters.length * 100))
                }

                this.$refs.wizdialog.temporary(str, 2000)
                prevent()
              }
            }
            if (e.shiftKey && e.altKey) {
              // Jump to last chapter
              if ((e.which === 39) || (e.which === 68)) { // alt + shift + d or alt + shift + right arrow
                  this.selchap = this.chapters[0].url
                  this.goToChapter()
                  prevent()
              }
              // Jump to first chapter
              if ((e.which === 37) || (e.which === 65)) { // alt + shift + a or alt + shift + left arrow
                  this.selchap = this.chapters[this.chapters.length - 1].url
                  this.goToChapter()
                  prevent()
              }
              // Go to random chapter
              if (e.which === 82) { // alt + shift + r
                  this.selchap = this.chapters[Math.floor(Math.random() * this.chapters.length)].url
                  this.goToChapter()
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
      /** Open shortcuts popup */
      openShortcuts() {
        this.$refs.shortcuts.open()
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
      async saveOptionsAsDefault(force = false) {
        if (!force) {
          if (!await this.$refs.wizdialog.confirm(
            this.i18n("reader_save_options_title"), 
            this.i18n("reader_save_options_confirm"))) {
              return
          }
        }
        this.options.displayBook = this.book ? 1 : 0
        this.options.readingDirection = this.direction === "ltr" ? 0 : 1
        this.options.displayFullChapter = this.fullchapter ? 1 : 0
        this.options.resizeMode = resize_values.findIndex(val => val === this.resize)
        util.saveOption("displayBook", this.options.displayBook)
        util.saveOption("readingDirection", this.options.readingDirection)
        util.saveOption("displayFullChapter", this.options.displayFullChapter)
        util.saveOption("resizeMode", this.options.resizeMode)
        if (!force) this.$refs.wizdialog.temporary(this.i18n("action_done"))
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
        dialogs.handleTips(this.$refs.wizdialog, true)
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
        if (this.thinscan === THINSCAN.no_adjust || (!this.book && !["height", "container"].includes(this.resize))) {
          return // parameters are already adapted for thin scans
        }

        if (this.thinscan === THINSCAN.adjust) {
          return this.adjustThinScan();
        }

        // Must be asking user
        const modalResult = await this.$refs.wizdialog.yesno(
            this.i18n("reader_thinscan_title"),
            this.i18n("reader_thinscan_description")
        );

        if (modalResult) {
            this.adjustThinScan();
            this.thinscan = THINSCAN.adjust;
        } else {
          this.thinscan = THINSCAN.no_adjust;
        }
      },
      adjustThinScan() {
        this.book = false
        if (["height", "container"].includes(this.resize)) {
          this.resize = "width"
        }
      },
      reloadErrors() {
        EventBus.$emit('reload-all-errors')
      }
    }
  }
</script>

<style>
#amrapp {
  width: 100%;
}
/** Drawer content below menu button */
.amr-drawer {
  padding-top:36px;
  padding-bottom:64px;
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
/** Break work in chapter title */
.amr-drawer .v-select {
  white-space: pre-wrap;
  word-break: break-word;
}
/** button font size bigger */
.btn-huge .v-icon {
  font-size: 250%!important;
}
/** To prevent select to be too small due to large padding */
.v-toolbar.pa-0 .v-toolbar__content {
  padding: 0px 5px;
}
/** So the dropdown can hover the rest... */
.amr-chapters-toolbar {
  z-index: 8;
}
.amr-chapters-toolbar .v-toolbar__content {
  height: auto!important;
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
/** Scrollbars style (only works for chrome, firefox does not support that */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-thumb {
  background: #ddd;
}
::-webkit-scrollbar-track {
  background: #666;
}
/** Loading cover */
.amr-transition-cover {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: fixed;
  opacity: 0.8;
  z-index: 42; /* Because when you search for a high z-index, 42 is always the right answer */
  text-align: center;
  display: block;
}
.amr-transition-cover .v-progress-circular {
   position: absolute;
   top: 50%;
   left: 50%;
   width: 128px;
   height: 128px;
   margin-top: -64px; /* Half the height */
   margin-left: -64px; /* Half the width */
}
</style>
