<template>
    <div>
        <div v-if="allMangas.length" class="amr-mangas">
            <Manga v-for="manga in allMangas" v-bind:key="manga.url" :manga="manga"></Manga>
        </div>
        <div v-if="!allMangas.length" class="amr-nomangas">
            <p>
                <strong>No manga in your list</strong>. Check the filters above or add mangas to the list. 
To add a manga in the reading list, just go read a manga on a site supported by All Mangas Reader. Each manga you are reading is added or updated in the All Mangas Reader reading list. You can start reading a manga by searching one using the <v-icon>mdi-magnify</v-icon>.
            </p>
            <p>
                <a @click.prevent="importSamples()">Start immediately by importing a few mangas we recommend !</a>
            </p>
        </div>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import Manga from './Manga'
import browser from "webextension-polyfill";

export default {
	data() {return {}},
	computed: {
		...mapGetters(["countMangas", "allMangas"])
	},
    name: "MangaList",
    components: { Manga },
    methods: {
        importSamples() {
            // we don't do this.$store.dispatch("importSamples"); because to load list of chapters, implementations rely on jQuery, which is not loaded in pages, rely on background page to do so
            browser.runtime.sendMessage({ action: "importSamples" })
        }
    },
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
<style>
    .amr-nomangas {
        padding:20px;
        text-align: center;
    }
    .amr-mangas {
        max-height: 350px;
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>
