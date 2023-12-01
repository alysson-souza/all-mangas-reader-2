<template>
    <v-app>
        <v-app-bar app max-height="64">
            <img src="/icons/icon_32.png" alt="All Mangas Reader" style="padding-right: 50px" />
            <v-toolbar-title>{{ title }}</v-toolbar-title>
        </v-app-bar>
        <v-main>
            <v-container fluid>
                <!-- Before the permissions are loaded -->
                <v-row v-if="!loaded">
                    <v-col>
                        <div class="amr-loader">
                            <v-progress-circular
                                indeterminate
                                :width="4"
                                :size="50"
                                color="red darken-2"></v-progress-circular>
                        </div>
                    </v-col>
                </v-row>
                <!-- Once loaded -->
                <div v-if="loaded">
                    <v-row>
                        <v-col>
                            <v-card elevation="2" outlined v-if="hasPermissions">
                                <v-card-text>
                                    <v-icon right color="green">mdi-check-decagram</v-icon>
                                    <span>{{ i18n("permissions_host_message_enabled") }} </span>
                                </v-card-text>
                            </v-card>
                            <v-card elevation="2" outlined v-else>
                                <v-card-text>
                                    <v-icon right color="red">mdi-alert-circle-outline</v-icon>
                                    <span>{{ i18n("permissions_host_message_disabled") }}</span>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col v-if="!hasPermissions">
                            <v-btn @click.stop="requestPermissions()">
                                <span>{{ i18n("permissions_host_message_button") }}</span>
                                <v-icon right>mdi-check-decagram-outline</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import i18n from "../../amr/i18n"
import browser from "webextension-polyfill"
import { host_permissions } from "../../constants/required_permissions"

export default {
    data() {
        return {
            loaded: false,
            hasPermissions: false,
            title: ""
        }
    },
    async created() {
        document.title = this.title = i18n("page_permissions_title")
        this.hasPermission = await browser.permissions.contains(host_permissions)
        this.loaded = true
    },
    methods: {
        i18n: (message, ...args) => i18n(message, ...args),
        requestPermissions: async function () {
            const response = await browser.permissions.request(host_permissions)
            if (response) this.hasPermissions = true
        }
    },
    name: "App"
}
</script>
<style data-amr="true">
.amr-loader {
    margin: 20px;
    text-align: center;
    width: 100%;
}
</style>
