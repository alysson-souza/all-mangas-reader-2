<!-- The prop "mangas" used to initialize this component is a list of manga objects with the same name : a manga read on multile sites -->
<template>
  <v-container fluid class="amr-list-line">
    <!-- Manga line-->
    <Manga 
      v-for="(manga, index) in mangas" 
      v-bind:key="manga.key" 
      :manga="manga" 
      :is-in-group="mangas.length > 1" 
      :is-first="index === 0" 
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
        return this.mangas[0];
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
* {
  font-size: 10pt;
}
.container.amr-list-line {
  padding: 0px 10px;
}
.container.amr-list-line:first-child {
  padding-top: 10px;
}
.container.amr-list-line:last-child {
  padding-bottom: 10px;
}
.container.amr-list-line:first-child
  .row:first-child
  .flex:first-child
  > .card {
  border-top-left-radius: 5px;
}
.container.amr-list-line:first-child .row:first-child .flex:last-child > .card {
  border-top-right-radius: 5px;
}
.container.amr-list-line:last-child .row:last-child .flex:first-child > .card {
  border-bottom-left-radius: 5px;
}
.container.amr-list-line:last-child .row:last-child .flex:last-child > .card {
  border-bottom-right-radius: 5px;
}
.container.amr-list-line .amr-list-elt > .card {
  padding: 4px;
}
.amr-manga-title-cont,
.amr-manga-actions-cont {
  padding: 4px;
}
.amr-manga-actions-cont i {
  cursor: pointer;
  font-size: 18px;
}
.amr-manga-actions-cont i:hover {
  opacity: 0.6;
}
.container.amr-list-line .amr-list-elt .amr-chapter-list-cont {
  padding: 8px;
}
.empty-icon {
  width: 13px;
}
.mirror-icon {
  vertical-align: middle;
  padding-right: 2px;
}
.back-card {
  height: 100% !important;
}

.progress-linear {
  margin: 0;
  margin-top: -1px;
}
/*Selects*/
.amr-select-wrapper {
  display: inline-block;
  position: relative;
  width: 100%;
}
select.amr-chap-sel {
  -moz-appearance: none;
  -webkit-appearance: none;
  -ms-appearance: none;
  display: inline-block;
  outline: none;
  border-style: none;
  width: 100%;
  border-top-left-radius: 2px !important;
  border-top-right-radius: 2px !important;
  position: relative;
}
.amr-select-wrapper:after {
  content: "▼";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  font-size: 75%;
  line-height: 19px;
  padding: 1px 5px;
  pointer-events: none;
  z-index: 1;
}
.btn {
  text-transform: none;
}
</style>