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
                    <v-tooltip top content-class="icon-ttip">
                        <v-icon slot="activator" @click="sort = 'az'" :class="'amr-filter ' + (sort === 'az' ? 'activated' : '')">mdi-sort-alphabetical</v-icon>
                        <span>{{i18n("list_sort_alpha")}}</span>
                    </v-tooltip>
                    <v-tooltip top content-class="icon-ttip">
                        <v-icon slot="activator" @click="sort = 'updates'" :class="'amr-filter ' + (sort === 'updates' ? 'activated' : '')">mdi-flash</v-icon>
                        <span>{{i18n("list_sort_new")}}</span>
                    </v-tooltip>
                </div>
                <!-- Categories -->
                <div class="amr-categories-container">
                    <Categories :categories="categories" :static-cats="false" :delegate-delete="false" />
                </div>
                <!-- Load manga list -->
                <div class="amr-manga-list-container">
                    <transition-group name="flip-list" tag="div">
                        <MangaGroup v-if="options.groupmgs === 0"  v-for="mg in allMangas" v-bind:key="mg.key" :mangas="[mg]" />
                        <MangaGroup v-if="options.groupmgs !== 0"  v-for="(grp, key) in groupedMangas" v-bind:key="key" :mangas="grp" />
                    </transition-group>
                </div>
            </div>
            <!-- No mangas yet -->
            <div v-if="!allMangas.length" class="amr-nomangas">
                <p :v-html="i18n('list_no_manga_message')">
                </p>
                <p>
                    <a @click.prevent="importSamples()">{{ i18n("list_import_samples")}}</a>
                </p>
            </div>
        </div>
    </div>
</template>
<script>
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
      sort: "updates" // sort mode for list (az : alphabetical, updates : mangas with updates first)
    };
  },
  computed: {
    // AMR options
    options: function() {
        return this.$store.state.options;
    },
    categories: function() {
        return this.options.categoriesStates;
    },
    groupedMangas: function() {
        // sort mangas
        let sort = this.sort;
        let sorted = this.allMangas.sort(function(a, b) {
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
    importSamples() {
      // we don't do this.$store.dispatch("importSamples"); because to load list of chapters, implementations rely on jQuery, which is not loaded in pages, rely on background page to do so
      browser.runtime.sendMessage({ action: "importSamples" });
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
    margin-top: 10px;
    margin-right: 10px;
}
.amr-categories-container {
    margin-right: 44px;
}
.amr-filter {
    font-size: 20px;
    color:grey;
    margin-left: 4px;
    cursor: pointer;
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
</style>
