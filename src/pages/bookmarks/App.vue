<template>
    <v-app>
        <v-navigation-drawer :clipped="$vuetify.breakpoint.lgAndUp" v-model="drawer" fixed app>
            <v-card flat>
                <v-list two-line>
                    <v-list-item @click="switchAllStates()" avatar ripple>
                        <v-list-item-content>
                            <v-list-item-title>
                                {{ i18n("bookmarks_allmangas") }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text--primary">
                                {{ i18n("bookmarks_number", nbBookmarks) }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon v-if="hasOneUnState()" color="red darken-2"> mdi-eye </v-icon>
                            <v-icon v-else color="grey lighten-1"> mdi-eye-off </v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-divider></v-divider>
                    <template v-for="(mg, index) in mangas">
                        <v-list-item :key="mg.key" @click="switchMgState(mg)" avatar ripple>
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ mg.name }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="text--primary"
                                    >{{ i18n("bookmarks_number", mg.nb) }}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-icon v-if="!mangasUnSel[mg.key]" color="red darken-2"> mdi-eye </v-icon>
                                <v-icon v-else color="grey lighten-1"> mdi-eye-off </v-icon>
                            </v-list-item-action>
                        </v-list-item>
                        <v-divider v-if="index + 1 < mangas.length" :key="index"></v-divider>
                    </template>
                </v-list>
            </v-card>
        </v-navigation-drawer>
        <v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" color="red darken-2" dark app fixed>
            <v-app-bar-title style="width: 300px" class="ml-0 pl-3">
                <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
                <v-btn icon large color="white" class="hidden-sm-and-down">
                    <v-avatar size="32px" tile>
                        <img src="/icons/icon_32.png" alt="All Mangas Reader" />
                    </v-avatar>
                </v-btn>
                <span>{{ i18n("bookmarks_title") }}</span>
            </v-app-bar-title>
            <v-text-field
                flat
                solo-inverted
                hide-details
                prepend-inner-icon="mdi-magnify"
                :label="i18n('bookmarks_search')"
                class="hidden-sm-and-down"
                v-model="search"></v-text-field>
            <v-spacer></v-spacer>
            <v-overflow-btn
                :items="dropdown_size"
                label="Select size"
                hide-details
                overflow
                v-model="size"
                class="hidden-md-and-down mr-2"
                item-text="text"
                item-value="value"
                single-line
                return-object
                solo-inverted
                flat></v-overflow-btn>
            <v-btn-toggle v-model="toggle_type" multiple class="transparent">
                <v-btn text>
                    <v-icon>mdi-image</v-icon>
                </v-btn>
                <v-btn text>
                    <v-icon>mdi-book-open-variant</v-icon>
                </v-btn>
            </v-btn-toggle>
        </v-app-bar>
        <v-main>
            <v-container fluid>
                <v-row justify="center" align="center" v-if="!loaded">
                    <!-- Before mirrors and bookmarks are loaded into bookmarks -->
                    <v-progress-circular indeterminate :width="4" :size="50" color="red darken-2"></v-progress-circular>
                </v-row>
                <v-row v-else>
                    <!-- Once loaded -->
                    <Bookmarks
                        :bookmark-list="displayedBookmarks"
                        :size="size.value"
                        v-if="nbBookmarks > 0 && displayedBookmarks.length > 0" />
                    <h2 v-else align-center>
                        <span v-if="nbBookmarks > 0" v-html="i18n('bookmarks_no_bookmarks_filter')"></span>
                        <span v-else v-html="i18n('bookmarks_no_bookmarks')"></span>
                    </h2>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import i18n from "../../amr/i18n"
import Bookmarks from "../components/Bookmarks"
import { formatMangaName } from "../../shared/utils"
import Vue from "vue"

const sizes = [
    { text: i18n("bookmarks_size_large"), value: 2 },
    { text: i18n("bookmarks_size_medium"), value: 3 },
    { text: i18n("bookmarks_size_small"), value: 4 }
]
export default {
    data() {
        return {
            loaded: false,
            drawer: true /* display left panel by default */,
            toggle_type: [0, 1] /* select both scan and chapter by default */,
            mangasUnSel: {} /* list of manga state (key is formatMgName(mg.name)) */,
            search: "",
            dropdown_size: sizes,
            size: sizes[1]
        }
    },
    computed: {
        /**
         * Create distinct manga (by name) list
         */
        mangas: function () {
            return this.$store.state.bookmarks.all
                .reduce((list, bm) => {
                    const bmmgname = formatMangaName(bm.name)
                    const pos = list.findIndex(mg => bmmgname === formatMangaName(mg.name))
                    if (pos === -1) {
                        return [
                            ...list,
                            {
                                key: bmmgname,
                                name: bm.name,
                                nb: 1
                            }
                        ]
                    } else {
                        list[pos].nb++
                    }
                    return list
                }, [])
                .sort((a, b) => a.name.localeCompare(b.name))
        },
        /**
         * Filters the bookmarks to display according to current criterias
         */
        displayedBookmarks: function () {
            return this.$store.state.bookmarks.all.filter(bm => {
                // filter bookmarks
                // by type
                if (bm.type === "chapter" && !this.toggle_type.includes(1)) return false
                if (bm.type === "scan" && !this.toggle_type.includes(0)) return false

                // by manga
                const bmmgname = formatMangaName(bm.name)
                if (this.mangasUnSel[bmmgname]) return false

                // by search text
                const sc = formatMangaName(this.search)
                let contains = false
                if (formatMangaName(bm.name).indexOf(sc) >= 0) contains = true
                else if (formatMangaName(bm.note).indexOf(sc) >= 0) contains = true
                else if (formatMangaName(bm.chapterName).indexOf(sc) >= 0) contains = true

                return contains
            })
        },
        nbBookmarks: function () {
            return this.$store.state.bookmarks.all.length
        }
    },

    async created() {
        document.title = i18n("page_bookmarks_title")
        const init = []
        // initialize mirrors state for store in options from background
        init.push(
            this.$store.dispatch("getStateFromReference", {
                module: "mirrors",
                key: "all",
                mutation: "setMirrors"
            })
        )
        // initialize bookmarks state for store in options from background
        init.push(
            this.$store.dispatch("getStateFromReference", {
                module: "bookmarks",
                key: "all",
                mutation: "setBookmarks"
            })
        )
        await Promise.all(init)
        this.loaded = true
    },
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        switchMgState: function (mg) {
            Vue.set(this.mangasUnSel, mg.key, !this.mangasUnSel[mg.key])
        },
        hasOneUnState: function (mg) {
            for (const mg of this.mangas) {
                if (this.mangasUnSel[mg.key]) return true
            }
            return false
        },
        switchAllStates: function (mg) {
            const nst = !this.hasOneUnState()
            for (const mg of this.mangas) {
                Vue.set(this.mangasUnSel, mg.key, nst)
            }
        }
    },
    watch: {
        toggle_type: function (n, o) {
            if (n.length === 0) {
                if (o.includes(0)) this.toggle_type = [1]
                else this.toggle_type = [0]
            }
        }
    },
    name: "App",
    components: { Bookmarks }
}
</script>
