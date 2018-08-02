<template>
	<v-app :dark="$store.state.options.dark === 1">
    <v-navigation-drawer
      :clipped="$vuetify.breakpoint.lgAndUp"
      v-model="drawer"
      fixed
      app
    >
    <v-card flat>
      <v-list two-line>
        <v-list-tile @click="switchAllStates()" avatar ripple>
            <v-list-tile-content>
              <v-list-tile-title>
                All mangas
              </v-list-tile-title>
              <v-list-tile-sub-title class="text--primary">{{ nbBookmarks }} bookmarks</v-list-tile-sub-title>
            </v-list-tile-content>
              <v-list-tile-action>
                  <v-icon
                    v-if="hasOneUnState()"
                    color="red darken-2"
                    @click="switchAllStates()"
                  >
                  mdi-eye
                  </v-icon>
                  <v-icon
                    v-else
                    color="grey lighten-1"
                    @click="switchAllStates()"
                  >
                  mdi-eye-off
                  </v-icon>
              </v-list-tile-action>
          </v-list-tile>
          <v-divider></v-divider>
        <template v-for="(mg, index) in mangas">
          <v-list-tile :key="mg.key" @click="switchMgState(mg)" avatar ripple>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ mg.name }}
              </v-list-tile-title>
              <v-list-tile-sub-title class="text--primary">{{ mg.nb }} bookmarks</v-list-tile-sub-title>
            </v-list-tile-content>
              <v-list-tile-action>
                  <v-icon
                    v-if="!mangasUnSel[mg.key]"
                    color="red darken-2"
                    @click="switchMgState(mg)"
                  >
                  mdi-eye
                  </v-icon>
                  <v-icon
                    v-else
                    color="grey lighten-1"
                    @click="switchMgState(mg)"
                  >
                  mdi-eye-off
                  </v-icon>
              </v-list-tile-action>
          </v-list-tile>
          <v-divider
              v-if="index + 1 < mangas.length"
              :key="index"
            ></v-divider>
        </template>
      </v-list>
    </v-card>
    </v-navigation-drawer>
    <v-toolbar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      color="red darken-2"
      dark
      app
      fixed
    >
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-btn icon large color="white">
          <v-avatar size="32px" tile>
            <img src="/icons/icon_32.png" alt="All Mangas Reader">
          </v-avatar>
        </v-btn>
        <span class="hidden-sm-and-down">Bookmarks</span>
      </v-toolbar-title>
      <v-text-field
        flat
        solo-inverted
        hide-details
        prepend-inner-icon="search"
        label="Search"
        class="hidden-sm-and-down"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn-toggle v-model="toggle_type" multiple class="transparent">
        <v-btn flat>
          <v-icon>mdi-image</v-icon>
        </v-btn>
        <v-btn flat>
          <v-icon>mdi-book-open-variant</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center align-center v-if="!loaded">
          <!-- Before mirrors and bookmarks are loaded into bookmarks -->
              <v-progress-circular indeterminate :width="4" :size="50" color="red darken-2"></v-progress-circular>
        </v-layout>
        <v-layout v-else>
          <!-- Once loaded -->
          <Bookmarks :bookmark-list="displayedBookmarks"/>
        </v-layout>
      </v-container>
    </v-content>
	</v-app>
</template>

<script>
import i18n from "../../amr/i18n";
import Bookmarks from "../components/Bookmarks";
import * as utils from "../../amr/utils";
import Vue from 'vue';

export default {
  data() {
    return {
      loaded: false,
      drawer: true, /* display left panel by default */
      toggle_type: [0,1], /* select both scan and chapter by default */
      mangasUnSel: {},
    };
  },
  computed: {
    /**
     * Create distinct manga (by name) list
     */
    mangas: function() {
      return this.$store.state.bookmarks.all.reduce((list, bm) => {
        let bmmgname = utils.formatMgName(bm.name);
        let pos = list.findIndex(mg => bmmgname === utils.formatMgName(mg.name));
        if (pos === -1) {
          return [...list, {
            key: bmmgname,
            name: bm.name,
            nb: 1
          }]
        } else {
          list[pos].nb++;
        }
        return list
      }, []).sort((a, b) => a.name.localeCompare(b.name));
    },
    /**
     * Filters the bookmarks to display according to current criterias
     */
    displayedBookmarks: function() {
      return this.$store.state.bookmarks.all.filter(bm => {
        // filter bookmarks
        // by type 
        if (bm.type === 'chapter' && !this.toggle_type.includes(1)) return false;
        if (bm.type === 'scan' && !this.toggle_type.includes(0)) return false;
        
        // by manga
        let bmmgname = utils.formatMgName(bm.name);
        if (this.mangasUnSel[bmmgname]) return false;

        // by search text

        return true;
      }); 
    },
    nbBookmarks: function() {
      return this.$store.state.bookmarks.all.length;
    }
  },

  async created() {
    let init = [];
    // initialize mirrors state for store in options from background
    init.push(this.$store.dispatch("getStateFromReference", {
      module: "mirrors",
      key: "all",
      mutation: "setMirrors"
    }));
    // initialize bookmarks state for store in options from background
    init.push(this.$store.dispatch("getStateFromReference", {
      module: "bookmarks",
      key: "all",
      mutation: "setBookmarks"
    }));
    await Promise.all(init);
    this.loaded = true
	}, 
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    switchMgState: function(mg) {
      Vue.set(this.mangasUnSel, mg.key, !this.mangasUnSel[mg.key])
    },
    hasOneUnState: function(mg) {
      for (let mg of this.mangas) {
        if (this.mangasUnSel[mg.key]) return true;
      }
      return false;
    },
    switchAllStates: function(mg) {
      let nst = !this.hasOneUnState();
      for (let mg of this.mangas) {
        Vue.set(this.mangasUnSel, mg.key, nst)
      }
    },
  },
  watch: {
    toggle_type: function(n, o) {
      if (n.length === 0) {
        if (o.includes(0)) this.toggle_type = [1];
        else this.toggle_type = [0];
      }
    }
  },
  name: "App",
  components: { Bookmarks }
};
</script>
<style>
</style>
