<template>
  <v-container fluid class="amr-list-line">
    <v-layout row>
		<v-flex xs3 class="amr-list-elt">
		<v-card dark tile flat :color="color(3)" class="back-card">
			<v-card dark :color="color(0)" class="amr-manga-title-cont">
				<img :src="mirror.mirrorIcon" class="mirror-icon" /> 
				<strong>{{ manga.name }}</strong>
			</v-card>
		</v-card>
		</v-flex>
		<v-flex xs6 class="amr-list-elt">
		<v-card dark tile flat :color="color(3)" class="back-card amr-chapter-list-cont">
			<!--<v-select dense :items="chapsForSelect" v-model="chapter"></v-select>-->
			<select v-if="manga.listChaps.length" :value="manga.lastChapterReadURL" :class="color(2)">
				<option v-for="chap in chapsForSelect" :key="chap.value" :value="chap.value">{{chap.text}}</option>
			</select>
			<v-tooltip top v-if="manga.listChaps.length">
				<v-progress-linear :value="progress" height="3" :color="color(-1)" slot="activator"></v-progress-linear>
				<span>Progression : {{Math.floor(progress)}} %</span>
			</v-tooltip>
      <span v-if="!manga.listChaps.length">Waiting...</span>
		</v-card>
		</v-flex>
		<v-flex xs3 class="amr-list-elt" text-xs-center>
			<v-card  dark tile flat :color="color(3)" class="back-card">
				<v-card dark :color="color(0)" class="amr-manga-actions-cont">
					<v-icon v-if="hasNew" @click='resetManga(manga.url)'>mdi-eye</v-icon>
					<v-icon v-if="!hasNew" class="empty-icon"></v-icon> 
					<v-icon>mdi-chevron-left</v-icon>
					<v-icon>mdi-play</v-icon>
					<v-icon>mdi-chevron-right</v-icon>
					<v-icon>mdi-page-last</v-icon>
					<v-icon>mdi-delete</v-icon>
					<v-icon @click="details = !details">more_vert</v-icon>
				</v-card>
			</v-card>
		</v-flex>
	</v-layout>
	<v-layout row v-if="details">
		<v-flex xs12 class="amr-details">
			<v-card dark tile flat :color="color(3)" class="back-card">
				Details
			</v-card>
		</v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      details: false
    };
  },
  props: ["manga"],
  computed: {
    options: () => this.$store.state.options,
    hasNew: function() {
      return (
        this.manga.read === 0 &&
        (this.manga.listChaps.length &&
          this.manga.lastChapterReadURL !== this.manga.listChaps[0][1])
      );
    },
    mirror: function() {
      return this.$store.state.mirrors.all.find(
        mir => mir.mirrorName === this.manga.mirror
      );
    },
    chapsForSelect: function() {
      return this.manga.listChaps.map(arr => {
        return { value: arr[1], text: arr[0] };
      });
    },
    progress: function() {
      return (
        (1 -
          this.manga.listChaps.findIndex(
            arr => arr[1] === this.manga.lastChapterReadURL
          ) /
            this.manga.listChaps.length) *
        100
      );
    }
  },
  methods: {
    color: function(light) {
      let lstr =
        light === 0 ? "" : light < 0 ? " darken-" + -light : " lighten-" + light;
      if (this.manga.read !== 0) return "blue-grey" + lstr;
      else if (
        this.manga.listChaps.length &&
        this.manga.lastChapterReadURL !== this.manga.listChaps[0][1]
      ) {
        return "green" + lstr;
      } else {
        return "blue" + lstr;
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
.container.amr-list-line:first-child
  .row:first-child
  .flex:first-child
  > .card {
  border-top-left-radius: 5px;
}
.container.amr-list-line:first-child .row:first-child .flex:last-child > .card {
  border-top-right-radius: 5px;
}
.container.amr-list-line:last-child .row:last-child .flex:first-child > .card {
  border-bottom-left-radius: 5px;
}
.container.amr-list-line:last-child .row:last-child .flex:last-child > .card {
  border-bottom-right-radius: 5px;
}
.container.amr-list-line .amr-list-elt > .card {
  padding: 4px;
}
.amr-manga-title-cont,
.amr-manga-actions-cont {
  padding: 4px;
}
.amr-manga-actions-cont i {
  cursor: pointer;
  font-size: 18px;
}
.amr-manga-actions-cont i:hover {
	opacity: 0.6;
}
.container.amr-list-line .amr-list-elt .amr-chapter-list-cont {
  padding: 8px;
}
.empty-icon {
  width: 13px;
}
.mirror-icon {
  vertical-align: middle;
  padding-right: 2px;
}
.back-card {
  height: 100% !important;
}

/*Selects*/
select {
  -moz-appearance: menulist;
  -webkit-appearance: menulist;
  background-color: solid;
  border-style: none;
  width: 100%;
  border-top-left-radius: 2px !important;
  border-top-right-radius: 2px !important;
}
.progress-linear {
  margin: 0;
  margin-top: -1px;
}
/*
.amr-chapter-list-cont > .input-group {
	padding: 0;
}
.input-group__details, .input-group__input {
	min-height: auto!important;
}
.input-group__selections__comma {
	font-size: 14px;
    height: 20px;
}
*/
</style>