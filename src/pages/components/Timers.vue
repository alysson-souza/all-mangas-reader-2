<template>
  <v-container class="text-center" fluid>
    <v-row >
      <v-col cols="6" offset="3">
        <v-btn color="primary"
              class="refresh-button" 
              @click="updateChaps()"
              :loading="loadingChapters" 
              :disabled="loadingChapters">
          <v-icon>mdi-book-open-variant</v-icon>
          {{i18n("refresh_chapters")}}
        </v-btn>
        {{i18n("refresh_last", lastchaps)}}
      </v-col>
    </v-row>
    <v-row >
      <v-col cols="12">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn color="primary"
                  class="refresh-button" 
                  @click="resetLists()"
                  :loading="loadingLists" 
                  :disabled="loadingLists"
                  v-on="on">
              <v-icon>mdi-format-list-bulleted</v-icon>
              {{i18n("refresh_lists")}}
            </v-btn>
          </template>
          <span>{{i18n("refresh_lists_desc")}}</span>
        </v-tooltip>
        <br />
        {{i18n("refresh_lists_nb", stats.nb, stats.nbmangas)}}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import i18n from "../../amr/i18n";
import * as utils from "../../amr/utils";
import browser from "webextension-polyfill";
import storedb from "../../amr/storedb";

export default {
  data() {
    return {
      /**
       * Currently loading booleans for buttons display
       */
      loadingChapters: false,
      loadingMirrors: false,
      loadingLists: false,
      ticker: Date.now(),
      stats: {nb:0,nbmangas:0}
    };
  },
  mounted: async function() {
    var self = this;
    setInterval(function() {
      self.$data.ticker = Date.now()
    }, 1000);
    this.stats = await storedb.getListsOfMangaStats()
  },
  computed: {
    /**
     * Convert timestamps in readable ... ago
     */
    lastchaps: function() {
      return utils.lasttime(
        this.ticker - this.$store.state.options.lastChaptersUpdate
      );
    },
    lastmirs: function() {
      return utils.lasttime(
        this.ticker - this.$store.state.options.lastMirrorsUpdate
      );
    }
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
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
     * Reset manga lists stored in db
     */
    async resetLists() {
      this.loadingLists = true
      await this.$store.dispatch("resetMirrorsMangaLists")
      this.loadingLists = false
      this.stats = await storedb.getListsOfMangaStats()
    }
  },
  name: "Timers"
};
</script>
<style>
.refresh-button {
  margin: 6px;
}
.refresh-button .v-btn__content {
  text-transform: none;
}
.refresh-button i {
  margin-right: 6px;
}
</style>
