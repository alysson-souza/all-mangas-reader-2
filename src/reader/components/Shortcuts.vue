<template>
    <v-container class="pa-0">
        <v-row v-for="(item, i) in items" :key="i" class="amr-shortcut-line" dense>
            <v-col class="text-right" cols="4">
                <div class="amr-shortcut" v-for="(shortcut, s) in item.keys" :key="s">
                    <div class="amr-shortcut-key" v-for="(key, k) in shortcut" :key="k">
                        {{key}}
                    </div>
                </div>
            </v-col>
            <v-col cols="8">
                {{ i18n(item.i18n) }}
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {i18nmixin} from "../../mixins/i18n-mixin"

export default {
    mixins: [i18nmixin],
    props: {
        items: Array
    },
    name: "Shortcuts",
}
</script>

<style data-amr="true">
    .amr-shortcut-line {
        align-items: center;
        justify-content: center;
    }
    .amr-shortcut {
        display: inline-block;
        background-color: #aaa;
        padding: 2px 1px;
        border-radius: 2px;
        margin: 2px;
        line-height: 0;
    }
    .amr-shortcut-key {
        display: inline-block;
        background-color: #424242;
        color: white;
        font-size: 1.1rem;
        padding:2px 5px;
        min-width: 19px;
        border-radius: 2px;
        margin: 0px 1px;
        text-align: center;
        line-height: 1.5;
    }
</style>
