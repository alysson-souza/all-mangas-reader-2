<template>
  <div>
    <!-- Manage manga categories -->
    <v-row >
      <v-col cols="12" class="header-container">
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
    </v-row>
    <v-row>
      <v-col cols="12" class="amr-categories">
        <div class="det-sel-wrapper">
          <select v-model="selectedCategory" class="green lighten-1">
            <option value="">{{ i18n("list_multi_action_select_category") }}</option>
            <option v-for="(cat, key) of categories" :key="key"
                    :value="cat.name">
                {{ cat.name }}
            </option>
          </select>
        </div>
        <!-- Actions buttons -->
        <div v-if="selectedCategory" class="amr-actions">
          <v-btn dark @click='addCategory()' class="green" small>
            {{ i18n("button_add") }}
          </v-btn>
          <v-btn dark @click='deleteCategory()' class="green" small>
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
import { mapGetters } from 'vuex';

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
      this.$store.dispatch("clearMangasSelect");
    },
    ...mapGetters(["selectedMangasCount", "selectedMangasKeys"])
  },
}
</script>

<style scoped>

.multi-action {
    min-height: 80px;
}

.header-container {
    font-size : 1.5rem;
}

.header-container .v-icon {
    font-size : 1.5rem;
    cursor: pointer;

}
.det-sel-wrapper {
    display  : inline-block;
    position : relative;
}

.amr-categories {
    display: flex;
    align-items: center;
}

.selected-header {
    font-size : 1rem;
}

select {
    display       : flex;
    outline       : none;
    border-style  : none;
    border-radius : 2px !important;
    position      : relative;
    padding       : 2px 16px 2px 4px;
    margin        : 6px 0;
    color         : white;
    font-size     : 1.5rem;
}

.det-sel-wrapper:after {
    content        : "▼";
    position       : absolute;
    top            : 0;
    right          : 0;
    bottom         : 0;
    line-height    : 36px;
    padding        : 2px;
    pointer-events : none;
    z-index        : 1;
}

</style>
