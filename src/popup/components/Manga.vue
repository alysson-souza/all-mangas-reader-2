<template>
    <!-- manga line, containing title, list of chapters and actions-->
    <v-layout row v-if="display && (!isInGroup || (isFirst || groupExpanded))">
      <!-- Title and icon -->
      <v-flex xs3 class="amr-list-elt">
      <v-card dark tile flat :color="color(3)" class="back-card">
        <v-card v-if="!isInGroup || isFirst" dark :color="color(0)" class="amr-manga-title-cont">
          <!-- Icon of the mirror if not in group -->
          <v-tooltip top content-class="icon-ttip">
            <img v-if="!isInGroup" :src="mirror.mirrorIcon" class="mirror-icon" slot="activator" /> 
            <span>{{mirror.mirrorName}}</span>
          </v-tooltip>
          <!-- + / - icon if group of mangas  -->
          <v-icon v-if="isInGroup && isFirst && !expanded" @click="emitExpand()">mdi-plus</v-icon>
          <v-icon v-if="isInGroup && isFirst && expanded" @click="emitExpand()">mdi-minus</v-icon>
          <strong>{{ manga.name }}</strong>
        </v-card>
      </v-card>
      </v-flex>
      <!-- List of chapters and progressbar-->
      <v-flex xs6 class="amr-list-elt">
      <v-card dark tile flat :color="color(3)" class="back-card amr-chapter-list-cont">
        <!-- List of chapters -->
        <!-- Icon of the mirror if in group -->
        <v-tooltip v-if="isInGroup" top content-class="icon-ttip" class="tip-icon-grouped">
          <img :src="mirror.mirrorIcon" class="mirror-icon grouped" slot="activator" /> 
          <span>{{mirror.mirrorName}}</span>
        </v-tooltip>
        <div v-if="manga.listChaps.length" class="amr-prog-cont">
          <div class="amr-select-wrapper">
            <select :value="manga.lastChapterReadURL" v-on:input="selChapter = $event.target.value" :class="color(2) + ' amr-chap-sel'" @change="playChap()">
              <option v-for="chap in chapsForSelect" :key="chap.value" :value="chap.value">{{chap.text}}</option>
            </select>
          </div>
          <!-- Reading progress -->
          <v-tooltip top content-class="icon-ttip">
            <v-progress-linear :value="progress" height="4" :color="color(-1)" slot="activator"></v-progress-linear>
            <span>Progression : {{Math.floor(progress)}} %</span>
          </v-tooltip>
        </div>
        <!-- Loading bar if chapters list is not loaded yet-->
        <v-progress-linear v-if="!manga.listChaps.length" :indeterminate="true" height="4" class="amr-manga-waiting"></v-progress-linear>
      </v-card>
      </v-flex>
      <!-- Actions -->
      <v-flex xs3 class="amr-list-elt" text-xs-center>
        <v-card  dark tile flat :color="color(3)" class="back-card">
          <v-card dark :color="color(0)" class="amr-manga-actions-cont">
            <!-- Mark as read -->
            <v-tooltip v-if="hasNew" top content-class="icon-ttip">
              <v-icon v-if="hasNew" slot="activator" @click="markAsRead()">mdi-eye</v-icon>
              <span>Mark last published chapter as read</span>
            </v-tooltip>
            <!-- Empty icon if all read -->
            <v-icon v-if="!hasNew" class="empty-icon"></v-icon> 
            <!-- Previous chapter -->
            <v-tooltip v-if="posInChapList < manga.listChaps.length - 1" top content-class="icon-ttip">
              <v-icon slot="activator" @click="play(-1)">mdi-chevron-left</v-icon>
              <span>Read previous chapter</span>
            </v-tooltip>
            <!-- Empty icon if no previous -->
            <v-icon v-if="posInChapList === manga.listChaps.length - 1" class="empty-icon"></v-icon> 
            <!-- Current chapter play -->
            <v-tooltip top content-class="icon-ttip">
              <v-icon slot="activator" @click="play(0)">mdi-play</v-icon>
              <span>Read current chapter</span>
            </v-tooltip>
            <!-- Next chapter play -->
            <v-tooltip v-if="posInChapList > 0" top content-class="icon-ttip">
              <v-icon slot="activator" @click="play(1)">mdi-chevron-right</v-icon>
              <span>Read next chapter</span>
            </v-tooltip>
            <!-- Empty icon if no next chapter -->
            <v-icon v-if="posInChapList <= 0" class="empty-icon"></v-icon> 
            <!-- Last chapter play -->
            <v-tooltip top content-class="icon-ttip">
              <v-icon slot="activator" @click="play(Infinity)">mdi-page-last</v-icon>
              <span>Read last published chapter</span>
            </v-tooltip>
            <!-- Delete manga -->
            <v-tooltip top content-class="icon-ttip">
              <v-icon slot="activator" @click="trash()">mdi-delete</v-icon>
              <span>Delete manga</span>
            </v-tooltip>
            <!-- Display details panel -->
            <v-icon v-if="isFirst" @click="$emit('details-click')">more_vert</v-icon>
            <!-- Empty icon if not first instead of details button -->
            <v-icon v-if="!isFirst" class="empty-icon"></v-icon> 
          </v-card>
        </v-card>
      </v-flex>
    </v-layout>
</template>

<script>
import { mapGetters } from "vuex";
import browser from "webextension-polyfill";
import * as utils from "../utils";

export default {
  data() {
    return {
      // current selected chapter
      selChapter: this.manga.lastChapterReadURL,
      // current state of other grouped mangas panel
      expanded: false
    };
  },
  // property to load the component with --> the manga it represents
  props: [
    // the manga to display
    "manga",
    // is part of a group of mangas
    "isInGroup",
    // if manga is first of the group
    "isFirst",
    // is the group currently expanded
    "groupExpanded"
  ],
  computed: {
    // AMR options
    options: function() {
      return this.$store.state.options;
    },
    categories: function() {
      return this.options.categoriesStates;
    },
    display: function() {
      return utils.displayFilterCats(this.manga, this.categories);
    },
    // determine if this manga has new published chapters
    hasNew: function() {
      return utils.hasNew(this.manga);
    },
    // determine if this manga has been read entirely
    hasBeenRead: function() {
      return utils.hasBeenRead(this.manga);
    },
    // mirror for current chapter
    mirror: function() {
      return this.$store.state.mirrors.all.find(
        mir => mir.mirrorName === this.manga.mirror
      );
    },
    // format chapters list to be displayed
    chapsForSelect: function() {
      return this.manga.listChaps.map(arr => {
        return { value: arr[1], text: arr[0] };
      });
    },
    // calculate reading progress
    progress: function() {
      return (1 - this.posInChapList / this.manga.listChaps.length) * 100;
    },
    // position of current chapter in chapters list
    posInChapList() {
      return this.manga.listChaps.findIndex(
        arr => arr[1] === this.manga.lastChapterReadURL
      );
    }
  },
  methods: {
    /**
     * Return the right color for this manga, depending if it updates (you can stop following udates for a manga), if it has unread chapters or not
     */
    color: function(light) {
      let lstr =
        light === 0
          ? ""
          : light < 0 ? " darken-" + -light : " lighten-" + light;
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
    /**
     * Click on + / - to expand reduce similar mangas
     */
    emitExpand: function() {
      this.expanded = !this.expanded;
      this.$emit("expand-group");
    },
    /**
     * Mark last chapter as read
     */
    markAsRead() {
      this.$store.dispatch("readManga", {
        url: this.manga.url,
        mirror: this.manga.mirror,
        lastChapterReadName: this.manga.listChaps[0][0],
        lastChapterReadURL: this.manga.listChaps[0][1],
        name: this.manga.name
      });
    },
    /**
     * Open a chapter in new tab
     */
    play(which) {
      let pos;
      if (which === Infinity) pos = 0;
      else {
        pos = this.posInChapList - which; // order of chapters is reversed
        if (pos < 0) pos = 0;
        else if (pos >= this.manga.listChaps.length)
          pos = this.manga.listChaps.length - 1;
      }
      browser.runtime.sendMessage({
        action: "opentab",
        url: this.manga.listChaps[pos][1]
      });
    },
    playChap() {
      browser.runtime.sendMessage({ action: "opentab", url: this.selChapter });
    },
    /**
     * Deletes a manga
     */
    trash() {
      //TODO
    }
  },
  // Name of the component
  name: "Manga",
  mount: function() {
    console.log(this.manga);
  }
};
</script>

<style lang="css" scoped>
* {
  font-size: 10pt;
}
.container.amr-list-line:first-child .row:first-child .flex:first-child > .card {
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
.container.amr-list-line .amr-list-elt .amr-chapter-list-cont {
  padding: 6px;
}
.amr-manga-title-cont,
.amr-manga-actions-cont {
  padding: 4px;
}
.amr-manga-actions-cont i,
.amr-manga-title-cont i {
  cursor: pointer;
  font-size: 18px;
}
.amr-manga-title-cont i {
  font-size: 16px;
}
.amr-manga-actions-cont i:hover {
  opacity: 0.6;
}
.empty-icon {
  width: 18px;
  height: 18x;
}
.mirror-icon {
  vertical-align: middle;
  padding-right: 2px;
  display: inline-block;
}
.back-card {
  height: 100% !important;
}

.progress-linear {
  margin: 0;
  margin-top: -1px;
}
/*Selects*/
.amr-select-wrapper {
  display: inline-block;
  position: relative;
  width: 100%;
}
select.amr-chap-sel {
  -moz-appearance: none;
  -webkit-appearance: none;
  -ms-appearance: none;
  display: inline-block;
  outline: none;
  border-style: none;
  width: 100%;
  border-top-left-radius: 2px !important;
  border-top-right-radius: 2px !important;
  position: relative;
  padding: 0px 4px;
}
.amr-select-wrapper:after {
  content: "▼";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  font-size: 75%;
  line-height: 19px;
  padding: 1px 5px;
  pointer-events: none;
  z-index: 1;
}

.amr-chapter-list-cont {
  overflow: auto;
}
.tip-icon-grouped {
  float: left;
  width: 20px;
  height: 20px;
}
.amr-prog-cont {
  margin-left: 0px;
}
.tip-icon-grouped + .amr-prog-cont {
  margin-left: 25px;
}
.amr-manga-waiting {
  margin-top: 7px;
}
.tip-icon-grouped + .amr-manga-waiting {
  margin-left: 25px;
  width: auto;
}
</style>