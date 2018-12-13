<template>
    <v-layout row wrap class="amr-bottombar">
        <v-flex xs12 text-xs-center pa-2>
            <!-- Always displayed links -->
            <v-tooltip top slot="activator" class="ml-1" v-for="(soc, i) in social_direct" :key="i">
                <v-btn slot="activator" icon :color="soc.color" @click.stop="opentab(soc.url)">
                    <v-icon>{{soc.icon}}</v-icon>
                </v-btn>
                <span>{{i18n(soc.tooltip)}}</span>
            </v-tooltip>
            <v-menu offset-y top>
                <!-- Social buttons -->
                <v-tooltip top slot="activator" class="ml-1">
                  <v-btn slot="activator" icon>
                      <v-icon>mdi-share-variant</v-icon>
                  </v-btn>
                  <span>{{i18n("reader_social_all")}}</span>
                </v-tooltip>
                <!-- List of social -->
                <v-list class="amr-social-list">
                    <v-list-tile v-for="(soc, i) in social_shared" :key="i">
                        <v-list-tile-content>
                            <v-tooltip left slot="activator" class="ml-1">
                                <v-btn slot="activator" icon :color="soc.color" @click="opentab(soc.url)">
                                    <v-icon>{{soc.icon}}</v-icon>
                                </v-btn>
                                <span>{{i18n(soc.tooltip)}}</span>
                            </v-tooltip>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </v-flex>
    </v-layout>
</template>

<script>
import {i18nmixin} from "../mixins/i18n-mixin"
import browser from "webextension-polyfill";

export default {
    mixins: [i18nmixin],
    data() {
        return {
            social_direct: [
                { icon: "mdi-patreon", tooltip: "reader_social_patreon", 
                    url: "https://www.patreon.com/allmangasreader", color: "deep-orange--text text--lighten-1"},
                { icon: "mdi-discord", tooltip: "reader_social_discord", 
                    url: "https://discord.gg/bdzk9hR", color: "indigo--text text--lighten-2" }
            ],
            social_shared: [
                { icon: "mdi-facebook", tooltip: "reader_social_facebook", 
                    url: "https://www.facebook.com/allmangasreader/", color: "blue darken-3" },
                { icon: "mdi-twitter", tooltip: "reader_social_twitter", 
                    url: "https://twitter.com/AllMangasReader", color: "light-blue" }
            ]
        }
    },
    methods: {
        opentab(url) {
            browser.runtime.sendMessage({ action: "opentab", url: url })
        }
    }
}
</script>

<style>
    .amr-bottombar {
        position: fixed;
        width: 300px;
        bottom: 0;
        right: 0;
        z-index:7;
        background-color: #212121;
    }
    .theme--light .amr-bottombar {
        background-color: #f5f5f5;
    }
    .amr-social-list .v-list__tile {
        padding: 0px 3px;
    }
</style>
