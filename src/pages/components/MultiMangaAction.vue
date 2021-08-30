<template>
  <div>
    <!-- Manage manga categories -->
    <v-row no-gutters>
      <v-col>
        <v-chip
          :color="selected.length ? 'grey lighten-1' : 'gray'"
          label
          text-color="white"
        >
          {{ i18n("list_multi_action_currently_selected", selected.length) }}
          <v-icon right @click="clearSelect()">
            mdi-refresh
          </v-icon>
        </v-chip>
          <v-btn
          tile
          small
          color="info"
          @click='selectAll()'
          >
            <v-icon left>
              mdi-bookmark-multiple
            </v-icon>
            {{ i18n("button_multi_manga_select_all") }}
          </v-btn>
          <v-btn
          tile
          small
          color="info"
          @click='selectUnread()'
          >
            <v-icon left>
              mdi-bookmark-multiple-outline
            </v-icon>
            {{ i18n("button_multi_manga_select_unread") }}
          </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="col-12">
        <v-btn
            outlined
            small
            color="info"
            @click='openNew()'
            :disabled="!selected.length || selected.length > 15"
            >
              <v-icon left x-small>
                mdi-play
              </v-icon>
              {{ i18n("button_multi_manga_open_new") }}
        </v-btn>
        <v-btn
            outlined
            small
            color="info"
            @click='openLatest()'
            :disabled="!selected.length || selected.length > 15"
            >
              <v-icon left x-small>
                mdi-skip-next
              </v-icon>
              {{ i18n("button_multi_manga_open_latest") }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="7">
        <v-select 
        :items="categories"
        dense
        v-model="selectedCategory"
        item-text="name"
        item-value="name"
        :label="i18n('list_multi_action_select_category')"
        :disabled="!selected.length || selected.length > 15 || !categories.filter(c => c.type !== 'native').length"
        >
        </v-select>
      </v-col>
      <v-col cols="5">
        <!-- Actions buttons -->
        <div v-if="selectedCategory">
          <v-btn
            color="blue"
            @click='addCategory()'
            small
            dark
          >
            <v-icon>
              mdi-plus
            </v-icon>
            <!-- {{ i18n("button_add") }} -->
          </v-btn>
          <v-btn
            color="red"
            @click='deleteCategory()'
            small
            dark
          >
            <v-icon>
              mdi-minus
            </v-icon>
            <!-- {{ i18n("button_remove") }} -->
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import i18n from '../../amr/i18n';
import * as utils from '../utils';

export default {
  name: "MultiMangaAction",
  data() {
    return {
      selectedCategory: "",
    }
  },
  props: [
    "selected"
  ],
  computed: {
    // AMR options
    options: function() {
      return this.$store.state.options;
    },
    categories: function() {
      return this.options.categoriesStates.filter(cat => cat.type !== 'native' && cat.type !== 'language');
    },
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    convertIcons: str => utils.convertIcons(str),
    addCategory: function() {
      for (let manga of this.selected) {
        this.$store.dispatch("addCategoryToManga", {
          key: manga.key,
          name: this.selectedCategory
        });
      }
      this.selectedCategory = "";
    },
    /**
     * Delete a category on this group of manga
     */
    deleteCategory: function() {
      for (let manga of this.selected) {
        this.$store.dispatch("removeCategoryFromManga", {
          key: manga.key,
          name: this.selectedCategory
        });
      }
      this.selectedCategory = "";
    },
    clearSelect: function () {
      this.$eventBus.$emit('multi-manga:deselect-all')
    },
    selectAll: function() {
      this.$eventBus.$emit('multi-manga:select-all')
    },
    selectUnread: function() {
      this.$eventBus.$emit('multi-manga:select-unread')
    },
    openLatest: function() {
      for (let manga of this.selected) {
        this.$eventBus.$emit('multi-manga:open-latest:' + manga.key)
      }
    },
    openNew: function() {
      for (let manga of this.selected) {
        this.$eventBus.$emit('multi-manga:open-first-new:' + manga.key)
      }
    }
  },
}
</script>