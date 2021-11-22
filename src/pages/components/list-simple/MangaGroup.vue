<!-- The prop "mangas" used to initialize this component is a list of manga objects with the same name : a manga read on multiple sites -->
<template>
  <v-card :class="color(3, true) + ' pa-1'">
    <v-row no-gutters class="min-h">
      <v-col cols="6">
        <v-checkbox v-show="selectable" v-model="selected" hide-details dense class="shrink mr-2 mt-0"></v-checkbox>
        <v-card :color="color(0)" class="ma-1 px-2" @click="expanded = !expanded">
          <v-icon small>{{ expanded ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
          <v-tooltip top :disabled="!(firstManga.displayName && firstManga.displayName !== '') || shouldTruncate()">
            <template v-slot:activator="{on}">
                <span class="amr-manga-title" v-on="on">
                  {{ firstManga.displayName && firstManga.displayName !== '' ? truncText(firstManga.displayName) : truncText(firstManga.name) }}
                </span>
            </template>
            {{ firstManga.name }}
          </v-tooltip>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="ma-1 px-2" :color="color(0)">
          {{ firstMangaProgress }}
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="ma-1 px-2" :color="color(0)">
          {{ mirrorList }}
        </v-card>
      </v-col>
    </v-row>
    <div v-if="expanded">
      <Manga 
        v-for="manga in group.mangas"
        :key="manga.key"
        :manga="manga"
        class="min-h-26"
        @search-request="propagateSR"
        @rename-manga="renameManga"
       />
    </div>
  </v-card>
</template>

<script>
import Manga from "./Manga";
import * as utils from "../../utils";
import * as amrutils from "../../../amr/utils";

export default {
  data() {
    return {
      // Is the full list expanded
      expanded: false,
      selectable: false,
      selected: false
    }
  },
  // property to load the component with --> a group of manga
  props: ["group", "groupIndex"],
  computed: {
    firstManga: function() {
      return this.group.mangas[0]
    },
    // AMR options
    options: function() {
      return this.$store.state.options;
    },
    // Progress of reading for first manga
    firstMangaProgress: function() {
      if (!this.firstManga.listChaps || this.firstManga.listChaps.length == 0)
        return 'N/A'

      let curPath = amrutils.chapPath(this.firstManga.lastChapterReadURL)
      let pos = this.firstManga.listChaps.findIndex(el => amrutils.chapPath(el[1]) == curPath)
      let percent = Math.floor((1 - pos / this.firstManga.listChaps.length) * 100)
      let absolute = `${this.firstManga.listChaps.length - pos}/${this.firstManga.listChaps.length}`
      return `${percent}% (${absolute})`
    },
    // List of mirrors in use for this series
    mirrorList: function() {
      return this.group.mangas.map(m => m.mirror).join(', ')
    }
  },
  methods: {
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

    /**
     * Return the right color for this manga, depending if it updates (you can stop following udates for a manga), if it has unread chapters or not
     */
    color: function(light, invertable = false) {
      if (this.options.alternateColors && invertable) {
        let odd = (this.groupIndex + 1) % 2 == 1
        light += odd ? -2 : 1
      }
      return utils.getColor(this.firstManga, this.options, light);
    },
    shouldTruncate: function() {
      return (this.firstManga.displayName && this.firstManga.displayName !== '' ? this.firstManga.displayName : this.firstManga.name).length > 100
    },
    truncText: function (str) {
      if (str.length > 100) {
        return str.slice(0, 100) + '...';
      } else {
        return str;
      }
    }
  },
  created() {
    this.$eventBus.$on('multi-manga:show-multiselect', () => {
      this.selectable = true
      this.selected = false
    })
    this.$eventBus.$on('multi-manga:hide-multiselect', () => {
      this.selectable = false
      this.selected = false
    })
    this.$eventBus.$on('multi-manga:select-all', () => {
      if (!this.selected)
        this.selected = true
    })
    this.$eventBus.$on('multi-manga:deselect-all', () => {
      if (this.selected)
        this.selected = false
    })
  },
  components: { Manga },
  // Name of the component
  name: "MangaGroup"
}
</script>

<style lang="css" scoped data-amr="true">
.dark-text * {
  color: #424242 !important;
}
.light-text * {
  color: #fafafa !important;
}
.amr-manga-title {
  font-weight: bold;
  cursor: pointer;
}
.empty-icon {
  width: 22px;
}
.min-h {
 min-height: 15px;
}
</style>
