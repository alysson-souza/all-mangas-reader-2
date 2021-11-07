<!-- The prop "mangas" used to initialize this component is a list of manga objects with the same name : a manga read on multiple sites -->
<template>
  <div class="mx-3">
    <MangaGroup
      v-for="(group, index) in groups"
      :key="index"
      :group="group"
      :group-index="index"
      @search-request="propagateSR"
      @rename-manga="renameManga"
    />
  </div>
</template>

<script>
import MangaGroup from "./MangaGroup";

export default {
  // property to load the component with --> a group of manga
  props: ["groups"],
  components: { MangaGroup },
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
  name: "SimpleList"
}
</script>
