<template>
	<v-app>
		<!-- Main toolbar in popup -->
		<v-card>
			<v-toolbar>
				<img src="/icons/icon_32.png" alt="All Mangas Reader" style="margin-right: 5px;">
				<v-toolbar-title v-text="title"></v-toolbar-title>
				<v-spacer></v-spacer>
				<v-btn icon @click.stop="openOptions()">
					<v-icon>mdi-cog</v-icon>
				</v-btn>
				<v-btn icon @click.stop="openSearch()">
					<v-icon>mdi-magnify</v-icon>
				</v-btn>
				<v-btn icon @click.stop="openRPanel()">
					<v-icon>mdi-dots-vertical</v-icon>
				</v-btn>
			</v-toolbar>
		</v-card>

		<!-- Default panel containing manga list -->
		<v-main class="ma-3">
			<v-alert class="mb-0" type="info" :value="true" icon="mdi-incognito" v-if="!trackingDone">
				{{i18n("options_gen_allowtracking_desc")}}
				<div>
					<v-btn @click="saveAllowTracking(true)">{{i18n('button_yes')}}</v-btn>
					<v-btn flat @click="saveAllowTracking(false)">{{i18n('button_no')}}</v-btn>
				</div>
			</v-alert>
			<MangaList
        @search-request="openSearch"
        @manga-loaded="handleLoaded()"
       />
			<v-tooltip top v-if="alertmessage !== ''">
				<template v-slot:activator="{ on }">
					<v-alert class="mb-0" type="warning" v-on="on" :value="true" icon="mdi-alert-decagram" slot="activator">
						{{alertmessage}}
						<v-btn light class="ml-2" x-small @v-if="!utils.isFirefox()" @click="DownloadAMR()">
							<v-icon>mdi-cloud-download</v-icon>
						</v-btn>
						</v-alert>
				</template>
				<span>{{tooltipalert}}</span>
			</v-tooltip>
			<div id="__bottom_app__"></div>
		</v-main>

		<!-- Options dialog -->
		<v-dialog
			v-model="options"
			fullscreen
			transition="dialog-bottom-transition"
			hide-overlay
			scrollable
			:content-class="istab()"
    >
			<v-card>
				<v-toolbar max-height="64">
					<v-btn icon @click.native="closeOptions()">
						<v-icon>mdi-close</v-icon>
					</v-btn>
					<v-toolbar-title>{{i18n("options_title")}}</v-toolbar-title>
				</v-toolbar>
				<v-main>
					<Options v-if="options" />
				</v-main>
			</v-card>
		</v-dialog>
		<!-- Search dialog -->
		<v-dialog
      v-model="search"
      fullscreen
      transition="dialog-bottom-transition"
      hide-overlay
      scrollable
    >
			<v-card tile>
        <v-toolbar app max-height="64">
          <v-btn icon @click.native="closeSearch()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{i18n("search_title")}}</v-toolbar-title>
        </v-toolbar>
        <v-main>
          <Search v-if="search" :to-search="toSearch" />
        </v-main>
			</v-card>
		</v-dialog>
		<!-- Right panel containing links, refresh buttons, import export panels -->
		<v-navigation-drawer
			temporary
			v-model="rpanel"
			right
			absolute
			width="500"
		>
			<!-- Links in right panel -->
			<v-container fluid class="pa-0 text-center" v-if="rpanel">
				<v-row >
					<v-col cols="6">
						<v-row >
              <v-col cols="3">
                <v-btn text icon color="red darken-2" @click="opentab('https://allmangasreader.com')">
                  <img src="/icons/icon_32.png" width="24" alt="All Mangas Reader">
                </v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn text icon color="yellow" @click="opentab('/pages/bookmarks/bookmarks.html')">
                  <v-icon>mdi-star</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn text icon color="blue" @click="opentab('https://gitlab.com/all-mangas-reader/all-mangas-reader-2/wikis/home')">
                  <v-icon>mdi-help</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn text icon color="blue lighten-2" @click="opentab('/pages/popup/popup.html?mode=tab')">
                  <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
              </v-col>
						</v-row>
					</v-col>
					<v-col cols="6">
						<v-tabs
							v-model="tabs"
							right
					  >
              <v-tabs-slider></v-tabs-slider>
              <v-tab key="refresh">
                <v-icon>mdi-refresh</v-icon>
              </v-tab>
              <v-tab @click="openImportExport()" key="importexport">
                <v-icon>mdi-content-save</v-icon>
              </v-tab>
            </v-tabs>
					</v-col>
				</v-row>
			</v-container>
			<v-tabs-items v-model="tabs" v-if="rpanel">
        <v-tab-item key="refresh">
          <!-- Refresh buttons -->
          <Timers />
        </v-tab-item>
        <v-tab-item key="importexport">
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
		alertmessage: "", // alert to display at the bottom of the popup
		tooltipalert: "",
		trackingDone: false
    };
  },
  name: "App",
  components: { MangaList, Options, Search, Timers, ImportExport },
  created() {
	this.trackingDone = this.$store.state.options.allowtrackingdone == 1;
	document.title = i18n("page_popup_title");
    // initialize state for store in popup from background
    this.$store.dispatch("getStateFromReference", {
      module: "mirrors",
      key: "all",
      mutation: "setMirrors"
		});
		if (this.$store.state.options.notifynewversion == 1 && ((localStorage.beta == 1 && localStorage.version != localStorage.latestBetaVersion) ||
			(localStorage.beta == 0 && localStorage.version != localStorage.latestStableVersion ))) {
				this.alertmessage = this.i18n("amr_newversion")
				this.tooltipalert = this.i18n("amr_newversion_long")
		}
	},
	watch: {
		rpanel: function(n) {
			if (!n) this.closeRPanel();
		}
	},
	methods: {
		i18n: (message, ...args) => i18n(message, ...args),
		istab() {
			if(window.location.href.indexOf("mode=tab") >= 0) {
				return
			} else {
				return 'hidescrollbar'
			}
		},
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
			PopupResizer.setHeightToMax();
			if (pstr != "") {
				this.$nextTick(() => { // set the search phrase in next tick so this.search change is effective, has Search is included on v-if, the component to handle it has to be created before we can set its props
					this.toSearch = pstr;
				})
			}
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
		},
		DownloadAMR() {
			if(!utils.isFirefox() || (utils.isFirefox() && localStorage.beta === 1)) {
				browser.runtime.sendMessage({
					action: "DownloadAMR",
					beta: localStorage.beta
				})
			}
		},
		async saveAllowTracking(doAllow) {
			await this.$store.dispatch("setOption", { key: "allowtrackingdone", value: 1});
			this.trackingDone = true
			await this.$store.dispatch("setOption", { key: "allowtracking", value: doAllow ? 1 : 0 });
			setTimeout(() => {
				browser.runtime.sendMessage({
					action: "reloadStats"
				});
			}, 0)
		}
	},
	mounted: function () {
  	this.$nextTick(function () {
    	PopupResizer.checkHeight();
		})
	},

};
</script>
<style>

/* Disable Webkit */
.hidescrollbar::-webkit-scrollbar {
	display: none;
}
/* Disable scrollbar Firefox */
.hidescrollbar {
	scrollbar-width: none;
}
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
.v-alert {
	padding: 4px!important;
}
</style>
