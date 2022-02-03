<template>
  <div>
    <!-- Categories and filters -->
    <v-row no-gutters>
      <v-col cols="12" class="d-flex align-center filter-container">
        <v-card class="hover-card">
          <Categories v-on="on" :categories="categories" :static-cats="false" :delegate-delete="false" />
        </v-card>
        <!-- Filters -->
        <v-card class="hover-card d-flex">
          <!-- Alphabetical -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="sort = 'az'" :class="['amr-filter', {activated: sort === 'az'}]">mdi-sort-alphabetical-ascending</v-icon>
            </template>
            <span>{{i18n("list_sort_alpha")}}</span>
          </v-tooltip>
          <!-- New first -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="sort = 'updates'" :class="['amr-filter', {activated: sort === 'updates'}]">mdi-flash-auto</v-icon>
            </template>
            <span>{{i18n("list_sort_new")}}</span>
          </v-tooltip>
          <!-- New w/ most unread -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="sort = 'updates-mostunread'" :class="['amr-filter', {activated: sort === 'updates-mostunread'}]">mdi-flash</v-icon>
            </template>
            <span>{{i18n("list_sort_new_most_unread")}}</span>
          </v-tooltip>
          <!-- Recently updated -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="sort = 'uptime'" :class="['amr-filter', {activated: sort === 'uptime'}]">mdi-sort-calendar-ascending</v-icon>
            </template>
            <span>{{i18n("list_sort_upts")}}</span>
          </v-tooltip>
          <!-- ascending/decending toggle -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="alpha_asc_desc = !alpha_asc_desc" :class="['amr-filter', {activated: alpha_asc_desc}]">mdi-swap-vertical</v-icon>
            </template>
            <span>{{i18n("list_asc_desc")}}</span>
          </v-tooltip>
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="selectable = !selectable" :class="['amr-filter', {activated: selectable}]">mdi-order-bool-ascending-variant</v-icon>
            </template>
            <span>{{i18n("list_select_action")}}</span>
          </v-tooltip>
          <!-- Search Field -->
          <v-menu offset-y bottom :close-on-content-click="false" :close-on-click="false" v-model="showFilter"  >
            <template #activator="{ on: onsearchMenu }">
              <v-tooltip top>
                <template #activator="{ on: onsearchTooltip }">
                    <v-icon v-on="{ ...onsearchMenu, ...onsearchTooltip }" :class="['amr-filter', {activated: showFilter}]">
                      mdi-magnify
                    </v-icon>
                </template>
                <span>{{ i18n("list_filter") }}</span>
              </v-tooltip>
            </template>
            <v-card>
              <v-row no-gutters class="pa-1">
                <v-col cols="10">
                  <v-text-field
                      v-model="searchText"
                      prepend-icon="mdi-magnify"
                      :label="i18n('list_search_label')"
                      dense
                      single-line
                      filled
                      rounded
                      hide-details
                      clearable
                      autofocus
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-btn
                    color="gray"
                    @click="showFilter = false"
                    class="no-bg-hover px-0 pr-2"
                    text
                  >
                    <v-icon class="ml-auto mb-5" small>
                      mdi-close
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-menu>
          <!-- Mirror select -->
          <v-menu offset-y top :close-on-content-click="false" :close-on-click="false" v-model="showMirrorSelection">
            <template #activator="{ on: onshowMirrorSelectionMenu }">
              <v-tooltip top>
                <template #activator="{ on: onshowMirrorSelectionTooltip }">
                    <v-icon v-on="{ ...onshowMirrorSelectionMenu, ...onshowMirrorSelectionTooltip }" :class="['amr-filter', {activated: showMirrorSelection}]">
                      mdi-image-multiple-outline
                    </v-icon>
                </template>
                <span>{{i18n("list_mirror_filter_icon")}}</span>
              </v-tooltip>
            </template>
            <v-card>
              <v-row no-gutters class="pt-1">
                <v-col cols="10" class="pt-4 px-2">
                  <v-select v-model="mirrorSelection" :items="usedMirrors" dense :label="i18n('list_mirror_filter_label')"></v-select>
                </v-col>
                <v-col cols="1">
                  <v-btn
                    color="gray"
                    @click="showMirrorSelection = false"
                    class="no-bg-hover px-0 pr-1"
                    text
                  >
                    <v-icon class="ml-5 mb-5" small>
                      mdi-close
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row no-gutters>

              </v-row>
            </v-card>
          </v-menu>
        </v-card>
        <v-card v-if="visMangas.length" class="hover-card">
          <v-tooltip v-if="visNewMangas.length" top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="markAllAsRead()">mdi-eye</v-icon>
            </template>
            <span>{{i18n("list_global_read")}}</span>
          </v-tooltip>
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="deleteAll()">mdi-delete</v-icon>
            </template>
            <span>{{i18n("list_global_delete")}}</span>
          </v-tooltip>
        </v-card>
      </v-col>
    </v-row>
    <br />
    <!-- Manga List -->
    <v-data-table
      :items="groupedMangas"
      :loading="!loaded"
      :headers="[{value: 'name'}]"
      :page.sync="pagination.currentPage"
      :items-per-page="itemsPerPage"
      hide-default-header
      hide-default-footer
      :search="searchText"
      @page-count="pagination.pageCount = $event"
    >
      <template v-slot:[pageNavigationPosition]>
        <v-row class="mx-2" :class="pageNavigationPosition === 'footer' ? 'my-6' :''">
          <v-col cols="3">
            <v-lazy>
              <v-select dense outlined :items="pagination.pageOptions" v-model="itemsPerPage" :label="i18n('list_page_label')">
              <template v-slot:item="{ item }">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item === -1 ? i18n('list_page_all') : item }}
                  </v-list-item-title>
                </v-list-item-content>
              </template>
              <template v-slot:selection="{ item }">
                {{ item === -1 ? i18n('list_page_all') : item }}
              </template>
              </v-select>
            </v-lazy>
          </v-col>
          <v-col>
            <v-lazy v-if="itemsPerPage > 0" :total-visible="$isPopup ? 5 : 10">
              <v-pagination  v-model="pagination.currentPage" :length="pagination.pageCount"></v-pagination>
            </v-lazy>
          </v-col>
          <v-col cols="1">
            <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
            <v-lazy>
              <v-btn color="blue" icon x-large @click="moveNavigation()" v-on="on">
                <v-icon>{{ pageNavigationPosition === 'top' ? 'mdi-arrow-down-box' : 'mdi-arrow-up-box'}}</v-icon>
              </v-btn>
            </v-lazy>
            </template>
            <span>{{i18n("list_move_navigation")}}</span>
          </v-tooltip>
          </v-col>
        </v-row>
      </template>
      <!-- Loading progress bar -->
      <template v-slot:progress>
        <v-progress-linear
          color="purple"
          :height="10"
          indeterminate
        ></v-progress-linear>
      </template>
      <!-- Table Body, manga entries -->
      <template v-slot:item="{item}">
        <tr class="">
          <td>
            <MangaGroup
              :group="item"
              :group-index="item.key"
              @search-request="propagateSR"
              @rename-manga="renameManga"
            />
          </td>
        </tr>
      </template>
      <template v-slot:no-data>
        <div v-if="allMangas.length > 0">
          <p v-html="i18n('list_no_manga_catstate_message')"></p>
        </div>
        <div v-else>
          <p v-html="convertIcons(i18n('list_no_manga_message'))"></p>
          <p>
            <a @click.prevent="importSamples()">{{ i18n("list_import_samples")}}</a>
          </p>
        </div>
      </template>
      <template v-slot:no-results>
        <p v-html="i18n('list_no_manga_search_message')"></p>
      </template>
    </v-data-table>
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5" v-html="dialogTitle"></span>
        </v-card-title>
        <v-card-text>
          <span v-html="dialogText"></span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.native="showDialog = false">{{i18n("button_no")}}</v-btn>
          <v-btn color="blue darken-1" text @click.native="dialogAction">{{i18n("button_yes")}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="renameDialog" max-width="800px">
      <v-card>
        <v-card-title>{{ i18n("rename_dialog_title") }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              {{ i18n("rename_dialog_original") }} - {{ renameOrigial }}
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="renameInput" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green" @click.native="renameMangaConfirm">{{ i18n("rename_dialog_button_confirm") }}</v-btn>
          <v-btn color="red" @click.native="renameMangaCancel">{{ i18n("button_cancel") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
      <MultiMangaAction :selected="selectedMangaExpanded" :selectable="selectable" :total="visMangas.length" v-on:unselect="selectable = false" />
  </div>
</template>
<script>
import i18n from "../../amr/i18n";
import { mapGetters } from "vuex";
import MangaGroup from "./MangaGroup";
import Categories from "./Categories";
import MultiMangaAction from './MultiMangaAction';
import browser from "webextension-polyfill";
import * as utilsamr from '../../amr/utils';
import * as utils from '../utils';

const default_sort = (a, b) => {
    let af = utilsamr.formatMgName((a.displayName && a.displayName !== '') ? a.displayName : a.name),
      bf = utilsamr.formatMgName((b.displayName && b.displayName !== '') ? b.displayName : b.name)
    let res = af === undefined ? -1 : af.localeCompare(bf)
    if (res === 0) {
        res = a.mirror === undefined ? -1 : a.mirror.localeCompare(b.mirror)
    }
    if (res === 0) {
        res = a.language === undefined ? -1 : a.language.localeCompare(b.language)
    }
    return res
}
const num_chapters_to_read_sort = (a, b) => {
    let af = a.listChaps.findIndex(ele => ele[1] == a.lastChapterReadURL),
      bf = b.listChaps.findIndex(ele => ele[1] == b.lastChapterReadURL)
    if (bf-af == 0){
      return default_sort(a, b)
    }else{
      return bf-af
    }
}
const sort_chapters_upts = (a, b) => {
    let af = a.upts,
      bf = b.upts
    if (bf-af == 0){//this should never happen
      return default_sort(a, b)
    }else{
      return bf-af
    }
}
export default {
  data() {
    return {
      loaded: false,
      sort: this.$store.state.options.sortOrder, // sort mode for list (az : alphabetical, updates : mangas with updates first)
      showDialog: false, // do show dialog to ask smthg
      showFilter: false, // Show the text search
      showMirrorSelection: false, // Show mirror search selection
      dialogTitle: "", //title of opened dialog
      dialogText: "", // text of opened dialog
      renameDialog: false, // Show dialog for renaming manga
      renameOrigial: '', // Original manga name when renaming
      renameInput: '', // Text field for renaming manga
      renameKey: '', // Key of the manga we are going to rename
      selectable: false, // Toggle Manga List select behaviour
      dialogAction: () => {self.showDialog = false}, // action to take on yes in dialog
      searchText: "",
      mirrorSelection: i18n('list_page_all'),
      selectedManga: [],
      pagination: {
        pageOptions: [
          5,
          25,
          50,
          100,
          -1
        ],
        currentPage: 1,
        pageCount: 0
      },
      itemsPerPage: this.$store.state.options.perPageMangas,
      pageNavigationPosition: this.$store.state.options.pageNavigationPosition === 'bottom' ? 'footer' : 'top',
      alpha_asc_desc: this.$store.state.options.alpha_asc_desc, // Toggle Manga List select behaviour
      searchMenu:false,
    };
  },
  watch: {
    itemsPerPage: function(newValue) {
      this.$store.dispatch("setOption", { key: 'perPageMangas', value: newValue })
    },
    sort: function(newValue) {
      this.$store.dispatch("setOption", { key: 'sortOrder', value: newValue })
    },
    showFilter: function(newValue) {
      if (!newValue) {
        this.searchText = ""
      }
    },
    showMirrorSelection: function(newValue) {
      if (!newValue) {
        this.mirrorSelection = i18n('list_page_all')
      }
    },
    selectable: function(newValue) {
      if (newValue)
        this.$eventBus.$emit('multi-manga:show-multiselect')
      else
        this.$eventBus.$emit('multi-manga:hide-multiselect')
    },
    alpha_asc_desc: function(newValue) {
      this.$store.dispatch("setOption", { key: 'alpha_asc_desc', value: newValue })
    }
  },
  computed: {
    // AMR options
    options: function() {
      return this.$store.state.options;
    },
    // categories states
    categories: function() {
      return this.options.categoriesStates;
    },
    mirrors: function() {
      return this.$store.state.mirrors.all;
    },
    /**
     * Return all visible mangas
     */
    visMangas: function() {
      if (this.mirrorSelection !== i18n('list_page_all')) {
        return this.allMangas.filter(
          mg => mg.mirror == this.mirrorSelection
        )
      }
      return this.allMangas.filter(
        mg => utils.displayFilterCats(mg, this.options.categoriesStates, this.mirrors.find(mir => mir.mirrorName === mg.mirror))
      )
    },
    /**
     * Returns a list of all mirrors that have series
     */
    usedMirrors: function() {
      return this.allMangas.reduce((mirrors, manga) => {
        let name = manga.mirror
        if (!mirrors.includes(name)) {
          mirrors.push(name)
        }
        return mirrors
      }, ['All'])
    },
    /**
     * Return all visible mangas having new chapters to read
     */
    visNewMangas: function() {
      return this.visMangas.filter(mg => utils.hasNew(mg))
    },
    /**
     * Build mangas groups (by name)
     */
    groupedMangas: function() {
      const results = this.sortMangaList(this.visMangas).reduce((groups, manga) => {
        let key
        let name = (manga.displayName && manga.displayName !== '') ? manga.displayName : manga.name
        if (this.options.groupmgs === 0) {
          key = manga.key
        } else {
          key = 'group:' + utilsamr.formatMgName(name)
        }

        let index = groups.findIndex(group => group.key == key)

        if (index === -1) {
          groups.push({
            name: name,
            key: key,
            mangas: []
          })
          index = groups.findIndex(group => group.key == key)
        }
        
        const mangaCopy = Object.assign({}, manga)
        mangaCopy.listChaps = []
        mangaCopy.hasNew = utils.hasNew(manga)
        groups[index].mangas.push(mangaCopy)

        // Ensure still updating manga are first in the group
        groups[index].mangas = groups[index].mangas.sort((a, b) => a.read - b.read)
        return groups
      }, [])
      return results
    },

    selectedMangaExpanded: function() {
      return this.allMangas.filter(manga => this.selectedManga.includes(manga.key))
        .map(manga => {
          return {
            'key': manga.key,
            'name': manga.displayName && manga.displayName !== '' ? manga.displayName : manga.name,
            'mirror': manga.mirror
          }
        })
    },
    ...mapGetters(["countMangas", "allMangas"])
  },
  name: "MangaList",
  components: { Categories, MangaGroup, MultiMangaAction },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    convertIcons: str => utils.convertIcons(str),
    importSamples() {
      // we don't do this.$store.dispatch("importSamples"); because to load list of chapters, implementations rely on jQuery, which is not loaded in pages, rely on background page to do so
      browser.runtime.sendMessage({ action: "importSamples" });
    },
    markAllAsRead() {
      this.dialogTitle = i18n("list_global_read_title");
      this.dialogText = i18n("list_global_read_text", this.visNewMangas.length);
      let self = this;
      this.dialogAction = () => {
        self.showDialog = false
        self.visNewMangas.forEach(async mg => {
          await self.$store.dispatch('readManga', {
            url: mg.url,
            mirror: mg.mirror,
            lastChapterReadName: mg.listChaps[0][0],
            lastChapterReadURL: mg.listChaps[0][1],
            name: mg.name,
            language: mg.language
          })
        })
      }
      this.showDialog = true;
    },
    deleteAll() {
      this.dialogTitle = i18n("list_global_delete_title");
      this.dialogText = i18n("list_global_delete_text", this.visMangas.length);
      let self = this;
      this.dialogAction = () => {
        self.showDialog = false
        self.visMangas.forEach(async mg => {
          await self.$store.dispatch("deleteManga", {
            key: mg.key
          })
        })
      }
      this.showDialog = true;
    },
    /**
     * Propagate search request event from MangaGroup to parent
     */
    propagateSR(str) {
      this.$emit("search-request", str)
    },
    sortMangaList(items) {
      var cmp;
      if (this.sort === "az") {
        cmp = default_sort
      } else if (this.sort === "updates-mostunread") {
        cmp = function(a, b) {
          let ha = utils.hasNew(a),
              hb = utils.hasNew(b);
          // primary sort on manga amount of new chapters, secondary on alphabetical
          return (ha && hb ? num_chapters_to_read_sort(a, b) : ha === hb ? default_sort(a, b) : (ha && !hb ? -1 : 1 ) );
        }
      } else if (this.sort === "updates") {
        cmp = function(a, b) {
          let ha = utils.hasNew(a),
              hb = utils.hasNew(b);
          // primary sort on manga has new chapter, secondary on alphabetical
          return (ha === hb ? default_sort(a, b) : (ha && !hb ? -1 : 1));
        }
      } else {
        cmp = function(a, b) {
          let na = a.upts != 0,
              nb = b.upts != 0;
          let ha = utils.hasNew(a),
              hb = utils.hasNew(b);
          // primary sort on manga when last chapter, secondary on number unread, tertiary on alphabetical
          return ((na || nb) ? sort_chapters_upts(a, b) : ha && hb ? num_chapters_to_read_sort(a, b) : ha === hb ? default_sort(a, b) : (ha && !hb ? -1 : 1 ) );
        }
      }
      return items.sort(function(a, b) {
        return AMR_STORE.getters.options.alpha_asc_desc ? cmp(b,a): cmp(a,b)
      })
    },
    moveNavigation: function() {
      let newDir = ''
      if (this.pageNavigationPosition == 'top') {
        newDir = 'bottom'
      } else {
        newDir = 'top'
      }
      this.pageNavigationPosition = newDir
      this.$store.dispatch("setOption", { key: 'pageNavigationPosition', value: newDir })
    },
    /**
     * Pull up the dialog for renaming a manga
     */
    renameManga(manga) {
      this.renameKey = manga.key
      this.renameOrigial = manga.name
      this.renameInput = manga.displayName
      this.renameDialog = true
    },
    renameMangaConfirm() {
      browser.runtime.sendMessage({
        action: "setDisplayName",
        key: this.renameKey,
        displayName: this.renameInput
      })
      this.renameMangaCancel() // Why copy the logic when I need the same things?
    },
    /**
     * Cancel button action that resets the form / variables
     */
    renameMangaCancel() {
      this.renameOrigial = ''
      this.renameKey = ''
      this.renameInput = ''
      this.renameDialog = false
    }
  },
  async created() {
    // initialize state for store in popup from background
    await this.$store.dispatch("getStateFromReference", {
      module: "mangas",
      key: "all",
      mutation: "setMangas"
    });
    // initialize state for store in popup from background
    await this.$store.dispatch("getStateFromReference", {
      module: "bookmarks",
      key: "all",
      mutation: "setBookmarks"
    });
    this.loaded = true;
    setTimeout(() => this.$emit("manga-loaded"), 1000)

    this.$eventBus.$on('multi-manga:select-manga', key => {
      if (!this.selectedManga.includes(key))
        this.selectedManga.push(key)
    })

    this.$eventBus.$on('multi-manga:deselect-manga', key => {
      this.selectedManga = this.selectedManga.filter(k => k != key)
    })

  }
}
</script>
<style data-amr="true">

.amr-filter {
    color:grey;
}
.theme--dark .amr-filter {
    color:grey;
}
.amr-filter.activated {
    color: black;
}
.theme--dark .amr-filter.activated {
    color: white;
}
.hover-card {
    margin: 0px 2px;
    padding: 0px 2px;
    display: inline-block;
    background-color: #f5f5f5;
}
.theme--dark .hover-card {
    background-color: #424242;
}
.hover-card i {
    font-size: 1.6rem;
    margin: 0px 2px;
}
.hover-card .tooltip {
    cursor: pointer;
}
.hover-card .filters-icon {
    margin: 0;
    font-size: 0.9rem;
}
.filter-container.v-icon {
  font-size: 20px;
}
tr:hover {
  background-color: transparent !important;
}
td {
  height: auto !important;
  border-bottom: none!important;
}
.v-data-table__wrapper {
  padding-right: 4px!important;
  padding-left: 4px!important;
}
.no-bg-hover::before {
   background-color: transparent !important;
}
</style>
