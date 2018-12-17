<template>
    <v-container grid-list-md pa-0>
        <v-layout row wrap v-for="(item, i) in items" :key="i" class="amr-shortcut-line">
            <v-flex xs4 text-xs-right>
                <div class="amr-shortcut" v-for="(shortcut, s) in item.keys" :key="s">
                    <div class="amr-shortcut-key" v-for="(key, k) in shortcut" :key="k">
                        {{key}}
                    </div>
                </div>
            </v-flex>
            <v-flex xs8>
                {{ i18n(item.i18n) }}
            </v-flex>
        </v-layout>
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

<style>
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
        font-size: 12px;
        padding:2px 5px;
        min-width: 19px;
        border-radius: 2px;
        margin: 0px 1px;
        text-align: center;
        line-height: 1.5;
    }
</style>
