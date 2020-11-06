<template>
    <div class="cat-cont multi-action green lighten-3 my-2">
        <!-- Manage manga categories -->
        <v-flex xs6 class="amr-categories">
            <div class="det-sel-wrapper">
                <select dark v-model="newCat" @change="addCategory()" class="green lighten-2">
                    <option value="">{{i18n("list_details_cats_select")}}</option>
                    <option v-for="(cat, key) of categories"
                            v-if="cat.type !== 'native' && cat.type !== 'language'"
                            :key="key"
                            :value="cat.name">
                        {{cat.name}}
                    </option>
                </select>
            </div>
        </v-flex>
    </div>

</template>

<script>
import i18n from '../../amr/i18n';
import * as utils from '../utils';
import { mapGetters } from 'vuex';
import Categories from './Categories';

export default {
  name: "MultiMangaAction",
  components: { Categories },
  data() {
    return {
      newCat: "",
    }
  },
  computed: {
    // AMR options
    options: function() {
      return this.$store.state.options;
    },
    categories: function() {
      return this.options.categoriesStates.filter(cat => cat.type !== 'native' && cat.type !== 'language');
    },
    selectedKeys: function () {
      return Object.keys(this.selectedManga)
    }
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    convertIcons: str => utils.convertIcons(str),
    addCategory: function() {
      for (let key of this.selectedKeys) {
        this.$store.dispatch("addCategoryToManga", {
          key: key,
          name: this.newCat
        });
      }
      this.newCat = "";
    },
    /**
     * Delete a category on this group of manga
     */
    deleteCategory: function(cat) {
      for (let key of this.selectedKeys) {
        this.$store.dispatch("removeCategoryFromManga", {
          key: key,
          name: cat
        });
      }
    },
    ...mapGetters(["selectedManga"])
  },
}
</script>

<style scoped>
.det-sel-wrapper {
    display  : inline-block;
    position : relative;
}

select {
    -moz-appearance    : none;
    -webkit-appearance : none;
    -ms-appearance     : none;
    display            : inline-block;
    outline            : none;
    border-style       : none;
    border-radius      : 2px !important;
    position           : relative;
    padding            : 2px 15px 2px 4px;
    color              : white;
    font-size          : 11px;
}

select option {
    font-size : 11px;
}

.det-sel-wrapper:after {
    content        : "▼";
    position       : absolute;
    top            : 0;
    right          : 0;
    bottom         : 0;
    font-size      : 75%;
    line-height    : 19px;
    padding        : 1px 5px;
    pointer-events : none;
    z-index        : 1;
}

</style>
