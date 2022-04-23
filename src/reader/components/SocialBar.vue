<template>
    <v-row class="amr-bottombar">
        <v-col class="text-center pa-2" cols="12">
            <!-- Always displayed links -->
            <v-tooltip top class="ml-1" v-for="(soc, i) in social_direct" :key="i">
                <template v-slot:activator="{ on }">
                    <v-btn v-on="on" icon :color="soc.color" @click.stop="opentab(soc.url)">
                        <v-icon>{{ soc.icon }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ i18n(soc.tooltip) }}</span>
            </v-tooltip>
            <v-menu offset-y top>
                <template v-slot:activator="{ on: menu }">
                    <!-- Social buttons -->
                    <v-tooltip top slot="activator" class="ml-1">
                        <template v-slot:activator="{ on: tooltip }">
                            <v-btn v-on="{ ...tooltip, ...menu }" icon>
                                <v-icon>{{ mdiShareVariant }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ i18n("reader_social_all") }}</span>
                    </v-tooltip>
                </template>
                <!-- List of social -->
                <v-list class="amr-social-list">
                    <v-list-item v-for="(soc, i) in social_shared" :key="i">
                        <v-list-item-content>
                            <v-tooltip left class="ml-1">
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on" icon :color="soc.color" @click="opentab(soc.url)">
                                        <v-icon>{{ soc.icon }}</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ i18n(soc.tooltip) }}</span>
                            </v-tooltip>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-col>
    </v-row>
</template>

<script>
import { i18nmixin } from "../../mixins/i18n-mixin"
import browser from "webextension-polyfill"
import { mdiShareVariant, mdiPatreon, mdiDiscord, mdiFacebook, mdiTwitter } from "@mdi/js"

export default {
    mixins: [i18nmixin],
    data() {
        return {
            social_direct: [
                {
                    icon: mdiPatreon,
                    tooltip: "reader_social_patreon",
                    url: "https://www.patreon.com/allmangasreader",
                    color: "deep-orange lighten-1"
                },
                {
                    icon: mdiDiscord,
                    tooltip: "reader_social_discord",
                    url: "https://discord.gg/bdzk9hR",
                    color: "indigo lighten-2"
                }
            ],
            social_shared: [
                {
                    icon: mdiFacebook,
                    tooltip: "reader_social_facebook",
                    url: "https://www.facebook.com/allmangasreader/",
                    color: "blue darken-3"
                },
                {
                    icon: mdiTwitter,
                    tooltip: "reader_social_twitter",
                    url: "https://twitter.com/AllMangasReader",
                    color: "light-blue"
                }
            ],
            mdiShareVariant
        }
    },
    methods: {
        opentab(url) {
            browser.runtime.sendMessage({ action: "opentab", url: url })
        }
    }
}
</script>

<style data-amr="true">
.amr-bottombar {
    position: fixed;
    width: 300px;
    bottom: 0;
    right: 0;
    z-index: 7;
    background-color: #212121;
}
.theme--light .amr-bottombar {
    background-color: #f5f5f5;
}
.amr-social-list .v-list__tile {
    padding: 0px 3px;
}
</style>
