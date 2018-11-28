<template>
  <v-app id="inspire" dark>
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
          <v-btn slot="activator" small fab v-show="hover && !drawer" @click.stop="goNextChapter">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <span>Go to next chapter</span>
        </v-tooltip>
        <v-tooltip left v-show="lastChapter">
          <v-btn slot="activator" small fab v-show="hover && !drawer" color="orange--text">
            <v-icon>mdi-alert</v-icon>
          </v-btn>
          <span>This is the latest published chapter !</span>
        </v-tooltip>
        <!-- Quick button to add a manga to reading list -->
        <v-tooltip left v-show="!mangaExists && options.addauto === 0">
          <v-btn slot="activator" small fab v-show="hover && !drawer" color="green--text" @click.stop="addManga">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <span>Add this manga to your reading list</span>
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
              <a :href="mirrorDesc.home" v-if="mirrorDesc !== null" target="_blank">
                <img :src="mirrorDesc.mirrorIcon" ma-1 />
              </a>
              <a :href="manga.currentMangaURL" target="_blank">{{manga.name}}</a>
            </div>
          </div>
        </v-card-title>
        <!-- Chapters navigation -->
        <v-card-actions>
          <v-layout row wrap>
            <v-flex xs12>
              <v-toolbar flat class="pa-0" my-1>
                <v-btn icon v-show="!firstChapter" @click.stop="goPreviousChapter">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-select
                  v-model="selchap"
                  :items="chapters"
                  item-text="title"
                  item-value="url"
                  solo dense single-line class="amr-chapter-select" 
                  loading="chapters.length === 0 ? 'primary' : false"
                  @change="goToChapter"
                ></v-select>
                <v-spacer></v-spacer>
                <v-btn icon v-show="!lastChapter" @click.stop="goNextChapter">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </v-toolbar>
            </v-flex>
            <!-- Action buttons -->
            <v-flex xs12 text-xs-center pa-2>
              <v-btn icon color="yellow--text">
                  <v-icon>mdi-star</v-icon>
              </v-btn>
              <v-btn icon color="orange--text">
                  <v-icon>mdi-page-last</v-icon>
              </v-btn>
              <v-btn icon color="green--text" v-show="!mangaExists && options.addauto === 0" @click.stop="addManga">
                  <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn icon color="blue--text">
                  <v-icon>mdi-pause</v-icon>
              </v-btn>
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
              <v-switch v-model="book" label="Display as a book (side by side scans)"></v-switch>
            </v-flex>
            <!-- Reading direction -->
            <v-flex xs6 align-self-center v-show="book">
              <div class="subheading">Reading direction</div>
            </v-flex>
            <v-flex xs6 v-show="book">
              <v-btn-toggle v-model="direction">
                <v-btn flat value="ltr">
                  <!--<span>Left to right</span>-->
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn flat value="rtl">
                  <!--<span>Right to left</span>-->
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-flex>
            <v-flex xs12>
              <!-- Display full chapter checkbox -->
              <v-switch v-model="fullchapter" label="Display full chapter (if unchecked, display current page)"></v-switch>
            </v-flex>
            <v-flex xs6 align-self-center v-show="!fullchapter">
              <!-- Resize mode -->
              <div class="subheading">Resize scans</div>
            </v-flex>
            <v-flex xs6 v-show="!fullchapter">
              <v-btn-toggle v-model="resize">
                <v-btn flat value="width">
                  <!--<span>Width</span>-->
                  <v-icon>mdi-arrow-expand-horizontal</v-icon>
                </v-btn>
                <v-btn flat value="height">
                  <!--<span>Height</span>-->
                  <v-icon>mdi-arrow-expand-vertical</v-icon>
                </v-btn>
                <v-btn flat value="container">
                  <!--<span>Container</span>-->
                  <v-icon>mdi-arrow-expand-all</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-flex>
          </v-layout>
        </v-card-title>
      </v-card>
    </v-navigation-drawer>
    <!-- End AMR Reader Side bar -->
    <v-content>
      <v-container fluid fill-height grid-list-md text-xs-center pa-0 
        :class="{'no-full-chapter': !fullchapter}">
        <!-- Scans -->
        <v-layout row wrap>
          <Page v-for="(scans, i) in pages" :key="i" 
              :scans="scans" 
              @loaded-scan="loadedScan" 
              :direction="direction"
              :resize="resize"
              ref="page" v-show="isVisible(i)" />
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import Vue from "vue"
  import browser from "webextension-polyfill";

  import mirrorImpl from '../content/mirrorimpl';
  import pageData from '../content/pagedata';
  import options from '../content/options';
  import util from "./util";

  import Page from "./Page";

const resize_values = ['width', 'height', 'container', 'none']

  export default {
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
      currentPage: 0, 

      originalTitle: document.title,
      mangaExists: null
    }),
    props: {
      images: Array /* List of scans to display, not necessarily pictures but urls that the implementation can handle to render a scan */
    },
    created() {
      /** Check if manga exists */
      this.checkExists()
      /** Initialize key handlers */
      this.handlekeys()
      /** Load current layout mode */
      this.loadLayoutMode()
      /** Load current bar state (drawer visible or not) */
      this.loadBarState()
    },
    mounted() {
      /* Load chapters list */
      this.loadChapters()
      /* Load mirror */
      this.loadMirror()
      
      // mark manga as read
      if (options.markwhendownload === 0) {
          util.consultManga()
      }
    },
    watch: {
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
          return this.images.map(img => [img])
        } else {
          return this.regroupablePages
        }
      }, 
      /** True if latest published chapter */
      lastChapter() {
        if (this.selchap === null || this.chapters.length === 0) return true
        return this.chapters.findIndex(el => el.url === this.selchap) === 0
      },
      /** True if first published chapter */
      firstChapter() {
        if (this.selchap === null || this.chapters.length === 0) return true
        return this.chapters.findIndex(el => el.url === this.selchap) === this.chapters.length - 1
      },
      layoutValue() {
        let cbook = this.book ? 1 : 0, 
            cdirection = this.direction === 'ltr' ? 0 : 1,
            cfullchapter = this.fullchapter ? 1 : 0,
            cresize = resize_values.findIndex(r => r === this.resize)
        
        return 1000 * cbook + 100 * cdirection + 10 * cfullchapter + cresize
      }
    },
    components: { Page },
    methods: {
      async checkExists() {
        this.mangaExists = await util.mangaExists()
      },
      async loadBarState() {
        let barState = await browser.runtime.sendMessage({action: "barState"})
        if (barState) {
          this.drawer = parseInt(barState.barVis) === 1
        }
      },
      async loadLayoutMode() {
        //Get specific mode for currentManga
        let cbook = -1, cdirection = -1, cfullchapter = -1, cresize = -1
        let specific = await browser.runtime.sendMessage({ 
            action: "mangaInfos", 
            url: pageData.currentMangaURL, 
            language: pageData.language 
        });
        if (specific && specific.layout) {
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
              if ((i - lastfull > 1 || lastfull === 0) && (i - lastfull) % 2 !== 0) {
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
          let curPage = 0
          let regrouped = []
          for (let sc of scans) {
            if (!regrouped[curPage]) {
              regrouped[curPage] = [sc.url]
            } else {
              regrouped[curPage].push(sc.url)
            }
            if (sc.full || regrouped[curPage].length === 2) {
              curPage++
            }
          }

          this.regroupablePages.length = 0;
          this.regroupablePages.push(...regrouped)
          this.chaploaded = true
          document.title = this.originalTitle
          if (options.prefetch == 1) {
              this.preloadNextChapter();
          }
          if (options.markwhendownload === 1) {
              util.consultManga();
          }
        }
      },
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
              pageData.currentChapter = chap.title;
              return false
          }
        })
      },
      async addManga() {
        await util.consultManga(true)
        this.mangaExists = true
      },
      goToChapter() {
        if (this.selchap === null) return
        let cur = this.chapters.findIndex(el => el.url === this.selchap)
        window.location.href = this.chapters[cur].url
      },
      goNextChapter() {
        if (this.selchap === null) return
        if (this.lastChapter) return
        let cur = this.chapters.findIndex(el => el.url === this.selchap)
        window.location.href = this.chapters[cur - 1].url
      },
      goPreviousChapter() {
        if (this.selchap === null) return false
        if (this.firstChapter) return
        let cur = this.chapters.findIndex(el => el.url === this.selchap)
        window.location.href = this.chapters[cur + 1].url
      },
      preloadNextChapter() {
        //TODO
      },
      goNextScan() {
        let cur = this.currentPage, n = cur
        if (cur + 1 < this.pages.length) n = cur + 1
        if (cur === n) return

        this.currentPage = n
        this.visible = [n]
      },
      goPreviousScan() {
        let cur = this.currentPage, n = cur
        if (cur - 1 >= 0) n = cur - 1
        if (cur === n) return

        this.currentPage = n
        this.visible = [n]
      },
      handlekeys() {
        let self = this;
        let registerKeys = (e) => {
            e = e || window.event;
            let t = e.target || e.srcElement;
            if (!((t.type && t.type == "text") || t.nodeName.toLowerCase() == "textarea")) {
                if (e.which == 87) { //W
                    window.scrollBy(0, -40);
                }
                if (e.which == 83) { //S
                    window.scrollBy(0, 40);
                }
                if (e.which == 107 || e.which == 187) { //+
                    //this.zoomin();
                }
                if (e.which == 109 || e.which == 189) { //-
                    //this.zoomout();
                }
                if (e.which == 66) { //b
                    // previous chapter
                    this.goPreviousChapter()
                }
                if (e.which == 78) { //n
                    // next chapter
                    this.goNextChapter()
                }
                if (options.lrkeys == 1) {
                    //Left key or A
                    if ((e.which == 37) || (e.which == 65)) {
                        // go to previous scan
                        this.goPreviousScan()
                        e.preventDefault()
                        e.stopPropagation()
                        e.stopImmediatePropagation()
                    }
                    //Right key or D
                    if ((e.which == 39) || (e.which == 68)) {
                        // go to next scan
                        this.goNextScan()
                        e.preventDefault()
                        e.stopPropagation()
                        e.stopImmediatePropagation()
                    }
                }
            }
        }
        window.addEventListener('keydown', registerKeys, true);

        //disable default websites shortcuts
        let stopProp = (e) => e.stopImmediatePropagation();
        if (options.lrkeys == 1) {
            window.addEventListener('keyup', stopProp, true);
            window.addEventListener('keypress', stopProp, true);
        }
      }
    }
  }
</script>

<style>
.amr-drawer {
  padding-top:36px;
}
.amr-manga-title div {
 margin-left: auto;
 margin-right: auto;
}
.amr-manga-title img {
  vertical-align: middle;
}
.amr-manga-title a { 
  color: white;
  text-decoration: none;
  vertical-align: middle;
}
/** To prevent select to be too small due to large padding */
.v-toolbar.pa-0 .v-toolbar__content {
  padding: 0px 5px;
}
/** To prevent select to be multiline and overflow the manga title */
/*.amr-chapter-select {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.amr-chapter-select .v-select__slot {
  overflow: hidden;
}*/
/*
.v-card__actions .v-btn-toggle .v-btn+.v-btn {
    margin-left: 0px;
}
*/
.opacity-full {
  opacity: 1;
}
.opacity-transparent {
  opacity: 0.7;
}
.fab-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 4;
}
.container.grid-list-md .layout .flex {
    padding: 4px;
}
.container.grid-list-md.no-full-chapter .layout .flex {
    padding: 0px 4px;
}
</style>
