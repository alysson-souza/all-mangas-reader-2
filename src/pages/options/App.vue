<template>
	<v-app :dark="$store.state.options.dark === 1">
        <v-content>
          <!-- Before mirrors and mangas are loaded into options -->
          <div v-if="!loaded" class="amr-loader">
              <v-progress-circular indeterminate :width="4" :size="50" color="red darken-2"></v-progress-circular>
          </div>
          <!-- Once loaded -->
          <Options v-if="loaded" />
        </v-content>
	</v-app>
</template>

<script>
import i18n from "../../amr/i18n";
import Options from "../components/Options";

export default {
  data() {
    return {
      loaded: false
    };
  },
  async created() {
    document.title = i18n("page_options_title");
    let init = [];
    // initialize mirrors state for store in options from background
    init.push(this.$store.dispatch("getStateFromReference", {
      module: "mirrors",
      key: "all",
      mutation: "setMirrors"
    }));
    // initialize mangas state for store in options from background
    init.push(this.$store.dispatch("getStateFromReference", {
      module: "mangas",
      key: "all",
      mutation: "setMangas"
    }));
    await Promise.all(init);
    this.loaded = true
	}, 
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
  },
  name: "App",
  components: { Options }
};
</script>
<style>
.amr-loader {
  margin: 20px;
  text-align: center;
  width: 100%;
}
</style>
