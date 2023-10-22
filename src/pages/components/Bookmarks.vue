<template>
    <v-container fluid>
        <gallery
            :images="scans"
            :index="curScan"
            @close="curScan = null"
            :options="{ closeOnSlideClick: true }"></gallery>
        <v-row>
            <v-col cols="12" sm="6" :lg="getSize()" v-for="bm in sortBookmarkList" :key="bm.key">
                <v-card tile>
                    <BookmarkScan
                        v-if="bm.type == 'scan'"
                        :bookmark="bm"
                        @click-scan="setScan(bm)"
                        @change-url="changeUrl"
                        :height="getHeight()" />
                    <v-row>
                        <v-col>
                            <div class="text-h6">
                                <img :src="getIcon(bm.mirror)" />
                                {{ bm.name }} - {{ bm.chapName }}
                            </div>
                            <p class="grey--text mb-0 text-subtitle-2" v-if="bm.scanUrl">
                                {{ i18n("bookmarks_scan_number", bm.scanName) }}
                            </p>
                            <p class="grey--text mb-0 text-caption">{{ bm.note }}</p>
                        </v-col>
                        <v-col cols="auto">
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn icon @click="openEdit(bm)">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                                <v-btn icon @click="openDelete(bm)">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                                <v-btn icon @click="openTab(bm)">
                                    <v-icon>mdi-open-in-new</v-icon>
                                </v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="deleteBookmarkDialog" max-width="290">
            <v-card v-if="bmToDelete">
                <v-card-title class="text-h5">{{
                    bmToDelete.type === "chapter" ? i18n("bookmarks_chapter_delete") : i18n("bookmarks_scan_delete")
                }}</v-card-title>
                <v-card-text>{{
                    bmToDelete.type === "chapter"
                        ? i18n("bookmarks_chapter_delete_text", bmToDelete.name, bmToDelete.chapName)
                        : i18n("bookmarks_scan_delete_text", bmToDelete.name, bmToDelete.chapName, bmToDelete.scanName)
                }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" flat @click.native="reallyDeleteBm()">{{ i18n("button_yes") }}</v-btn>
                    <v-btn color="grey darken-1" flat @click.native="deleteBookmarkDialog = false">{{
                        i18n("button_no")
                    }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="editBookmarkDialog" max-width="500px">
            <v-card v-if="bmToEdit">
                <v-card-title>
                    <span class="text-h5" v-if="bmToEdit.type === 'chapter'">{{ i18n("bookmarks_chapter_edit") }}</span>
                    <span class="text-h5" v-else>{{ i18n("bookmarks_scan_edit") }}</span>
                </v-card-title>
                <v-card-text>
                    <p
                        v-html="
                            bmToEdit.type === 'chapter'
                                ? i18n('bookmarks_chapter_edit_text', bmToEdit.name, bmToEdit.chapName)
                                : i18n('bookmarks_scan_edit_text', bmToEdit.name, bmToEdit.chapName, bmToEdit.scanName)
                        "></p>
                    <v-container>
                        <v-row dense>
                            <v-col cols="12">
                                <v-textarea :label="i18n('bookmarks_edit_note')" v-model="bmToEdit.note"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary darken-1" flat @click.native="editBookmarkDialog = false">{{
                        i18n("button_cancel")
                    }}</v-btn>
                    <v-btn color="primary darken-1" flat @click.native="reallyEditBm">{{ i18n("button_save") }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script>
import i18n from "../../amr/i18n"
import VueGallery from "vue-gallery"
import BookmarkScan from "./BookmarkScan"
import browser from "webextension-polyfill"
import Vue from "vue"

export default {
    data() {
        return {
            deleteBookmarkDialog: false,
            bmToDelete: undefined,
            editBookmarkDialog: false,
            bmToEdit: undefined,
            curScan: null
        }
    },
    computed: {
        scans: function () {
            return this.sortBookmarkList.filter(bm => bm.type === "scan").map(bm => bm.displayedUrl)
        },
        sortBookmarkList: function () {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties, vue/no-mutating-props
            return this.bookmarkList.sort((a, b) => {
                const cmp = a.name.localeCompare(b.name)
                const cmpc = a.chapName.localeCompare(b.chapName)
                let cmps = 0
                if (a.scanName && b.scanName) {
                    if (typeof a.scanName === "string") {
                        cmps = a.scanName.localeCompare(b.scanName)
                    } else if (typeof a.scanName === "number") {
                        cmps = a.scanName - b.scanName
                    }
                } else if (!a.scanName && b.scanName) cmps = -1
                else if (a.scanName && !b.scanName) cmps = 1

                return cmp === 0 ? (cmpc === 0 ? -cmps : -cmpc) : cmp
            })
        }
    },
    props: ["bookmarkList", "size"],
    name: "Bookmarks",
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        getSize: function () {
            return this.size === 2 ? 6 : this.size === 3 ? 4 : 3
        },
        getHeight: function () {
            return this.size === 2 ? "500px" : this.size === 3 ? "300px" : "250px"
        },
        openDelete(bm) {
            this.bmToDelete = bm
            this.deleteBookmarkDialog = true
        },
        reallyDeleteBm() {
            this.$store.dispatch("deleteBookmark", this.bmToDelete)
            this.deleteBookmarkDialog = false
        },
        openEdit(bm) {
            this.bmToEdit = bm
            this.editBookmarkDialog = true
        },
        reallyEditBm() {
            this.$store.dispatch("updateBookmarkNote", this.bmToEdit)
            this.editBookmarkDialog = false
        },
        setScan(bm) {
            this.curScan = this.scans.findIndex(sc => sc === bm.displayedUrl || sc === bm.scanUrl)
        },
        openTab(bm) {
            browser.runtime.sendMessage({ action: "opentab", url: bm.chapUrl })
        },
        /**
         * Returns mirror icon from its name
         */
        getIcon(mirrorname) {
            return this.$store.state.mirrors.all.find(mir => mir.mirrorName === mirrorname).mirrorIcon
        },
        /** Called when BookmarkScan updates the url to display */
        changeUrl({ url, key }) {
            const nbm = this.bookmarkList.find(bm => bm.key === key)
            Vue.set(nbm, "displayedUrl", url)
        }
    },

    components: {
        gallery: VueGallery,
        BookmarkScan
    }
}
</script>
<style data-amr="true">
.subtitle {
    font-size: 1.3rem !important;
    line-height: 24px !important;
    letter-spacing: normal !important;
}
</style>
