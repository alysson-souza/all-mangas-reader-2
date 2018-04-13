<template>
    <v-container fluid>
        <v-layout row>
            <div class="mirrors-cont">
                <SearchMirror v-for="ws in activatedWebsites" :key="ws.mirrorName" :mirror="ws" :search-phrase="search" @add-mangas="addMangas" />
            </div>
        </v-layout>
        <v-layout row>
            <v-flex xs4 offset-xs2>
                <v-text-field v-model="searchwrite" @keyup.enter="search = searchwrite" />
            </v-flex>
            <v-flex xs4>
                <v-btn color="primary" @click="search = searchwrite" small>{{i18n("search_button")}}</v-btn>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-container fluid>
                <v-layout row v-for="res in results" :key="res.url">
                    {{res.name}} ({{res.mirror}})
                </v-layout>
            </v-container>
        </v-layout>
    </v-container>
</template>

<script>
import i18n from "../../amr/i18n";
import SearchMirror from "./SearchMirror";

export default {
    data() {
        return {
            searchwrite: "",
            search: "",
            results: []
        };
    },
    computed: {
        activatedWebsites() {
            return this.$store.state.mirrors.all
                .filter(mir => mir.activated)
        }
    },
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        addMangas(mgs) {
            this.results.push(...mgs);
        }
    },
    name: "Search",
    components: { SearchMirror }
}
</script>
<style>
.mirrors-cont {
    margin: auto;
}
</style>

