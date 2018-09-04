<template>
    <div>
        <v-tabs
            v-model="tabs"
            fixed-tabs
            color="transparent"
        >
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
        </v-tabs>
        <v-tabs-items v-model="tabs" :class="(dark ? 'black' : 'white') + ' elevation-1'">
            <v-tab-item id="onwebsites">
              <v-container fluid>
                <!-- Display options -->
                <div class="headline">{{ i18n("options_web_chapter_display_mode") }}</div>
                <!-- Display chapter mode (chapter) -->
                <div class="subtitle">{{i18n('options_web_chapter_display_chapter_desc')}}</div>
                <v-checkbox v-model="displayChapters" @change="setOption('displayChapters')"
                        :label="i18n('options_web_chapter_display_chapter_opt')"></v-checkbox>
                
                <!-- Display chapter mode -->
                <div v-if="displayChapters">
                    <div class="subtitle">{{ i18n("options_web_chapter_display_mode_opt") }}</div>
                    <v-radio-group v-model="displayMode" @change="setOption('displayMode')" column>
                        <v-radio :label="i18n('options_web_chapter_display_mode_1')" :value="1" ></v-radio>
                        <v-radio :label="i18n('options_web_chapter_display_mode_2')" :value="2"></v-radio>
                        <v-radio :label="i18n('options_web_chapter_display_mode_3')" :value="3"></v-radio>
                    </v-radio-group>
                </div>
                <!-- Resize scans -->
                <div class="subtitle">{{i18n('options_web_resize_desc')}}</div>
                <v-checkbox v-model="resize" @change="setOption('resize')"
                        :label="i18n('options_web_resize_opt')"></v-checkbox>

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
                
                <!-- Facilities -->
                <div class="headline">{{ i18n("options_web_facilities") }}</div>
                <!-- Automatically add manga to updates list -->
                <div class="subtitle">{{i18n('options_web_addauto_desc')}}</div>
                <v-checkbox v-model="addauto" @change="setOption('addauto')"
                        :label="i18n('options_web_addauto_opt')"></v-checkbox>
                <!-- Use right / left keys while reading for prev / next scans -->
                <div class="subtitle">{{i18n('options_web_lrkeys_desc')}}</div>
                <v-checkbox v-model="lrkeys" @change="setOption('lrkeys')"
                        :label="i18n('options_web_lrkeys_opt')"></v-checkbox>
                <!-- Bookmark scans when dblclicked -->
                <div class="subtitle">{{i18n('options_web_autobm_desc')}}</div>
                <v-checkbox v-model="autobm" @change="setOption('autobm')"
                        :label="i18n('options_web_autobm_opt')"></v-checkbox>
                <!-- Right key to next chapter -->
                <div class="subtitle">{{i18n('options_web_rightnext_desc')}}</div>
                <v-checkbox v-model="rightnext" @change="setOption('rightnext')"
                        :label="i18n('options_web_rightnext_opt')"></v-checkbox>
              </v-container>
            </v-tab-item>
            <v-tab-item id="general">
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
                    <v-radio v-for="c in colors" :key="c" :value="c" :color="c" :class="c + '--text'" ></v-radio>
                </v-radio-group>
                <!-- Mangas with read chapters color -->
                <div class="subtitle">{{ i18n("options_gen_colors_read") }}</div>
                <v-radio-group v-model="colorread" @change="setOption('colorread')" row class="colored-radio">
                    <v-radio v-for="c in colors" :key="c" :value="c" :color="c" :class="c + '--text'" ></v-radio>
                </v-radio-group>
                <!-- Mangas with notfollow chapters color -->
                <div class="subtitle">{{ i18n("options_gen_colors_notfollow") }}</div>
                <v-radio-group v-model="colornotfollow" @change="setOption('colornotfollow')" row class="colored-radio">
                    <v-radio v-for="c in colors" :key="c" :value="c" :color="c" :class="c + '--text'" ></v-radio>
                </v-radio-group>

                <!-- Updates -->
                <div class="headline">{{ i18n("options_gen_updates") }}</div>
                <!-- Update chapters list -->
                <div class="subtitle">
                    <v-container fluid class="opt-container">
                        <v-layout row wrap>
                            <v-flex xs4 class="sel-title">
                                {{ i18n("options_gen_update_chap_label") }} : 
                            </v-flex>
                            <v-flex xs4>
                                <v-select v-model="updatechap" :items="update_chap_values">
                                </v-select>
                            </v-flex>
                            <v-flex>
                                <v-btn color="primary" class="btn-sel" small 
                                    @click="updateChaps()" 
                                    :loading="loadingChapters" 
                                    :disabled="loadingChapters">
                                    {{i18n("options_update_chap_btn")}}
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </div>
                <!-- Stop updates for a week -->
                <div class="subtitle">{{i18n('options_gen_stopupdateforaweek_desc')}}</div>
                <v-checkbox v-model="stopupdateforaweek" @change="setOption('stopupdateforaweek')"
                        :label="i18n('options_gen_stopupdateforaweek_opt')"></v-checkbox>
                
                <!-- Update mirrors list -->
                <div class="subtitle">
                    <v-container fluid class="opt-container">
                        <v-layout row wrap>
                            <v-flex xs4 class="sel-title">
                                {{ i18n("options_gen_update_mir_label") }} : 
                            </v-flex>
                            <v-flex xs4>
                                <v-select v-model="updatemg" :items="update_mir_values">
                                </v-select>
                            </v-flex>
                            <v-flex>
                                <v-btn color="primary" class="btn-sel" small 
                                    @click="updateMirrors()" 
                                    :loading="loadingMirrors" 
                                    :disabled="loadingMirrors">
                                    {{i18n("options_update_mir_btn")}}
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </div>
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
                        <v-layout row wrap>
                            <v-flex xs6 class="sel-title">
                                {{ i18n("options_gen_notificationtimer_label") }} : 
                            </v-flex>
                            <v-flex xs6>
                                <v-select v-model="notificationtimer" :items="notificationtimer_values">
                                </v-select>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </div>
              </v-container>
            </v-tab-item>
            <v-tab-item id="supported">
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
                <v-layout flex class="mt-2">
                    <v-flex xs4>
                        <v-select v-model="selectedLang" :items="distinctLangs"></v-select>
                    </v-flex>
                    <v-flex xs8>
                        <v-btn @click="deactivateAll()" color="primary" small>{{i18n('options_gen_deactivate_all')}}</v-btn>
                        <v-btn @click="activateAll()" color="primary" small>{{i18n('options_gen_activate_all')}}</v-btn>
                    </v-flex>
                </v-layout>
                <v-data-table
                    :headers="headersSupportedWebsites"
                    :items="supportedWebsites"
                    item-key="mirrorName"
                    hide-actions
                >
                    <template slot="headers" slot-scope="props">
                    <tr>
                        <th
                            v-for="header in props.headers"
                            :key="header.text"
                            class="column"
                            >
                            {{ header.text }}
                        </th>
                    </tr>
                    </template>
                    <template slot="items" slot-scope="props">
                    <tr :active="props.selected" @click="props.selected = !props.selected" v-if="filterLanguage(props.item)">
                        <td>
                            <img :src="props.item.mirrorIcon" class="mirror-icon" />
                            {{ props.item.mirrorName }}
                            <!-- Badge with number of mangas read -->
                            <v-card v-if="nbMangas(props.item.mirrorName) > 0" color="primary" dark class="mirror-manga-info">
                                {{ i18n('options_gen_mirrornbmangas', nbMangas(props.item.mirrorName)) }}
                            </v-card>
                        </td>
                        <td class="text-xs-right td-langs">
                            <span v-for="(lang, key) in props.item.languages.split(',')" :key="key">
                                <Flag :value="lang" />
                            </span>
                        </td>
                        <td class="text-xs-right">
                            <v-checkbox :disabled="nbMangas(props.item.mirrorName) > 0" v-model="props.item.activated" @change="changeActivation(props.item)"/>
                        </td>
                    </tr>
                    </template>
                </v-data-table>
                <!-- Repositories -->
                <div class="headline mt-4">{{ i18n("options_sup_repos") }}</div>
                <div class="subtitle">{{i18n('options_sup_repos_desc')}}</div>
                <v-layout row>
                    <v-flex xs12>
                <v-dialog v-model="newRepositoryDialog" max-width="500px">
                    <v-btn color="primary" dark slot="activator" class="mb-2" small>{{i18n('options_gen_repos_dialog_title')}}</v-btn>
                    <v-card>
                        <v-card-title>
                        <span class="headline">{{i18n('options_gen_repos_dialog_desc')}}</span>
                        </v-card-title>
                        <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                            <v-flex xs12>
                                <v-text-field :label="i18n('options_gen_repos_input')" v-model="newRepo" class="normal-input-group"></v-text-field>
                            </v-flex>
                            </v-layout>
                        </v-container>
                        </v-card-text>
                        <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" flat @click.native="newRepositoryDialog = false">{{i18n('button_cancel')}}</v-btn>
                        <v-btn color="blue darken-1" flat @click.native="addRepository">{{i18n('button_add')}}</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-btn color="primary" dark class="mb-2" @click="goLab()" small>{{i18n('options_gen_laboratory')}}</v-btn>
                    </v-flex>
                </v-layout>
                <v-data-table
                    :items="impl_repositories"
                    hide-actions
                    hide-headers
                    >
                    <template slot="items" slot-scope="props">
                        <td>{{ props.item }}</td>
                        <td class="justify-center layout px-0">
                        <v-btn icon class="mx-0" @click="moveUpRepository(props.item)">
                            <v-icon color="primary">mdi-chevron-up</v-icon>
                        </v-btn>
                        <v-btn icon class="mx-0" @click="moveDownRepository(props.item)">
                            <v-icon color="primary">mdi-chevron-down</v-icon>
                        </v-btn>
                        <v-btn icon class="mx-0" @click="deleteRepository(props.item)">
                            <v-icon color="primary">mdi-delete</v-icon>
                        </v-btn>
                        </td>
                    </template>
                    </v-data-table>
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

/**
 * Converters to format options in db and in page (ex : booleans are store as 0:1 in db)
 */
const converters = {
  /** Boolean to 0:1 converter */
  boolTo01: {
    fromDb: val => val === 1,
    toDb: val => (val ? 1 : 0),
    properties: [
      "displayChapters",
      "resize",
      "load",
      "imgorder",
      "prefetch",
      "markwhendownload",
      "addauto",
      "lrkeys",
      "autobm",
      "rightnext",
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
      "stopupdateforaweek",
      "deactivateunreadable"
    ]
  }
};

export default {
  data() {
    // default options
    let res = {
      tabs: null,
      colors: [
        "red",
        "pink",
        "purple",
        "deep-purple",
        "indigo",
        "blue",
        "light-blue",
        "cyan",
        "teal",
        "green",
        "light-green",
        "lime",
        "yellow",
        "amber",
        "orange",
        "deep-orange",
        "brown",
        "blue-grey",
        "grey"
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
      loadingChapters: false,
      update_mir_values: [
        { value: 24 * 60 * 60 * 1000, text: i18n("options_days", 1) },
        { value: 2 * 24 * 60 * 60 * 1000, text: i18n("options_days", 2) },
        { value: 7 * 24 * 60 * 60 * 1000, text: i18n("options_week", 1) },
        { value: 2 * 7 * 24 * 60 * 60 * 1000, text: i18n("options_week", 2) }
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
      newRepo: "",
      newRepositoryDialog: false,
      selectedLang: "",
    };
    // add all options properties in data model; this properties are the right one in store because synchronization with background has been called by encapsuler (popup.js / other) before initializing vue
    res = Object.assign(res, this.$store.state.options);
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
    displayzero: function() {
      amrUpdater.refreshBadgeAndIcon();
    },
    nocount: function() {
      amrUpdater.refreshBadgeAndIcon();
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
     * Update mirrors lists
     */
    async updateMirrors() {
      this.loadingMirrors = true
      await this.$store.dispatch("updateMirrorsLists")
      this.loadingMirrors = false
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
    }
  }
};
</script>
<style>
.subtitle {
  font-size: 14px !important;
  line-height: 24px !important;
  letter-spacing: normal !important;
}
.headline {
  font-size: 16px !important;
  line-height: 30px !important;
  padding-bottom: 16px;
  font-weight: bold;
}
.v-input label {
  font-size: 14px !important;
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

    

