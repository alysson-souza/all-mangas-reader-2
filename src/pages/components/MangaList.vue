<template>
    <div>
        <!-- Before mangas are loaded into popup -->
        <div v-if="!loaded" class="amr-loader">
            <v-progress-circular indeterminate :width="4" :size="50" color="red darken-2"></v-progress-circular>
        </div>
        <!-- Once loaded -->
        <div v-if="loaded">
            <div v-if="allMangas.length" class="amr-mangas">
                <div class="amr-filters-container">
                    <v-card v-if="visMangas.length" color="grey lighten-4" class="hover-card">
                        <v-tooltip v-if="visNewMangas.length" top content-class="icon-ttip">
                            <v-icon slot="activator" @click="markAllAsRead()">mdi-eye</v-icon>
                            <span>{{i18n("list_global_read")}}</span>
                        </v-tooltip>
                        <v-tooltip top content-class="icon-ttip">
                            <v-icon slot="activator" @click="deleteAll()">mdi-delete</v-icon>
                            <span>{{i18n("list_global_delete")}}</span>
                        </v-tooltip>
                    </v-card>
                    <v-card v-if="visMangas.length" color="grey lighten-2" class="hover-card">
                        <v-icon class="filters-icon">mdi-filter</v-icon>
                        <v-tooltip top content-class="icon-ttip">
                            <v-icon slot="activator" @click="sort = 'az'" :class="'amr-filter ' + (sort === 'az' ? 'activated' : '')">mdi-sort-alphabetical</v-icon>
                            <span>{{i18n("list_sort_alpha")}}</span>
                        </v-tooltip>
                        <v-tooltip top content-class="icon-ttip">
                            <v-icon slot="activator" @click="sort = 'updates'" :class="'amr-filter ' + (sort === 'updates' ? 'activated' : '')">mdi-flash</v-icon>
                            <span>{{i18n("list_sort_new")}}</span>
                        </v-tooltip>
                    </v-card>
                </div>
                <!-- Categories -->
                <div class="amr-categories-container">
                    <Categories :categories="categories" :static-cats="false" :delegate-delete="false" />
                </div>
                <!-- Load manga list -->
                <div class="amr-manga-list-container">
                    <transition-group name="flip-list" tag="div">
                        <MangaGroup v-if="options.groupmgs === 0"  v-for="(mg, key) in allMangas" v-bind:key="key" :mangas="[mg]" />
                        <MangaGroup v-if="options.groupmgs !== 0"  v-for="(grp, key) in groupedMangas" v-bind:key="key" :mangas="grp" />
                    </transition-group>
                </div>
            </div>
            <!-- No mangas in list because of caegories state -->
            <div v-if="visMangas.length === 0 && allMangas.length > 0" class="amr-nomangas">
                <p v-html="i18n('list_no_manga_catstate_message')">
                </p>
            </div>
            <!-- No mangas yet -->
            <div v-if="!allMangas.length" class="amr-nomangas">
                <p v-html="i18n('list_no_manga_message')">
                </p>
                <p>
                    <a @click.prevent="importSamples()">{{ i18n("list_import_samples")}}</a>
                </p>
            </div>
        </div>
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
import browser from "webextension-polyfill";
import * as utilsamr from '../../amr/utils';
import * as utils from '../utils';

export default {
  data() {
    return {
      loaded: false,
      sort: "updates", // sort mode for list (az : alphabetical, updates : mangas with updates first)
      showDialog: false, // do show dialog to ask smthg
      dialogTitle: "", //title of opened dialog
      dialogText: "", // text of opened dialog
      dialogAction: () => {} // action to take on yes in dialog
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
            mg => utils.displayFilterCats(mg, this.options.categoriesStates)
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
        // sort mangas
        let sort = this.sort;
        let sorted = this.visMangas.sort(function(a, b) {
            if (sort === "az") {
                return a.name < b.name ? -1 : (a.name === b.name ? 0 : 1);
            } else if (sort === "updates") {
                let ha = utils.hasNew(a),
                    hb = utils.hasNew(b);
                // primary sort on manga has new chapter, secondary on alphabetical
                return (ha === hb ? (a.name < b.name ? -1 : (a.name === b.name ? 0 : 1)) : (ha && !hb ? -1 : 1));
            }
        });
        // create groups
        return sorted.reduce((grps, manga) => {
            let key = utilsamr.formatMgName(manga.name);
            (grps[key] = grps[key] || []).push(manga);
            return grps;
        }, {});
    },
    ...mapGetters(["countMangas", "allMangas"])
  },
  name: "MangaList",
  components: { MangaGroup, Categories },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    importSamples() {
      // we don't do this.$store.dispatch("importSamples"); because to load list of chapters, implementations rely on jQuery, which is not loaded in pages, rely on background page to do so
      browser.runtime.sendMessage({ action: "importSamples" });
    }, 
    markAllAsRead() {
        this.dialogTitle = i18n("list_global_read_title");
        this.dialogText = i18n("list_global_read_text", this.visNewMangas.length);
        let self = this;
        this.dialogAction = () => {
            self.visNewMangas.forEach(mg => {
                self.$store.dispatch("readManga", {
                    url: mg.url,
                    mirror: mg.mirror,
                    lastChapterReadName: mg.listChaps[0][0],
                    lastChapterReadURL: mg.listChaps[0][1],
                    name: mg.name
                })
            })
            self.showDialog = false
        }
        this.showDialog = true;
    },
    deleteAll() {
        this.dialogTitle = i18n("list_global_delete_title");
        this.dialogText = i18n("list_global_delete_text", this.visMangas.length);
        let self = this;
        this.dialogAction = () => {
            self.visMangas.forEach(mg => {
                self.$store.dispatch("deleteManga", {
                    key: mg.key
                })
            })
            self.showDialog = false
        }
        this.showDialog = true;
    }
  },
  async created() {
    // initialize state for store in popup from background
    await this.$store.dispatch("getStateFromReference", {
      module: "mangas",
      key: "all",
      mutation: "setMangas"
    });
    this.loaded = true;
  }
};
</script>
<style>
.amr-nomangas {
  padding: 20px;
  text-align: center;
}
.amr-mangas {
  max-height: 350px;
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
.theme--dark .icon.amr-filter {
    color:grey;
}
.amr-filter.activated {
    color: black;
}
.theme--dark .icon.amr-filter.activated {
    color: white;
}
.flip-list-move {
  transition: transform 1s;
}
.hover-card {
    margin: 0px 2px;
    padding: 0px 2px;
    display: inline-block;
}
.hover-card i {
    font-size: 16px;
    margin: 0px 2px;
}
.hover-card .tooltip {
    cursor: pointer;
}
.hover-card .filters-icon {
    margin: 0;
    font-size: 10px;
}
</style>
