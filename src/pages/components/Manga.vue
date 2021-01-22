<template>
  <tr :class="color(0)">
    <td>
      <v-tooltip top content-class="icon-ttip">
        <template v-slot:activator="{ on }">
          <img v-if="isMirrorEnabled" :src="mirror.mirrorIcon" class="mirror-icon" v-on="on" />
          <v-icon v-if="!isMirrorEnabled" v-on="on">mdi-cancel</v-icon>
        </template>
        <span>{{ isMirrorEnabled ? mirror.mirrorName : i18n("list_mirror_disabled_tooltip", firstManga.mirror) }}</span>
      </v-tooltip>
      {{ firstManga.name }}
    </td>
    <td>{{ firstManga.mirror }} - {{ mirror.mirrorName }}</td>
    <td>{{ firstManga.url }}</td>
    <td>{{ selValue }}</td>
  </tr>
</template>

<script>
import i18n from "../../amr/i18n";
import { mapGetters } from "vuex";
import browser from "webextension-polyfill";
import * as utils from "../utils";
import * as amrutils from "../../amr/utils";
import Flag from "./Flag";

export default {
  data() {
    return {
      // current selected chapter in the select, used to handle click in select list
      selChapter: this.manga.lastChapterReadURL,
      // current state of other grouped mangas panel
      expanded: false,
      // delete manga popup state
      deleteManga: false,
      // list of languages state
      displayLangs: false
    };
  },
  // property to load the component with --> the manga it represents
  props: [
    // the manga to display
    "mangas",
    "firstManga"
  ],
  computed: {
    // current selected value
    selValue: function() {
      return amrutils.chapPath(this.manga.lastChapterReadURL);
    },
    // AMR options
    options: function() {
      return this.$store.state.options;
    },
    // determine if this manga has new published chapters
    hasNew: function() {
      return utils.hasNew(this.manga);
    },
    // determine if this manga has been read entirely
    hasBeenRead: function() {
      return utils.hasBeenRead(this.manga);
    },
    // mirror for current chapter
    mirror: function() {
      return this.$store.state.mirrors.all.find(
        mir => mir.mirrorName === this.manga.mirror
      );
    },
    isMirrorEnabled: function () {
      const mirror = this.$store.state.mirrors.all.find(
          mir => mir.mirrorName === this.manga.mirror
      );
      return mirror && !mirror.disabled;
    },
    // format chapters list to be displayed
    chapsForSelect: function() {
      return this.manga.listChaps.map(arr => {
        return { value: amrutils.chapPath(arr[1]), text: arr[0], url: arr[1] };
      });
    },
    // calculate reading progress
    progress: function() {
      return (1 - this.posInChapList / this.manga.listChaps.length) * 100;
    },
    // position of current chapter in chapters list
    posInChapList() {
      return this.chapsForSelect.findIndex(el => el.value === this.selValue);
    },
    // number of days since last chapter has been published
    timeUpdated() {
      let nbdays = Math.floor(
        (Date.now() - this.manga.upts) / (1000 * 60 * 60 * 24)
      );
      return nbdays;
    },
    // list of languages
    languages() {
      let alllangs =
        this.manga.languages === undefined
          ? []
          : this.manga.languages.split(",");
      return alllangs.filter(lang => {
        let keylang = amrutils.mangaKey(
          this.manga.url,
          this.manga.mirror,
          lang
        );
        return (
          this.$store.state.mangas.all.findIndex(m => m.key === keylang) === -1
        );
      });
    },
    isDarkText: function() {
      return utils.darkText(this.manga, this.options)
    },
    smalldevice: function() {
      return utils.isSmallDevice()
    },
    isSelected: function () {
      return Boolean(this.selectedManga()[this.manga.key])
    }
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    /**
     * Return the right color for this manga, depending if it updates (you can stop following udates for a manga), if it has unread chapters or not
     */
    color: function(light) {
      return utils.getColor(this.manga, this.options, light);
    },
    /** get the real url from the value (url path used in select) in the manga list */
    urlFromValue: function(val) {
      return this.manga.listChaps.find(
        arr => amrutils.chapPath(arr[1]) === val
      )[1];
    },
    /**
     * Click on + / - to expand reduce similar mangas
     */
    emitExpand: function() {
      this.expanded = !this.expanded;
      this.$emit("expand-group");
    },
    /**
     * Mark last chapter as read
     */
    markAsRead() {
      this.$store.dispatch("readManga", {
        url: this.manga.url,
        mirror: this.manga.mirror,
        lastChapterReadName: this.manga.listChaps[0][0],
        lastChapterReadURL: this.manga.listChaps[0][1],
        name: this.manga.name,
        language: this.manga.language
      });
    },
    /**
     * Open a chapter in new tab
     */
    play(which) {
      let pos;
      if (which === Infinity) pos = 0;
      else {
        pos = this.posInChapList - which; // order of chapters is reversed
        if (pos < 0) pos = 0;
        else if (pos >= this.manga.listChaps.length)
          pos = this.manga.listChaps.length - 1;
      }
      browser.runtime.sendMessage({
        action: "opentab",
        url: this.manga.listChaps[pos][1]
      });
    },
    /**
     * Opens a chapter from select
     */
    playChap() {
      browser.runtime.sendMessage({ action: "opentab", url: this.selChapter });
    },
    /**
     * Opens manga main page
     */
    openManga() {
      browser.runtime.sendMessage({ action: "opentab", url: this.manga.url });
    },
    /**
     * Deletes a manga
     */
    trash() {
      this.deleteManga = false;
      this.$store.dispatch("deleteManga", {
        key: this.manga.key
      });
    },
    /** Read a manga in another language */
    async readMangaInLang(lang) {
      await browser.runtime.sendMessage({
        action: "readManga",
        url: this.manga.url,
        mirror: this.manga.mirror,
        name: this.manga.name,
        language: lang
      });
    },
    toggleSelect: function (manga) {
      this.$store.dispatch("toggleMangaSelect", manga.key);
    },
    ...mapGetters(["selectedManga"])
  },
  // Name of the component
  name: "Manga",
  components: { Flag }
};
</script>

<style lang="css" scoped>
* {
  font-size: 0.9rem;
}
.dark-text * {
  color: #424242!important;
}
.container.amr-list-line:first-child
  .amr-line-container:first-child
  .flex:first-child
  > .v-card {
  border-top-left-radius: 5px;
}
.container.amr-list-line:first-child
  .amr-line-container:first-child
  .flex:last-child
  > .v-card {
  border-top-right-radius: 5px;
}
.container.amr-list-line:last-child
  .amr-line-container:last-child
  .flex:first-child
  > .v-card {
  border-bottom-left-radius: 5px;
}
.container.amr-list-line:last-child
  .amr-line-container:last-child
  .flex:last-child
  > .v-card {
  border-bottom-right-radius: 5px;
}
.container.amr-list-line:first-child
  .amr-line-container.compact:first-child
  .flex:first-child
  > .v-card {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.container.amr-list-line:first-child
  .amr-line-container.compact:first-child
  .flex:last-child
  > .v-card {
  border-top-right-radius: 0px;
}
.container.amr-list-line:last-child
  .amr-line-container.compact:last-child
  .flex:first-child
  > .v-card {
  border-bottom-left-radius: 0px;
}
.container.amr-list-line:last-child
  .amr-line-container.compact:last-child
  .flex:nth-last-child(2)
  > .v-card {
  border-bottom-left-radius: 5px;
}
.container.amr-list-line:last-child
  .amr-line-container.compact:last-child
  .flex:last-child
  > .v-card {
  border-bottom-right-radius: 5px;
}
.container.amr-list-line .amr-list-elt > .v-card {
  padding: 4px;
}
.container.amr-list-line .amr-list-elt .amr-chapter-list-cont {
  padding: 6px;
}
.amr-manga-title {
  font-weight: bold;
  cursor: pointer;
}
.amr-manga-title-cont .select-checkbox {
    display: inline-flex;
    height: 20px;
}
.amr-manga-title-cont,
.amr-manga-actions-cont {
  padding: 4px;
}
.amr-manga-actions-cont i,
.amr-manga-title-cont i {
  cursor: pointer;
  font-size: 1.1rem;
}
.amr-manga-title-cont i {
  font-size: 1.2rem;
}
.amr-manga-actions-cont i:hover {
  opacity: 0.6;
}
.empty-icon {
  width: 18px;
  height: 18x;
}
.mirror-icon {
  vertical-align: middle;
  padding-right: 2px;
  display: inline-block;
}
.back-card {
  height: 100% !important;
}

.v-progress-linear {
  margin: 0;
  margin-top: -1px;
}
/*Selects*/
.amr-select-wrapper {
  display: inline-block;
  position: relative;
  width: 100%;
}
select.amr-chap-sel {
  -moz-appearance: none;
  -webkit-appearance: none;
  -ms-appearance: none;
  display: inline-block;
  outline: none;
  border-style: none;
  width: 100%;
  border-top-left-radius: 2px !important;
  border-top-right-radius: 2px !important;
  position: relative;
  padding-top: 0px;
  padding-right: 20px;
  padding-bottom: 0px;
  padding-left: 4px;
}
.amr-select-wrapper:after {
  content: "▼";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  font-size: 0.75rem;
  line-height: 19px;
  padding: 1px 5px;
  pointer-events: none;
  z-index: 1;
}

.amr-chapter-list-cont {
  overflow: auto;
}
.tip-icon-grouped {
  float: left;
  width: 20px;
  height: 20px;
}
.flag-container {
  float: left;
  margin: 0px 2px;
  cursor: pointer;
}
.amr-prog-cont {
  margin-left: 0px;
}
.tip-icon-grouped + .amr-prog-cont,
.flag-container + .amr-prog-cont {
  margin-left: 25px;
}
.tip-icon-grouped + .flag-container + .amr-prog-cont {
  margin-left: 45px;
}
.amr-manga-waiting {
  margin-top: 7px;
}
.tip-icon-grouped + .amr-manga-waiting {
  margin-left: 25px;
  width: auto;
}
.tip-icon-grouped + .flag-container + .amr-manga-waiting {
  margin-left: 45px;
  width: auto;
}
.amr-calendar-badge,
.amr-timeroff-badge {
  float: right;
  padding: 0px 4px;
}
.amr-timeroff-badge {
  margin-top: 2px;
}
</style>
