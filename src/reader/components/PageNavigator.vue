<template>
  <v-row class="amr-page-next-prev">
    <v-col class="my-2" cols="12">
      <v-toolbar flat>
        <!-- Backward button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-show="showBackwardButton" v-on="on" class="btn-huge" icon @click.stop="goPreviousScan">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </template>
          <span>{{ i18n(shouldInvertKeys ? "reader_go_next_scan" : "reader_go_previous_scan") }}</span>
        </v-tooltip>
        <!-- Current scan infos -->
        <div class="title">{{
            i18n("reader_page_progression", currentPage + 1, pages.length, pages.length > 0 ?
                Math.floor((currentPage + 1) / pages.length * 100) : 0)
          }}
        </div>
        <!-- Forward button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-show="showForwardButton" v-on="on" class="btn-huge" icon @click.stop="goNextScan">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </template>
          <span>{{ i18n(shouldInvertKeys ? "reader_go_previous_scan" : "reader_go_next_scan") }}</span>
        </v-tooltip>
      </v-toolbar>
    </v-col>
  </v-row>
</template>
<script>
export default {
  name: 'PageNavigator',
  props: {
    currentPage: {},
    firstScan: Boolean,
    goNextScan: Function,
    goPreviousScan: Function,
    i18n: Function,
    lastScan: Boolean,
    pages: Array,
    shouldInvertKeys: Boolean
  },
  computed: {
    showBackwardButton() {
      return this.shouldInvertKeys ? !this.lastScan : !this.firstScan;
    },
    showForwardButton() {
      return this.shouldInvertKeys ? !this.firstScan : !this.lastScan;
    }
  }
}
</script>
<style data-amr="true">
/** Pages navigator */
.amr-page-next-prev {
  max-width: 400px;
  margin: 0px auto !important;
}

.amr-page-next-prev .title {
  margin: 0px auto;
}
</style>
