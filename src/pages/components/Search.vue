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
                <v-tabs
                    v-model="langtabs"
                    color="transparent"
                    show-arrows
                >
                    <v-tabs-slider></v-tabs-slider>
                    <v-tab v-for="lang in langs" 
                        :key="lang" 
                        :href="'#langtab-' + lang"
                        class="primary--text">
                        <Flag v-if="lang != 'aa'" :value="lang" big />
                        <v-btn color="primary" v-else>{{ i18n("search_multilang") }}</v-btn>
                    </v-tab>
                
                    <v-tab-item :id="'langtab-' + lang" 
                            v-for="(res, lang) in results" 
                            :key="lang" 
                            v-model="langtabs">
                        <v-container fluid>
                            <v-layout row v-for="fmtkey in res['__SORTEDKEYS__']" :key="fmtkey">
                                <!-- name of the manga -->
                                <v-flex xs4><strong>
                                    {{res[fmtkey] === undefined ? "" : res[fmtkey][0].name}}
                                </strong></v-flex>
                                <!-- mirror icons buttons to add to list -->
                                <v-flex xs8>
                                    <v-tooltip top content-class="icon-ttip" v-for="(mg, key) in res[fmtkey]" :key="key">
                                        <div class="mirror-result-cont" slot="activator">
                                            <img @click="handleIconClick(mg)" :src="getIcon(mg.mirror)" :class="'mirror-icon ' + (isInList(mg) || mg.adding ? 'added' : '')" /> 
                                            <v-icon v-if="isInList(mg)" color="green">mdi-check</v-icon>
                                            <v-progress-circular indeterminate size="18" v-if="mg.adding" color="grey darken-4"></v-progress-circular>
                                        </div>
                                        <span v-if="isInList(mg)">{{i18n("search_result_inlist", mg.name, mg.mirror)}}</span>
                                        <span v-else>{{i18n("search_result_add", mg.name, mg.mirror)}}</span>
                                    </v-tooltip>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-tab-item>
                </v-tabs>
            </v-container>
        </v-layout>
    </v-container>
</template>

<script>
import i18n from "../../amr/i18n";
import browser from "webextension-polyfill";
import SearchMirror from "./SearchMirror";
import * as utils from "../../amr/utils";
import Flag from "./Flag";

export default {
    data() {
        return {
            searchwrite: "",
            search: "",
            results: {},
            langs: [],
            langtabs: null
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
            this.results = {}
            this.search = this.searchwrite
        },
        /**
         * Add mangas to results
         */
        addMangas(mgs, searchphrase, languages) {
            if (searchphrase !== this.search) return;
            // Set current lang of the implementation, multi if multiple is supported
            let curmirlang = "aa" // contains manga in multiple languages (aa to be first in list)
            if (languages.split(",").length === 1) curmirlang = utils.getUnifiedLang(languages) // use unified lang so if a manga lang is 'gb' and another 'en', both will be under 'en'

            // add new mangas to grouped list
            let addMgs = (mgs, lang) => {
                for (let mg of mgs) {
                    mg.adding = false; // is currently be added to list (display progress)
                    let mgst = utils.formatMgName(mg.name)
                    if (!this.results[lang]) this.results[lang] = {}
                    if (this.results[lang][mgst] !== undefined) {
                        this.results[lang][mgst].push(mg)
                    } else {
                        this.results[lang][mgst] = [mg]
                    }
                }
            }
            
            if (Array.isArray(mgs)) { // normal use case, implementation returns list of mangas
                addMgs(mgs, curmirlang)
            } else { 
                // implementation returns object which keys are languages : {"en" : [[]], "fr": [[]]}
                for (let l in mgs) {
                    addMgs(mgs[l], utils.getUnifiedLang(l))
                }
            }

            let lsts = {}
            for (let l in this.results) {
                // build sorted list of keys
                let tmplst = []
                Object.keys(this.results[l]).forEach(key => tmplst.push(this.results[l][key]))
                // sort list of lists by length and alphabetically inside
                tmplst.sort(
                    (a, b) => {
                        if (!a[0].name) return -1
                        return a.length === b.length ? 
                            a[0].name.localeCompare(b[0].name) : 
                            b.length - a.length
                    }
                )
                //add a property to sort entries in object
                this.results[l]["__SORTEDKEYS__"] = tmplst.map(lst => utils.formatMgName(lst[0].name))
            }

            this.langs = Object.keys(this.results).sort()
            if (this.langtabs === null && this.langs[0] !== undefined) {
                this.langtabs = "langtab-" + this.langs[0] // select first tab if none selected
            }
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
            return this.$store.state.mangas.all.findIndex(m => m.key.indexOf(utils.mangaKey(mg.url, mg.mirror, mg.language)) === 0) !== -1
        },

        handleIconClick(mg) {
            console.log('Icon Clicked')
            console.log(this.$store.state)
            this.$store.state.options.searchOpenSeries ? this.openSeries(mg) : this.addToList(mg)
        },

        openSeries(mg) {
            browser.runtime.sendMessage({ action: "opentab", url: mg.url });
        }
    },
    name: "Search",
    components: { SearchMirror, Flag }
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
    font-size: 1.6rem;
}
.mirror-icon.added {
    opacity: 0.3;
}
.search-results {
    font-size: 1.2rem;
}
</style>

