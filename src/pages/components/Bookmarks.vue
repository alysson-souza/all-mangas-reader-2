<template>
    <v-container fluid grid-list-lg>
        <v-layout row wrap>
            <v-flex xs12 sm6 lg4 v-for="bm in bookmarkList" :key="bm.key">
                <v-card tile>
                    <v-card-media v-if="bm.type == 'scan'"
                    :src="bm.scanUrl"
                    height="300px"
                    >
                    </v-card-media>

                    <v-card-title primary-title>
                    <div>
                        <div class="headline">{{bm.name}} - {{bm.chapName}}</div>
                        <span class="grey--text">{{bm.note}}</span>
                    </div>
                    </v-card-title>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
export default {
  data() {
    return {};
  },
  props: ["bookmarkList"],
  name: "Bookmarks",
};
</script>
