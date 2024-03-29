<template>
    <v-dialog v-model="dialog" max-width="500px">
        <slot name="activator" slot="activator"></slot>
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ i18n("bookmark_popup_title") }}</span>
            </v-card-title>
            <v-card-text>
                {{
                    !scanName
                        ? i18n("bookmark_chapter_text", chapterName, mangaName, mirrorName)
                        : i18n("bookmark_chapter_scan", scanName, chapterName, mangaName, mirrorName)
                }}
                <v-container class="pb-0">
                    <v-row dense>
                        <v-col cols="12">
                            <v-textarea
                                filled
                                hide-details
                                name="input-7-4"
                                :label="i18n('bookmark_popup_note')"
                                v-model="note"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey darken-1" text @click="cancel">{{ i18n("button_cancel") }}</v-btn>
                <v-btn color="primary darken-1" text @click="deleteBookmark" v-show="alreadyBookmarked">{{
                    i18n("button_delete")
                }}</v-btn>
                <v-btn color="primary darken-1" text @click="saveBookmark">{{ i18n("button_save") }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { i18nmixin } from "../../mixins/i18n-mixin"
import pageData from "../state/pagedata"
import bookmarks from "../state/bookmarks"

export default {
    mixins: [i18nmixin],
    props: {
        mirror: Object
    },
    data() {
        return {
            resolve: null,
            reject: null,
            dialog: false /* state of the popup : opened / closed */,

            alreadyBookmarked: false /* true if object already bookmarked */,
            note: "" /* The note to add to the bookmark */,
            scanUrl: String /* The url of the scan. If null, bookmark the chapter */,
            scanName: String /* The name of the scan. */,

            pageData: pageData.state /* Set pageDate in state so it's reactive */
        }
    },
    computed: {
        /** Return the current mirror name */
        mirrorName() {
            return this.mirror.mirrorName
        },
        /** Return the current chapter name */
        chapterName() {
            return this.pageData.currentChapter
        },
        /** Return the current manga name */
        mangaName() {
            return this.pageData.name
        }
    },
    methods: {
        /** Open the bookmark dialog with options (default chapter, with scanUrl : corresponding scan) */
        open({ scanUrl } = {}) {
            this.dialog = true
            this.scanUrl = scanUrl
            if (scanUrl) {
                const sc = bookmarks.getScan(scanUrl)
                this.note = sc.note
                this.scanName = sc.name
                this.alreadyBookmarked = sc.booked
            } else {
                this.note = bookmarks.state.note
                this.alreadyBookmarked = bookmarks.state.booked
                this.scanName = undefined
            }
            return new Promise((resolve, reject) => {
                this.resolve = resolve
                this.reject = reject
            })
        },
        async saveBookmark() {
            await bookmarks.saveBookmark({
                note: this.note,
                scanName: this.scanName,
                scanUrl: this.scanUrl
            })
            this.agree()
        },
        async deleteBookmark() {
            await bookmarks.deleteBookmark({
                scanUrl: this.scanUrl
            })
            this.agree()
        },
        agree() {
            this.resolve(true)
            this.dialog = false
        },
        cancel() {
            this.resolve(false)
            this.dialog = false
        }
    }
}
</script>
