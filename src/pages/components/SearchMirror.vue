<template>
    <div class="mirror-search">
        <v-progress-circular v-if="searching" indeterminate :width="3" color="primary" class="mirror-progress"></v-progress-circular>
        <img :src="mirror.mirrorIcon" :class="'mirror-search-icon ' + (disabled ? 'disabled': '')" @click.stop="disabled = !disabled" />
    </div>
</template>

<script>
import browser from "webextension-polyfill";
import i18n from "../../amr/i18n";

export default {
    data() {
        return {
            searching: false, // currently searching
            disabled: false // is disabled in search
        };
    },
    props: [
        "mirror", // the mirror to search on
        "search-phrase", // phrase to search
    ],
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        async search() {
            this.searching = true;
            let mgs = await browser.runtime.sendMessage({
                action: "searchList", 
                mirror: this.mirror.mirrorName,
                search: this.searchPhrase
            });
            this.$emit("add-mangas", mgs);
            this.searching = false;
        }
    },
    watch: {
        "searchPhrase": function() {
            this.search();
        }
    },
    name: "SearchMirror",
}
</script>
<style>
.mirror-search {
    display : inline-block;
    margin: 5px;
    position:relative;
    width: 32px;
    height: 32px;
}
.mirror-progress {
    position: absolute;
    left: 0;
    top: 0;
}
.mirror-search-icon {
    position: absolute;
    top: 8px;
    left: 8px;
    cursor: pointer;
}
.mirror-search-icon.disabled {
    opacity: 0.3;
}
</style>

