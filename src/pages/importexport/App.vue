<template>
	<v-app>
    <!-- Before mirrors and mangas are loaded into options -->
    <v-content v-if="!loaded" class="amr-loader">
        <v-progress-circular indeterminate :width="4" :size="50" color="red darken-2"></v-progress-circular>
    </v-content>

    <!-- Once loaded -->
    <v-toolbar v-if="loaded"
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      color="red darken-2"
      dark
      app
      fixed
    >
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
        <v-btn icon large color="white" class="hidden-sm-and-down">
          <v-avatar size="32px" tile>
            <img src="/icons/icon_32.png" alt="All Mangas Reader">
          </v-avatar>
        </v-btn>
        <span>{{i18n("importexport_title")}}</span>
      </v-toolbar-title>
    </v-toolbar>
    <v-content>
      <ImportExport />
    </v-content>
	</v-app>
</template>

<script>
import i18n from "../../amr/i18n";
import ImportExport from "../components/ImportExport";

export default {
  data() {
    return {
      loaded: false
    };
  },
  async created() {
    document.title = i18n("page_ie_title");
    let init = [];
    // initialize mirrors state for store in ie from background
    init.push(this.$store.dispatch("getStateFromReference", {
      module: "mirrors",
      key: "all",
      mutation: "setMirrors"
    }));
    // initialize mangas state for store in ie from background
    init.push(this.$store.dispatch("getStateFromReference", {
      module: "mangas",
      key: "all",
      mutation: "setMangas"
    }));
    // initialize bookmarks state for store in ie from background
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
  },
  name: "App",
  components: { ImportExport }
};
</script>
<style>
.amr-loader {
  margin: 20px;
  text-align: center;
  width: 100%;
}
</style>
