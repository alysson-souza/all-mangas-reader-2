<template>
    <div>
        <!-- Before mangas are loaded into popup -->
        <div v-if="!loaded" class="amr-loader">
            <v-progress-circular indeterminate :width="4" :size="50" color="red darken-2"></v-progress-circular>
        </div>
        <!-- Once loaded -->
        <div v-if="loaded">
            <div v-if="allMangas.length" class="amr-mangas">
                <!-- Categories -->
                <Categories :categories="categories" :static-cats="false" :delegate-delete="false" />
                <!-- Load manga list -->
                <div class="amr-manga-list-container">
                    <MangaGroup v-if="options.groupmgs === 0"  v-for="mg in allMangas" v-bind:key="mg.key" :mangas="[mg]" />
                    <MangaGroup v-if="options.groupmgs !== 0"  v-for="(grp, key) in groupedMangas" v-bind:key="key" :mangas="grp" />
                </div>
            </div>
            <!-- No mangas yet -->
            <div v-if="!allMangas.length" class="amr-nomangas">
                <p>
                    <strong>No manga in your list</strong>. Check the filters above or add mangas to the list. 
    To add a manga in the reading list, just go read a manga on a site supported by All Mangas Reader. Each manga you are reading is added or updated in the All Mangas Reader reading list. You can start reading a manga by searching one using the <v-icon>mdi-magnify</v-icon>.
                </p>
                <p>
                    <a @click.prevent="importSamples()">Start immediately by importing a few mangas we recommend !</a>
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
import * as utils from '../../amr/utils';

export default {
  data() {
    return {
      loaded: false
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
        // create groups
        var groups = this.allMangas.reduce((grps, manga) => {
            let key = utils.formatMgName(manga.name);
            (grps[key] = grps[key] || []).push(manga);
            return grps;
        }, {});
        return groups; // no more string index
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
</style>
