<template>
  <div>
    <v-tabs v-model="tabs" fixed-tabs >
      <v-tabs-slider></v-tabs-slider>
      <v-tab href="#general" class="primary--text">
        {{ i18n("options_general") }}
      </v-tab>
      <v-tab href="#onwebsites" class="primary--text">
        {{ i18n("options_on_websites") }}
      </v-tab>
      <v-tab href="#supported" class="primary--text">
        {{ i18n("options_supported") }}
      </v-tab>
      <v-tab href="#mirror" class="primary--text">
        {{ i18n("options_mirror_specific") }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabs" class="elevation-1">
      <v-tab-item value="general" transition="false">
        <v-expansion-panels accordion focusable>
          <v-expansion-panel>
            <!-- AMR aspect -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_gen_aspect") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <!-- Open in new tab -->
              <v-checkbox v-model="newTab" @change="setOption('newTab')"
                      :label="i18n('options_gen_newTab_desc')"></v-checkbox>
              <!-- Group mangas with same name -->
              <v-checkbox v-model="groupmgs" @change="setOption('groupmgs')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_gen_groupmgs_opt') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_gen_groupmgs_desc') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!-- Display badge last update -->
              <v-checkbox v-model="displastup" @change="setOption('displastup')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_gen_displastup_opt') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_gen_displastup_desc') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!--Allow read/create cookies -->
              <v-checkbox v-model="allowcookies" @change="setOption('allowcookies')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_gen_allowcookies_opt') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_gen_allowcookies_desc') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox> 
              <!-- Dark popup -->
              <v-checkbox v-model="dark" @change="setOption('dark')"
                      :label="i18n('options_gen_dark_desc')"></v-checkbox>
              <!-- Enable inverted color scheme -->
              <v-checkbox v-model="alternateColors" @change="setOption('alternateColors')"
                      :label="i18n('options_invert_color_scheme')"></v-checkbox>
            
              <!-- Mangas with new chapters color -->
              <v-label>{{ i18n("options_gen_colors_new") }}</v-label>
              <v-radio-group v-model="colornew" @change="setOption('colornew')" row class="colored-radio">
                <v-radio v-for="c in colors" :key="c" :value="c" :color="getColor(c)" :class="getTextColor(c)" ></v-radio>
              </v-radio-group>
              <!-- Mangas with read chapters color -->
              <v-label>{{ i18n("options_gen_colors_read") }}</v-label>
              <v-radio-group v-model="colorread" @change="setOption('colorread')" row class="colored-radio">
                <v-radio v-for="c in colors" :key="c" :value="c" :color="getColor(c)" :class="getTextColor(c)" ></v-radio>
              </v-radio-group>
              <!-- Mangas with notfollow chapters color -->
              <v-label>{{ i18n("options_gen_colors_notfollow") }}</v-label>
              <v-radio-group v-model="colornotfollow" @change="setOption('colornotfollow')" row class="colored-radio">
                <v-radio v-for="c in colors" :key="c" :value="c" :color="getColor(c)" :class="getTextColor(c)" ></v-radio>
              </v-radio-group>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <!-- Updates -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_gen_updates") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">


              <!-- Update chapters list -->
              <v-label>{{ i18n("options_gen_update_chap_label") }}</v-label>
                <v-container fluid class="opt-container">
                  <v-row  >
                    <v-col cols="6">
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

              <!-- Stop updates for a week -->
              <v-checkbox v-model="stopupdateforaweek" @change="setOption('stopupdateforaweek')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_gen_stopupdateforaweek_desc') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_gen_stopupdateforaweek_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!-- Update on startup -->
              <v-checkbox v-model="checkmgstart" @change="setOption('checkmgstart')"
                      :label="i18n('options_gen_checkmgstart_desc')"></v-checkbox>
              <!-- Spin icon while loading chapters -->
              <v-checkbox v-model="refreshspin" @change="setOption('refreshspin')"
                      :label="i18n('options_gen_refreshspin_desc')"></v-checkbox>
              <!-- Save bandwidth while loading chapters -->
              <v-checkbox v-model="savebandwidth" @change="setOption('savebandwidth')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_gen_savebandwidth_desc') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_gen_savebandwidth_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!-- Wait for n seconds between two chapters update request -->
              <v-label>
                <template>
                  <div>
                    {{ i18n('options_gen_waitbetweenupdates_opt') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_gen_waitbetweenupdates_desc') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-label>
                <v-container fluid class="opt-container">
                  <v-row  >
                    <v-col cols="6">
                      <v-select v-model="waitbetweenupdates" :items="wait_update_values"></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              <!-- Display grey 0 when no new -->
              <v-checkbox v-model="displayzero" @change="setOption('displayzero')"
                      :label="i18n('options_gen_displayzero_desc')"></v-checkbox>
              <!-- Grey sharingan if no new -->
              <v-checkbox v-model="nocount" @change="setOption('nocount')"
                      :label="i18n('options_gen_nocount_desc')"></v-checkbox>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <!-- Notifications -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_gen_notifs") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <!-- Notify on new chapter -->
              <v-checkbox v-model="shownotifications" @change="setOption('shownotifications')"
                      :label="i18n('options_gen_shownotifications_desc')"></v-checkbox>
              <!-- Time to close notification -->
              <v-label>{{ i18n("options_gen_notificationtimer_label") }}</v-label>
                <v-container fluid class="opt-container">
                  <v-row  >
                    <v-col cols="6">
                      <v-select v-model="notificationtimer" :items="notificationtimer_values"></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              <!-- Notify on new version of the app -->
              <v-checkbox v-if="!isFirefox()" v-model="notifynewversion" @change="setOption('notifynewversion')"
                      :label="i18n('options_gen_notifynewversion_desc')"></v-checkbox>
              <!--Allow tracking of reading -->
              <!-- <v-checkbox v-model="allowtracking" @change="setOption('allowtracking')"
                      :label="i18n('options_gen_allowtracking_desc')"></v-checkbox>
               -->             
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <!-- Synchronization -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_sync_title") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <v-alert dense v-if="!syncEnabled"  :value="true" color="error" icon="mdi-alert-octagon" text elevation="1">
                {{i18n('options_sync_title_warning')}}
              </v-alert>
              <v-checkbox v-if="isFirefox()" v-model="syncEnabled" @change="setOption('syncEnabled')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_sync_checkbox') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_sync_checkbox_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <v-checkbox v-model="gistSyncEnabled" @change="setOption('gistSyncEnabled')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_sync_gist') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_sync_gist_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <v-alert dense v-if="gistSyncEnabled" value="true" color="info" icon="mdi-information" text elevation="1">
                <a class="info--text" href="https://gitlab.com/all-mangas-reader/all-mangas-reader-2#synchronization-with-gist-3rd-party" target="__blank">{{i18n('options_sync_gist_help')}}</a>
              </v-alert>
              <v-text-field v-if="gistSyncEnabled" v-model="gistSyncSecret" @change="setOption('gistSyncSecret')"
                          :label="i18n('option_sync_gist_secret')"></v-text-field>
              <v-text-field v-if="gistSyncEnabled" v-model="gistSyncGitID" @change="setOption('gistSyncGitID')"
                          :label="i18n('option_sync_gist_gitID')"></v-text-field>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <!-- Search -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_search_title") }}</div></v-expansion-panel-header>
              <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <v-checkbox v-model="searchOpenSeries" @change="setOption('searchOpenSeries')"
                          :label="i18n('options_search_open_series_desc')"></v-checkbox>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-tab-item>
      <v-tab-item value="onwebsites" transition="false">
        <v-expansion-panels accordion focusable>
          <v-expansion-panel>
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_web_chapter_display_mode") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <!-- Display options -->
              <v-alert dense value="true" color="info" icon="mdi-information" text elevation="1">
                {{i18n('options_web_chapter_desc')}}
              </v-alert>
                  
              <!-- Display as a book option -->
              <v-checkbox v-model="displayBook" @change="setOption('displayBook')"
                      :label="i18n('option_read_book')"></v-checkbox>

              <!-- Reading direction -->
              <v-radio-group v-model="readingDirection" @change="setOption('readingDirection')" column>
                <v-radio :label="i18n('option_read_book_ltr')" :value="0" ></v-radio>
                <v-radio :label="i18n('option_read_book_rtl')" :value="1"></v-radio>
              </v-radio-group>

              <!-- Invert keys with reading direction change -->
              <v-checkbox v-if="readingDirection" v-model="invertKeys" @change="setOption('invertKeys')"
                :label="i18n('options_web_chapter_reading_direction_invert_keys_opt')"></v-checkbox>

              <!-- Display full chapter option -->
              <v-checkbox v-model="displayFullChapter" @change="setOption('displayFullChapter')">
                <template v-slot:label>
                  <div>
                    {{ i18n('option_read_fullchapter') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('option_read_fullchapter_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!-- Scaling mode -->
              <v-radio-group v-model="resizeMode" @change="setOption('resizeMode')" column>
                <v-radio :label="i18n('option_read_resize_w')" :value="0" ></v-radio>
                <v-radio :label="i18n('option_read_resize_h')" :value="1" v-show="!displayFullChapter" ></v-radio>
                <v-radio :label="i18n('option_read_resize_c')" :value="2" v-show="!displayFullChapter" ></v-radio>
                <v-radio :label="i18n('option_read_resize_n')" :value="3" ></v-radio>
              </v-radio-group>
              <!-- Display dark reader option -->
              <v-checkbox v-model="darkreader" @change="setOption('darkreader')"
                      :label="i18n('options_web_chapter_darkreader_desc')"></v-checkbox>

              <!-- Thin Scan option -->
              <v-label>{{i18n('options_web_chapter_thinscan_desc')}}</v-label>
              <v-row>
                <v-col cols="6">
                  <v-select v-model="thinscan" :items="thinscan_values" @change="setOption('thinscan')"></v-select>
                </v-col>
              </v-row>
              <!-- Default to webtoon mode -->

              <v-checkbox v-model="smoothNavigation" @change="setOption('smoothNavigation')"
                      :label="i18n('options_webtoon_mode_default')"></v-checkbox>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <!-- Loading options -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_web_loading") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <!-- Loading progression -->
              <v-checkbox v-model="load" @change="setOption('load')"
                      :label="i18n('options_web_load_desc')"></v-checkbox>
              <!-- Loading images in the order -->
              <v-checkbox v-model="imgorder" @change="setOption('imgorder')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_web_imgorder_desc') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_web_imgorder_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!-- Prefetch next chapter -->
              <v-checkbox v-model="prefetch" @change="setOption('prefetch')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_web_prefetch_desc') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_web_prefetch_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!-- Mark chapter as read when loaded -->
              <v-checkbox v-model="markwhendownload" @change="setOption('markwhendownload')"
                      :label="i18n('options_web_markwhendownload_desc')"></v-checkbox>
              <!-- Automatically add manga to updates list -->
              <v-checkbox v-model="options_web_addauto_desc" @change="setOption('options_web_addauto_desc')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_web_addauto_desc') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_web_addauto_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!-- Smooth navigation toggle (dynamially load next/previous chapters) -->
              <v-checkbox v-model="displayFullChapter" @change="setOption('displayFullChapter')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_reader_smooth_navigation') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_reader_smooth_navigation_label') }}
                      <br/>
                      {{ i18n('options_reader_smooth_navigation_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-tab-item>
      <v-tab-item value="supported" transition="false">
        <v-expansion-panels accordion focusable>
          <v-expansion-panel>
            <!-- Languages -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_sup_languages") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <div class="text-h6">{{i18n('options_sup_languages_desc')}}</div>
              <Flag
                  v-for="lang in alllangs"
                  :key="lang.flag"
                  :value="[lang.flag, isReadable(lang.flag)]"
                  v-on:toggleLanguageSelection="clickReadLanguage(lang.languages)"
                  big
                  class="flag-list" />
              <!-- Deactivate unreadable websites-->
              <v-checkbox v-model="deactivateunreadable" @change="setOption('deactivateunreadable')"
                      :label="i18n('options_sup_deactivate_unreadable_desc')"></v-checkbox>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <!-- Supported websites -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_supported") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <v-label>{{i18n('options_sup_desc')}}</v-label>
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
                  class="elevation-1"
                  disable-pagination
                  dense
                  hide-default-header
                  hide-default-footer
              >
                <template v-slot:header="{ props: { headers } }">
                  <thead>
                    <tr>
                      <th v-for="header in headers" :key="header.text" class="column">
                        {{ header.text }}
                      </th>
                    </tr>
                  </thead>
                </template>
                <template v-slot:item="{item }">
                  <tr>
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
                      <v-checkbox :disabled="nbMangas(item.mirrorName) > 0 && item.activated" v-model="item.activated" @change="changeActivation(item)"/>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <!-- Laboratory -->
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_sup_repos") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <v-label>{{i18n('options_sup_repos_desc')}}</v-label>
              <v-row >
                <v-col cols="12">
                  <v-btn color="primary" dark class="mb-2" @click="goLab()" small>{{i18n('options_gen_laboratory')}}</v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-tab-item>
      <v-tab-item value="mirror" transition="false">
         <v-expansion-panels accordion focusable>
          <!-- Mangadex Options -->
          <v-expansion-panel>
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_mirror_specific_mangadex") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <!-- Datasaver option -->
              <v-checkbox v-model="mangadexDataSaver" @change="setOption('mangadexDataSaver')">
                <template v-slot:label>
                  <div>
                    {{ i18n('options_mangadex_datasaver') }}
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" color="blue darken-2" class="superscript" small>
                          mdi-information
                        </v-icon>
                      </template>
                      {{ i18n('options_mangadex_datasaver_info') }}
                    </v-tooltip>
                  </div>
                </template>
              </v-checkbox>
              <!-- Image Server option -->
              <!-- <div class="text-h6">{{i18n('options_mangadex_image_server')}}</div>
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
              </div> -->
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
            </v-expansion-panel-content>
          </v-expansion-panel>
          <!-- Komga Options -->
          <v-expansion-panel>
            <v-expansion-panel-header><div class="text-h5 blue--text lighten-4">{{ i18n("options_mirror_specific_komga") }}</div></v-expansion-panel-header>
            <v-expansion-panel-content class="pt-6" color="slight-overlay">
              <!-- Komga Domain -->
              <v-text-field v-model="komgaUrl" @change="setOption('komgaUrl')" :label="i18n('options_komga_server_label')" />
              <!-- Komga Username -->
              <v-text-field v-model="komgaUser" @change="setOption('komgaUser')" :label="i18n('options_komga_username_label')" />
              <!-- Komga Password -->
              <div class="text-h6">{{i18n('options_komga_password')}}</div>
              <v-text-field v-model="komgaPassword" type="password" @change="setOption('komgaPassword')" :label="i18n('options_komga_password_label')" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
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
      "gistSyncEnabled",
      "searchOpenSeries",
      "mangadexDataSaver",
      "webtoonDefault",
      "alternateColors",
      "invertKeys",
      "smoothNavigation"
    ]
  }
};

export default {
  data() {
    // default options
    let res = {
      tabs: 'general',
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
          return this.$store.state.mirrors.all.filter(m => !m.disabled)
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
      // retrieve Sync options, must follow current naming convention : providerSyncEnabled
      if (optstr.toLowerCase().includes('syncenabled')) {
        this.updateSync(optstr, val)
      } else if(optstr.toLowerCase().includes('sync')) {
        this.updateStorageConf(optstr, val)
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
    async updateSync(key, value) {
        await browser.runtime.sendMessage({ action: "sync_update", key, value });
    },
    async updateStorageConf(key, value) {
      await browser.runtime.sendMessage({ action: 'sync_config_update', key, value })
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
    },
    isFirefox() {
      return typeof InstallTrigger !== 'undefined';
    }
  }
};
</script>
<style data-amr="true">
.subtitle {
  font-size: 1.3rem !important;
  line-height: 24px !important;
  letter-spacing: normal !important;
}
.headline {
  font-size: 1.5rem !important;
  line-height: 30px !important;
  font-weight: bold;
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
.slight-overlay {
  background-color:rgba(168, 83, 57, 0.06)
}
.v-icon.v-icon.superscript {
  vertical-align: super;
  line-height: 0;
}
</style>
<style scoped>
.v-alert {
  font-size: 0.8rem!important;
}
</style>