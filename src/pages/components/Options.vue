<template>
  <div>
    <v-tabs v-model="tabs" fixed-tabs >
      <v-tabs-slider></v-tabs-slider>
      <v-tab href="#onwebsites" class="primary--text">
        {{ i18n("options_on_websites") }}
      </v-tab>
      <v-tab href="#general" class="primary--text">
        {{ i18n("options_general") }}
      </v-tab>
      <v-tab href="#supported" class="primary--text">
        {{ i18n("options_supported") }}
      </v-tab>
      <v-tab href="#mirror" class="primary--text">
        {{ i18n("options_mirror_specific") }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabs" class="elevation-1">
      <v-tab-item value="onwebsites" v-if="tabs === 'onwebsites'">
        <v-container fluid>
          <!-- Display options -->
          <div class="headline">{{ i18n("options_web_chapter_display_mode") }}</div>
          <div class="subtitle mb-3">{{i18n('options_web_chapter_desc')}}</div>
              
          <!-- Display as a book option -->
          <div class="subtitle">{{i18n('option_read_book')}}</div>
          <v-checkbox v-model="displayBook" @change="setOption('displayBook')" 
                  :label="i18n('options_web_chapter_display_book_opt')"></v-checkbox>
          <!-- Reading direction -->
          <div v-if="displayBook">
            <div class="subtitle">{{ i18n("options_web_chapter_reading_direction_opt") }}</div>
            <v-radio-group v-model="readingDirection" @change="setOption('readingDirection')" column>
              <v-radio :label="i18n('option_read_book_ltr')" :value="0" ></v-radio>
              <v-radio :label="i18n('option_read_book_rtl')" :value="1"></v-radio>
            </v-radio-group>
          </div>

          <!-- Display full chapter option -->
          <div class="subtitle">{{i18n('option_read_fullchapter')}}</div>
          <v-checkbox v-model="displayFullChapter" @change="setOption('displayFullChapter')"
                  :label="i18n('options_web_chapter_display_full_chapter_opt')"></v-checkbox>
          
          <!-- Scaling mode -->
          <div class="subtitle">{{ i18n("options_web_chapter_resize_mode_opt") }}</div>
          <v-radio-group v-model="resizeMode" @change="setOption('resizeMode')" column>
            <v-radio :label="i18n('option_read_resize_w')" :value="0" ></v-radio>
            <v-radio :label="i18n('option_read_resize_h')" :value="1" v-show="!displayFullChapter" ></v-radio>
            <v-radio :label="i18n('option_read_resize_c')" :value="2" v-show="!displayFullChapter" ></v-radio>
            <v-radio :label="i18n('option_read_resize_n')" :value="3" ></v-radio>
          </v-radio-group>

          <!-- Display dark reader option -->
          <div class="subtitle">{{i18n('options_web_chapter_darkreader_desc')}}</div>
          <v-checkbox v-model="darkreader" @change="setOption('darkreader')"
                  :label="i18n('options_web_chapter_darkreader_opt')"></v-checkbox>

          <!-- Thin Scan option -->
          <div class="subtitle">{{i18n('options_web_chapter_thinscan_desc')}}</div>
          <v-select v-model="thinscan" :items="thinscan_values" @change="setOption('thinscan')"></v-select>

           <!-- Default to webtoon mode -->
          <div class="subtitle">{{i18n('options_webtoon_mode_default')}}</div>
          <v-checkbox v-model="webtoonDefault" @change="setOption('webtoonDefault')"
                  :label="i18n('options_webtoon_mode_default_option')"></v-checkbox>

              
          <!-- Loading options -->
          <div class="headline">{{ i18n("options_web_loading") }}</div>
          <!-- Loading progression -->
          <div class="subtitle">{{i18n('options_web_load_desc')}}</div>
          <v-checkbox v-model="load" @change="setOption('load')"
                  :label="i18n('options_web_load_opt')"></v-checkbox>
          <!-- Loading images in the order -->
          <div class="subtitle">{{i18n('options_web_imgorder_desc')}}</div>
          <v-checkbox v-model="imgorder" @change="setOption('imgorder')"
                  :label="i18n('options_web_imgorder_opt')"></v-checkbox>
          <!-- Prefetch next chapter -->
          <div class="subtitle">{{i18n('options_web_prefetch_desc')}}</div>
          <v-checkbox v-model="prefetch" @change="setOption('prefetch')"
                  :label="i18n('options_web_prefetch_opt')"></v-checkbox>
          <!-- Mark chapter as read when loaded -->
          <div class="subtitle">{{i18n('options_web_markwhendownload_desc')}}</div>
          <v-checkbox v-model="markwhendownload" @change="setOption('markwhendownload')"
                  :label="i18n('options_web_markwhendownload_opt')"></v-checkbox>
          <!-- Automatically add manga to updates list -->
          <div class="subtitle">{{i18n('options_web_addauto_desc')}}</div>
          <v-checkbox v-model="addauto" @change="setOption('addauto')"
                  :label="i18n('options_web_addauto_opt')"></v-checkbox>
        </v-container>
      </v-tab-item>
      <v-tab-item value="general" v-if="tabs === 'general'">
        <v-container fluid>
          <!-- AMR aspect -->
          <div class="headline">{{ i18n("options_gen_aspect") }}</div>
          <!-- Open in new tab -->
          <div class="subtitle">{{i18n('options_gen_newTab_desc')}}</div>
          <v-checkbox v-model="newTab" @change="setOption('newTab')"
                  :label="i18n('options_gen_newTab_opt')"></v-checkbox>
          <!-- Group mangas with same name -->
          <div class="subtitle">{{i18n('options_gen_groupmgs_desc')}}</div>
          <v-checkbox v-model="groupmgs" @change="setOption('groupmgs')"
                  :label="i18n('options_gen_groupmgs_opt')"></v-checkbox>
          <!-- Display badge last update -->
          <div class="subtitle">{{i18n('options_gen_displastup_desc')}}</div>
          <v-checkbox v-model="displastup" @change="setOption('displastup')"
                  :label="i18n('options_gen_displastup_opt')"></v-checkbox>
          <!-- Dark popup -->
          <div class="subtitle">{{i18n('options_gen_dark_desc')}}</div>
          <v-checkbox v-model="dark" @change="setOption('dark')"
                  :label="i18n('options_gen_dark_opt')"></v-checkbox>
          
          <!-- Mangas with new chapters color -->
          <div class="subtitle">{{ i18n("options_gen_colors_new") }}</div>
          <v-radio-group v-model="colornew" @change="setOption('colornew')" row class="colored-radio">
            <v-radio v-for="c in colors" :key="c" :value="c" :color="getColor(c)" :class="getTextColor(c)" ></v-radio>
          </v-radio-group>
          <!-- Mangas with read chapters color -->
          <div class="subtitle">{{ i18n("options_gen_colors_read") }}</div>
          <v-radio-group v-model="colorread" @change="setOption('colorread')" row class="colored-radio">
            <v-radio v-for="c in colors" :key="c" :value="c" :color="getColor(c)" :class="getTextColor(c)" ></v-radio>
          </v-radio-group>
          <!-- Mangas with notfollow chapters color -->
          <div class="subtitle">{{ i18n("options_gen_colors_notfollow") }}</div>
          <v-radio-group v-model="colornotfollow" @change="setOption('colornotfollow')" row class="colored-radio">
            <v-radio v-for="c in colors" :key="c" :value="c" :color="getColor(c)" :class="getTextColor(c)" ></v-radio>
          </v-radio-group>

          <!-- Create inverted color scheme -->
          <div class="subtitle">{{i18n('options_invert_color_scheme')}}</div>
          <v-checkbox v-model="alternateColors" @change="setOption('alternateColors')"
                  :label="i18n('options_invert_color_scheme_option')"></v-checkbox>

          <!-- Updates -->
          <div class="headline">{{ i18n("options_gen_updates") }}</div>
          <!-- Update chapters list -->
          <div class="subtitle">
            <v-container fluid class="opt-container">
              <v-row  >
                <v-col cols="4" class="sel-title">
                  {{ i18n("options_gen_update_chap_label") }} : 
                </v-col>
                <v-col cols="4">
                  <v-select v-model="updatechap" :items="update_chap_values"></v-select>
                </v-col>
                <v-col>
                  <v-btn color="primary" class="btn-sel" small 
                      @click="updateChaps()" 
                      :loading="loadingChapters" 
                      :disabled="loadingChapters">
                      {{i18n("options_update_chap_btn")}}
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </div>
          <!-- Stop updates for a week -->
          <div class="subtitle">{{i18n('options_gen_stopupdateforaweek_desc')}}</div>
          <v-checkbox v-model="stopupdateforaweek" @change="setOption('stopupdateforaweek')"
                  :label="i18n('options_gen_stopupdateforaweek_opt')"></v-checkbox>
          
          <!-- Update on startup -->
          <div class="subtitle">{{i18n('options_gen_checkmgstart_desc')}}</div>
          <v-checkbox v-model="checkmgstart" @change="setOption('checkmgstart')"
                  :label="i18n('options_gen_checkmgstart_opt')"></v-checkbox>
          <!-- Spin icon while loading chapters -->
          <div class="subtitle">{{i18n('options_gen_refreshspin_desc')}}</div>
          <v-checkbox v-model="refreshspin" @change="setOption('refreshspin')"
                  :label="i18n('options_gen_refreshspin_opt')"></v-checkbox>
          <!-- Save bandwidth while loading chapters -->
          <div class="subtitle">{{i18n('options_gen_savebandwidth_desc')}}</div>
          <v-checkbox v-model="savebandwidth" @change="setOption('savebandwidth')"
                  :label="i18n('options_gen_savebandwidth_opt')"></v-checkbox>
          <!-- Wait for n seconds between two chapters update request -->
          <div class="subtitle">{{i18n('options_gen_waitbetweenupdates_desc')}}</div>
          <div class="subtitle">
            <v-container fluid class="opt-container">
              <v-row  >
                <v-col cols="6" class="sel-title">
                  {{ i18n("options_gen_waitbetweenupdates_opt") }} : 
                </v-col>
                <v-col cols="6">
                  <v-select v-model="waitbetweenupdates" :items="wait_update_values"></v-select>
                </v-col>
              </v-row>
            </v-container>
          </div>
          <!-- Display grey 0 when no new -->
          <div class="subtitle">{{i18n('options_gen_displayzero_desc')}}</div>
          <v-checkbox v-model="displayzero" @change="setOption('displayzero')"
                  :label="i18n('options_gen_displayzero_opt')"></v-checkbox>
          <!-- Grey sharingan if no new -->
          <div class="subtitle">{{i18n('options_gen_nocount_desc')}}</div>
          <v-checkbox v-model="nocount" @change="setOption('nocount')"
                  :label="i18n('options_gen_nocount_opt')"></v-checkbox>
          
          <!-- Notifications -->
          <div class="headline">{{ i18n("options_gen_notifs") }}</div>
          <!-- Notify on new chapter -->
          <div class="subtitle">{{i18n('options_gen_shownotifications_desc')}}</div>
          <v-checkbox v-model="shownotifications" @change="setOption('shownotifications')"
                  :label="i18n('options_gen_shownotifications_opt')"></v-checkbox>
          <!-- Time to close notification -->
          <div class="subtitle">
            <v-container fluid class="opt-container">
              <v-row  >
                <v-col cols="6" class="sel-title">
                  {{ i18n("options_gen_notificationtimer_label") }} : 
                </v-col>
                <v-col cols="6">
                  <v-select v-model="notificationtimer" :items="notificationtimer_values"></v-select>
                </v-col>
              </v-row>
            </v-container>
          </div>
          <!-- Notify on new version of the app -->
          <div class="subtitle">{{i18n('options_gen_notifynewversion_desc')}}</div>
          <v-checkbox v-model="notifynewversion" @change="setOption('notifynewversion')"
                  :label="i18n('options_gen_notifynewversion_opt')"></v-checkbox>
          
          <!--Allow tracking of reading -->
          <div class="subtitle">{{i18n('options_gen_allowtracking_desc')}}</div>
          <v-checkbox v-model="allowtracking" @change="setOption('allowtracking')"
                  :label="i18n('options_gen_allowtracking_opt')"></v-checkbox>
          
          <!-- Synchronization -->
          <div class="headline">{{ i18n("options_sync_title") }}</div>
          <div class="subtitle">{{i18n('options_sync_manga_list_desc')}}</div>
          <v-alert v-if="!syncEnabled"  :value="true" color="error" icon="mdi-alert-octagon" outline>
            {{i18n('options_sync_title_warning')}}
          </v-alert>

          <v-checkbox v-model="syncEnabled" @change="setOption('syncEnabled')"
                      :label="i18n('options_sync_checkbox')"></v-checkbox>

          <!-- Synchronization -->
          <div class="headline">{{ i18n("options_search_title") }}</div>
          <div class="subtitle">{{i18n('options_search_open_series_desc')}}</div>
          <v-checkbox v-model="searchOpenSeries" @change="setOption('searchOpenSeries')"
                      :label="i18n('options_search_open_series_checkbox')"></v-checkbox>
        </v-container>
      </v-tab-item>
      <v-tab-item value="supported">
        <v-container fluid>
          <!-- Languages -->
          <div class="headline">{{ i18n("options_sup_languages") }}</div>
          <div class="subtitle">{{i18n('options_sup_languages_desc')}}</div>
          <Flag 
              v-for="lang in alllangs" 
              :key="lang.flag" 
              :value="lang.flag" 
              @click.native="clickReadLanguage(lang.languages)"
              big
              :class="'flag-list ' + (isReadable(lang.flag) ? '' : 'flag-disabled')" />
          <!-- Deactivate unreadable websites-->
          <div class="subtitle">{{i18n('options_sup_deactivate_unreadable_desc')}}</div>
          <v-checkbox v-model="deactivateunreadable" @change="setOption('deactivateunreadable')"
                  :label="i18n('options_sup_deactivate_unreadable')"></v-checkbox>

          <!-- Supported websites -->
          <div class="headline">{{ i18n("options_supported") }}</div>
          <div class="subtitle">{{i18n('options_sup_desc')}}</div>
          <!-- Filters -->
          <v-row class="mt-2 flex">
            <v-col cols="4">
              <v-select v-model="selectedLang" :items="distinctLangs"></v-select>
            </v-col>
            <v-col cols="8">
              <v-btn @click="deactivateAll()" color="primary" small>{{i18n('options_gen_deactivate_all')}}</v-btn>
              <v-btn @click="activateAll()" color="primary" small>{{i18n('options_gen_activate_all')}}</v-btn>
            </v-col>
          </v-row>
          <v-data-table
              :headers="headersSupportedWebsites"
              :items="supportedWebsites"
              item-key="mirrorName"
              hide-actions
              class="elevation-1"
              disable-pagination
              dense
              hide-default-header
              hide-default-footer
          >
            <template v-slot:header="{ props: { headers } }">
              <thead>
                <tr>
                  <th
                      v-for="header in headers"
                      :key="header.text"
                      class="column"
                  >
                    {{ header.text }}
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:body="{ items }">
              <tbody>
                <tr v-for="item in items" :key="item.mirrorName" :active="item.activated" @click="item.activated = !item.activated">
                  <td>
                    <img :src="item.mirrorIcon" class="mirror-icon" />
                    {{ item.mirrorName }}
                    <!-- Badge with number of mangas read -->
                    <v-card v-if="nbMangas(item.mirrorName) > 0" color="primary" dark class="mirror-manga-info">
                      {{ i18n('options_gen_mirrornbmangas', nbMangas(item.mirrorName)) }}
                    </v-card>
                  </td>
                  <td class="text-right td-langs">
                    <span v-for="(lang, key) in item.languages.split(',')" :key="key">
                      <Flag :value="lang" />
                    </span>
                  </td>
                  <td class="text-right">
                    <v-checkbox :disabled="nbMangas(item.mirrorName) > 0" v-model="item.activated" @change="changeActivation(item)"/>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-data-table>
          <!-- Laboratory -->
          <div class="headline mt-4">{{ i18n("options_sup_repos") }}</div>
          <div class="subtitle">{{i18n('options_sup_repos_desc')}}</div>
          <v-row >
            <v-col cols="12">
              <v-btn color="primary" dark class="mb-2" @click="goLab()" small>{{i18n('options_gen_laboratory')}}</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
      <v-tab-item value="mirror">
        <v-container fluid>
          <!-- Mangadex Options -->
          <div class="text-h5">{{ i18n("options_mirror_specific_mangadex") }}</div>
          <!-- Datasaver option -->
          <div class="text-h6">{{i18n('options_mangadex_datasaver')}}</div>
          <v-checkbox v-model="mangadexDataSaver" @change="setOption('mangadexDataSaver')"
                :label="i18n('options_mangadex_datasaver_label')"></v-checkbox>
          <!-- Image Server option -->
          <div class="text-h6">{{i18n('options_mangadex_image_server')}}</div>
          <div class="text-body-1">
            <v-container fluid class="opt-container">
              <v-row  >
                <v-col cols="6" class="sel-title">
                  {{ i18n("options_mangadex_image_server_label") }} : 
                </v-col>
                <v-col cols="6">
                  <v-select v-model="mangadexImageServer" :items="mangadex_image_server_values"></v-select>
                </v-col>
              </v-row>
            </v-container>
          </div>
          <!-- Blocked Groups - ->
          <div class="text-h6">{{i18n('options_mangadex_blocked_groups')}}</div>
          <div class="text-body-1">{{i18n('options_mangadex_blocked_groups_label')}}</div>
          <v-text-field v-model="arrays.mangadexBlockedGroups.value" dense outlined>
            <template v-slot:prepend>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                </template>
                {{i18n('options_numeric')}}
              </v-tooltip>
            </template>
            <template v-slot:append-outer>
              <v-btn rounded @click="addArrayEntry('mangadexBlockedGroups')" disabled>Add (Not Implimented)</v-btn>
            </template>
          </v-text-field>
          <v-card v-if="arrays.mangadexBlockedGroups.array.length">
            <v-chip 
              v-for="(group, index) in arrays.mangadexBlockedGroups.array" 
              :key="index"
              close
              @click:close="removeArrayEntry('mangadexBlockedGroups', index)"
            >
              {{ group }}
            </v-chip>
          </v-card>
          <!- - Preferred Groups - ->
          <div class="text-h6">{{i18n('options_mangadex_preferred_groups')}}</div>
          <div class="text-body-1">{{i18n('options_mangadex_preferred_groups_label')}}</div>
          <v-text-field v-model="arrays.mangadexPreferredGroups.value" dense outlined> 
            <template v-slot:prepend>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                </template>
                {{i18n('options_numeric')}}
              </v-tooltip>
            </template>
            <template v-slot:append-outer>
              <v-btn rounded @click="addArrayEntry('mangadexPreferredGroups')" disabled>Add (Not Implimented)</v-btn>
            </template>
          </v-text-field>
          <v-card v-if="arrays.mangadexPreferredGroups.array.length">
            <v-chip 
              v-for="(group, index) in arrays.mangadexPreferredGroups.array" 
              :key="index"
              close
              @click:close="removeArrayEntry('mangadexPreferredGroups', index)"
            >
              {{ group }}
            </v-chip>
          </v-card> -->
        </v-container>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<script>
import i18n from "../../amr/i18n";
import browser from "webextension-polyfill";
import amrUpdater from "../../amr/amr-updater";
import Flag from "./Flag";
import * as amrutils from "../../amr/utils";
import * as utils from "../utils";
import { getSyncSchedule } from '../../amr/sync/sync-schedule'
import { THINSCAN } from '../../amr/options';

/**
 * Converters to format options in db and in page (ex : booleans are store as 0:1 in db)
 */
const converters = {
  /** Boolean to 0:1 converter */
  boolTo01: {
    fromDb: val => val === 1,
    toDb: val => (val ? 1 : 0),
    properties: [
      "resize",
      "load",
      "imgorder",
      "prefetch",
      "markwhendownload",
      "addauto",
      "newTab",
      "groupmgs",
      "displastup",
      "dark",
      "checkmgstart",
      "refreshspin",
      "savebandwidth",
      "displayzero",
      "nocount",
      "shownotifications",
      "notifynewversion",
      "allowtracking",
      "stopupdateforaweek",
      "deactivateunreadable",
      "displayBook",
      "displayFullChapter",
      "darkreader",
      "syncEnabled",
      "searchOpenSeries",
      "mangadexDataSaver",
      "webtoonDefault",
      "alternateColors"
    ]
  }
};

export default {
  data() {
    // default options
    let res = {
      tabs: null,
      colors: [
        "red#l3",
        "red",
        "red#d3",
        "pink#l3",
        "pink",
        "pink#d3",
        "purple#l3",
        "purple",
        "purple#d3",
        "deep-purple#l3",
        "deep-purple",
        "deep-purple#d3",
        "indigo#l3",
        "indigo",
        "indigo#d3",
        "blue#l3",
        "blue",
        "blue#d3",
        "light-blue#l3",
        "light-blue",
        "light-blue#d3",
        "cyan#l3",
        "cyan",
        "cyan#d3",
        "teal#l3",
        "teal",
        "teal#d3",
        "green#l3",
        "green",
        "green#d3",
        "light-green#l3",
        "light-green",
        "light-green#d3",
        "lime#l3",
        "lime",
        "lime#d3",
        "yellow#l3",
        "yellow",
        "yellow#d3",
        "amber#l3",
        "amber",
        "amber#d3",
        "orange#l3",
        "orange",
        "orange#d3",
        "deep-orange#l3",
        "deep-orange",
        "deep-orange#d3",
        "brown#l3",
        "brown",
        "brown#d3",
        "blue-grey#l3",
        "blue-grey",
        "blue-grey#d3",
        "grey#l3",
        "grey",
        "grey#d3"
      ],
      update_chap_values: [
        { value: 5 * 60 * 1000, text: i18n("options_minutes", 5) },
        { value: 10 * 60 * 1000, text: i18n("options_minutes", 10) },
        { value: 15 * 60 * 1000, text: i18n("options_minutes", 15) },
        { value: 30 * 60 * 1000, text: i18n("options_minutes", 30) },
        { value: 1 * 60 * 60 * 1000, text: i18n("options_hours", 1) },
        { value: 2 * 60 * 60 * 1000, text: i18n("options_hours", 2) },
        { value: 6 * 60 * 60 * 1000, text: i18n("options_hours", 6) },
        { value: 12 * 60 * 60 * 1000, text: i18n("options_hours", 12) },
        { value: 24 * 60 * 60 * 1000, text: i18n("options_days", 1) },
        { value: 7 * 24 * 60 * 60 * 1000, text: i18n("options_week", 1) }
      ],
      thinscan_values: [
        { value: THINSCAN.ask, text: i18n("options_web_chapter_thinscan_ask") },
        { value: THINSCAN.adjust, text: i18n("options_web_chapter_thinscan_adjust") },
        { value: THINSCAN.no_adjust, text: i18n("options_web_chapter_thinscan_no_adjust") },
      ],
      loadingChapters: false,
      wait_update_values: [
        { value: 0, text: i18n("options_gen_waitbetweenupdates_0") },
        { value: 1, text: i18n("options_seconds", 1) },
        { value: 2, text: i18n("options_seconds", 2) },
        { value: 3, text: i18n("options_seconds", 3) },
        { value: 4, text: i18n("options_seconds", 4) },
        { value: 5, text: i18n("options_seconds", 5) },
        { value: 10, text: i18n("options_seconds", 10) },
        { value: 20, text: i18n("options_seconds", 20) },
        { value: 30, text: i18n("options_seconds", 30) },
        { value: 60, text: i18n("options_minutes", 1) },
      ],
      loadingMirrors: false,
      notificationtimer_values: [
        { value: 0, text: i18n("options_gen_notificationtimer_def") },
        { value: 5 * 1000, text: i18n("options_seconds", 5) },
        { value: 10 * 1000, text: i18n("options_seconds", 10) },
        { value: 15 * 1000, text: i18n("options_seconds", 15) },
        { value: 30 * 1000, text: i18n("options_seconds", 30) },
        { value: 60 * 1000, text: i18n("options_minutes", 1) },
        { value: 2 * 60 * 1000, text: i18n("options_minutes", 2) }
      ],
      headersSupportedWebsites: [
        { text: i18n("options_gen_mirrors_header_name"), value: "name" },
        { text: i18n("options_gen_mirrors_header_lang"), value: "lang" },
        { text: i18n("options_gen_mirrors_header_act"), value: "activ" },
      ],
      mangadex_image_server_values: [
        {value: "none", text: i18n('options_mangadex_image_server_none')},
        {value: "na", text: "na"},
        {value: "na2", text: "na2"},
      ],
      newRepo: "",
      newRepositoryDialog: false,
      selectedLang: "",
    };
    // add all options properties in data model; this properties are the right one in store because synchronization with background has been called by encapsuler (popup.js / other) before initializing vue
    res = Object.assign(res, this.$store.state.options);

    // Create array for these values so they can be added as chips
    res.arrays = {
      mangadexBlockedGroups: {
        array: this.$store.state.options.mangadexBlockedGroups.length ? this.$store.state.options.mangadexBlockedGroups.split(',') : [],
        value: ""
      },
      mangadexPreferredGroups: {
        array: this.$store.state.options.mangadexPreferredGroups.length ? this.$store.state.options.mangadexPreferredGroups.split(',') : [],
        value: ""
      }
    }

    // convert values
    Object.keys(converters).forEach(key => {
      for (let prop of converters[key].properties) {
        this[prop] = converters[key].fromDb(this[prop]);
      }
    });
    return res;
  },
  components: {Flag},
  computed: {
      supportedWebsites() {
          return this.$store.state.mirrors.all
      },
      distinctLangs() {
          let dis = [];
          dis.push({value: "", text: i18n("options_gen_mirrors_filter_all")});
          let dislangs = this.$store.state.mirrors.all.reduce((dm, mir) => {
              mir.languages.split(",").forEach(lang => !dm.includes(lang) ? dm.push(lang) : dm)
              return dm;
          }, []);
          dis.push(...dislangs.map(lang => {return {value: lang, text: this.getLang(lang)}}));
          return dis;
      },
      /** Return list of all languages supported in AMR */
      alllangs() {
          return amrutils.languages.map(el => {
              return {
                  flag: Array.isArray(el) ? el[0]: el,
                  languages: el
              }
          })
      }
  },
  watch: {
    /**
     * For v-select, v-model is updated after event change is called so we
     * need to watch the value to update the model properly
     */
    updatechap: function(n, o) {
      this.setOption("updatechap");
    },
    updatemg: function(n, o) {
      this.setOption("updatemg");
    },
    waitbetweenupdates: function(n, o) {
        this.setOption("waitbetweenupdates");
    },
    mangadexImageServer: function(n, o) {
        this.setOption("mangadexImageServer");
    },
    displayzero: function() {
      amrUpdater.refreshBadgeAndIcon();
    },
    nocount: function() {
      amrUpdater.refreshBadgeAndIcon();
    },
    /** If switch from single page to fullchapter and resize mode is height or container, set it to width */
    displayFullChapter(nVal, oVal) {
        if (nVal && [1, 2].includes(this.resizeMode)) {
            this.resizeMode = 0
        }
    }
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    /**
     * Set an option value
     */
    setOption(optstr) {
      //option value in the data model
      let val = this[optstr];
      // Set dark mode before conversion
      if (optstr === 'dark') {
        this.$vuetify.theme.dark = val
      }
      //convert it for base if necessary
      Object.keys(converters).forEach(key => {
        for (let prop of converters[key].properties) {
          if (prop === optstr) val = converters[key].toDb(val);
        }
      });
      this.$store.dispatch("setOption", { key: optstr, value: val });
      // do post treatment for some options
      if (optstr === "deactivateunreadable" && val === 1) { // deactivate all unreadable mirrors if option is checked
          this.deactivateUnreadable();
      }

      if (optstr === "syncEnabled") {
          this.updateSync(val);
      }
    },

    addArrayEntry(optstr) {
      let val = this.arrays[optstr].value
      this.arrays[optstr].array.push(val)
      this[optstr] = this.arrays[optstr].array.join(',')
      this.arrays[optstr].value = ""
      setOption(optstr)
    },

    removeArrayEntry(optstr, index) {
      this.arrays[optstr].array.splice(index, 1)
      this[optstr] = this.arrays[optstr].array.join(',')
      setOption(optstr)
    },
    /**
     * Deactivate all unreadable mirrors when option is checked
     */
    async deactivateUnreadable() {
        let _self = this;
        this.$store.state.mirrors.all.forEach(mir => {
            if (!_self.filterReadableLanguage(mir) && _self.nbMangas(mir.mirrorName) === 0) {
                mir.activated = false;
                _self.changeActivation(mir);
            }
        })
    },
    async updateSync(value) {
        await browser.runtime.sendMessage({ action: "sync_update", value });
    },
    /**
     * Determine if a mirror is displayed depending on the language filter
     */
    filterReadableLanguage(mirror) {
        let res = false
        for (let lang of this.readlanguages) {
            res = res || mirror.languages.split(",").includes(lang);
        }
        return res
    }, 
    /**
     * Updates chapters lists
     */
    async updateChaps() {
      this.loadingChapters = true
      //We don't call the store updateChaptersLists because when refreshing chapters, it will use jQuery (inside implementations), which is not loaded in the popup, let's do it in background
      await browser.runtime.sendMessage({ action: "updateChaptersLists" }) // update is forced by default (mangas are updated even if chapters has been found recently (less than a week ago) and the pause for a week option is checked) but is done manually by the user (this case is called from options page or for timers page)
      this.loadingChapters = false
    },
    /**
     * Return language name from code
     */
    getLang(code) {
        return i18n("language_" + code);
    },
    /**
     * Move a repo up in list
     */
    moveUpRepository(repo) {
        this.$store.dispatch("moveUpRepository", repo);
    },
    /**
     * Move a repo down in list
     */
    moveDownRepository(repo) {
        this.$store.dispatch("moveDownRepository", repo);
    },
    /**
     * Deletes a repo
     */
    deleteRepository(repo) {
        this.$store.dispatch("deleteRepository", repo);
    },
    /**
     * Adds a repository
     */
    addRepository() {
        if (this.newRepo !== "") {
            let r = this.newRepo;
            if (r.slice(-1) !== "/") r += "/"
            this.$store.dispatch("addRepository", r);
        }
        this.newRepositoryDialog = false;
    }, 
    /**
     * Update activation state in store and db (value is already set on mirror object)
     */
    changeActivation(mirror) {
        this.$store.dispatch("changeMirrorActivation", mirror);
    },
    /**
     * Number of manga in list for a mirror
     */
    nbMangas(mirrorName) {
        return this.$store.state.mangas.all.reduce((count, mg) => {
            return mg.mirror === mirrorName ? count + 1 : count;
        }, 0);
    }, 
    /**
     * Determine if a mirror is displayed depending on the language filter
     */
    filterLanguage(mirror) {
        return this.selectedLang === "" || mirror.languages.split(",").includes(this.selectedLang);
    }, 
    /**
     * Deactivate all visible mirrors (which can be deactivated)
     */
    deactivateAll() {
        let _self = this;
        this.$store.state.mirrors.all.forEach(mir => {
            if (_self.filterLanguage(mir) && _self.nbMangas(mir.mirrorName) === 0) {
                mir.activated = false;
                _self.changeActivation(mir);
            }
        })
    }, 
    /**
     * Activate all visible mirrors (which can be activated)
     */
    activateAll() {
        let _self = this;
        this.$store.state.mirrors.all.forEach(mir => {
            if (_self.filterLanguage(mir) && _self.nbMangas(mir.mirrorName) === 0) {
                mir.activated = true;
                _self.changeActivation(mir);
            }
        })
    },
    /**
     * Opens lab
     */
    goLab() {
        browser.runtime.sendMessage({ action: "opentab", url: "/pages/lab/lab.html" });
    },
    /**
     * Click a flag in readable list
     */
    clickReadLanguage(language) {
        if (Array.isArray(language)) {
            for (let lang of language) {
                this.clickReadLanguage(lang)
            }
        } else {
            if (this.isReadable(language)) {
                this.$store.dispatch("removeReadLanguage", language)
            } else {
                this.$store.dispatch("addReadLanguage", language)
            }
        }
    },
    /**
     * Is a lang readable
     */
    isReadable(lang) {
        return this.readlanguages.includes(lang)
    },
    /**
     * Compute special color (like colorname#d|lx d for darken, l for lighten and x vuetify lighten scale)
     */
    getColor(c) {
        return utils.computeColorLight(c, 0)
    },
    /**
     * Compute special color for text (like colorname#d|lx d for darken, l for lighten and x vuetify lighten scale)
     */
    getTextColor(c) {
        let col = utils.computeColorLight(c, 0)
        let sp = col.split(" ")
        return sp[0] + "--text" + (sp.length > 1 ? " text--" + sp[1] : "")
    }
  }
};
</script>
<style>
.subtitle {
  font-size: 1.3rem !important;
  line-height: 24px !important;
  letter-spacing: normal !important;
}
.headline {
  font-size: 1.5rem !important;
  line-height: 30px !important;
  padding-bottom: 16px;
  font-weight: bold;
}
.v-input label {
  font-size: 1.3rem !important;
}
.v-input {
  padding: 0;
  margin: 0;
}
.normal-input-group {
  padding: 18px 0 0;
}
/** hint to color radio buttons even if not selected */
.colored-radio .v-input--selection-controls__input .v-icon {
    color: inherit!important;
}
.sel-title {
  line-height: 40px;
}
.v-btn-sel {
  padding: 0px 8px;
}
.opt-container {
  padding: 0;
}
.mirror-icon {
    vertical-align: middle;
    margin-right:4px;
}
.mirror-manga-info {
    display: inline-block;
    width: auto;
    padding:2px 5px;
    margin-left: 5px;
}
.td-langs {
    max-width: 200px;
}
.flag-list {
    margin: 2px 4px;
    cursor: pointer;
}
.flag-disabled {
    opacity: 0.4;
}
</style>