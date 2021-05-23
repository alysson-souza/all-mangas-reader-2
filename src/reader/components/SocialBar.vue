<template>
  <v-row   class="amr-bottombar">
    <v-col class="text-center pa-2" cols="12">
      <!-- Always displayed links -->
      <v-tooltip top class="ml-1" v-for="(soc, i) in social_direct" :key="i">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon :color="soc.color" @click.stop="opentab(soc.url)">
            <v-icon>{{soc.icon}}</v-icon>
          </v-btn>
        </template>
        <span>{{i18n(soc.tooltip)}}</span>
      </v-tooltip>
      <v-menu offset-y top>
        <template v-slot:activator="{ on: menu }">
          <!-- Social buttons -->
          <v-tooltip top slot="activator" class="ml-1">
            <template v-slot:activator="{ on: tooltip }">
              <v-btn v-on="{ ...tooltip, ...menu}" icon>
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </template>
            <span>{{i18n("reader_social_all")}}</span>
          </v-tooltip>
        </template>
        <!-- List of social -->
        <v-list class="amr-social-list">
          <v-list-tile v-for="(soc, i) in social_shared" :key="i">
            <v-list-tile-content>
              <v-tooltip left class="ml-1">
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" icon :color="soc.color" @click="opentab(soc.url)">
                    <v-icon>{{soc.icon}}</v-icon>
                  </v-btn>
                </template>
                <span>{{i18n(soc.tooltip)}}</span>
              </v-tooltip>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
import {i18nmixin} from "../../mixins/i18n-mixin"
import browser from "webextension-polyfill";

export default {
    mixins: [i18nmixin],
    data() {
        return {
            social_direct: [
                { icon: "mdi-patreon", tooltip: "reader_social_patreon",
                    url: "https://www.patreon.com/allmangasreader", color: "deep-orange lighten-1"},
                { icon: "mdi-discord", tooltip: "reader_social_discord",
                    url: "https://discord.gg/bdzk9hR", color: "indigo lighten-2" }
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

<style data-amr="true">
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
