<template>
  <div>
    <!-- Manage manga categories -->
    <v-row >
      <v-col>
        <div class="cat-chip grey">
          <span class="cat-badge">
            {{ i18n("list_multi_action_currently_selected", selected.length) }}
          </span>
        </div>
        <v-tooltip top content-class="icon-ttip">
          <template v-slot:activator="{ on }">
            <v-icon class="flex" v-on="on" @click.native="clearSelect()">mdi-close</v-icon>
          </template>
          <span>{{ i18n("button_clear") }}</span>
        </v-tooltip>
      </v-col>
      <v-col class="amr-categories">
        <v-select :items="categories" v-model="selectedCategory" item-text="name" item-value="name" :label="i18n('list_multi_action_select_category')"></v-select>
        <!-- Actions buttons -->
        <div v-if="selectedCategory">
          <v-btn dark @click='addCategory()' class="green" small>
            {{ i18n("button_add") }}
          </v-btn>
          <v-btn dark @click='deleteCategory()' class="red" small>
            {{ i18n("button_remove") }}
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
      for (let key of this.selected) {
        this.$store.dispatch("addCategoryToManga", {
          key: key,
          name: this.selectedCategory
        });
      }
      this.selectedCategory = "";
    },
    /**
     * Delete a category on this group of manga
     */
    deleteCategory: function() {
      for (let key of this.selected) {
        this.$store.dispatch("removeCategoryFromManga", {
          key: key,
          name: this.selectedCategory
        });
      }
      this.selectedCategory = "";
    },
    clearSelect: function () {
      this.$emit('clearSelected')
    }
  },
}
</script>s