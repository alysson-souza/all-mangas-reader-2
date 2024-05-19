<template>
    <div>
        <br /><br /><br />
        <v-container>
            <v-row>
                <v-col cols="2">
                    <v-select
                        v-model="selectedVersion"
                        :items="versionLabels"
                        item-text="title"
                        item-value="index"
                        solo>
                    </v-select>
                </v-col>
                <v-col cols="10" v-show="versionEntries">
                    <v-card v-for="(value, key) in versionEntries" :key="key" class="my-4" outlined elevation="3">
                        <v-card-title class="primary--text">{{ key }}</v-card-title>
                        <v-card-text>
                            <v-list dense>
                                <v-list-item v-for="(item, i) in value" :key="i"> * {{ item }} </v-list-item>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <v-container v-if="selectedVersion !== null">
            <v-row v-if="versionEntries.New_Mirrors"> </v-row>
        </v-container>
    </div>
</template>

<script>
import i18n from "../../amr/i18n"
import { default as log } from "../../../changelog.json"

export default {
    data() {
        return {
            selectedVersion: log.versions.length > 0 ? 0 : undefined
        }
    },
    computed: {
        versionEntries: function () {
            let t = log.versions[this.selectedVersion].parsed
            delete t._
            return t
        },
        versionLabels: function () {
            return log.versions.map((e, i) => {
                return {
                    index: i,
                    title:
                        e.version == null
                            ? e.title == "[Unreleased]"
                                ? this.i18n("change_log_beta_title")
                                : e.title
                            : e.version
                }
            })
        }
    },
    methods: {
        i18n: (message, ...args) => i18n(message, ...args)
    }
}
</script>
