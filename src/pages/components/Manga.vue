<template>
  <v-card v-if="shouldShow" :class="color(3, true) + ' amr-manga-row' + (manga.update === 0 ? ' amr-noupdates' : '')">
    <v-row :class="isDarkText ? 'dark-text' : 'light-text'">
      <v-col v-show="selectable" cols="auto" class="pr-0 mr-0">
        <v-checkbox v-model="selected" hide-details dense class="shrink mr-2 mt-0"></v-checkbox>
      </v-col>
      <!-- Name, Last Updated -->
      <v-col cols="4" lg="5">

        <v-card :color="color(0)" class="back-card amr-manga-title-cont">
          <v-row no-gutters align="center" class="min-h-26">
            
              <!-- + / - icon if group of mangas  -->
              <v-icon small v-show="isInGroup && isFirst && !groupExpanded" @click="emitExpand()">mdi-plus</v-icon>
              <v-icon small v-show="isInGroup && isFirst && groupExpanded" @click="emitExpand()">mdi-minus</v-icon>
              <v-icon small v-show="isInGroup && !isFirst && groupExpanded" class="padding-group"></v-icon>
              <!-- Mirror icons -->
              <v-tooltip top content-class="icon-ttip">
                <template v-slot:activator="{ on }">
                  <img class="m-icon" width="16" height="16" v-if="isMirrorEnabled" :src="mirror.mirrorIcon" v-on="on" />
                  <v-icon small v-if="!isMirrorEnabled" v-on="on">mdi-cancel</v-icon>
                </template>
                <span>{{ isMirrorEnabled ? mirror.mirrorName : i18n("list_mirror_disabled_tooltip", manga.mirror) }}</span>
              </v-tooltip>
            
            <!-- Chapter name -->
            <v-col :sm="title_sm_col" :lg="title_lg_col">
              <v-tooltip top :disabled="!(manga.displayName && manga.displayName !== '')">
                <template v-slot:activator="{on}">
                  <div class="text-truncate ml-1">
                    <span class="amr-manga-title" v-on="on" @click="openManga">
                      {{ manga.displayName && manga.displayName !== '' ? manga.displayName : manga.name }}
                    </span>
                  </div>
                </template>
                {{ manga.name }}
              </v-tooltip>
            </v-col>
            <div class="ml-auto">
              <!-- Display last update time -->
              <v-tooltip top content-class="icon-ttip">
                <template v-slot:activator="{ on }">
                  <v-card v-show="options.displastup === 1 && manga.upts != 0 && timeUpdated < 50" dark :class="color(-2) + ' amr-calendar-badge'" v-on="on">
                    <v-icon>mdi-calendar-clock</v-icon>
                  </v-card>
                </template>
                <span v-if="timeUpdated === 0">{{i18n("list_calendar_today")}}</span>
                <span v-else>{{i18n("list_calendar_days_found", timeUpdated)}}</span>
              </v-tooltip>
              <!-- Display a timer off if the manga is not updating anymore -->
              <v-tooltip top content-class="icon-ttip">
                <template v-slot:activator="{ on }">
                  <v-icon v-show="manga.update === 0" class="amr-timeroff-badge" v-on="on">mdi-timer-off</v-icon>
                </template>
                <span>{{i18n("list_stopped_updating")}}</span>
              </v-tooltip>
            </div>
          </v-row>
        </v-card>
      </v-col>
      <!-- Select List -->
      <v-col :cols="selectable ? '3' : '4'" :lg="selectable ? '4': '5'">
        <v-card :color="color(3, true)" tile flat class="back-card">
              <!-- List of chapters -->
              <div v-if="manga.listChaps.length" class="amr-prog-cont">

                <v-select
                  v-model="selValue"
                  :items="chapsForSelect"
                  @change="playChap($event)"
                  dense
                  solo
                  class="align-self-center chap-select"
                  hide-details
                  :background-color="color(0)"
                  :color="isDarkText ? 'dark-text' : 'light-text'"
                  :menu-props="{ auto: true }"
                  :loading="chapsForSelect.length ? '' : color(-2)"
                  :disabled="!chapsForSelect.length"
                >
                  <template v-slot:prepend-inner v-if="chapsForSelect.length">
                    <v-tooltip top content-class="icon-ttip">
                      <template v-slot:activator="{ on }">
                        <div class="d-flex align-center">
                          <v-progress-circular
                            :indeterminate="!chapsForSelect.length"
                            v-on="on"
                            :color="isDarkText ? 'dark-text' : 'light-text'" 
                            :value="progress > 90 && progress < 100 ? '90' : progress"
                            :size="12"
                            :width="2"
                            :rotate="90"
                            class="align-self-center"
                          />
                        </div>
                      </template>
                      <span>{{i18n("list_progress_reading", progress)}}</span>
                    </v-tooltip>
                    <v-divider
                      class="mx-2"
                      vertical
                    ></v-divider>
                  </template>
                  <template v-slot:selection="{on, item}">
                    <div class="d-flex align-center text-truncate">
                      <div v-on="on" class="text-truncate">
                        <Flag v-if="manga.language" :value="manga.language" @toggleLanguageSelection="displayLangs = !displayLangs"/>
                        <span class="chap-title">{{item.text}}</span>
                        
                      </div>
                    </div>
                  </template>
                </v-select>
                </div>
              <div v-else>
                <!-- Loading bar if chapters list is not loaded yet-->
                <v-progress-linear v-show="isMirrorEnabled" :indeterminate="true" height="4" class="amr-manga-waiting" :color="color(2)"></v-progress-linear>
                <span v-show="!isMirrorEnabled">
                  {{ isMirrorEnabled ? mirror.mirrorName : i18n("list_mirror_disabled", manga.mirror) }}
                </span>
              </div>
        </v-card>
      </v-col>
      <!-- Actions -->
      <v-col cols="4" lg="2" class="amr-list-actions text-center ml-auto">
        <v-card :color="color(0)" class="back-card d-flex justify-space-between px-3 min-h-26">
          <!-- Mark as read -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-show="hasNew" v-on="on" @click="markAsRead()">mdi-eye</v-icon>
            </template>
            <span>{{i18n("list_mg_act_read")}}</span>
          </v-tooltip>
          <!-- Empty icon if all read -->
          <v-icon v-show="!hasNew" class="empty-icon"></v-icon>
          <!-- Previous chapter -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-show="posInChapList < manga.listChaps.length - 1" v-on="on" @click="play(-1)">mdi-chevron-left</v-icon>
            </template>
            <span>{{i18n("list_mg_act_prev")}}</span>
          </v-tooltip>
          <!-- Empty icon if no previous -->
          <v-icon v-show="posInChapList === manga.listChaps.length - 1" class="empty-icon"></v-icon>
          <!-- Current chapter play -->
          <v-icon v-show="!isMirrorEnabled" class="empty-icon"></v-icon>
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-show="isMirrorEnabled" v-on="on" @click="play(0)">mdi-play</v-icon>
            </template>
            <span>{{i18n("list_mg_act_cur")}}</span>
          </v-tooltip>
          <!-- Next chapter play -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-show="posInChapList > 0" v-on="on" @click="play(1)">mdi-chevron-right</v-icon>
            </template>
            <span>{{i18n("list_mg_act_next")}}</span>
          </v-tooltip>
          <!-- Empty icon if no next chapter -->
          <v-icon v-show="posInChapList <= 0" class="empty-icon"></v-icon>
          <!-- Last chapter play -->
          <v-icon v-show="!isMirrorEnabled" class="empty-icon"></v-icon>
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-show="isMirrorEnabled" v-on="on" @click="play(Infinity)">mdi-page-last</v-icon>
            </template>
            <span>{{i18n("list_mg_act_latest")}}</span>
          </v-tooltip>
          <!-- Delete manga -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="deleteManga = true">mdi-delete</v-icon>
            </template>
            <span>{{i18n("list_mg_act_delete")}}</span>
          </v-tooltip>

          <v-icon @click="expanded = !expanded">mdi-dots-vertical</v-icon>
          <!-- Delete manga dialog -->
          <v-dialog v-model="deleteManga" max-width="500px">
            <v-card>
              <v-card-title>
                <h3>{{i18n("list_mg_delete_question", manga.name, manga.mirror)}}</h3>
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" elevation="1" @click.native="deleteManga = false">{{i18n("button_no")}}</v-btn>
                <v-btn color="blue darken-1" elevation="1" @click.native="trash()">{{i18n("button_yes")}}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="expanded" dense>
      <!-- Categories -->
      <v-col cols="6">
        <span>{{i18n("list_details_cats")}} : </span>
        <Categories
          :categories="manga.cats"
          :static-cats="true"
          :delegate-delete="true"
          @delete-category="deleteCategory" />
        <div class="det-sel-wrapper">
          <select dark v-model="newCat" @change="addCategory()" :class="color(2)">
            <option value="">{{i18n("list_details_cats_select")}}</option>
            <option v-for="(cat, key) of selectableCategory"
                    :key="key"
                    :value="cat.name">
                {{cat.name}}
            </option>
          </select>
        </div>
      </v-col>
      <!-- Manage manga bookmarks -->
      <v-col cols="6">
        <span>{{i18n("list_details_books")}} : </span>
        <select v-if="bookmarks.length" dark v-model="curBm" @change="openBookmark()" :class="color(2)">
          <option v-for="(bm, key) of bookmarks"
                  :key="key"
                  :value="bm.chapUrl">
              {{bm.type === 'scan' ? i18n("bookmarks_scan_title", bm.chapName, bm.scanName) : i18n("bookmarks_chapter_title", bm.chapName)}}
          </option>
        </select>
        <span v-if="!bookmarks.length">{{i18n("list_details_no_bookmarks")}}</span>
      </v-col>
      <v-col cols="12" class="text-center">
        <v-btn @click='searchElsewhere()' :color="color(-1)" small>{{i18n("list_details_act_search")}}</v-btn>
        <v-btn @click='resetManga()' :color="color(-1)" small>{{i18n("list_details_act_reset")}}</v-btn>
        <v-btn v-if="manga.read === 0" @click='toggleFollow()' :color="color(-1)" small>{{i18n("list_details_act_stop_follow")}}</v-btn>
        <v-btn v-if="manga.read === 1" @click='toggleFollow()' :color="color(-1)" small>{{i18n("list_details_act_follow")}}</v-btn>
        <v-btn v-if="manga.update === 1" @click='toggleUpdate()' :color="color(-1)" small>{{i18n("list_details_act_stop_updating")}}</v-btn>
        <v-btn v-if="manga.update === 0" @click='toggleUpdate()' :color="color(-1)" small>{{i18n("list_details_act_restart_updating")}}</v-btn>
        <v-btn @click='refreshMangaNow()' :color="color(-1)" small>{{ i18n("refresh_chapters") }}</v-btn>
        <v-btn @click='renameManga()' :color="color(-1)" small>{{ i18n("list_details_rename_manga") }}</v-btn>
        <v-btn v-if="manga.displayName && manga.displayName !== ''" @click='resetName()' :color="color(-1)" small>{{ i18n("list_details_reset_name") }}</v-btn>
      </v-col>
    </v-row>
    <v-row  v-if="displayLangs">
      <v-col cols="3"><v-card dark tile flat class="back-card" :color="color(3)"></v-card></v-col>
      <v-col cols="6">
        <v-card dark tile flat class="back-card" :color="color(3)">
          <p class="mb-0">{{i18n("popup_language_pick")}} :</p>
          <Flag v-for="lang in languages" :key="lang" :value="lang" big @click.native="readMangaInLang(lang)"/>
        </v-card>
      </v-col>
      <v-col cols="3"><v-card dark tile flat class="back-card" :color="color(3)"></v-card></v-col>
    </v-row>
  </v-card>
</template>

<script>
import i18n from "../../amr/i18n";
import browser from "webextension-polyfill";
import * as utils from "../utils";
import * as amrutils from "../../amr/utils";
import Flag from "./Flag";
import Categories from "./Categories";

export default {
  data() {
    return {
      // current state of other grouped mangas panel
      expanded: false,
      // delete manga popup state
      deleteManga: false,
      // list of languages state
      displayLangs: false,
      // category to add to this group of mangas
      newCat: "",
      // selected bookmark
      curBm: null,
      selectable: false, // Should we show the multi select checkbox
      selected: false,
      canOpenTab: true // This is used for a timer to hopefully eliminate weird duping issue
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
    "groupIndex"
  ],
  computed: {
    shouldShow: function() {
      let show = true

      if (this.isInGroup && !this.isFirst && !this.groupExpanded) {
        show = false
      }

      return show
    },
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
    // mirror for current chapter
    mirror: function() {
      return this.$store.state.mirrors.all.find(
        mir => mir.mirrorName === this.manga.mirror
      );
    },
    isMirrorEnabled: function () {
      // const mirror = this.$store.state.mirrors.all.find(
      //     mir => mir.mirrorName === this.manga.mirror
      // )

      return this.mirror && !this.mirror.disabled;
    },
    // format chapters list to be displayed
    chapsForSelect: function() {
      return this.manga.listChaps.map(arr => {
        return { value: amrutils.chapPath(arr[1]), text: arr[0], url: arr[1] };
      });
    },
    // calculate reading progress
    progress: function() {
      return Math.floor((1 - this.posInChapList / this.manga.listChaps.length) * 100);
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
    title_lg_col() {
      let cols = 11
      if(this.options.displastup === 1 && this.manga.upts != 0 && this.timeUpdated < 50) {
        cols = 10
      }
      if(this.isInGroup && this.isFirst) {
        cols = 10
      }
      return cols
    },
    title_sm_col() {
      let cols = 10
      if(this.options.displastup === 1 && this.manga.upts != 0 && this.timeUpdated < 50) {
        cols = cols - 2
      }
      if(this.isInGroup && this.isFirst) {
        cols = cols - 1
      }
      return cols
    },
    isDarkText: function() {
      return utils.darkText(this.manga, this.options)
    },
    selectableCategory() {
      return this.options.categoriesStates.filter(cat => cat.type !== 'native' && cat.type != 'language' && !this.manga.cats.includes(cat.name))
    },
    // bookmarks for this group
    bookmarks: function() {
      return this.$store.state.bookmarks.all.filter(
        bm => this.manga.key.indexOf(amrutils.mangaKey(bm.url)) >= 0
      )
    },
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    /**
     * Return the right color for this manga, depending if it updates (you can stop following udates for a manga), if it has unread chapters or not
     */
    color: function(light, invertable = false) {
      if (this.options.alternateColors && invertable) {
        let odd = (this.groupIndex + 1) % 2 == 1
        light += odd ? -2 : 1
      }
      return utils.getColor(this.manga, this.options, light);
    },
    /** get the real url from the value (url path used in select) in the manga list */
    urlFromValue: function(val) {
      return this.manga.listChaps.find(
        arr => amrutils.chapPath(arr[1]) === val
      )[1];
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
     * Reset manga reading to first chapter for the group of mangas
     */
    resetManga() {
      this.$store.dispatch("resetManga", { url: this.manga.url, language: this.manga.language })
    },
    /**
     * Toggle following manga updates for this group
     */
    toggleFollow: function() {
      this.$store.dispatch("markMangaReadTop", {
        url: this.manga.url,
        language: this.manga.language,
        updatesamemangas: true,
        read: this.manga.read == 1 ? 0 : 1
      });
    },
    /**
     * Stop updating (looking for new chapters) mangas in this group
     */
    toggleUpdate: function() {
      this.$store.dispatch("markMangaUpdateTop", {
        url: this.manga.url,
        language: this.manga.language,
        updatesamemangas: true,
        update: this.manga.update == 1 ? 0 : 1
      });
    },
    /**
     * Refresh manga chapter list
     */
    refreshMangaNow: function () {
      browser.runtime.sendMessage({
        action: 'refreshMangas',
        manga: this.manga
      })
    },
    /**
     * Open search panel with search field prefilled with manga name
     */
    searchElsewhere: function() {
      this.$emit("search-request", this.manga.name);
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
    playChap(chapterValue) {
      browser.runtime.sendMessage({ action: "opentab", url: this.urlFromValue(chapterValue) });
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
    deleteCategory: function(cat) {
      this.$store.dispatch("removeCategoryFromManga", {
        key: this.manga.key,
        name: cat
      })
    },
    addCategory: function() {
      this.$store.dispatch("addCategoryToManga", {
        key: this.manga.key,
        name: this.newCat
      })
      this.newCat = ""
    },
    /**
     * Open bookmark in a new tab (the chapter corresponding to bookmark)
     */
    openBookmark: function() {
      browser.runtime.sendMessage({ action: "opentab", url: this.curBm });
    },
    emitExpand() {
      this.$emit("expand-group");
    },
    /**
     * Emit the event for renaming this manga
     */
    renameManga() {
      this.$emit('rename-manga', this.manga)
    },
    resetName() {
      browser.runtime.sendMessage({
        action: "setDisplayName",
        key: this.manga.key,
        displayName: ''
      })
    },
    setOpenTrue() {
      this.canOpenTab = true
    }
  },
  watch: {
    selected(newValue) {
      if (newValue)
        this.$eventBus.$emit('multi-manga:select-manga', this.manga.key)
      else
        this.$eventBus.$emit('multi-manga:deselect-manga', this.manga.key)
    },
    shouldShow(newValue) {
      if (newValue && this.selected) {
        this.selected = false
      }
    }
  },
  created() {
    this.$eventBus.$on('multi-manga:open-latest:' + this.manga.key, () => {
      if (!this.canOpenTab) return
      if (this.isMirrorEnabled) {
        this.play(0)
      }
      this.canOpenTab = false
      setTimeout(this.setOpenTrue, 500) 
    })
    this.$eventBus.$on('multi-manga:open-first-new:' + this.manga.key, () => {
      if (!this.canOpenTab) return
      if (this.isMirrorEnabled && this.posInChapList > 0) {
        this.play(1)
      }
      this.canOpenTab = false
      setTimeout(this.setOpenTrue, 500)
    })
    this.$eventBus.$on('multi-manga:show-multiselect', () => {
      this.selectable = true
      this.selected = false
    })
    this.$eventBus.$on('multi-manga:hide-multiselect', () => {
      this.selectable = false
      this.selected = false
    })
    this.$eventBus.$on('multi-manga:select-all', () => {
      if (this.shouldShow && !this.selected)
        this.selected = true
    })
    this.$eventBus.$on('multi-manga:select-unread', () => {
      if (this.shouldShow && !this.selected && this.posInChapList > 0)
        this.selected = true
    })
    this.$eventBus.$on('multi-manga:deselect-all', () => {
      if (this.selected)
        this.selected = false
    })
  },
  // Name of the component
  name: "Manga",
  components: { Flag, Categories }
};
</script>

<style lang="css" scoped data-amr="true">
.dark-text * {
  color: #424242 !important;
}
.light-text * {
  color: #fafafa !important;
}
.amr-manga-title {
  font-weight: bold;
  cursor: pointer;
}
.amr-manga-title-cont .select-checkbox {
    display: inline-flex;
    height: 20px;
}
.empty-icon {
  width: 22px;
}
.padding-group {
  width: 16px;
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
.amr-manga-waiting {
  margin-top: 7px;
}
.amr-calendar-badge,
.amr-timeroff-badge {
  float: right;
  padding: 0px 4px;
}
.amr-timeroff-badge {
  margin-top: 2px;
}
.amr-manga-row {
  height: auto !important;
  padding: 6px !important;
  border-radius: unset!important;
}

.det-sel-wrapper {
  display: inline-block;
  position: relative;
}
.det-sel-wrapper:after {
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
.det-sel-wrapper select {
  -moz-appearance: none;
  -webkit-appearance: none;
  -ms-appearance: none;
  display: inline-block;
  outline: none;
  border-style: none;
  border-radius: 2px !important;
  position: relative;
  padding: 2px 4px;
  padding-right: 15px;
  color: white;
  font-size: 1rem;
}
.amr-list-actions .v-icon.v-icon{
  font-size: 22px;
}
.cat-cont {
  display: inline-block;
}

.amr-noupdates {
  opacity: 0.75;
}
.min-h-26 {
 min-height: 26px;
}

@media screen and (max-width: 1263px) {
  .m-icon {
    margin-left: 2px!important;
  }
}
@media screen and (min-width: 1264px) {
  .m-icon {
    margin-left: 4px!important;
  }
}
.chap-title {
  font-size:13px;
}
</style>
<style lang="css">
  .v-text-field.v-text-field--solo.v-input--dense>.v-input__control {
    min-height: 26px!important;
  }
</style>