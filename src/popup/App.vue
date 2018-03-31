<template>
	<v-app :dark="$store.state.options.dark === 1">
		<v-toolbar app>
			<img src="/icons/icon_32.png" alt="All Mangas Reader">
			<v-toolbar-title v-text="title"></v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn icon @click.stop="openOptions()">
				<v-icon>mdi-settings</v-icon>
			</v-btn>
			<v-btn icon @click.stop="bottomSearch = !bottomSearch">
				<v-icon>mdi-magnify</v-icon>
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
			<div id="__bottom_app__"></div>
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
            <v-btn icon @click.native="closeOptions()" dark>
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
import MangaList from "./components/MangaList";
import Options from "./components/Options";
import PopupResizer from './resizePopup';

export default {
  data() {
    return {
      bottomSearch: false,
      bottomOptions: false,
			title: "All Mangas Reader", 
			options: false
    };
  },
  name: "App",
  components: { MangaList, Options },
  created() {
    // initialize state for store in popup from background
    this.$store.dispatch("getStateFromReference", {
      module: "mirrors",
      key: "all",
      mutation: "setMirrors"
    });
	}, 
	methods: {
		openOptions() {
			this.options = true;
			PopupResizer.setHeightToMax();
		}, 
		closeOptions() {
			this.options = false;
			PopupResizer.setHeightToCurrent();
		}
	}, 
	mounted: function () {
  	this.$nextTick(function () {
    	PopupResizer.checkHeight();
		})
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
