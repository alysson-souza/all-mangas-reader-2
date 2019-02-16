<template>
<div v-if="!isInGroup || (isFirst || groupExpanded)" class="amr-line-container" :class="{'dark-text': isDarkText, compact: smalldevice}">
    <!-- manga line, containing title, list of chapters and actions-->
    <v-layout row wrap>
      <!-- Title and icon -->
      <v-flex :xs4="!smalldevice" :xs12="smalldevice" class="amr-list-elt">
      <v-card dark tile flat :color="color(3)" class="back-card">
        <v-card v-if="!isInGroup || isFirst" dark :color="color(0)" class="amr-manga-title-cont">
          <!-- Icon of the mirror if not in group -->
          <v-tooltip top content-class="icon-ttip">
            <img v-if="!isInGroup" :src="mirror.mirrorIcon" class="mirror-icon" slot="activator" /> 
            <span>{{mirror.mirrorName}}</span>
          </v-tooltip>
          <!-- + / - icon if group of mangas  -->
          <v-icon v-if="isInGroup && isFirst && !expanded" @click="emitExpand()">mdi-plus</v-icon>
          <v-icon v-if="isInGroup && isFirst && expanded" @click="emitExpand()">mdi-minus</v-icon>
          <template v-if="seen">
            <!-- Display a calendar with last update -->
            <v-tooltip v-if="options.displastup === 1 && manga.upts != 0 && timeUpdated < 50" top content-class="icon-ttip">
              <v-card dark :class="color(-2) + ' amr-calendar-badge'" slot="activator">
                <v-icon>mdi-calendar-clock</v-icon>
                <span v-if="timeUpdated > 0">{{ timeUpdated }}</span>
              </v-card>
              <span v-if="timeUpdated === 0">{{i18n("list_calendar_today")}}</span>
              <span v-else>{{i18n("list_calendar_days_found", timeUpdated)}}</span>
            </v-tooltip>
            <!-- Display a timer off if the manga is not updating anymore -->
            <v-tooltip v-if="manga.update === 0" top content-class="icon-ttip">
              <v-icon class="amr-timeroff-badge" slot="activator">mdi-timer-off</v-icon>
              <span>{{i18n("list_stopped_updating")}}</span>
            </v-tooltip>
          </template>
          <!-- Manga name -->
          <span class="amr-manga-title" @click="openManga">{{ manga.name }}</span>
        </v-card>
      </v-card>
      </v-flex>
      <!-- List of chapters and progressbar-->
      <v-flex xs5 class="amr-list-elt">
      <v-card dark tile flat :color="color(3)" class="back-card amr-chapter-list-cont">
          <template v-if="seen">
        <!-- List of chapters -->
        <!-- Icon of the mirror if in group -->
        <v-tooltip v-if="isInGroup" top content-class="icon-ttip" class="tip-icon-grouped">
          <img :src="mirror.mirrorIcon" class="mirror-icon grouped" slot="activator" /> 
          <span>{{mirror.mirrorName}}</span>
        </v-tooltip>
        <!-- Flag of the language of chapters if multiple languages available -->
        <Flag v-if="manga.language" :value="manga.language" @click.native="displayLangs = !displayLangs"/>
        <!-- List of chapters -->
        <div v-if="manga.listChaps.length" class="amr-prog-cont">
          <div class="amr-select-wrapper">
            <select :value="selValue" v-on:input="selChapter = urlFromValue($event.target.value)" :class="color(2) + ' amr-chap-sel'" @change="playChap()">
              <option v-for="chap in chapsForSelect" :key="chap.value" :value="chap.value">{{chap.text}}</option>
            </select>
          </div>
          <!-- Reading progress -->
          <v-tooltip top content-class="icon-ttip">
            <v-progress-linear :value="progress" height="4" :color="color(-1)" slot="activator"></v-progress-linear>
            <span>{{ i18n("list_progress_reading", Math.floor(progress)) }}</span>
          </v-tooltip>
        </div>
        <!-- Loading bar if chapters list is not loaded yet-->
        <v-progress-linear v-if="!manga.listChaps.length" :indeterminate="true" height="4" class="amr-manga-waiting" :color="color(1)"></v-progress-linear>
          </template>
      </v-card>
      </v-flex>
      <!-- Actions -->
      <v-flex :xs3="!smalldevice" :xs6="smalldevice" class="amr-list-elt" text-xs-center>
        <v-card  dark tile flat :color="color(3)" class="back-card">
          <template v-if="seen">
          <v-card dark :color="color(0)" class="amr-manga-actions-cont">
            <!-- Mark as read -->
            <v-tooltip v-if="hasNew" top content-class="icon-ttip">
              <v-icon v-if="hasNew" slot="activator" @click="markAsRead()">mdi-eye</v-icon>
              <span>{{i18n("list_mg_act_read")}}</span>
            </v-tooltip>
            <!-- Empty icon if all read -->
            <v-icon v-if="!hasNew" class="empty-icon"></v-icon> 
            <!-- Previous chapter -->
            <v-tooltip v-if="posInChapList < manga.listChaps.length - 1" top content-class="icon-ttip">
              <v-icon slot="activator" @click="play(-1)">mdi-chevron-left</v-icon>
              <span>{{i18n("list_mg_act_prev")}}</span>
            </v-tooltip>
            <!-- Empty icon if no previous -->
            <v-icon v-if="posInChapList === manga.listChaps.length - 1" class="empty-icon"></v-icon> 
            <!-- Current chapter play -->
            <v-tooltip top content-class="icon-ttip">
              <v-icon slot="activator" @click="play(0)">mdi-play</v-icon>
              <span>{{i18n("list_mg_act_cur")}}</span>
            </v-tooltip>
            <!-- Next chapter play -->
            <v-tooltip v-if="posInChapList > 0" top content-class="icon-ttip">
              <v-icon slot="activator" @click="play(1)">mdi-chevron-right</v-icon>
              <span>{{i18n("list_mg_act_next")}}</span>
            </v-tooltip>
            <!-- Empty icon if no next chapter -->
            <v-icon v-if="posInChapList <= 0" class="empty-icon"></v-icon> 
            <!-- Last chapter play -->
            <v-tooltip top content-class="icon-ttip">
              <v-icon slot="activator" @click="play(Infinity)">mdi-page-last</v-icon>
              <span>{{i18n("list_mg_act_latest")}}</span>
            </v-tooltip>
            <!-- Delete manga -->
            <v-tooltip top content-class="icon-ttip">
              <v-icon slot="activator" @click="deleteManga = true">mdi-delete</v-icon>
              <span>{{i18n("list_mg_act_delete")}}</span>
            </v-tooltip>
            <!-- Display details panel -->
            <v-icon v-if="isFirst" @click="$emit('details-click')">mdi-dots-vertical</v-icon>
            <!-- Empty icon if not first instead of details button -->
            <v-icon v-if="!isFirst" class="empty-icon"></v-icon> 
            <!-- Delete manga dialog -->
            <v-dialog v-model="deleteManga" max-width="500px">
              <v-card>
                  <v-card-title>
                  <span class="headline">{{i18n("list_mg_delete_question", manga.name, manga.mirror)}}</span>
                  </v-card-title>
                  <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" flat @click.native="deleteManga = false">{{i18n("button_no")}}</v-btn>
                  <v-btn color="blue darken-1" flat @click.native="trash()">{{i18n("button_yes")}}</v-btn>
                  </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card>
          </template>
        </v-card>
      </v-flex>
    </v-layout>
    <!-- List of available languages if set -->
    <v-layout row v-if="displayLangs">
      <v-flex xs3><v-card dark tile flat class="back-card" :color="color(3)"></v-card></v-flex>
      <v-flex xs6>
        <v-card dark tile flat class="back-card" :color="color(3)">
          <p class="mb-0">{{i18n("popup_language_pick")}} :</p>
          <Flag v-for="lang in languages" :key="lang" :value="lang" big @click.native="readMangaInLang(lang)"/>
        </v-card>
      </v-flex>
      <v-flex xs3><v-card dark tile flat class="back-card" :color="color(3)"></v-card></v-flex>
    </v-layout>
</div>
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
    "manga",
    // is part of a group of mangas
    "isInGroup",
    // if manga is first of the group
    "isFirst",
    // is the group currently expanded
    "groupExpanded",
    // has the group been in the viewport at least once
    "seen"
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
    }
  },
  // Name of the component
  name: "Manga",
  components: { Flag }
};
</script>

<style lang="css" scoped>
* {
  font-size: 10pt;
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
.amr-manga-title-cont,
.amr-manga-actions-cont {
  padding: 4px;
}
.amr-manga-actions-cont i,
.amr-manga-title-cont i {
  cursor: pointer;
  font-size: 18px;
}
.amr-manga-title-cont i {
  font-size: 16px;
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
  font-size: 75%;
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
