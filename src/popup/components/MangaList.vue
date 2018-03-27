<template>
    <div>
        <Manga v-for="manga in allMangas" v-bind:key="manga.url" :manga="manga"></Manga>
        <div v-if="!allMangas">
            <p>
                No manga in your list. Check the filters above or add mangas to the list. 
To add a manga in the reading list, just go read a manga on a site supported by All Mangas Reader. Each manga you are reading is added or updated in the All Mangas Reader reading list. You can start reading a manga by searching one here.
            </p>
        </div>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import Manga from './Manga'

export default {
	data() {return {}},
	computed: {
		...mapGetters(["countMangas", "allMangas"])
	},
    name: "MangaList",
    components: { Manga },
	created() {
		// initialize state for store in popup from background
		this.$store.dispatch("getStateFromReference", {
			module: "mangas",
			key: "all",
			mutation: "setMangas"
		});
	}
};
</script>