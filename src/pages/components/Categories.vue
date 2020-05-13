<template>
  <div class="cat-cont">
      <!-- Eye button to include all / do not care about all -->
      <v-tooltip v-if="!staticCats && !allincluded" top content-class="icon-ttip">
          <v-icon class="cat-act" @click.stop="stateAll('include')" slot="activator">mdi-eye</v-icon>
          <span>{{i18n("list_cat_include_all")}}</span>
      </v-tooltip>
      <v-tooltip v-if="!staticCats && allincluded" top content-class="icon-ttip">
          <v-icon class="cat-act" @click.stop="stateAll('')" slot="activator">mdi-eye-off</v-icon>
          <span>{{i18n("list_cat_donotcare_all")}}</span>
      </v-tooltip>
      <!-- Display all categories -->
      <div v-for="(cat, key) in sortedCategories" 
        :class="'cat-chip ' + (staticCats ? 'include' : cat.state)"
        :key="key"
        @click="switchState(cat)">
        <!-- Category name and tooltip -->
        <v-tooltip v-if="!staticCats && cat.type !== 'language'" top content-class="icon-ttip" class="cat-name">
          <span class="cat-name" slot="activator">{{cat.type === 'native' ? i18n(cat.name) : cat.name}}</span>
          <span v-if="cat.state==='include'" v-html='i18n("list_cat_include", cat.type === "native" ? i18n(cat.name) : cat.name)'></span>
          <span v-if="cat.state==='exclude'" v-html='i18n("list_cat_exclude", cat.type === "native" ? i18n(cat.name) : cat.name)'></span>
          <span v-if="!cat.state" v-html='i18n("list_cat_no", cat.type === "native" ? i18n(cat.name) : cat.name)'></span>
        </v-tooltip>
        <Flag v-if="!staticCats && cat.type === 'language'" :value='cat.name' />
        <span v-if="staticCats" class="cat-name">{{cat}}</span>
        <!-- Icon only me -->
        <v-tooltip v-if="!staticCats" top content-class="icon-ttip">
            <v-icon class="cat-act" @click.stop="onlyMe(cat)" slot="activator">mdi-eye</v-icon>
            <span>{{i18n("list_cat_only")}}</span>
        </v-tooltip>
        <!-- Trash icon -->
        <v-tooltip top content-class="icon-ttip">
            <v-icon v-if="cat.type !== 'native' && cat.type !== 'language'" class="cat-act" @click.stop="deleteCat(cat)" slot="activator">mdi-close</v-icon>
            <span>{{i18n("list_cat_delete")}}</span>
        </v-tooltip>
        <!-- badge nb mangas -->
        <span v-if="countUsed(cat) > 0" class="cat-badge grey darken-1">{{countUsed(cat)}}</span>
      </div>
      <!-- Input text to add a category -->
      <input v-if="!staticCats" type="text" v-model="newCat" :placeholder="i18n('list_cat_add')" class="cat-add"
        @keyup.enter="addCategory()" />
    <v-dialog v-model="deleteCatDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{i18n("list_cat_delete", catToDelete.name)}}</v-card-title>
        <v-card-text>{{i18n("list_cat_delete", countUsed(catToDelete))}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click.native="reallyDeleteCat()">{{i18n("button_yes")}}</v-btn>
          <v-btn color="grey darken-1" flat @click.native="deleteCatDialog = false">{{i18n("button_no")}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import i18n from "../../amr/i18n"
import * as utils from "../utils"
import Flag from './Flag'

const types_order = ["native", "language", undefined] // order of displayed categories types

export default {
  data() {
    return {
      newCat: "", // used to create new category
      deleteCatDialog: false, // display delete category dialog
      catToDelete: {} // category to dele inside dialog
    };
  },
  props: [
    // categories to display in the list
    "categories",
    // is editable or static
    "static-cats",
    // delegate delete function
    "delegate-delete"
  ],
  computed: {
    allincluded: function() {
      return this.categories.reduce(
        (nb, cat) => cat.state === "include" ? nb + 1 : nb
      , 0) === this.categories.length;
    },
    sortedCategories: function() {
      return this.categories.sort((a, b) => {
        if (typeof a === 'string') {
          return a.localeCompare(b);
        }
        let at = types_order.findIndex(t => t === a.type), 
            bt = types_order.findIndex(t => t === b.type)
        return at === bt ? a.name.localeCompare(b.name) : at - bt
      })
    }
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    switchState(cat) {
      let nstate = "";
      if (cat.state === "include") nstate = "exclude";
      else if (cat.state === "exclude") nstate = "";
      else if (!cat.state || cat.state === "") nstate = "include";
      this.$store.dispatch("updateCategory", {
        name: cat.name,
        catstate: nstate
      });
    },
    addCategory() {
      this.$store.dispatch("addCategory", this.newCat);
      this.newCat = "";
    },
    deleteCat(cat) {
      if (this.delegateDelete) {
        this.$emit("delete-category", cat);
      } else {
        if (this.countUsed(cat) > 0) {
          this.catToDelete = cat;
          this.deleteCatDialog = true;
        } else {
          this.$store.dispatch("removeCategory", cat.name);
        }
      }
    },
    reallyDeleteCat() {
      this.$store.dispatch("removeCategory", this.catToDelete.name);
      this.deleteCatDialog = false;
    },
    onlyMe(cat) {
      for (let c of this.categories) {
        if (c.name === cat.name) {
          this.$store.dispatch("updateCategory", {
            name: c.name,
            catstate: "include"
          });
        } else {
          this.$store.dispatch("updateCategory", {
            name: c.name,
            catstate: ""
          });
        }
      }
    },
    countUsed(cat) {
      return utils.countUsed(cat, this.$store.state.mangas.all);
    },
    stateAll(state) {
      for (let c of this.categories) {
        this.$store.dispatch("updateCategory", {
          name: c.name,
          catstate: state
        });
      }
    }
  },
  name: "Categories",
  components: {Flag}
};
</script>
<style>
/** Categories */
.cat-cont {
  padding: 5px 10px;
}
.cat-add {
  padding: 1px;
  outline: none;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  font-size:11px;
}
.cat-act {
  font-size: 12px;
  cursor: pointer;
}
.application .theme--dark.icon, .theme--dark .icon.cat-act {
  color: rgba(0,0,0,.54);
}
.cat-act:hover {
  opacity: 0.6;
}
.cat-name {
  margin-right: 2px;
  cursor: pointer;
}
.cat-chip {
  font-size: 12px;
  margin: 2px;
  padding: 0px 4px;
  background: #aaa;
  vertical-align: middle;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  border-radius: 2px;
  outline: none;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  color: black;
}
.cat-chip:hover {
  background: #777;
}
.cat-chip.include, .cat-chip.exclude {
  background: #e0e0e0;
}
.cat-chip.include:hover, .cat-chip.exclude:hover {
  background: #a0a0a0;
}
.theme--dark .cat-chip {
  background: #424242;
  color: white;
}
.theme--dark .cat-chip:hover {
  background: #303030;
}
.theme--dark .cat-chip.include, .theme--dark .cat-chip.exclude {
  background: #707070;
}
.theme--dark .cat-chip.include:hover, .theme--dark .cat-chip.exclude:hover {
  background: #424242;
}
.cat-chip.exclude .cat-name {
  text-decoration: line-through;
}
.cat-badge {
  color: white;
  font-weight: bold;
  font-size: 10px;
  padding: 0px 3px;
}
</style>


