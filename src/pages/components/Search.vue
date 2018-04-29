<template>
    <v-container fluid class="searchpanel">
        <v-layout row>
            <div class="mirrors-cont">
                <SearchMirror v-for="ws in activatedWebsites" :key="ws.mirrorName" :mirror="ws" :search-phrase="search" @add-mangas="addMangas" />
            </div>
        </v-layout>
        <v-layout row class="searchbar">
            <v-flex xs9>
                <v-text-field v-model="searchwrite" @keyup.enter="launchSearch()" />
            </v-flex>
            <v-flex xs3>
                <v-btn color="primary" @click="launchSearch()" small>{{i18n("search_button")}}</v-btn>
            </v-flex>
        </v-layout>
        <!-- results area -->
        <v-layout row class="search-results">
            <v-container fluid>
                <v-layout row v-for="(lst, key) in results" :key="key">
                    <!-- name of the manga -->
                    <v-flex xs4><strong>{{lst[0].name}}</strong></v-flex>
                    <!-- mirror icons buttons to add to list -->
                    <v-flex xs8>
                        <v-tooltip top content-class="icon-ttip" v-for="(mg, key) in lst" :key="key">
                            <div class="mirror-result-cont" slot="activator">
                                <img @click="addToList(mg)" :src="getIcon(mg.mirror)" :class="'mirror-icon ' + (isInList(mg) || mg.adding ? 'added' : '')" /> 
                                <v-icon v-if="isInList(mg)" color="green">mdi-check</v-icon>
                                <v-progress-circular indeterminate size="18" v-if="mg.adding" color="grey darken-4"></v-progress-circular>
                            </div>
                            <span v-if="isInList(mg)">{{i18n("search_result_inlist", mg.name, mg.mirror)}}</span>
                            <span v-else>{{i18n("search_result_add", mg.name, mg.mirror)}}</span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-layout>
    </v-container>
</template>

<script>
import i18n from "../../amr/i18n";
import browser from "webextension-polyfill";
import SearchMirror from "./SearchMirror";
import * as utils from "../../amr/utils";

export default {
    data() {
        return {
            searchwrite: "",
            search: "",
            results: []
        };
    },
    props: [
        // search phrase from includer (used to trigger search from manga)
        "to-search"
    ],
    watch: {
        /**
         * When property fromStr is changed, launch search (used when click on search mangas elsewhere)
         */
        toSearch: function(n) {
            this.searchwrite = n;
            this.launchSearch();
        }
    },
    computed: {
        activatedWebsites() {
            return this.$store.state.mirrors.all
                .filter(mir => mir.activated)
        }
    },
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        /**
         * Starts the search
         */
        launchSearch() {
            if (this.search === this.searchwrite) return
            this.results = []
            this.search = this.searchwrite
        },
        /**
         * Add mangas to results
         */
        addMangas(mgs, searchphrase) {
            if (searchphrase !== this.search) return;
            // rebuild list grouped by reduced mg name
            let resGrouped = {}
            this.results.forEach(lst => resGrouped[utils.formatMgName(lst[0].name)] = lst)
            // add new mangas to grouped list
            mgs.forEach(function(mg) {
                mg.adding = false; // is currently be added to list (display progress)
                let mgst = utils.formatMgName(mg.name)
                if (resGrouped[mgst]) {
                    resGrouped[mgst].push(mg)
                 } else {
                     resGrouped[mgst] = [mg]
                 }
            }.bind(this))
            let lsts = []
            Object.keys(resGrouped).forEach(key => lsts.push(resGrouped[key]))
            // sort list of lists by length and alphabetically inside
            lsts.sort((a, b) => a.length === b.length ? a[0].name.localeCompare(b[0].name) : b.length - a.length)
            this.results = lsts
        },
        /**
         * Adds a manga to reading list
         */
        addToList: async function(mg) {
            if (this.isInList(mg)) return;
            mg.adding = true;
            // call background because readManga uses jQuery (through refreshListChaps in website implementation) and its not present in popup
            await browser.runtime.sendMessage(Object.assign({action: "readManga"}, mg));
            mg.adding = false;
        },
        /**
         * Returns mirror icon from its name
         */
        getIcon(mirrorname) {
            return this.$store.state.mirrors.all.find(mir => mir.mirrorName === mirrorname).mirrorIcon
        },
        /**
         * True if manga is in reading list
         */
        isInList(mg) {
            return this.$store.state.mangas.all.findIndex(m => m.key === utils.mangaKey(mg.url)) !== -1
        }
    },
    name: "Search",
    components: { SearchMirror }
}
</script>
<style>
.searchpanel {
    overflow: auto;
}
.mirrors-cont {
    margin: auto;
}
.searchbar {
    width: 450px;
    margin: auto;
}
.mirror-result-cont {
    display: inline-block;
    position: relative;
    width: 18px;
    height: 18px;
    margin: 4px;
    cursor: pointer;
}
.mirror-result-cont > * {
    position: absolute;
    left:0;
    top:0;
}
.mirror-result-cont > i {
    font-size: 18px;
}
.mirror-icon.added {
    opacity: 0.3;
}
.search-results {
    font-size: 12px;
}
</style>

