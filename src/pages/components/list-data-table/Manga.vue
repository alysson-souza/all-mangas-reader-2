<template>
  <v-card v-show="shouldShow" :class="color(3, true) + ' amr-manga-row' + (manga.update === 0 ? ' amr-noupdates' : '')">
    <v-row :class="isDarkText ? 'dark-text' : 'light-text'">
      <v-col v-show="selectable" cols="auto" class="pr-0 mr-0">
        <v-checkbox v-model="selected" hide-details dense class="shrink mr-2 mt-0"></v-checkbox>
      </v-col>
      <!-- Name, Last Updated -->
      <v-col cols="4" lg="5">

        <v-card :color="color(0)" class="back-card amr-manga-title-cont" :class="isInGroup && !isFirst && groupExpanded ? 'ml-4':''">
          <v-row no-gutters align="center" class="min-h-26">
            
              <!-- + / - icon if group of mangas  -->
              <v-icon small v-show="isInGroup && isFirst && !groupExpanded" @click="emitExpand()">mdi-plus</v-icon>
              <v-icon small v-show="isInGroup && isFirst && groupExpanded" @click="emitExpand()">mdi-minus</v-icon>
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
                      {{ manga.displayName && manga.displayName !== '' ? truncText(manga.displayName) : truncText(manga.name) }}
                    </span>
                  </div>
                </template>
                {{ manga.name }}
              </v-tooltip>
            </v-col>
            <div class="d-flex align-center ml-auto">
              <v-divider
                class="mx-1"
                vertical
              ></v-divider>
              <!-- Display a timer off if the manga is not updating anymore -->
              <v-tooltip top content-class="icon-ttip">
                <template v-slot:activator="{ on }">
                  <v-icon small v-show="manga.update === 0" class="mx-1" v-on="on">mdi-timer-off</v-icon>
                </template>
                <span>{{i18n("list_stopped_updating")}}</span>
              </v-tooltip>
              <!-- Display last update time -->
              <v-tooltip top content-class="icon-ttip">
                <template v-slot:activator="{ on }">
                    <v-card flat v-show="options.displastup === 1 && manga.upts != 0 && timeUpdated < 50" dark :class="color(0)" v-on="on">
                      <span v-show="timeUpdated > 0" class="pl-1">{{ timeUpdated }}</span>
                      <v-icon dense class="pr-1">mdi-calendar-clock</v-icon>
                    </v-card>
                </template>
                <span v-if="timeUpdated === 0">{{i18n("list_calendar_today")}}</span>
                <span v-else>{{i18n("list_calendar_days_found", timeUpdated)}}</span>
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
                  class="align-self-center"
                  hide-details
                  :background-color="color(0)"
                  :color="isDarkText ? 'dark-text' : 'light-text'"
                  :menu-props="{ auto: true }"
                  :loading="chapsForSelect.length ? '' : color(-2)"
                  :disabled="!chapsForSelect.length"
                >
                  <template v-slot:prepend-inner v-if="chapsForSelect.length && showProgress">
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
                      <span>{{i18n("list_progress_reading", progress, absoluteProgress)}}</span>
                    </v-tooltip>
                    <v-divider
                      class="mx-2"
                      vertical
                    ></v-divider>
                  </template>
                  <template v-slot:selection="{on, item}">
                    <div class="d-flex align-center text-truncate">
                      <div v-on="on" class="text-truncate">
                        <Flag v-if="manga.language" :value="manga.language"/>
                        <span class="chap-title">{{truncText(item.text)}}</span>
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
      <!-- Categories Menu -->
      <v-col :cols="submenu_col" class="d-flex justify-center" v-if="categories.length">
        <v-menu offset-x :close-on-content-click="false" max-height="196">
          <template v-slot:activator="{on, attrs}">
            <v-btn
              :color="color(-1)"
              v-bind="attrs"
              v-on="on"
              x-small
              :dark="!isDarkText"
            >
              {{i18n("list_details_cats")}}
              <v-icon
                right
                x-small
              >
                mdi-menu-down
             </v-icon>
            </v-btn>
          </template>
          <v-list
            :color="color(1)"
            dense
            :subheader="true"
            class="py-0"
          >
            <v-list-item
              link
              v-for="(item, index) of categories"
              :key="index"
              :style="index < categories.length - 1 ? 'border-bottom: 1px solid rgb(0 0 0 / 10%);': ''"
              :class="isDarkText ? 'dark-text' : 'light-text'"
              @click="hasCategory(item.name) ? deleteCategory(item.name) : addCategory(item.name)"
            >
              <v-list-item-title>
                {{ item.name }}
              </v-list-item-title>
              <v-list-item-action>
                <v-checkbox
                  dense
                  :dark="!isDarkText"
                  :input-value="hasCategory(item.name)"
                ></v-checkbox>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
      <!-- Updates Menu -->
      <v-col :cols="submenu_col" class="d-flex justify-center">
        <v-menu offset-x :close-on-content-click="false" max-height="196">
          <template v-slot:activator="{on, attrs}">
            <v-btn
              :color="color(-1)"
              v-bind="attrs"
              v-on="on"
              x-small
              :dark="!isDarkText"
            >
              {{i18n("options_gen_updates")}}
              <v-icon
                right
                x-small
              >
                mdi-menu-down
             </v-icon>
            </v-btn>
          </template>
          <v-list
            :color="color(1)"
            dense
            :subheader="true"
            class="py-0"
            :class="isDarkText ? 'dark-text' : 'light-text'"
          >
            <!-- un/follow updates -->
            <v-list-item link @click='toggleFollow()'>
              <v-list-item-title v-if="manga.read === 0">
                <v-icon small left>
                  mdi-bell-off-outline
                </v-icon>
                {{ i18n("list_details_act_stop_follow") }}
              </v-list-item-title>
              <v-list-item-title v-else>
                <v-icon small left>
                  mdi-bell-alert-outline
                </v-icon>
                {{ i18n("list_details_act_follow") }}
              </v-list-item-title>
            </v-list-item>
            <!-- start/stop updates -->
            <v-list-item link @click='toggleUpdate()'>
              <v-list-item-title v-if="manga.update === 1">
                <v-icon small left>
                  mdi-timer-off-outline
                </v-icon>
                {{ i18n("list_details_act_stop_updating") }}
              </v-list-item-title>
              <v-list-item-title v-else>
                <v-icon small left>
                  mdi-timer-outline
                </v-icon>
                {{ i18n("list_details_act_restart_updating") }}
              </v-list-item-title>
            </v-list-item>
            <!-- refresh manga chapter list -->
            <v-list-item link @click='refreshMangaNow();'>
              <v-list-item-title>
                <v-icon small left :class="loader">
                  mdi-refresh
                </v-icon>
                {{ i18n("refresh_chapters") }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
      <!-- More actions Menu -->
      <v-col :cols="submenu_col" class="d-flex justify-center">
        <v-menu offset-x :close-on-content-click="false" max-height="196">
          <template v-slot:activator="{on, attrs}">
            <v-btn
              :color="color(-1)"
              v-bind="attrs"
              v-on="on"
              x-small
              :dark="!isDarkText"
            >
              {{ i18n("list_details_more_actions") }}
              <v-icon
                right
                x-small
              >
                mdi-menu-down
             </v-icon>
            </v-btn>
          </template>
          <v-list
            :color="color(1)"
            dense
            :subheader="true"
            class="py-0"
            :class="isDarkText ? 'dark-text' : 'light-text'"
          >
            <!-- search this manga elsewhere -->
            <v-list-item link @click='searchElsewhere()'>
              <v-list-item-title>
                <v-icon small left>
                  mdi-text-search
                </v-icon>
                {{ i18n("list_details_act_search") }}
              </v-list-item-title>
            </v-list-item>
            <!-- Reset manga read status -->
            <v-list-item link @click='resetManga()'>
              <v-list-item-title>
                <v-icon small left>
                  mdi-restart
                </v-icon>
                {{ i18n("list_details_act_reset") }}
              </v-list-item-title>
            </v-list-item>
            <!-- Rename manga -->
            <v-list-item link @click='renameManga();'>
              <v-list-item-title>
                <v-icon x-small left :class="loader">
                  mdi-pencil-outline
                </v-icon>
                {{ i18n("list_details_rename_manga") }}
              </v-list-item-title>
            </v-list-item>
            <!-- Reset manga name -->
            <v-list-item link @click='resetName();' v-if="manga.displayName && manga.displayName !== ''">
              <v-list-item-title>
                <v-icon x-small left :class="loader">
                  mdi-pencil-off-outline
                </v-icon>
                {{ i18n("list_details_reset_name") }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>


      <!-- Manage manga bookmarks -->
      <v-col :cols="submenu_col" class="d-flex justify-center" v-if="bookmarks.length">
        <v-menu offset-x :close-on-content-click="false" max-height="196">
          <template v-slot:activator="{on, attrs}">
            <v-btn
              :color="color(-1)"
              v-bind="attrs"
              v-on="on"
              x-small
              :dark="!isDarkText"
            >
              {{ i18n("list_details_books") }}
              <v-icon
                right
                x-small
              >
                mdi-bookmark-multiple-outline
             </v-icon>
            </v-btn>
          </template>
          <v-list
            :color="color(1)"
            dense
            :subheader="true"
            class="py-0"
            :class="isDarkText ? 'dark-text' : 'light-text'"
          >
            <!-- search this manga elsewhere -->
            <v-list-item
              link
              v-for="(item, index) of bookmarks"
              :key="index"
              :style="index < bookmarks.length - 1 ? 'border-bottom: 1px solid rgb(0 0 0 / 10%);': ''"
              :class="isDarkText ? 'dark-text' : 'light-text'"
              @click="openBookmark(item.chapUrl)"
            >
              <v-list-item-title>
                {{item.type === 'scan' ? i18n("bookmarks_scan_title", item.chapName, item.scanName) : i18n("bookmarks_chapter_title", item.chapName)}}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import i18n from "../../../amr/i18n";
import browser from "webextension-polyfill";
import * as utils from "../../utils";
import * as amrutils from "../../../amr/utils";
import Flag from "./../Flag";

export default {
  data() {
    return {
      // current state of other grouped mangas panel
      expanded: false,
      // delete manga popup state
      deleteManga: false,
      selectable: false, // Should we show the multi select checkbox
      selected: false,
      canOpenTab: true, // This is used for a timer to hopefully eliminate weird duping issue
      refreshing: false,
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
    showProgress: function() {
      return this.options.disppercentage
    },
    // calculate reading progress
    progress: function() {
      return Math.floor((1 - this.posInChapList / this.manga.listChaps.length) * 100);
    },
    absoluteProgress: function() {
      return `${this.manga.listChaps.length - this.posInChapList}/${this.manga.listChaps.length}`
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
      if(this.isInGroup) {
        cols = 10
      }
      return cols
    },
    title_sm_col() {
      let cols = 10
      if(this.options.displastup === 1 && this.manga.upts != 0 && this.timeUpdated < 50) {
        cols = cols - 2
      }
      if(this.isInGroup) {
        cols = cols - 1
      }
      if(this.manga.update === 0) {
        cols = cols - 2
      }
      return cols
    },
    submenu_col() {
      if(this.categories.length && this.bookmarks.length) {
        return '3'
      } else {
        return '4'
      }
    },
    isDarkText: function() {
      return utils.darkText(this.manga, this.options)
    },
    categories() {
      return this.options.categoriesStates.filter(cat => cat.type !== 'native' && cat.type != 'language')
    },
    loader() {
      if(this.refreshing) {
        return 'custom-loader'
      }
      return ''
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
    truncText: function (str) {
      if (str.length > 100) {
        return str.slice(0, 100) + '...';
      } else {
        return str;
      }
    },
    /**
     * Mark last chapter as read
     */
    markAsRead() {
      browser.runtime.sendMessage({ 
        action: 'readManga',
        url: this.manga.url,
        mirror: this.manga.mirror,
        lastChapterReadName: this.manga.listChaps[0][0],
        lastChapterReadURL: this.manga.listChaps[0][1],
        name: this.manga.name,
        language: this.manga.language
      })
    },
    /**
     * Reset manga reading to first chapter for the group of mangas
     */
    resetManga() {
      browser.runtime.sendMessage({
        action: "resetManga",
        url: this.manga.url,
        language: this.manga.language
      })
    },
    /**
     * Toggle following manga updates for this group
     */
    toggleFollow: function() {
      browser.runtime.sendMessage({
        action: "markMangaReadTop",
        url: this.manga.url,
        language: this.manga.language,
        updatesamemangas: true,
        read: this.manga.read == 1 ? 0 : 1
      })

    },
    /**
     * Stop updating (looking for new chapters) mangas in this group
     */
    toggleUpdate: function() {
      browser.runtime.sendMessage({
        action: "markMangaUpdateTop",
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
      this.refreshing = true
      browser.runtime.sendMessage({
        action: 'refreshMangas',
        manga: this.manga
      })
      setTimeout(()=> this.refreshing = false, 2000)
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
    async trash() {
      browser.runtime.sendMessage({ action: "deleteManga", key: this.manga.key })
      this.deleteManga = false;
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
      browser.runtime.sendMessage({
        action: "removeCategoryFromManga",
        key: this.manga.key,
        name: cat
      })
    },
    addCategory: function(cat) {
      browser.runtime.sendMessage({
        action: "addCategoryToManga",
        key: this.manga.key,
        name: cat
      })
    },
    hasCategory: function(cat) {
      return this.manga.cats.includes(cat)
    },
    /**
     * Open bookmark in a new tab (the chapter corresponding to bookmark)
     */
    openBookmark: function(bm) {
      browser.runtime.sendMessage({ action: "opentab", url: bm });
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
  components: { Flag }
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

.amr-prog-cont {
  margin-left: 0px;
}
.amr-manga-waiting {
  margin-top: 7px;
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
.chap-title {
  font-size:13px;
}
.amr-noupdates {
  opacity: 0.75;
}
.min-h-26 {
 min-height: 26px;
}
.add {
  color:rgba(0, 0, 255, 0.3)!important;
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
.custom-loader {
  animation: loader 1s infinite;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
<style lang="css">
  .v-text-field.v-text-field--solo.v-input--dense>.v-input__control {
    min-height: 26px!important;
  }
</style>