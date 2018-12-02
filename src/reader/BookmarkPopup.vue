<template>
    <v-dialog v-model="dialog" max-width="600px">
      <slot name="activator" 
            slot="activator"
            :bookmarked="alreadyBookmarked"
            @auto-bookmark="alreadyBookmarked ? deleteBookmark() : saveBookmark()"></slot>
      <v-card>
        <v-card-title>
          <span class="headline">{{i18n("bookmark_popup_title")}}</span>
        </v-card-title>
        <v-card-text>
            {{
              !scanName ? 
                i18n("bookmark_chapter_text", 
                  chapterName, 
                  mangaName, 
                  mirrorName) :
                i18n("bookmark_chapter_scan", 
                  scanName,
                  chapterName,
                  mangaName,
                  mirrorName)
            }}
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-textarea
                  box
                  name="input-7-4"
                  :label="i18n('bookmark_popup_note')"
                  v-model="note"
                ></v-textarea>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" flat @click="dialog = false">Close</v-btn>
          <v-btn color="primary darken-1" flat @click="deleteBookmark" v-show="alreadyBookmarked">Delete</v-btn>
          <v-btn color="primary darken-1" flat @click="saveBookmark">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import i18n from "../mixins/i18n-mixin"
import browser from "webextension-polyfill";

import mirrorImpl from '../content/mirrorimpl';
import pageData from '../content/pagedata';

export default {
    mixins: [i18n],
    data() {
        return {
            dialog: false, /* state of the popup : opened / closed */

            alreadyBookmarked: false, /* Flag to tell if bookmark is already saved */
            note: "", /* The note to add to the bookmark */

            pageData: pageData, /* Set pageDate in state so it's reactive */
        }
    },
    props: {
      scanUrl: String, /* The url of the scan. If null, bookmark the chapter */
      scanName: String /* The name of the scan to bookmark. */
    },
    created() {
      /* Check existence of the bookmark */
      this.loadBookmark()
    },
    computed: {
      /** Return the current mirror name */
      mirrorName() {
        return mirrorImpl.get().mirrorName
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
    watch: {
      /** emit event to toggle booked state when changed */
      alreadyBookmarked(nVal, oVal) {
        if (nVal !== oVal) {
          this.$emit("toggle-booked")
        }
      },
      note(nVal, oVal) {
        this.$emit("change-note", nVal)
      }
    },
    methods: {
      /** Save the bookmark */
      async saveBookmark() {
        let obj = {
          action: "addUpdateBookmark",
          mirror: mirrorImpl.get().mirrorName,
          url: pageData.currentMangaURL,
          chapUrl: pageData.currentChapterURL,
          name: pageData.name,
          chapName: pageData.currentChapter,
          note: this.note
        }
        if (!this.scanUrl) {
          obj.type = "chapter"
        } else {
          obj.type = "scan"
          obj.scanUrl = this.scanUrl
          obj.scanName = this.scanName
        }
        await browser.runtime.sendMessage(obj)
        this.alreadyBookmarked = true
        if (this.dialog) this.dialog = false
      },
      /** Delete the bookmark */
      async deleteBookmark() {
        let obj = {
            action: "deleteBookmark",
            mirror: mirrorImpl.get().mirrorName,
            url: pageData.currentMangaURL,
            chapUrl: pageData.currentChapterURL
        }
        if (!this.scanUrl) {
          obj.type = "chapter"
        } else {
          obj.type = "scan"
          obj.scanUrl = this.scanUrl
        }
        await browser.runtime.sendMessage(obj)
        this.alreadyBookmarked = false
        this.note = null
        if (this.dialog) this.dialog = false
      },
      /** Check data for this bookmark from server */
      async loadBookmark() {
        let obj = {
          action: "getBookmarkNote",
          mirror: mirrorImpl.get().mirrorName,
          url: pageData.currentMangaURL,
          chapUrl: pageData.currentChapterURL,
        };
        if (!this.scanUrl) {
          obj.type = "chapter"
        } else {
          obj.type = "scan"
          obj.scanUrl = this.scanUrl
          obj.scanName = this.scanName
        }
        let result = await browser.runtime.sendMessage(obj);
        this.alreadyBookmarked = result.isBooked
        this.note = result.note
      }
    }
}
</script>

<style>

</style>
