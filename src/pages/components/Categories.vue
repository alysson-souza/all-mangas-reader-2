<template>

  <v-menu :close-on-content-click="false" v-model="menu">
    <template #activator="{ on: onMenu }">
      <v-tooltip top>
        <template #activator="{ on: onTooltip }">
          <v-btn
            v-on="{ ...onMenu, ...onTooltip }"
            text
            small
            :ripple="false"
            class="no-bg-hover"
          >
            <v-icon>
              mdi-format-list-bulleted-type
            </v-icon>
          </v-btn>
        </template>
        <span>{{ i18n("list_cat_filter") }}</span>
      </v-tooltip>
    </template>
    <v-card>
      <v-row no-gutters>
        <v-btn
          color="primary"
          @click="menu = false"
          class="ml-auto no-bg-hover"
          text
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </v-row>
      <v-row no-gutters class="px-4">
        <!-- Eye button to include all / do not care about all -->
        <v-tooltip v-if="!staticCats && !allincluded" top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon class="cat-act" @click.stop="stateAll('include')" v-on="on">mdi-eye</v-icon>
            </template>
            <span>{{i18n("list_cat_include_all")}}</span>
        </v-tooltip>
        <v-tooltip v-if="!staticCats && allincluded" top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon class="cat-act" @click.stop="stateAll('')" v-on="on">mdi-eye-off</v-icon>
            </template>
            <span>{{i18n("list_cat_donotcare_all")}}</span>
        </v-tooltip>
        <!-- Display all categories -->
        <div v-for="(cat, key) in sortedCategories"
          :class="'cat-chip ' + (staticCats ? 'include' : cat.state)"
          :key="key"
          @click="switchState(cat)">
          <!-- Category name and tooltip -->
          <v-tooltip v-if="!staticCats && cat.type !== 'language'" top content-class="icon-ttip" class="cat-name">
            <template v-slot:activator="{ on }">
              <span class="cat-name" v-on="on">{{cat.type === 'native' ? i18n(cat.name) : cat.name}}</span>
            </template>
            <span v-if="cat.state==='include'" v-html='i18n("list_cat_include", cat.type === "native" ? i18n(cat.name) : cat.name)'></span>
            <span v-if="cat.state==='exclude'" v-html='i18n("list_cat_exclude", cat.type === "native" ? i18n(cat.name) : cat.name)'></span>
            <span v-if="!cat.state" v-html='i18n("list_cat_no", cat.type === "native" ? i18n(cat.name) : cat.name)'></span>
          </v-tooltip>
          <Flag v-if="!staticCats && cat.type === 'language'" :value='cat.name' />
          <span v-if="staticCats" class="cat-name">{{cat}}</span>
          <!-- Icon only me -->
          <v-tooltip v-if="!staticCats" top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon class="cat-act" @click.stop="onlyMe(cat)" v-on="on">mdi-eye</v-icon>
            </template>
            <span>{{i18n("list_cat_only")}}</span>
          </v-tooltip>
          <!-- Trash icon -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-if="cat.type !== 'native' && cat.type !== 'language'" class="cat-act" @click.stop="deleteCat(cat)" v-on="on">mdi-close</v-icon>
            </template>
            <span>{{i18n("list_cat_delete")}}</span>
          </v-tooltip>
          <!-- Edit icon -->
          <v-tooltip top content-class="icon-ttip">
            <template v-slot:activator="{ on }">
              <v-icon v-if="cat.type !== 'native' && cat.type !== 'language'" class="cat-act" @click.stop="displayEditCategoryModal(cat)" v-on="on">mdi-pencil</v-icon>
            </template>
            <span>{{i18n("list_cat_edit")}}</span>
          </v-tooltip>
          <!-- badge nb mangas -->
          <span v-if="countUsed(cat) > 0" class="cat-badge grey darken-1">{{countUsed(cat)}}</span>
        </div>
      </v-row>
      <v-row no-gutters class="pa-5">
        <v-col cols="12">
          <!-- Input text to add a category -->
          <v-text-field v-if="!staticCats" dense v-model="newCat" :placeholder="i18n('list_cat_add')" class="cat-add"
            @keyup.enter="addCategory()" />
        </v-col>
      </v-row>
      <v-dialog v-model="deleteCatDialog" max-width="290">
        <v-card>
          <v-card-title class="text-h5">{{i18n("list_cat_delete_title", catToDelete.name)}}</v-card-title>
          <v-card-text>{{i18n("list_cat_delete_desc", countUsed(catToDelete))}}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat @click.native="reallyDeleteCat()">{{i18n("button_yes")}}</v-btn>
            <v-btn color="grey darken-1" flat @click.native="deleteCatDialog = false">{{i18n("button_no")}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- Edit Category Dialog -->
      <v-dialog v-model="editCatDialog" max-width="290">
        <v-card>
          <v-card-title class="text-h5">{{i18n("list_cat_edit_title", catToEdit.name)}}</v-card-title>
          <v-card-text>
            <label>
              {{i18n("list_cat_edit_desc", countUsed(catToEdit))}} <br />
              <v-text-field solo outlined dense v-model="updateCatName" />
            </label>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" :disabled="!isValidEditName" flat @click.native="submitEditCategory()">
              {{i18n("button_yes")}}
            </v-btn>
            <v-btn color="grey darken-1" flat @click.native="editCatDialog = false">{{i18n("button_no")}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-menu>
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
      editCatDialog: false,
      catToEdit: { name: "" },
      updateCatName: "",
      deleteCatDialog: false, // display delete category dialog
      catToDelete: {}, // category to dele inside dialog
      menu: false,
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
      let cats = this.categories // This is just to get rid of the eslint error
      return cats.sort((a, b) => {
        if (typeof a === 'string') {
          return a.localeCompare(b);
        }
        let at = types_order.findIndex(t => t === a.type),
            bt = types_order.findIndex(t => t === b.type)
        return at === bt ? a.name.localeCompare(b.name) : at - bt
      })
    },
    isValidEditName: function () {
      return this.updateCatName.length >= 1 && this.updateCatName !== this.catToEdit.name;
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
    displayEditCategoryModal(cat) {
      this.catToEdit = cat;
      this.editCatDialog = true;
      this.updateCatName = cat.name
    },
    submitEditCategory() {
      this.$store.dispatch("editCategory", {
        oldname: this.catToEdit.name ,
        newname: this.updateCatName,
      });

      // Reset edit state
      this.editCatDialog = false;
      this.catToEdit = {};
      this.updateCatName = ""
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
<style data-amr="true">
/** Categories */
.cat-cont {
  padding: 5px 10px;
}
.cat-add {
  padding: 1px;
  outline: none;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  font-size: 1rem;
}

.cat-act {
  font-size: 1.1rem;
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
  font-size: 0.9rem;
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
  font-size: 0.9rem;
  padding: 0px 3px;
}
.no-bg-hover::before {
   background-color: transparent !important;
}
</style>
