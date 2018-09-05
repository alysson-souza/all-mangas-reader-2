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
                            <v-icon slot="activator" @click="sort = 'az'" :class="['amr-filter', {activated: sort === 'az'}]">mdi-sort-alphabetical</v-icon>
                            <span>{{i18n("list_sort_alpha")}}</span>
                        </v-tooltip>
                        <v-tooltip top content-class="icon-ttip">
                            <v-icon slot="activator" @click="sort = 'updates'" :class="['amr-filter', {activated: sort === 'updates'}]">mdi-flash</v-icon>
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
                        <template v-if="options.groupmgs === 0">
                            <MangaGroup
                                @search-request="propagateSR"
                                @start-observing="startObserving"
                                @stop-observing="stopObserving"
                                v-for="mg in sortedMangas"
                                :key="'GROUP' + mg.key"
                                :mangas="[mg]" />
                        </template>
                        <template v-else>
                            <MangaGroup
                                @search-request="propagateSR"
                                @start-observing="startObserving"
                                @stop-observing="stopObserving"
                                v-for="(grp, key) in groupedMangas"
                                :key="key"
                                :mangas="grp" />
                        </template>
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
                <p v-html="convertIcons(i18n('list_no_manga_message'))">
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
      dialogTitle: "", //title of opened dialog
      dialogText: "", // text of opened dialog
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
     * Sort mangas (according to this.sort)
     */
    sortedMangas: function() {
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
        return this.visMangas.sort(cmp);
    },
    /**
     * Build mangas groups (by name)
     */
    groupedMangas: function() {
        // create groups
        return this.sortedMangas.reduce((grps, manga) => {
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
    }
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
.amr-nomangas {
  padding: 20px;
  text-align: center;
}
.amr-nomangas, .amr-mangas {
    max-width: 750px;
    margin-left: auto;
    margin-right: auto;
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
    font-size: 18px;
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
