<template>
  <div>
    <!-- Categories and filters -->
    <v-row no-gutters>
      <!-- Categories -->
      <v-col cols="9">
        <Categories :categories="categories" :static-cats="false" :delegate-delete="false" />
      </v-col>
      <!-- Filters -->
      <v-col cols="3" class="float-right">
        
      </v-col>
    </v-row>
    <v-data-table :items="visMangas" :loading="!loaded" :custom-sort="sortMangaList" show-expand hide-default-header>
      <template v-slot:progress>
        <v-progress-linear
          color="purple"
          :height="10"
          indeterminate
        ></v-progress-linear>
      </template>
      <template v-slot:body="{items}">
        <tbody>
          <Manga 
            v-for="manga in items" 
            @search-request="propagateSR"
            :key="manga.key" 
            :manga="manga"
          />
        </tbody>
      </template>
      <template v-slot:expanded-item="{item }">
        <td>
          More info about {{ item.name }}
        </td>
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
import Manga from "./Manga";
import Categories from "./Categories";
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
      expanded: [],
      loaded: false,
      sort: "updates", // sort mode for list (az : alphabetical, updates : mangas with updates first)
      showDialog: false, // do show dialog to ask smthg
      showFilter: false, // Show the text filter for existing manga
      filterText: "", // Filter text
      dialogTitle: "", //title of opened dialog
      dialogText: "", // text of opened dialog
      selectable: false, // Toggle Manga List select behaviour
      dialogAction: () => {self.showDialog = false} // action to take on yes in dialog
    };
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
            mg => utils.displayFilterCats(mg, this.options.categoriesStates) && utils.filterByText(mg, this.filterText)
        )
    },
    /**
     * Return all visible mangas having new chapters to read
     */
    visNewMangas: function() {
        return this.visMangas.filter(
            mg => utils.hasNew(mg)
        )
    },
    /**
     * Build mangas groups (by name)
     */
    groupedMangas: function() {
        // create groups
        return this.sortedMangas.reduce((grps, manga) => {
            let key = utilsamr.formatMgName(manga.name);
            (grps[key] = grps[key] || []).push(manga);

            // Ensure still updating manga are first in the group
            grps[key] = grps[key].sort((a, b) => a.read - b.read)

            return grps;
        }, {});
    },
    ...mapGetters(["countMangas", "allMangas"])
  },
  name: "MangaList",
  components: { Categories, Manga },
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
    /**
     * IntersectionObserver register/unregister
     */
    startObserving(mangagroup) {
        // setup a backref on the HTMLElement
        mangagroup.$el.mangagroup = mangagroup;
        // add the HTMLElement to the observer
        this.observer.observe(mangagroup.$el);
    },
    stopObserving(mangagroup) {
        this.observer.unobserve(mangagroup.$el);
    },
    color: function(manga, light) {
      return utils.getColor(manga, this.options, light);
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

    mirror: function(manga) {
      return this.$store.state.mirrors.all.find(
        mir => mir.mirrorName === manga.mirror
      );
    },
    isMirrorEnabled: function (manga) {
      let mirror = mirror(manga)

      return mirror && !mirror.disabled;
    },
  },
  async created() {
    // initialize the IntersectionObserver for visibility checks
    this.observer = new IntersectionObserver(
        (entries) => {
            entries.forEach( (entry) => {
                if (entry.isIntersecting) {
                    let mg = entry.target.mangagroup;
                    mg.seen = true;
                    this.stopObserving(mg);
                }
            });
        },
        {} // default options
    );
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
    this.$emit("manga-loaded")
  }
};
</script>
<style>
.amr-container-wrapper {
    margin: 0 10px;
}
.amr-nomangas {
  padding: 20px;
  text-align: center;
}
.amr-nomangas, .amr-mangas {
    /* max-width: 750px; */
    margin-left: auto;
    margin-right: auto;
}

.amr-width-popup {
    max-width: 750px;
}

.amr-width-popup .v-icon {
  font-size: 18px;
}

.amr-width {
    max-width: 80%;
}

body.popup .amr-mangas {
  max-height: 452px;
  overflow-y: auto;
  overflow-x: hidden;
}
.amr-loader {
  margin: 20px;
  text-align: center;
  width: 100%;
}
.amr-filters-container {
    float: right;
    margin-top: 7px;
    margin-right: 9px;
}
.amr-categories-container {
    margin-right: 44px;
}
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
.flip-list-move {
  transition: transform 1s;
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
</style>
