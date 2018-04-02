<template>
	<v-app :dark="$store.state.options.dark === 1">
		<v-toolbar app>
			<img src="/icons/icon_32.png" alt="All Mangas Reader">
			<v-toolbar-title v-text="title"></v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn icon @click.stop="options = true">
				<v-icon>mdi-settings</v-icon>
			</v-btn>
		</v-toolbar>
		<v-content>
            
		</v-content>
		<v-dialog
			v-model="options"
			fullscreen
			transition="dialog-bottom-transition"
			:overlay="false"
			scrollable
			>
        <v-card tile>
          <v-toolbar card dark color="primary">
            <v-btn icon @click.native="options = false" dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Settings</v-toolbar-title>
          </v-toolbar>
          <Options />
        </v-card>
	</v-dialog>
	</v-app>
</template>

<script>
import Options from "../components/Options";

export default {
  data() {
    return {
      title: "All Mangas Reader Lab",
      options: false
    };
  },
  name: "App",
  components: { Options },
  created() {
    // initialize state for store in popup from background
    this.$store.dispatch("getStateFromReference", {
      module: "mirrors",
      key: "all",
      mutation: "setMirrors"
    });
  }
};
</script>
<style>
.dialog .card__title,
.dialog .card__text {
  padding: 4px 16px;
}
.dialog .card__title {
  padding-top: 10px;
}
</style>
