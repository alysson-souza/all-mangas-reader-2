<!-- The prop "mangas" used to initialize this component is a list of manga objects with the same name : a manga read on multiple sites -->
<template>
  <v-container fluid :class="'amr-list-line ' + (updating ? '' : 'noupdates')" v-if="nbDisplayed > 0">
    <!-- Manga line-->
    <Manga
      v-for="(manga, key) in mangas" 
      :key="key" 
      :manga="manga" 
      :is-in-group="nbDisplayed > 1" 
      :is-first="manga.key === first.key"
      :group-expanded="expanded"
      :seen="seen"
      @details-click="details = !details"
      @expand-group="expanded = !expanded" />

    <!-- Details, hidden, more actions on manga group -->
    <transition name="fadeHeight">
    <v-layout row v-if="details">
      <v-flex xs12 class="amr-details">
        <v-card tile flat :color="color(3)" class="back-card">
          <v-container grid-list-md>
            <v-layout row>
              <!-- Manage manga categories -->
              <v-flex xs6 class="amr-categories">
                <span>{{i18n("list_details_cats")}} : </span>
                <!-- Categories -->
                <Categories 
                  :categories="mangaCats" 
                  :static-cats="true" 
                  :delegate-delete="true" 
                  @delete-category="deleteCategory" />
                <div class="det-sel-wrapper">
                <select dark v-model="newCat" @change="addCategory()" :class="color(2)">
                  <option value="">{{i18n("list_details_cats_select")}}</option>
                  <option v-for="(cat, key) of this.options.categoriesStates" 
                          v-if="cat.type !== 'native'" 
                          :key="key" 
                          :value="cat.name">
                      {{cat.name}}
                  </option>
                </select>
                </div>
              </v-flex>
              <!-- Manage manga bookmarks -->
              <v-flex xs6 class="amr-bookmarks">
                <span>{{i18n("list_details_books")}} : </span>
              </v-flex>
            </v-layout>
            <!-- Actions buttons -->
            <v-layout row text-xs-center>
              <v-flex xs12 class="amr-actions">
                <v-btn dark @click='searchElsewhere()' :color="color(0)" small>{{i18n("list_details_act_search")}}</v-btn>
                <v-btn dark @click='resetManga()' :color="color(0)" small>{{i18n("list_details_act_reset")}}</v-btn>
                <v-btn dark v-if="mangas[0].read === 0" @click='stopFollowingUpdates()' :color="color(0)" small>{{i18n("list_details_act_stop_follow")}}</v-btn>
                <v-btn dark v-if="mangas[0].read === 1" @click='followUpdates()' :color="color(0)" small>{{i18n("list_details_act_follow")}}</v-btn>
                <v-btn dark v-if="mangas[0].update === 1" @click='stopUpdating()' :color="color(0)" small>{{i18n("list_details_act_stop_updating")}}</v-btn>
                <v-btn dark v-if="mangas[0].update === 0" @click='restartUpdating()' :color="color(0)" small>{{i18n("list_details_act_restart_updating")}}</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
    </transition>
  </v-container>
</template>

<script>
import i18n from "../../amr/i18n";
import { mapGetters } from "vuex";
import browser from "webextension-polyfill";
import Manga from "./Manga";
import Categories from "./Categories";
import * as utils from "../utils";

export default {
  data() {
    return {
      // current state of details panel
      details: false,
      // is the group expanded
      expanded: false, 
      // category to add to this group of mangas
      newCat: "",
      // has the mangagroup been seen in the UI
      seen: false,
    };
  },
  // property to load the component with --> a group of manga
  props: ["mangas"],
  components: { Manga, Categories },
  computed: {
    first: function() {
      /** returns the first DISPLAYED manga of the group */
      for (let mg of this.mangas) {
        if (utils.displayFilterCats(mg, this.options.categoriesStates))
          return mg;
      }
      return this.mangas[0];
    },
    mangaCats: function() {
      return this.mangas.reduce((cats, manga) => {
        return cats.concat(
          manga.cats.filter(
            cat => cats.findIndex(
              c => c.name === cat.name
            ) < 0
          )
        );
      }, []);
    },
    /**
     * return true if at least one manga of the group is still updating (update top is 1)
     */
    updating: function() {
      for (let mg of this.mangas) {
        if (mg.update === 1) return true;
      }
      return false;
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
    i18n: (message, ...args) => i18n(message, ...args),
    /**
     * Return the right color for this manga, depending if it updates (you can stop following udates for a manga), if it has unread chapters or not
     */
    color: function(light) {
      let lstr =
        light === 0
          ? ""
          : light < 0 ? " darken-" + -light : " lighten-" + light;
      if (this.first.read !== 0) return this.options.colornotfollow + lstr;
      else if (
        this.first.listChaps.length &&
        this.first.lastChapterReadURL !== this.first.listChaps[0][1]
      ) {
        return this.options.colornew + lstr;
      } else {
        return this.options.colorread + lstr;
      }
    },
    /**
     * Reset manga reading to first chapter for the group of mangas
     */
    resetManga() {
      for (let mg of this.mangas)
        this.$store.dispatch("resetManga", { url: mg.url });
    },
    /**
     * Stop following manga updates for this group
     */
    stopFollowingUpdates: function() {
      this.$store.dispatch("markMangaReadTop", {
        url: this.mangas[0].url,
        updatesamemangas: true,
        read: 1
      });
    },
    /**
     * Following manga updates for this group
     */
    followUpdates: function() {
      this.$store.dispatch("markMangaReadTop", {
        url: this.mangas[0].url,
        updatesamemangas: true,
        read: 0
      });
    }, 
    /**
     * Stop updating (looking for new chapters) mangas in this group
     */
    stopUpdating: function() {
      this.$store.dispatch("markMangaUpdateTop", {
        url: this.mangas[0].url,
        updatesamemangas: true,
        update: 0
      });
    },
    /**
     * Restart updating (looking for new chapters) mangas in this group
     */
    restartUpdating: function() {
      this.$store.dispatch("markMangaUpdateTop", {
        url: this.mangas[0].url,
        updatesamemangas: true,
        update: 1
      });
    },
    /**
     * Delete a category on this group of manga
     */
    deleteCategory: function(cat) {
      for (let mg of this.mangas) {
        this.$store.dispatch("removeCategoryFromManga", {
          key: mg.key,
          name: cat
        });
      }
    }, 
    addCategory: function() {
      for (let mg of this.mangas) {
        this.$store.dispatch("addCategoryToManga", {
          key: mg.key,
          name: this.newCat
        });
      }
      this.newCat = "";
    }, 
    searchElsewhere: function() {
      this.$emit("search-request", this.first.name);
    }
  },
  // Name of the component
  name: "MangaGroup",
  mounted() {
      this.$emit("start-observing", this);
  },
  beforeDestroy() {
      this.$emit("stop-observing", this);
  }
};
</script>

<style lang="css" scoped>
.container.amr-list-line {
  padding: 0px 10px;
}
.container.amr-list-line.noupdates {
  opacity: 0.75;
}
.container.amr-list-line:last-child {
  padding-bottom: 10px;
}
.btn {
  text-transform: none;
}
.fadeHeight-enter-active,
.fadeHeight-leave-active {
  transition: all 0.5s;
  max-height: 100px;
}
.fadeHeight-enter,
.fadeHeight-leave-to
{
  max-height: 0px;
}
.det-sel-wrapper {
  display: inline-block;
  position: relative;
}
select {
  -moz-appearance: none;
  -webkit-appearance: none;
  -ms-appearance: none;
  display: inline-block;
  outline: none;
  border-style: none;
  border-radius: 2px !important;
  position: relative;
  padding: 2px 4px;
  padding-right: 15px;
  color: white;
  font-size: 11px;
}
select option {
    font-size: 11px;
}
.det-sel-wrapper:after {
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
.cat-cont {
  display: inline-block;
}
</style>
