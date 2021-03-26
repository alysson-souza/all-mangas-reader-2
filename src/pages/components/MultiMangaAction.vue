<template>
  <div>
    <!-- Manage manga categories -->
    <v-row >
      <v-col>
        <v-chip :color="selected.length ? 'green' : 'gray'" label close @click:close="clearSelect()">
          {{ i18n("list_multi_action_currently_selected", selected.length) }}
        </v-chip>
        <v-btn @click='selectAll()' outlined small color="info">
          {{ i18n("button_multi_manga_select_all") }}
        </v-btn>
        <v-btn @click='selectUnread()' outlined small color="info">
          {{ i18n("button_multi_manga_select_unread") }}
        </v-btn>

      </v-col>
      <v-col>
        <v-select :items="categories" dense outlined v-model="selectedCategory" item-text="name" item-value="name" :label="i18n('list_multi_action_select_category')"></v-select>
        <!-- Actions buttons -->
        <div v-if="selectedCategory">
          <v-btn @click='addCategory()' class="green" small>
            {{ i18n("button_add") }}
          </v-btn>
          <v-btn @click='deleteCategory()' class="red" small>
            {{ i18n("button_remove") }}
          </v-btn>
        </div>
      </v-col>
      <v-col>
        <v-btn @click='openLatest()' :disabled="!selected.length || selected.length > 15" outlined small color="info">
          {{ i18n("button_multi_manga_open_latest") }}
        </v-btn>
        <v-btn @click='openNew()' :disabled="!selected.length || selected.length > 15" outlined small color="info">
          {{ i18n("button_multi_manga_open_new") }}
        </v-btn>
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