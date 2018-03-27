<template>
  <v-container fluid class="amr-list-line">
    <v-layout row>
    <v-flex xs3 class="amr-list-elt">
        <v-card dark tile flat :color="color(true)">
            <v-card dark :color="color(false)" class="amr-manga-title-cont">
                <strong>{{ manga.name }}</strong>
            </v-card>
        </v-card>
    </v-flex>
    <v-flex xs6 class="amr-list-elt">
        <v-card  dark tile flat  :color="color(true)" class="amr-chapter-list-cont">
            {{ manga.lastChapterReadName }}
        </v-card>
    </v-flex>
    <v-flex xs3 class="amr-list-elt" text-xs-center>
        <v-card  dark tile flat :color="color(true)">
            <v-card dark :color="color(false)" class="amr-manga-actions-cont">
                <v-icon small @click='resetManga(manga.url)'>mdi-eye</v-icon>
                <v-icon small>mdi-chevron-left</v-icon>
                <v-icon small color="green lighter-3">mdi-play-circle</v-icon>
                <v-icon small>mdi-chevron-right</v-icon>
                <v-icon small>mdi-page-last</v-icon>
                <v-icon small>mdi-delete</v-icon>
                <v-icon small>more_vert</v-icon>
            </v-card>
        </v-card>
    </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  props: ["manga"],
  methods: {
    color: function(light) {
      if (this.manga.read !== 0) return light ? "blue-grey" : "blue-grey darken-1";
      else if (this.manga.listChaps && this.manga.lastChapterReadURL !== this.manga.listChaps[0][1]) {
        return light ? "green lighten-1" : "green darken-2";
      } else {
        return light ? "blue lighten-1" : "blue darken-2";
      }
    },
    resetManga(url) {
      this.$store.dispatch("resetManga", { url: url });
    }
  },
  name: "Manga"
};
</script>

<style lang="css" scoped>
* {
  font-size: 10pt;
}
.container.amr-list-line {
  padding: 0px 10px;
}
.container.amr-list-line:first-child {
  padding-top: 10px;
}
.container.amr-list-line:last-child {
  padding-bottom: 10px;
}
.container.amr-list-line:first-child .amr-list-elt:first-child > .card {
  border-top-left-radius: 5px;
}
.container.amr-list-line:first-child .amr-list-elt:last-child > .card {
  border-top-right-radius: 5px;
}
.container.amr-list-line:last-child .amr-list-elt:first-child > .card {
  border-bottom-left-radius: 5px;
}
.container.amr-list-line:last-child .amr-list-elt:last-child > .card {
  border-bottom-right-radius: 5px;
}
.container.amr-list-line .amr-list-elt > .card {
  padding: 4px;
}
.amr-manga-title-cont, .amr-manga-actions-cont{
  padding: 4px;
}
.container.amr-list-line .amr-list-elt .amr-chapter-list-cont {
  padding: 8px;
}
</style>