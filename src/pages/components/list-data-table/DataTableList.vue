<!-- The prop "mangas" used to initialize this component is a list of manga objects with the same name : a manga read on multiple sites -->
<template>
  <v-data-table
      :items="groups"
      :loading="!loaded"
      :headers="[{value: 'name'}]"
      :page.sync="pagination.currentPage"
      :items-per-page="itemsPerPage"
      hide-default-header
      hide-default-footer
      :search="searchText"
      @page-count="pagination.pageCount = $event"
      @search-request="propagateSR"
      @rename-manga="renameManga"
    >
      <template v-if="pageNavigationPosition == 'top'" v-slot:top>
        <v-row class="mx-2">
          <v-col cols="3">
            <v-select dense outlined :items="pagination.pageOptions" v-model="itemsPerPage" :label="i18n('list_page_label')"></v-select>
          </v-col>
          <v-col>
            <v-pagination :total-visible="$isPopup ? 5 : 10" v-model="pagination.currentPage" :length="pagination.pageCount"></v-pagination>
          </v-col>
          <v-col cols="1">
            <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-btn color="blue" icon x-large @click="moveNavigation()" v-on="on">
                <v-icon>mdi-arrow-down-box</v-icon>
              </v-btn>
            </template>
            <span>{{i18n("list_move_navigation")}}</span>
          </v-tooltip>
          </v-col>
        </v-row>
      </template>
      <template v-if="pageNavigationPosition == 'bottom'" v-slot:footer>
        <v-row class="mx-2 pt-5">
          <v-col cols="3">
            <v-select dense outlined :items="pagination.pageOptions" v-model="itemsPerPage" :label="i18n('list_page_label')"></v-select>
          </v-col>
          <v-col>
            <v-pagination :total-visible="$isPopup ? 5 : 10" v-model="pagination.currentPage" :length="pagination.pageCount"></v-pagination>
          </v-col>
          <v-col cols="1">
            <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-btn color="blue" icon x-large @click="moveNavigation()" v-on="on">
                <v-icon>mdi-arrow-up-box</v-icon>
              </v-btn>
            </template>
            <span>{{i18n("list_move_navigation")}}</span>
          </v-tooltip>
          </v-col>
        </v-row>
      </template>
      <!-- Loading progress bar -->
      <template v-slot:progress>
        <v-progress-linear
          color="purple"
          :height="10"
          indeterminate
        ></v-progress-linear>
      </template>
      <!-- Table Body, manga entries -->
      <template v-slot:item="{item, index}">
        <tr class="">
          <td>
            <MangaGroup
              :group="item"
              :group-index="index"
              @search-request="propagateSR"
              @rename-manga="renameManga"
            />
          </td>
        </tr>
      </template>
      <template v-slot:no-data>
        <div v-if="allMangas.length > 0">
          <p v-html="i18n('list_no_manga_catstate_message')"></p>
        </div>
        <div v-else>
          <p v-html="convertIcons(i18n('list_no_manga_message'))"></p>
          <p>
            <a @click.prevent="importSamples()">{{ i18n("list_import_samples")}}</a>
          </p>
        </div>
      </template>
      <template v-slot:no-results>
        <p v-html="i18n('list_no_manga_search_message')"></p>
      </template>
    </v-data-table>
</template>

<script>
import MangaGroup from "./MangaGroup";
import i18n from "../../../amr/i18n";
import * as utils from '../../utils';

export default {
  // property to load the component with --> a group of manga
  props: ["groups", 'loaded', 'searchText'],
  data(){
    return {
      pagination: {
          pageOptions: [
            5,
            25,
            50,
            100
          ],
          currentPage: 1,
          pageCount: 0
        },
        itemsPerPage: this.$store.state.options.perPageMangas,
        pageNavigationPosition: this.$store.state.options.pageNavigationPosition,
    }
  },
  computed: {
    options: function() {
      return this.$store.state.options;
    }
  },
  components: { MangaGroup },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    convertIcons: str => utils.convertIcons(str),
    /**
     * Propagate search request event from MangaGroup to parent
     */
    propagateSR(str) {
      this.$emit("search-request", str)
    },
    /**
     * Emit the event for renaming this manga
     */
    renameManga(manga) {
      this.$emit('rename-manga', manga)
    },
    moveNavigation: function() {
      let newDir = ''
      if (this.pageNavigationPosition == 'top') {
        newDir = 'bottom'
      } else {
        newDir = 'top'
      }
      this.pageNavigationPosition = newDir
      this.$store.dispatch("setOption", { key: 'pageNavigationPosition', value: newDir })
    }
  },
  // Name of the component
  name: "DataTableList"
}
</script>
