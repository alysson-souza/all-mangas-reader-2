<template>
  <div class="cat-cont">
      <div v-for="(cat, key) in categories" 
        :class="'cat-chip ' + cat.state" 
        :key="key"
        @click="switchState(cat)">
        <v-tooltip top content-class="icon-ttip" class="cat-name">
          <span class="cat-name" slot="activator">{{cat.name}}</span>
          <span v-if="cat.state==='include'">Mangas from category "{{cat.name}}" are <strong>included</strong> in the list</span>
          <span v-if="cat.state==='exclude'">Mangas from category "{{cat.name}}" are <strong>excluded</strong> in the list</span>
          <span v-if="!cat.state">Do not care about category "{{cat.name}}" to filter mangas</span>
        </v-tooltip>
          <v-icon class="cat-act" @click.stop="onlyMe(cat)">mdi-eye</v-icon>
          <v-icon v-if="cat.type !== 'native'" class="cat-act" @click.stop="deleteCat(cat)">mdi-close</v-icon>
      </div>
      <input type="text" v-model="newCat" placeholder="Add category" class="cat-add"
        @keyup.enter="addCategory()" />
  </div>
</template>
<script>
export default {
  data() {
    return {
      newCat: ""
    };
  },
  props: [
    // categories to display in the list
    "categories"
  ],
  methods: {
    switchState(cat) {
      let nstate = "";
      if (cat.state === "include") nstate = "exclude";
      else if (cat.state === "exclude") nstate = "";
      else if (!cat.state || cat.state === "") nstate = "include";
      this.$store.dispatch("updateCategory", { name: cat.name, catstate: nstate });
    },
    addCategory() {
      this.$store.dispatch("addCategory", this.newCat);
      this.newCat = "";
    },
    deleteCat(cat) {
      this.$store.dispatch("removeCategory", cat.name);
    },
    onlyMe(cat) {
      for (let c of this.categories) {
        if (c.name === cat.name) {
            this.$store.dispatch("updateCategory", { name: c.name, catstate: "include" });
        } else {
            this.$store.dispatch("updateCategory", { name: c.name, catstate: "" });
        }
      }
    }
  },
  name: "Categories"
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
}
.cat-act {
  font-size: 12px;
  cursor: pointer;
}
.cat-act:hover {
    opacity:0.6;
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
}
.cat-chip.include {
  background: #e0e0e0;
}
.cat-chip.exclude {
  background: #e0e0e0;
}
.cat-chip.exclude .cat-name {
  text-decoration: line-through;
}
</style>


