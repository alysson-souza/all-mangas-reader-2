<template>
    <v-dialog v-model="dialog"
    :max-width="800" @keydown.esc="dialog = false"
    v-bind:style="{ zIndex: 5 }">
        <v-card>
            <v-toolbar dark color="primary" dense flat>
                <v-toolbar-title class="white--text">{{i18n("reader_shortcuts_title")}}</v-toolbar-title>
            </v-toolbar>
            <v-card-text text-no-wrap>
                <div class="title py-3">{{i18n('reader_shortcuts_section_chapters')}}</div>
                <shortcuts :items="shortcuts_chapter" />
                <div class="title py-3">{{i18n('reader_shortcuts_section_manga')}}</div>
                <shortcuts :items="shortcuts_manga" />
                <div class="title py-3">{{i18n('reader_shortcuts_section_layout')}}</div>
                <shortcuts :items="shortcuts_layout" />
                <div class="title py-3">{{i18n('reader_shortcuts_section_actions')}}</div>
                <shortcuts :items="shortcuts_actions" />
            </v-card-text>
            <v-card-actions class="pt-0">
                <v-spacer></v-spacer>
                <v-btn color="grey" flat="flat" @click.native="dialog = false">
                    {{i18n("button_close")}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Shortcuts from "./Shortcuts"
import {i18nmixin} from "../../mixins/i18n-mixin"

let alt = "Alt", shift = "Shift"
export default {
    mixins: [i18nmixin],
    data() {
        return {
            dialog: false, /* display or not dialog */
            shortcuts_chapter: [ // shortcuts linked to chapter navigation
                { keys: [["←↑↓→"], ["wasd"]], i18n:"reader_shortcut_arrows" },
                { keys: [["+"], ["-"]], i18n:"reader_shortcut_zoom" },
                { keys: [[alt, "s"]], i18n:"reader_shortcut_info_scan" },
                { keys: [[alt, "←"], [alt, "→"], [alt, "a"], [alt, "d"]], i18n:"reader_shortcut_first_last_scan" },
                { keys: [[alt, "r"]], i18n:"reader_shortcut_random_scan" },
                { keys: [[shift, "r"]], i18n:"reader_shortcut_reload_errors" },
                { keys: [["Space"]], i18n:"reader_shortcut_magic_scroll" },
            ],
            shortcuts_manga: [ // shortcuts linked to manga navigation
                { keys: [["b"], ["n"], [shift, "a"], [shift, "d"], [shift, "←"], [shift, "→"]], i18n: "reader_shortcut_chapters_nextprevious" },
                { keys: [[alt, "c"]], i18n: "reader_shortcut_info_chapter" },
                { keys: [[alt, shift, "←"], [alt, shift, "→"], [alt, shift, "a"], [alt, shift, "d"]], i18n:"reader_shortcut_first_last_chapter" },
                { keys: [[alt, shift, "r"]], i18n:"reader_shortcut_random_chapter" },
            ],
            shortcuts_layout: [ // shortcuts linked to layout options
                { keys: [[shift, "m"]], i18n: "reader_shortcut_layout_drawer" },
                { keys: [[shift, "w"], [shift, "h"], [shift, "c"]], i18n: "reader_shortcut_layout_resize" },
                { keys: [[shift, "f"]], i18n: "reader_shortcut_layout_fullchapter" },
                { keys: [[shift, "b"]], i18n: "reader_shortcut_layout_book" },
                { keys: [[shift, "d"]], i18n: "reader_shortcut_layout_direction" },
            ],
            shortcuts_actions: [ // shortcuts linked to manga actions
                { keys: [[shift, "+"]], i18n: "reader_shortcut_action_add" },
                { keys: [[shift, "-"]], i18n: "reader_shortcut_action_remove" },
                { keys: [[shift, "p"]], i18n: "reader_shortcut_action_play_pause" },
                { keys: [[shift, "l"]], i18n: "reader_shortcut_action_mark_latest" },
            ]
        }
    },
    components: { Shortcuts },
    methods: {
        open() {
            this.dialog = true
        }
    }
}
/**
Manga actions
 - add manga to reading list ^+
 - remove manga from reading list ^-
 - play pause notifications for manga ^p
*/
</script>