<!-- The prop "mangas" used to initialize this component is a list of manga objects with the same name : a manga read on multiple sites -->
<template>
  <div>
    <Manga 
      v-for="(manga, index) in group.mangas" 
      :key="manga.key"
      :manga="manga"
      :is-in-group="group.mangas.length > 1" 
      :is-first="index == 0"
      :group-index="groupIndex"
      :group-expanded="expanded"
      @expand-group="expanded = !expanded"
      @search-request="propagateSR"
      @rename-manga="renameManga"
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
  props: ["group", "groupIndex"],
  components: { Manga },
  methods: {
    /**
     * Propagate search request event from MangaGroup to parent
     */
    propagateSR(str) {
      this.$emit("search-request", str)
    },
    /** 
     * Emit the event for renaming this manga
     */
    renameManga(manga) {
      this.$emit('rename-manga', manga)
    }
  },
  // Name of the component
  name: "MangaGroup"
}
</script>