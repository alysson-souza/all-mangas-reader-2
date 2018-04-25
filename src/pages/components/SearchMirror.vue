<template>
    <v-tooltip top>
        <div class="mirror-search" slot="activator">
            <v-progress-circular v-if="searching" indeterminate :width="3" color="primary" class="mirror-progress"></v-progress-circular>
            <img :src="mirror.mirrorIcon" :class="'mirror-search-icon ' + (disabled ? 'disabled': '')" @click.stop="disabled = !disabled" />
        </div>
        <span v-if="disabled">{{i18n('search_mirror_enable', mirror.mirrorName)}}</span>
        <span v-else>{{i18n('search_mirror_disable', mirror.mirrorName)}}</span>
    </v-tooltip>
</template>

<script>
import browser from "webextension-polyfill";
import i18n from "../../amr/i18n";

export default {
    data() {
        return {
            searching: false, // currently searching
            disabled: localStorage["s." + this.mirror.mirrorName + ".disabled"] ? true : false // is disabled in search
        };
    },
    props: [
        "mirror", // the mirror to search on
        "search-phrase", // phrase to search
    ],
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        async search() {
            if (this.disabled) return;
            this.searching = true;
            let searchinit = this.searchPhrase;
            let mgs = await browser.runtime.sendMessage({
                action: "searchList", 
                mirror: this.mirror.mirrorName,
                search: searchinit
            });
            this.$emit("add-mangas", mgs, searchinit);
            this.searching = false;
        }
    },
    watch: {
        "searchPhrase": function() {
            this.search();
        },
        disabled: function(nv) {
            if (nv) {
                localStorage.setItem("s." + this.mirror.mirrorName + ".disabled", true);
            } else {
                localStorage.removeItem("s." + this.mirror.mirrorName + ".disabled");
            }
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

