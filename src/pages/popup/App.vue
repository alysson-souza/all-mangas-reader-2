<template>
	<v-app :dark="$store.state.options.dark === 1">
		<!-- Main toolbar in popup -->
		<v-toolbar app>
			<img src="/icons/icon_32.png" alt="All Mangas Reader">
			<v-toolbar-title v-text="title"></v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn icon @click.stop="openOptions()">
				<v-icon>mdi-settings</v-icon>
			</v-btn>
			<v-btn icon @click.stop="openSearch()">
				<v-icon>mdi-magnify</v-icon>
			</v-btn>
			<v-btn icon @click.stop="openRPanel()">
				<v-icon>more_vert</v-icon>
			</v-btn>
		</v-toolbar>
		<!-- Default panel containing manga list -->
		<v-content>
			<MangaList></MangaList>
			<div id="__bottom_app__"></div>
		</v-content>
		<!-- Options dialog -->
		<v-dialog
			v-model="options"
			fullscreen
			transition="dialog-bottom-transition"
			:overlay="false"
			scrollable
			>
        <v-card tile>
          <v-toolbar app>
            <v-btn icon @click.native="closeOptions()">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>{{i18n("options_title")}}</v-toolbar-title>
          </v-toolbar>
					<v-content>
          	<Options />
					</v-content>
        </v-card>
	</v-dialog>
	<!-- Search dialog -->
	<v-dialog
			v-model="search"
			fullscreen
			transition="dialog-bottom-transition"
			:overlay="false"
			scrollable
			>
        <v-card tile>
          <v-toolbar app>
            <v-btn icon @click.native="closeSearch()">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>{{i18n("search_title")}}</v-toolbar-title>
          </v-toolbar>
					<v-content>
          	<Search />
					</v-content>
        </v-card>
	</v-dialog>
	<!-- Right panel containing links, refresh buttons, import export panels -->
	<v-navigation-drawer
      temporary
      v-model="rpanel"
			right
      :dark="$store.state.options.dark === 1"
      absolute
			width="500"
    >
		<!-- Links in right panel -->
		<v-container fluid class="pa-0" text-xs-center>
			<v-layout row>
				<v-flex xs6>
					<v-layout row>
				<v-flex xs4>
					<v-btn flat icon color="red darken-2" @click="opentab('https://allmangasreader.com')">
						<img src="/icons/icon_32.png" width="24" alt="All Mangas Reader">
					</v-btn>
				</v-flex>
				<v-flex xs4>
					<v-btn flat icon color="yellow" @click="opentab('/pages/bookmarks.html')">
						<v-icon>star</v-icon>
					</v-btn>
				</v-flex>
				<v-flex xs4>
					<v-btn flat icon color="blue" @click="opentab('https://gitlab.com/plduhoux/all-mangas-reader-2/wikis/home')">
						<v-icon>help</v-icon>
					</v-btn>
				</v-flex>
					</v-layout>
				</v-flex>
				<v-flex xs6>
					<v-tabs
            v-model="tabs"
            color="transparent"
						right
        		>
            <v-tabs-slider></v-tabs-slider>
            <v-tab href="#refresh">
                <v-icon>refresh</v-icon>
            </v-tab>
            <v-tab href="#importexport">
                <v-icon>save</v-icon>
            </v-tab>
        </v-tabs>
				</v-flex>
			</v-layout>
		</v-container>
		<v-tabs-items v-model="tabs" :class="($store.state.options.dark === 1 ? 'black' : 'white')">
				<v-tab-item id="refresh">
					<!-- Refresh buttons -->
					<Timers />
				</v-tab-item>
				<v-tab-item id="importexport">
					<!-- Import export panels -->
					<ImportExport />
				</v-tab-item>
		</v-tabs-items>
	</v-navigation-drawer>
	</v-app>
</template>

<script>
import i18n from "../../amr/i18n";
import MangaList from "../components/MangaList";
import Options from "../components/Options";
import Search from "../components/Search";
import PopupResizer from './resizePopup';
import Timers from '../components/Timers';
import ImportExport from '../components/ImportExport';
import browser from "webextension-polyfill";

export default {
  data() {
    return {
			title: "All Mangas Reader", 
			options: false,
			search: false,
			rpanel: false,
			tabs: "refresh", // in rpanel, right tabs state
    };
  },
  name: "App",
  components: { MangaList, Options, Search, Timers, ImportExport },
  created() {
    // initialize state for store in popup from background
    this.$store.dispatch("getStateFromReference", {
      module: "mirrors",
      key: "all",
      mutation: "setMirrors"
    });
	}, 
	watch: {
		rpanel: function(n) {
			if (!n) this.closeRPanel();
		}
	},
	methods: {
		i18n: (message, ...args) => i18n(message, ...args),
		openOptions() {
			this.options = true;
			PopupResizer.setHeightToMax();
		}, 
		closeOptions() {
			this.options = false;
			PopupResizer.setHeightToCurrent();
		},
		openSearch() {
			this.search = true;
			PopupResizer.setHeightToMax();
		}, 
		closeSearch() {
			this.search = false;
			PopupResizer.setHeightToCurrent();
		},
		openRPanel() {
			this.rpanel = true;
			PopupResizer.setHeightToMax();
		}, 
		closeRPanel() {
			PopupResizer.setHeightToCurrent();
		},
		/**
     * Opens a url
     */
    opentab(url) {
        browser.runtime.sendMessage({
            action: "opentab",
            url: url
        });
    },
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
.navigation-drawer {
    padding: 0;
}
</style>
