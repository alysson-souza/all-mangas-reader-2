<template>
  <v-card v-if="shouldShow" 
    v-intersect="{
          handler: onIntersect,
          options: {
            threshold: 0,
            // add virtual margin so items are rendered outside of viewport
            rootMargin: '190px 0px 190px 0px' // 38px = 1 row height 
          }
        }"
    :class="color(3, true) + ' amr-manga-row' + (manga.update === 0 ? ' amr-noupdates' : '')"
  >
    <v-row :class="isDarkText ? 'dark-text' : 'light-text'">
      <v-lazy class="col-auto pr-0 mr-0" v-if="selectable && lazyLoad">
          <v-checkbox v-model="selected" hide-details dense class="shrink mr-2 mt-0"></v-checkbox>
      </v-lazy>
      <!-- Name, Last Updated -->
      <v-col cols="4" lg="5">
        <v-card :color="color(0)" class="back-card amr-manga-title-cont" :class="isInGroup && !isFirst && groupExpanded ? 'ml-4':''">
          <v-row no-gutters align="center" class="min-h-26">
            
              <!-- + / - icon if group of mangas  -->
              <v-lazy
                v-if="isInGroup && isFirst && lazyLoad"
                class="d-flex align-self-center"
                width="16px"
              >
                <v-icon small v-if="!groupExpanded" @click="emitExpand()">mdi-plus</v-icon>
                <v-icon small v-else @click="emitExpand()">mdi-minus</v-icon>
              </v-lazy>

              <!-- Mirror icons -->
              <v-lazy
                  v-if="lazyLoad"
                  width="20"
                  height="16"
                  :class="!isInGroup || isInGroup && !isFirst ? 'ml-1': ''"
              >
              <v-tooltip top content-class="icon-ttip">
                <template v-slot:activator="{ on }">
                  <img v-if="isMirrorEnabled" class="m-icon" width="16" height="16" :src="mirror.mirrorIcon" v-on="on" />
                  <v-icon v-else small v-on="on">mdi-cancel</v-icon>
                </template>
                <span>{{ isMirrorEnabled ? mirror.mirrorName : i18n("list_mirror_disabled_tooltip", manga.mirror) }}</span>
              </v-tooltip>
            </v-lazy>
            <!-- Manga name -->
            <v-col :sm="title_sm_col" :lg="title_lg_col">
              <v-tooltip top :disabled="!(manga.displayName && manga.displayName !== '')">
                <template v-slot:activator="{on}">
                  <div class="ml-1 d-flex ">
                    <span class="amr-manga-title text-truncate" v-on="on" @click="openManga">
                      {{ manga.displayName && manga.displayName !== '' ? manga.displayName : manga.name }}
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
                  <v-lazy>
                    <v-icon small v-if="manga.update === 0" class="mx-1" v-on="on">mdi-timer-off</v-icon>
                  </v-lazy>
                </template>
                <span>{{i18n("list_stopped_updating")}}</span>
              </v-tooltip>
              <!-- Display last update time -->
              <v-tooltip top content-class="icon-ttip">
                <template v-slot:activator="{ on }">
                <v-lazy>
                    <v-card flat v-if="options.displastup === 1 && manga.upts != 0 && timeUpdated < 50" dark :class="color(0)" v-on="on">
                      <span class="group mr-1">
                        <span v-if="timeUpdated > 0" class="text-caption">{{ timeUpdated }}</span>
                        <v-icon small>mdi-calendar-clock</v-icon>
                      </span>
                    </v-card>
                </v-lazy>
                </template>
                <v-lazy>
                  <span v-if="timeUpdated === 0">{{i18n("list_calendar_today")}}</span>
                  <span v-else>{{i18n("list_calendar_days_found", timeUpdated)}}</span>
                </v-lazy>
              </v-tooltip>
            </div>
          </v-row>
        </v-card>
      </v-col>
      <!-- Select List -->
      <v-col 
        :cols="selectable ? '3' : '4'"
        :lg="selectable ? '4': '5'"
      >
        <v-card :color="color(0)" class="back-card" :rounded="true" :flat="listChaps.length ? true : false">
              <!-- List of chapters -->
              <div v-if="listChaps.length" class="amr-prog-cont">
                  <v-select
                    v-if="displayChapterSelectMenu"
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
                          <v-lazy
                            width="12"
                          >
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
                          </v-lazy>
                        </template>
                        <span>{{i18n("list_progress_reading", progress, absoluteProgress)}}</span>
                      </v-tooltip>
                      <v-divider
                        class="ml-2 mr-1"
                        vertical
                      ></v-divider>
                    </template>
                    <template v-slot:selection="{on, item}">
                          <div v-on="on" class="d-flex align-center text-truncate align-content-space-between">
                            <v-lazy v-if="manga.language" width="16" height="20">
                              <Flag :value="manga.language"/>
                            </v-lazy>
                            <span class="chap-title text-truncate" :class="manga.language ? 'ml-1': ''">{{item.text}}</span>
                          </div>
                    </template>
                  </v-select>
                </div>
              <div v-else>
                <v-lazy>
                  <!-- Loading bar if chapters list is not loaded yet-->
                  <v-progress-linear v-if="isMirrorEnabled" :indeterminate="true" height="4" :color="color(2)"></v-progress-linear>
                  <span v-else>
                    {{ isMirrorEnabled ? mirror.mirrorName : i18n("list_mirror_disabled", manga.mirror) }}
                  </span>
                </v-lazy>
              </div>
        </v-card>
      </v-col>
      <!-- Actions -->
      <v-col cols="4" lg="2" class="amr-list-actions text-center ml-auto">
          <v-card  :color="color(0)" class="back-card px-3 min-h-26">
            <div v-if="displayActionMenu" class="d-flex min-h-26 justify-space-between">
            <!-- Mark as read -->
            <v-tooltip top content-class="icon-ttip">
              <template v-slot:activator="{ on }">
                <v-lazy v-if="manga.hasNew" height="22" class="align-self-center"> 
                  <v-icon v-on="on" @click="markAsRead()">mdi-eye</v-icon>
                </v-lazy>
              </template>
              <span>{{i18n("list_mg_act_read")}}</span>
            </v-tooltip>
            <!-- Empty icon if all read -->
            <v-lazy v-if="!manga.hasNew" height="22" class="align-self-center">
              <v-icon  class="empty-icon"></v-icon>
            </v-lazy>
            
            <!-- Previous chapter -->
            <v-tooltip top content-class="icon-ttip">
              <template v-slot:activator="{ on }">
              <v-lazy v-if="posInChapList < listChaps.length - 1" height="22" class="align-self-center">
                <v-icon v-on="on" @click="play(-1)">mdi-chevron-left</v-icon>
              </v-lazy>
              </template>
              <span>{{i18n("list_mg_act_prev")}}</span>
            </v-tooltip>
            <!-- Empty icon if no previous -->
            <v-lazy v-if="posInChapList === listChaps.length - 1">
              <v-icon class="empty-icon"></v-icon>
            </v-lazy>
            <!-- Current chapter play -->
            <v-lazy v-if="!isMirrorEnabled">
              <v-icon class="empty-icon"></v-icon>
            </v-lazy>

            <v-tooltip top content-class="icon-ttip">
              <template v-slot:activator="{ on }">
                <v-lazy v-if="isMirrorEnabled" height="22" class="align-self-center">
                  <v-icon v-on="on" @click="play(0)">mdi-play</v-icon>
                </v-lazy>
              </template>
              <span>{{i18n("list_mg_act_cur")}}</span>
            </v-tooltip>
            <!-- Next chapter play -->
            <v-tooltip top content-class="icon-ttip">
              <template v-slot:activator="{ on }">
                <v-lazy v-if="posInChapList > 0" height="22" class="align-self-center">
                  <v-icon v-on="on" @click="play(1)">mdi-chevron-right</v-icon>
                </v-lazy>
              </template>
              <span>{{i18n("list_mg_act_next")}}</span>
            </v-tooltip>
            <!-- Empty icon if no next chapter -->
            <v-lazy v-if="posInChapList === 0"> 
              <v-icon class="empty-icon"></v-icon>
            </v-lazy>
            <!-- Last chapter play -->
            <v-lazy v-if="!isMirrorEnabled">
              <v-icon class="empty-icon"></v-icon>
            </v-lazy>
            
            <v-tooltip top content-class="icon-ttip">
              <template v-slot:activator="{ on }">
                <v-lazy v-if="isMirrorEnabled" height="22" class="align-self-center">
                  <v-icon v-on="on" @click="play(Infinity)">mdi-page-last</v-icon>
                </v-lazy>
              </template>
              <span>{{i18n("list_mg_act_latest")}}</span>
            </v-tooltip>
            <!-- Delete manga -->
            <v-tooltip top content-class="icon-ttip">
              <template v-slot:activator="{ on }">
                <v-lazy height="22" class="align-self-center"> 
                  <v-icon v-on="on" @click="deleteManga = true">mdi-delete</v-icon>
                </v-lazy>
              </template>
              <span>{{i18n("list_mg_act_delete")}}</span>
            </v-tooltip>
            <!-- Expand Menu -->
            <v-lazy height="22" class="align-self-center">
              <v-icon @click="expanded = !expanded">mdi-dots-vertical</v-icon>
            </v-lazy>
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
            </div>
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
import i18n from "../../amr/i18n";
import browser from "webextension-polyfill";
import * as utils from "../utils";
import * as amrutils from "../../amr/utils";
import Flag from "./Flag";

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
      displayChapterSelectMenu: false,
      displayActionMenu: false,
      lazyLoad: false,
      listChaps: [],
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
    "groupIndex",
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
      return this.listChaps.map(arr => {
        return { value: amrutils.chapPath(arr[1]), text: arr[0], url: arr[1] };
      });
    },
    showProgress: function() {
      return this.options.disppercentage
    },
    // calculate reading progress
    progress: function() {
      return Math.floor((1 - this.posInChapList / this.listChaps.length) * 100);
    },
    absoluteProgress: function() {
      return `${this.listChaps.length - this.posInChapList}/${this.listChaps.length}`
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
      if(this.manga.update === 0) {
        cols = cols - 1
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
      return utils.darkText(this.manga, this.manga.hasNew, this.options)
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
      onIntersect (entries, observer) {
        this.lazyLoad = entries[0].isIntersecting
        if(this.lazyLoad) {
          const chaps = this.$store.state.mangas.all.find(manga => manga.key === this.manga.key)
          if(chaps) this.listChaps = chaps.listChaps
        } else {
          this.listChaps = []
        }
      },
    i18n: (message, ...args) => i18n(message, ...args),
    /**
     * Return the right color for this manga, depending if it updates (you can stop following udates for a manga), if it has unread chapters or not
     */
    color: function(light, invertable = false) {
      if (this.options.alternateColors && invertable) {
        let odd = (this.groupIndex + 1) % 2 == 1
        light += odd ? -2 : 1
      }
      return utils.getColor(this.manga, this.manga.hasNew, this.options, light);
    },
    /** get the real url from the value (url path used in select) in the manga list */
    urlFromValue: function(val) {
      return this.listChaps.find(
        arr => amrutils.chapPath(arr[1]) === val
      )[1];
    },
    /**
     * Mark last chapter as read
     */
    markAsRead() {
      browser.runtime.sendMessage({ 
        action: 'readManga',
        url: this.manga.url,
        mirror: this.manga.mirror,
        lastChapterReadName: this.listChaps[0][0],
        lastChapterReadURL: this.listChaps[0][1],
        name: this.manga.name,
        language: this.manga.language
      })
      self.$store.dispatch(
        'autoExportReadStatus',
        {
          url: this.manga.url,
          mirror: this.manga.mirror,
          lastChapterReadName: this.listChaps[0][0],
          lastChapterReadURL: this.listChaps[0][1],
          name: this.manga.name,
          language: this.manga.language
        },
        {
          root: true
        }
      )
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
        else if (pos >= this.listChaps.length)
          pos = this.listChaps.length - 1;
      }
      browser.runtime.sendMessage({
        action: "opentab",
        url: this.listChaps[pos][1]
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
    lazyLoad(newValue, oldValue) {
      if(newValue === oldValue) return
      if(newValue) {
        this.displayChapterSelectMenu = true
        this.displayActionMenu = true
      } else {
        this.displayChapterSelectMenu = false
        this.displayActionMenu = false
      }
    },
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
.group {
  display:flex;
  flex:1;
  justify-content: space-evenly;
}
.dark-text * {
  color: #424242 !important;
}
.light-text * {
  color: #fafafa !important;
}
.amr-manga-title {
  font-weight: bold;
  cursor: pointer;
  max-width: 700px!important
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
  max-width:600px!important
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
    margin-right: 2px!important;
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