<template>
    <!-- Manage manga categories -->
    <div style="position: fixed; z-index: 10; top: 30%; left: 35%" class="pr-4" v-show="selectable">
        <v-card elevation="12" class="pa-3" ref="draggableContainer">
            <v-row class="mb-3 secondary" @mousedown="dragMouseDown">
                <v-btn class="ml-auto no-bg-hover" @click="unselect()" text x-small>
                    <v-icon color="gray"> mdi-close </v-icon>
                </v-btn>
            </v-row>
            <div class="d-flex align-center my-3">
                <v-chip color="gray" label small>
                    {{ selected.length + "/" + total }}
                </v-chip>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn text x-small class="no-bg-hover" v-bind="attrs" v-on="on" @click="selectAll()">
                            <v-icon color="gray" left> mdi-checkbox-multiple-marked-outline </v-icon>
                        </v-btn>
                    </template>
                    <span>{{ i18n("button_multi_manga_select_all") }}</span>
                </v-tooltip>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn text x-small class="no-bg-hover" v-bind="attrs" v-on="on" @click="clearSelect()">
                            <v-icon color="gray" left> mdi-close-box-multiple-outline </v-icon>
                        </v-btn>
                    </template>
                    <span>{{ i18n("button_multi_manga_unselect_all") }}</span>
                </v-tooltip>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn text x-small class="no-bg-hover" v-bind="attrs" v-on="on" @click="selectUnread()">
                            <v-icon color="gray" left> mdi-playlist-check </v-icon>
                        </v-btn>
                    </template>
                    <span>{{ i18n("button_multi_manga_select_unread") }}</span>
                </v-tooltip>
            </div>
            <v-row>
                <v-col cols="12" lg="6">
                    <v-btn
                        @click="openLatest()"
                        :disabled="!selected.length || selected.length > 15"
                        outlined
                        small
                        color="info">
                        {{ i18n("button_multi_manga_open_latest") }}
                    </v-btn>
                    <v-btn
                        @click="openNew()"
                        :disabled="!selected.length || selected.length > 15"
                        outlined
                        small
                        color="info">
                        {{ i18n("button_multi_manga_open_new") }}
                    </v-btn>
                </v-col>
                <v-divider />
                <v-col cols="12" lg="6">
                    <v-select
                        :items="categories"
                        dense
                        outlined
                        v-model="selectedCategory"
                        item-text="name"
                        item-value="name"
                        :label="i18n('list_multi_action_select_category')"></v-select>
                    <!-- Actions buttons -->
                    <div v-if="selectedCategory">
                        <v-btn @click="addCategory()" class="green" small>
                            {{ i18n("button_add") }}
                        </v-btn>
                        <v-btn @click="deleteCategory()" class="red" small>
                            {{ i18n("button_remove") }}
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>

<script>
import i18n from "../../amr/i18n"
import * as utils from "../utils"
export default {
    name: "MultiMangaAction",
    data() {
        return {
            selectedCategory: "",
            positions: {
                clientX: undefined,
                clientY: undefined,
                movementX: 0,
                movementY: 0
            }
        }
    },
    props: ["selected", "selectable", "total"],
    computed: {
        // AMR options
        options: function () {
            return this.$store.state.options
        },
        categories: function () {
            return this.options.categoriesStates.filter(cat => cat.type !== "native" && cat.type !== "language")
        }
    },
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        convertIcons: str => utils.convertIcons(str),
        addCategory: function () {
            for (let manga of this.selected) {
                this.$store.dispatch("addCategoryToManga", {
                    key: manga.key,
                    name: this.selectedCategory
                })
            }
            this.selectedCategory = ""
        },
        /**
         * Delete a category on this group of manga
         */
        deleteCategory: function () {
            for (let manga of this.selected) {
                this.$store.dispatch("removeCategoryFromManga", {
                    key: manga.key,
                    name: this.selectedCategory
                })
            }
            this.selectedCategory = ""
        },
        clearSelect: function () {
            this.$eventBus.$emit("multi-manga:deselect-all")
        },
        selectAll: function () {
            this.$eventBus.$emit("multi-manga:select-all")
        },
        selectUnread: function () {
            this.$eventBus.$emit("multi-manga:select-unread")
        },
        openLatest: function () {
            for (let manga of this.selected) {
                this.$eventBus.$emit("multi-manga:open-latest:" + manga.key)
            }
        },
        openNew: function () {
            for (let manga of this.selected) {
                this.$eventBus.$emit("multi-manga:open-first-new:" + manga.key)
            }
        },
        unselect: function () {
            this.$emit("unselect")
        },
        dragMouseDown: function (event) {
            console.log(this.$refs)
            event.preventDefault()
            // get the mouse cursor position at startup:
            this.positions.clientX = event.clientX
            this.positions.clientY = event.clientY
            document.onmousemove = this.elementDrag
            document.onmouseup = this.closeDragElement
        },
        elementDrag: function (event) {
            event.preventDefault()
            this.positions.movementX = this.positions.clientX - event.clientX
            this.positions.movementY = this.positions.clientY - event.clientY
            this.positions.clientX = event.clientX
            this.positions.clientY = event.clientY
            // set the element's new position:
            this.$refs.draggableContainer.$el.style.top =
                this.$refs.draggableContainer.$el.offsetTop - this.positions.movementY + "px"
            this.$refs.draggableContainer.$el.style.left =
                this.$refs.draggableContainer.$el.offsetLeft - this.positions.movementX + "px"
        },
        closeDragElement() {
            document.onmouseup = null
            document.onmousemove = null
        }
    }
}
</script>
