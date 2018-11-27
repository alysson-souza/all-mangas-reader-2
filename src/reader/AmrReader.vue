<template>
  <v-app id="inspire" dark>
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
            <div class="headline white--text"><img :src="mirror.mirrorIcon" /><a :href="manga.currentMangaURL" target="_blank">{{manga.name}}</a></div>
          </div>
        </v-card-title>
        <!-- Chapters navigation -->
        <v-card-actions>
          <v-layout row wrap>
            <v-flex xs12>
              <v-toolbar flat class="pa-0" my-1>
                <v-btn icon>
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-select
                  v-model="selchap"
                  :items="chapters"
                  item-text="title"
                  item-value="url"
                  solo dense single-line class="amr-chapter-select" 
                  loading="chapters.length === 0 ? 'primary' : false"
                ></v-select>
                <v-spacer></v-spacer>
                <v-btn icon>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </v-toolbar>
            </v-flex>
            <v-flex xs12 text-xs-center pa-2>
              <v-btn icon color="yellow--text">
                  <v-icon>mdi-star</v-icon>
              </v-btn>
              <v-btn icon color="orange--text">
                  <v-icon>mdi-page-last</v-icon>
              </v-btn>
              <v-btn icon color="green--text">
                  <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn icon color="blue--text">
                  <v-icon>mdi-pause</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
      <v-card color="grey darken-2" class="white--text">
        <v-card-title>
          <v-layout row wrap>
            <v-flex xs12>
              <!-- Display book checkbox -->
              <v-switch v-model="book" label="Display as a book (side by side scans)"></v-switch>
            </v-flex>
            <v-flex xs6 align-self-center>
              <div class="subheading">Reading direction</div>
            </v-flex>
            <v-flex xs6>
              <v-btn-toggle v-model="direction" v-show="book">
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
            <v-flex xs6 align-self-center>
              <!-- Resize mode -->
              <div class="subheading">Resize scans</div>
            </v-flex>
            <v-flex xs6>
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
      <v-container fluid fill-height grid-list-md text-xs-center pa-0 class="p-a-0">
        <!-- Button to open side bar -->
        <v-btn color="red darken-2" dark small fixed top right fab @click.stop="drawer = !drawer">
          <v-icon>mdi-add</v-icon>
        </v-btn>
        <!-- Scans -->
        <v-layout row wrap>
          <Page v-for="(scans, i) in pages" :key="i" 
              :scans="scans" 
              @loaded-scan="loadedScan" 
              :direction="direction"
              ref="page" />
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

  export default {
    data: () => ({
      drawer: null, /* Display the side drawer or not */

      chapters: [], /* List of chapters */
      selchap: null, /* Current chapter */

      direction: 'ltr', /* Reading from left to right or right to left */
      book: true, /* Do we display side by side pages */
      resize: 'width', /* Mode of resize : width, height, container */
      fullchapter: true, /* Do we display whole chapter or just current page */

      chaploaded: false, /* True if all scans have been loaded */
      regroupablePages: [], /* How to regroup pages to make a book */
      visible: [], /* List of indexes of visible pages, used when not fullchapter, one one in list except for transitions */
      originalTitle: document.title
    }),
    props: {
      images: Array /* List of scans to display, not necessarily pictures but urls that the implementation can handle to render a scan */
    },
    mounted() {
      /* Load chapters list */
      this.loadChapters()
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
      /* Current displayed pages */
      pages() {
        /* First, list of pages is single scan pages with all the chapter's scans */
        if (!this.chaploaded || !this.book) {
          return this.images.map(img => [img])
        } else {
          return this.regroupablePages
        }
      }, 
    },
    components: { Page },
    methods: {
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
              this.selchap = chap
              pageData.currentChapter = chap.title;
              return false
          }
        })
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
.amr-manga-title a { 
  color: white;
  text-decoration: none;
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
</style>
