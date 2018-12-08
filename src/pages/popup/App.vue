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
				<v-icon>mdi-dots-vertical</v-icon>
			</v-btn>
		</v-toolbar>
		<!-- Default panel containing manga list -->
		<v-content>
			<MangaList
				@search-request="openSearch"
				@manga-loaded="handleLoaded()"
				>
			</MangaList>
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
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>{{i18n("options_title")}}</v-toolbar-title>
          </v-toolbar>
					<v-content>
          	<Options v-if="options" />
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
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>{{i18n("search_title")}}</v-toolbar-title>
          </v-toolbar>
					<v-content>
          	<Search v-if="search" :to-search="toSearch" />
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
		<v-container fluid class="pa-0" text-xs-center v-if="rpanel">
			<v-layout row>
				<v-flex xs6>
					<v-layout row>
				<v-flex xs3>
					<v-btn flat icon color="red darken-2" @click="opentab('https://allmangasreader.com')">
						<img src="/icons/icon_32.png" width="24" alt="All Mangas Reader">
					</v-btn>
				</v-flex>
				<v-flex xs3>
					<v-btn flat icon color="yellow" @click="opentab('/pages/bookmarks/bookmarks.html')">
						<v-icon>mdi-star</v-icon>
					</v-btn>
				</v-flex>
				<v-flex xs3>
					<v-btn flat icon color="blue" @click="opentab('https://gitlab.com/all-mangas-reader/all-mangas-reader-2/wikis/home')">
						<v-icon>mdi-help</v-icon>
					</v-btn>
				</v-flex>
				<v-flex xs3>
					<v-btn flat icon color="blue lighten-2" @click="opentab('/pages/popup/popup.html?mode=tab')">
						<v-icon>mdi-open-in-new</v-icon>
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
                <v-icon>mdi-refresh</v-icon>
            </v-tab>
            <v-tab @click="openImportExport()" href="#importexport">
                <v-icon>mdi-content-save</v-icon>
            </v-tab>
        </v-tabs>
				</v-flex>
			</v-layout>
		</v-container>
		<v-tabs-items v-model="tabs" :class="($store.state.options.dark === 1 ? 'black' : 'white')" v-if="rpanel">
				<v-tab-item value="refresh">
					<!-- Refresh buttons -->
					<Timers />
				</v-tab-item>
				<v-tab-item value="importexport">
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
import * as utils from '../../amr/utils';

export default {
  data() {
    return {
			title: "All Mangas Reader", 
			options: false,
			search: false,
			rpanel: false,
			tabs: "refresh", // in rpanel, right tabs state
			toSearch: "", // phrase to search in search panel (used to load search from manga)
    };
  },
  name: "App",
  components: { MangaList, Options, Search, Timers, ImportExport },
  created() {
		document.title = i18n("page_popup_title");
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
		handleLoaded() {
			PopupResizer.setHeightToCurrent();
		},
		/**
		 * Open search panel, if launch trough event search-reaquest, the parameter is the search phrase to search
		 */
		openSearch(pstr = "") {
			this.search = true;
			if (pstr != "") this.toSearch = pstr;
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
		/** Opens import export tab. If Firefox, opens it in a new tab because file input closes the extension : https://bugzilla.mozilla.org/show_bug.cgi?id=1292701 */
		openImportExport() {
			if (utils.isFirefox()) {
				this.opentab("/pages/importexport/importexport.html");
				window.close();
			}
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
.v-dialog .v-card__title,
.v-dialog .v-card__text {
  padding: 4px 16px;
}
.v-dialog .v-card__title {
  padding-top: 10px;
}
.navigation-drawer {
    padding: 0;
}
.v-dialog .v-card--tile {
	overflow: auto;
}
</style>
