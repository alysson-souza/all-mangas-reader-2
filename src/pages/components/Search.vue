<template>
    <v-container fluid class="searchpanel">
        <v-row>
            <div class="mirrors-cont">
                <SearchMirror
                    v-for="ws in activatedWebsites"
                    :key="ws.mirrorName"
                    :mirror="ws"
                    :search-phrase="search"
                    @add-mangas="addMangas" />
            </div>
        </v-row>
        <v-row class="searchbar">
            <v-col cols="9">
                <v-text-field v-model="searchwrite" @keyup.enter="launchSearch()" />
            </v-col>
            <v-col cols="3">
                <v-btn color="primary" @click="launchSearch()" small>{{ i18n("search_button") }}</v-btn>
            </v-col>
        </v-row>
        <!-- results area -->
        <v-row class="search-results">
            <v-container fluid>
                <v-tabs v-model="langtabs" color="transparent" show-arrows>
                    <v-tabs-slider></v-tabs-slider>
                    <v-tab v-for="lang in langs" :key="lang" :href="'#langtab-' + lang" class="primary--text">
                        <Flag v-if="lang != 'aa'" :value="lang" big />
                        <v-btn color="primary" v-else>{{ i18n("search_multilang") }}</v-btn>
                    </v-tab>

                    <v-tab-item :id="'langtab-' + lang" v-for="(res, lang) in results" :key="lang" v-model="langtabs">
                        <v-container fluid>
                            <v-row v-for="fmtkey in res['__SORTEDKEYS__']" :key="fmtkey">
                                <!-- name of the manga -->
                                <v-col cols="4">
                                    <strong>
                                        {{ res[fmtkey]?.[0]?.name ?? "— ⚠️" }}
                                    </strong>
                                </v-col>
                                <!-- mirror icons buttons to add to list -->
                                <v-col cols="8">
                                    <v-tooltip
                                        top
                                        content-class="icon-ttip"
                                        v-for="(mg, key) in res[fmtkey]"
                                        :key="key">
                                        <template v-slot:activator="{ on }">
                                            <div class="mirror-result-cont" v-on="on">
                                                <img
                                                    @click="handleIconClick(mg)"
                                                    :src="getIcon(mg.mirror)"
                                                    :class="
                                                        'mirror-icon ' + (isInList(mg) || mg.adding ? 'added' : '')
                                                    " />
                                                <v-icon v-if="isInList(mg)" color="green">mdi-check</v-icon>
                                                <v-progress-circular
                                                    indeterminate
                                                    size="18"
                                                    v-if="mg.adding"
                                                    color="grey darken-4"></v-progress-circular>
                                            </div>
                                        </template>
                                        <span v-if="isInList(mg)">{{
                                            i18n("search_result_inlist", mg.name, mg.mirror)
                                        }}</span>
                                        <span v-else>{{ i18n("search_result_add", mg.name, mg.mirror) }}</span>
                                    </v-tooltip>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-tab-item>
                </v-tabs>
            </v-container>
        </v-row>
    </v-container>
</template>

<script>
import i18n from "../../amr/i18n"
import browser from "webextension-polyfill"
import SearchMirror from "./SearchMirror"
import { formatMangaName, getUnifiedLang, mangaKey } from "../../shared/utils"
import Flag from "./Flag"

export default {
    data() {
        return {
            searchwrite: "",
            search: "",
            /**
             * Object that contains the search results grouped by language
             * @type {{
             *      [lanaugeKey: string]: {
             *         [mirrorName: string]: { url: string, name: string, mirror: string, adding: boolean }[]
             *      }
             *  }}
             */
            results: {},
            langs: [],
            langtabs: null
        }
    },
    props: [
        // search phrase from includer (used to trigger search from manga)
        "to-search"
    ],
    watch: {
        /**
         * When property fromStr is changed, launch search (used when click on search mangas elsewhere)
         */
        toSearch: function (n) {
            this.searchwrite = n
            this.launchSearch()
        }
    },
    computed: {
        activatedWebsites() {
            return this.$store.state.mirrors.all.filter(mir => mir.activated)
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
            if (searchphrase !== this.search) {
                return
            }
            // Set current lang of the implementation, multi if multiple is supported
            let curmirlang = "aa" // contains manga in multiple languages (aa to be first in list)
            if (languages.split(",").length === 1) {
                // use unified lang so if a manga lang is 'gb' and another 'en', both will be under 'en'
                curmirlang = getUnifiedLang(languages)
            }

            // add new mangas to grouped list
            const addMgs = (mgs, lang) => {
                for (const mg of mgs) {
                    // Need to handle a case where we do not have valid manga, like error
                    // [{ "error": "not found", "message": "No Series found" }]
                    if (!mg.url || !mg.name) {
                        continue
                    }

                    mg.adding = false // is currently be added to list (display progress)
                    const mgst = formatMangaName(mg.name)
                    if (!this.results[lang]) this.results[lang] = {}
                    if (this.results[lang][mgst] !== undefined) {
                        this.results[lang][mgst].push(mg)
                    } else {
                        this.results[lang][mgst] = [mg]
                    }
                }
            }

            if (Array.isArray(mgs)) {
                // normal use case, implementation returns list of mangas
                addMgs(mgs, curmirlang)
            } else {
                // implementation returns object which keys are languages : {"en" : [[]], "fr": [[]]}
                for (const l in mgs) {
                    addMgs(mgs[l], getUnifiedLang(l))
                }
            }

            const SORTED_KEY = "__SORTEDKEYS__"
            for (const languageKey in this.results) {
                const languageRecord = this.results[languageKey]
                /** @type {{ name: string }[][]} **/
                const tempList = []

                Object.entries(languageRecord).forEach(([mangaKey, value]) => {
                    if (mangaKey !== SORTED_KEY) {
                        tempList.push(value)
                    }
                })

                // sort list of lists by length and alphabetically inside
                tempList.sort((a, b) => {
                    if (!a[0].name) {
                        return -1
                    }
                    return a.length === b.length ? a[0].name.localeCompare(b[0].name) : b.length - a.length
                })

                //add a property to sort entries in object
                languageRecord[SORTED_KEY] = tempList.map(lst => formatMangaName(lst[0].name))
            }

            this.langs = Object.keys(this.results).sort()
            if (this.langtabs === null && this.langs[0] !== undefined) {
                this.langtabs = "langtab-" + this.langs[0] // select first tab if none selected
            }
        },
        /**
         * Adds a manga to reading list
         */
        addToList: async function (mg) {
            if (this.isInList(mg)) return
            mg.adding = true
            // call background because readManga uses jQuery (through refreshListChaps in website implementation) and its not present in popup
            await browser.runtime.sendMessage(Object.assign({ action: "readManga" }, mg))
            mg.adding = false
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
            const key = mangaKey({ url: mg.url, mirror: mg.mirror, language: mg.language, rootState: this.$store })
            return this.$store.state.mangas.all.some(m => m.key.indexOf(key) === 0)
        },

        handleIconClick(mg) {
            console.log("Icon Clicked")
            console.log(this.$store.state)
            this.$store.state.options.searchOpenSeries ? this.openSeries(mg) : this.addToList(mg)
        },

        openSeries(mg) {
            browser.runtime.sendMessage({ action: "opentab", url: mg.url })
        }
    },
    name: "Search",
    components: { SearchMirror, Flag }
}
</script>
<style data-amr="true">
.searchpanel {
    /*background: #ffffff;*/
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
    left: 0;
    top: 0;
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
