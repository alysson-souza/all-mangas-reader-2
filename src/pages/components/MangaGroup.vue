<!-- The prop "mangas" used to initialize this component is a list of manga objects with the same name : a manga read on multiple sites -->
<template>
  <div>
    <Manga 
      v-for="(manga, index) in group.mangas" 
      :key="index"
      :manga="manga"
      :is-in-group="group.mangas.length > 1" 
      :is-first="index == 0"
      :group-expanded="expanded"
      @expand-group="expanded = !expanded"
      @search-request="propagateSR"
    />
  </div>
</template>

<script>
import Manga from "./Manga";

export default {
  data() {
    return {
      // Is the full list expanded
      expanded: false,
    }
  },
  // property to load the component with --> a group of manga
  props: ["group"],
  components: { Manga },
  methods: {
    /**
     * Propagate search request event from MangaGroup to parent
     */
    propagateSR(str) {
      this.$emit("search-request", str)
    },
  },
  // Name of the component
  name: "MangaGroup"
}
</script>