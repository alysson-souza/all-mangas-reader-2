<!-- The prop "mangas" used to initialize this component is a list of manga objects with the same name : a manga read on multile sites -->
<template>
  <v-container fluid class="amr-list-line" v-if="nbDisplayed > 0">
    <!-- Manga line-->
    <Manga
      v-for="manga in mangas" 
      v-bind:key="manga.key" 
      :manga="manga" 
      :is-in-group="nbDisplayed > 1" 
      :is-first="manga.key === first.key" 
      :group-expanded="expanded"
      @details-click="details = !details"
      @expand-group="expanded = !expanded" />

    <!-- Details, hidden, more actions on manga group -->
    <v-layout row v-if="details">
      <v-flex xs12 class="amr-details">
        <v-card dark tile flat :color="color(3)" class="back-card">
          <v-btn @click='resetManga(first.key)' :color="color(0)" small>Reset reading</v-btn>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import browser from "webextension-polyfill";
import Manga from "./Manga";
import * as utils from "../utils";

export default {
  data() {
    return {
      // current state of details panel
      details: false,
      // is the group expanded
      expanded: false
    };
  },
  // property to load the component with --> a group of manga
  props: ["mangas"],
  components: { Manga },
  computed: {
    first: function() {
      /** returns the first DISPLAYED manga of the group */
      for (let mg of this.mangas) {
        if (utils.displayFilterCats(mg, this.options.categoriesStates))
          return mg;
      }
      return this.mangas[0];
    },
    /**
     * Returns number of manga of this group which will be displayed according to the filters
     */
    nbDisplayed: function() {
      let nb = 0;
      for (let mg of this.mangas) {
        if (utils.displayFilterCats(mg, this.options.categoriesStates)) nb++;
      }
      return nb;
    },
    // AMR options
    options: function() {
      return this.$store.state.options;
    }
  },
  methods: {
    /**
     * Return the right color for this manga, depending if it updates (you can stop following udates for a manga), if it has unread chapters or not
     */
    color: function(light) {
      let lstr =
        light === 0
          ? ""
          : light < 0 ? " darken-" + -light : " lighten-" + light;
      if (this.first.read !== 0) return "blue-grey" + lstr;
      else if (
        this.first.listChaps.length &&
        this.first.lastChapterReadURL !== this.first.listChaps[0][1]
      ) {
        return "green" + lstr;
      } else {
        return "blue" + lstr;
      }
    }
  },
  // Name of the component
  name: "MangaGroup"
};
</script>

<style lang="css" scoped>
.container.amr-list-line {
  padding: 0px 10px;
}
.container.amr-list-line:last-child {
  padding-bottom: 10px;
}
.btn {
  text-transform: none;
}
</style>