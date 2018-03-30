<template>
	<v-app>
		<v-toolbar app>
			<img src="/icons/icon_32.png" alt="All Mangas Reader">
			<v-toolbar-title v-text="title"></v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn icon @click.stop="bottomSearch = bottomOptions = false">
				<v-icon>mdi mdi-ninja</v-icon>
			</v-btn>
			<v-btn icon @click.stop="bottomSearch = !bottomSearch">
				<v-icon>mdi mdi-magnify</v-icon>
			</v-btn>
			<v-menu bottom left>
				<v-btn icon slot="activator">
					<v-icon>more_vert</v-icon>
				</v-btn>
				<v-list>
					<v-list-tile>
						<v-list-tile-action>
							<v-icon>mdi mdi-timer</v-icon>
						</v-list-tile-action>
						<v-list-tile-title>Timers</v-list-tile-title>
					</v-list-tile>
					<v-list-tile>
						<v-list-tile-action>
							<v-icon>mdi mdi-content-save-settings</v-icon>
						</v-list-tile-action>
						<v-list-tile-title>Import / Export</v-list-tile-title>
					</v-list-tile>
				</v-list>
          	</v-menu>
		</v-toolbar>
		<v-content>
			<MangaList></MangaList>
		</v-content>
	</v-app>
</template>

<script>
import MangaList from "./components/MangaList";

export default {
  data() {
    return {
      bottomSearch: false,
      bottomOptions: false,
      title: "All Mangas Reader"
    };
  },
  name: "App",
  components: { MangaList },
  created() {
	  	// initialize state for store in popup from background
		this.$store.dispatch("getStateFromReference", {
			module: "options",
			mutation: "extendOptions"
		});
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
	.dialog .card__title, .dialog .card__text {
    	padding: 4px 16px;
	}
	.dialog .card__title {
		padding-top: 10px;
	}
</style>
