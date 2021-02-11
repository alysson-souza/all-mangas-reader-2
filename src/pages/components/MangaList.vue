<template>
  <div>
    <!-- Categories and filters -->
    <v-row no-gutters>
      <!-- Categories -->
      <v-col cols="12" md="auto">
        <Categories :categories="categories" :static-cats="false" :delegate-delete="false" />
      </v-col>
      <!-- Filters -->
      <v-col cols="6" md="auto" class="d-flex align-center justify-end filter-container">
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
        <v-card v-if="visMangas.length" class="hover-card">
          <v-icon class="filters-icon">mdi-filter</v-icon>
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="sort = 'az'" :class="['amr-filter', {activated: sort === 'az'}]">mdi-sort-alphabetical-ascending</v-icon>
            </template>
            <span>{{i18n("list_sort_alpha")}}</span>
          </v-tooltip>
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="sort = 'updates'" :class="['amr-filter', {activated: sort === 'updates'}]">mdi-flash</v-icon>
            </template>
            <span>{{i18n("list_sort_new")}}</span>
          </v-tooltip>
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="selectable = !selectable" :class="['amr-filter', {activated: selectable}]">mdi-order-bool-ascending-variant</v-icon>
            </template>
            <span>{{i18n("list_select_action")}}</span>
          </v-tooltip>
          <v-tooltip top content-class="icon-ttip">
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="toggleFilter()" :class="['amr-filter', {activated: showFilter}]">mdi-magnify</v-icon>
              </template>
              <span>{{i18n("list_filter")}}</span>
            </v-tooltip>
        </v-card>
      </v-col>
      <v-col cols="6" v-show="showFilter">
        <!-- Search Field -->
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
      <v-col cols="12" md="6" v-if="selectedManga.length > 0">
        <MultiMangaAction :selected="selectedMangaExpanded" @clearSelected="clearSelected"/>
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
      <template v-if="pageNavigationPosition == 'top'" v-slot:top>
        <v-row class="mx-2">
          <v-col cols="3">
            <v-select dense outlined :items="pagination.pageOptions" v-model="itemsPerPage" :label="i18n('list_page_label')"></v-select>
          </v-col>
          <v-col>
            <v-pagination :total-visible="10" v-model="pagination.currentPage" :length="pagination.pageCount"></v-pagination>
          </v-col>
          <v-col cols="1">
            <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-btn color="blue" icon x-large @click="moveNavigation()" v-on="on">
                <v-icon>mdi-arrow-down-box</v-icon>
              </v-btn>
            </template>
            <span>{{i18n("list_move_navigation")}}</span>
          </v-tooltip>
          </v-col>
        </v-row>
      </template>
      <template v-if="pageNavigationPosition == 'bottom'" v-slot:footer>
        <v-row class="mx-2 pt-5">
          <v-col cols="3">
            <v-select dense outlined :items="pagination.pageOptions" v-model="itemsPerPage" :label="i18n('list_page_label')"></v-select>
          </v-col>
          <v-col>
            <v-pagination :total-visible="10" v-model="pagination.currentPage" :length="pagination.pageCount"></v-pagination>
          </v-col>
          <v-col cols="1">
            <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-btn color="blue" icon x-large @click="moveNavigation()" v-on="on">
                <v-icon>mdi-arrow-up-box</v-icon>
              </v-btn>
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
      <template v-slot:item="{item, index}">
        <tr class="m-2">
          <td v-show="selectable">
            <v-checkbox v-model="selectedManga" :value="item.key" hide-details />
          </td>
          <td>
            <MangaGroup 
              @search-request="propagateSR"
              :group="item"
              :group-index="index"
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
          <span class="headline" v-html="dialogTitle"></span>
        </v-card-title>
        <v-card-text>
          <span v-html="dialogText"></span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="showDialog = false">{{i18n("button_no")}}</v-btn>
          <v-btn color="blue darken-1" flat @click.native="dialogAction">{{i18n("button_yes")}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    let af = utilsamr.formatMgName(a.name), bf = utilsamr.formatMgName(b.name)
    let res = af === undefined ? -1 : af.localeCompare(bf)
    if (res === 0) {
        res = a.mirror === undefined ? -1 : a.mirror.localeCompare(b.mirror)
    }
    if (res === 0) {
        res = a.language === undefined ? -1 : a.language.localeCompare(b.language)
    }
    return res
}
export default {
  data() {
    return {
      loaded: false,
      sort: "updates", // sort mode for list (az : alphabetical, updates : mangas with updates first)
      showDialog: false, // do show dialog to ask smthg
      showFilter: false, // Show the text search
      dialogTitle: "", //title of opened dialog
      dialogText: "", // text of opened dialog
      selectable: false, // Toggle Manga List select behaviour
      dialogAction: () => {self.showDialog = false}, // action to take on yes in dialog
      searchText: "",
      selectedManga: [],
      pagination: {
        pageOptions: [
          25,
          50,
          100
        ],
        currentPage: 1,
        pageCount: 0
      },
      itemsPerPage: this.$store.state.options.perPageMangas,
      pageNavigationPosition: this.$store.state.options.pageNavigationPosition
    };
  },
  watch: {
    itemsPerPage: function(newValue) {
      this.$store.dispatch("setOption", { key: 'perPageMangas', value: newValue })
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
    /**
     * Return all visible mangas
     */
    visMangas: function() {
      return this.allMangas.filter(
        mg => utils.displayFilterCats(mg, this.options.categoriesStates)
      )
    },
    /**
     * Return all visible mangas having new chapters to read
     */
    visNewMangas: function() {
      return this.visMangas.filter(
        mg => utils.hasNew(mg)        )
    },
    /**
     * Build mangas groups (by name)
     */
    groupedMangas: function() {
      return this.sortMangaList(this.visMangas).reduce((groups, manga) => {
        let key
        if (this.options.groupmgs === 0) {
          key = manga.key
        } else {
          key = 'group:' + utilsamr.formatMgName(manga.name)
        }

        let index = groups.findIndex(group => group.key == key)

        if (index === -1) {
          groups.push({
            name: manga.name,
            key: key,
            mangas: []
          })
        }
        index = groups.findIndex(group => group.key == key)

        groups[index].mangas.push(manga)

        // Ensure still updating manga are first in the group
        groups[index].mangas = groups[index].mangas.sort((a, b) => a.read - b.read)
        return groups
      }, [])
    },
    selectedMangaExpanded: function() {
      let newList = []
      this.selectedManga.forEach(key => {
        if (key.startsWith('group:')) {
          let index = this.groupedMangas.findIndex(group => group.key == key)
          if (index !== -1) {
            newList.push(...this.groupedMangas[index].mangas.map(manga => manga.key))
          }
        } else {
          newList.push(key)
        }
      })
      return newList
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
        self.visNewMangas.forEach(mg => {
          self.$store.dispatch("readManga", {
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
        self.visMangas.forEach(mg => {
          self.$store.dispatch("deleteManga", {
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
      } else /*if (sort === "updates")*/ {
        cmp = function(a, b) {
          let ha = utils.hasNew(a),
              hb = utils.hasNew(b);
          // primary sort on manga has new chapter, secondary on alphabetical
          return (ha === hb ? default_sort(a, b) : (ha && !hb ? -1 : 1));
        };
      };
      return items.sort(cmp);
    },
    clearSelected: function() {
      this.selectedManga = []
    },
    toggleFilter: function() {
      this.showFilter = !this.showFilter

      if (!this.showFilter) {
        this.searchText = ''
      }
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
    
  }
}
</script>
<style>

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
td {
  height: auto !important;
}
</style>
