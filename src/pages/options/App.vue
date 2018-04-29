<template>
	<v-app :dark="$store.state.options.dark === 1">
        <v-content>
            <Options />
        </v-content>
	</v-app>
</template>

<script>
import i18n from "../../amr/i18n";
import Options from "../components/Options";

export default {
  data() {
    return {};
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
  },
  name: "App",
  components: { Options }
};
</script>
<style>

</style>
