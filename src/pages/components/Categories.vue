<template>
  <div class="cat-cont">
     <v-select
        v-model="selectedCats"
        :items="catList"
        :item-text="item => item.type === 'native' ? i18n(item.name) : item.name"
        item-value="name" 
        attach
        chips
        multiple
        dense
      >
        <template v-slot:prepend-item>
          <v-list-item ripple>
            <v-list-item-action>
                <v-icon @click="addCategory()" :color="selectedCats.length > 0 ? 'light-blue' : ''">
                  mdi-plus
                </v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-text-field @keypress.enter="addCategory()" :label="i18n('list_cat_add')" v-if="!staticCats" dense v-model="newCat" class="cat-add mt-2"/>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            v-model="selectedCats"
            ripple
            @click="toggleAllCats"
          >
            <v-list-item-action>
              <v-icon :color="selectedCats.length > 0 ? 'light-blue' : ''">
                {{ icon }}
              </v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{i18n("list_cat_include_all")}}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider class="mt-2"></v-divider>
        </template>
        <template v-slot:item="{ active, item, attrs, on }">
          <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
            <v-list-item-action>
            <v-checkbox :input-value="active"></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                <v-row no-gutters align="center" class="py-2">
                  <v-badge :value="countUsed(item) > 0" :content="countUsed(item)" class="pr-2">
                    {{ item.type === 'native' ? i18n(item.name) : item.name }}
                  </v-badge>

                  <v-spacer></v-spacer>
                  <v-btn color="transparent" v-if="item.type !== 'native'" x-small depressed right @click.stop="displayEditCategoryModal(item)">
                    <v-icon>
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                  <v-btn color="transparent" v-if="item.type !== 'native'" x-small depressed right @click.stop="deleteCat(item)">
                    <v-icon>
                      mdi-close
                    </v-icon>
                  </v-btn>
                </v-row>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <!-- Categories Chips -->
        <template v-slot:selection="{ item, index }">
          <v-chip small v-if="index < 5">
            <span>{{ item.type === 'native' ? i18n(item.name) : item.name }}</span>
          </v-chip>
          <span
            v-if="index === 5"
            class="grey--text text-caption"
          >
            (+{{ selectedCats.length - index }} {{ i18n('list_cat_and_more') }} )
          </span>
        </template>
      </v-select>
    <!-- Delete Category Dialog -->
    <v-dialog v-model="deleteCatDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{i18n("list_cat_delete_title", catToDelete.name)}}</v-card-title>
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
        <v-card-title class="headline">{{i18n("list_cat_edit_title", catToEdit.name)}}</v-card-title>
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
      editCatDialog: false,
      catToEdit: { name: "" },
      updateCatName: "",
      deleteCatDialog: false, // display delete category dialog
      catToDelete: {}, // category to dele inside dialog
      selectedCats: this.categories.filter(c => c.state === 'include'),
      catList: this.categories
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
    },
    icon () {
      if (this.selectedCats.length === this.catList.length) return 'mdi-close-box'
      if (this.selectedCats.length) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    },
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    addCategory() {
      if(this.newCat.length) {
        this.$store.dispatch("addCategory", this.newCat);
        this.newCat = "";
        this.catList = this.categories
      }
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
      this.catList = this.categories
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
      this.catList = this.categories
    },
    reallyDeleteCat() {
      this.$store.dispatch("removeCategory", this.catToDelete.name);
      this.deleteCatDialog = false;
    },
    countUsed(cat) {
      return utils.countUsed(cat, this.$store.state.mangas.all);
    },
    toggleAllCats() {
      this.$nextTick(() => {
        if(this.selectedCats.length === this.catList.length) {
          this.selectedCats = []
        } else {
          this.selectedCats = this.catList.slice()
        }
      })
    },
    updateCategory(name, include = true) {
        this.$store.dispatch("updateCategory", {
          name: name,
          catstate: include ? 'include' : 'exclude'
        });
    },
  },
watch: {
  selectedCats: function (selectedCats)  {
    const catListName = this.catList.map(item=>item.name)
    const selectedCatsName = this.selectedCats.map(item=>item.name)

    if(selectedCatsName.length === catListName.length) {
      selectedCatsName.forEach(c => {
        this.updateCategory(c)
      })
      return
    }

    if(!selectedCats.length) {
      catListName.forEach(c => {
        this.updateCategory(c, false)
      })
      return
    }

    catListName.forEach(l => {
      if(selectedCats.includes(l)) {
        this.updateCategory(l)
      } else {
        this.updateCategory(l, false)
      }
    })
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
.v-badge__badge {
  font-size:8px!important;
  height: 10px!important;
  min-width: 10px!important;
  padding:1px 6px!important;
}

</style>
