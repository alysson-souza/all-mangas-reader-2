<template>
	<v-app :dark="$store.state.options.dark === 1">
		<v-toolbar app>
			<img src="/icons/icon_32.png" alt="All Mangas Reader">
			<v-toolbar-title v-text="title"></v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn icon @click.stop="options = true">
				<v-icon>mdi-settings</v-icon>
			</v-btn>
		</v-toolbar>
		<v-content>
            <v-container fluid>
                <div class="headline">Select the mirror to test : </div>
                <v-layout row>
                <v-flex xs6>
                    <v-layout row>
                    <v-flex xs3>
                        <v-subheader>Mirrors : </v-subheader>
                    </v-flex>
                    <v-flex xs9>
                        <v-select v-model="current" :items="mirrors" item-value="mirrorName" item-text="mirrorName">
                        </v-select>
                    </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs6>
                    <v-layout>
                    <v-flex xs4>
                        <v-subheader>Search field : </v-subheader>
                    </v-flex>
                    <v-flex xs8>
                        <v-text-field v-model="search"></v-text-field>
                    </v-flex>
                    </v-layout>
                </v-flex>
                </v-layout>
                <v-layout row>
                <v-flex xs12>
                    <v-btn  
                        :loading="loadingTests" 
                        :disabled="loadingTests" 
                        color="primary" 
                        @click="loadTests()">Load tests</v-btn>
                    <v-btn  
                        :loading="loadingMirrors" 
                        :disabled="loadingMirrors" 
                        color="primary" 
                        @click="reloadMirrors()">Reload mirrors</v-btn>
                </v-flex>
                </v-layout>
                <div class="headline mt-4" v-if="testsResults.length > 0 ">Course of tests</div>
                <!-- Display tests -->
                <v-layout row v-if="index < currentTest && testsResults.length > index" v-for="(test, index) in tests" :key="index" :class="'ma-4 pa-4 elevation-1 lighten-5 ' + (testsResults[index].passed ? 'green' : 'red')">
                    <v-flex xs3>
                        <v-icon v-if="testsResults[index].passed" color="green">mdi-check</v-icon>
                        <v-icon v-else color="red">mdi-alert-circle</v-icon>
                        <span><strong>Test {{test.name}}</strong></span>
                    </v-flex>
                    <v-flex xs6>
                        <div v-for="(res, index) in testsResults[index].results" :key="index">
                            <span v-html="res"></span>
                        </div>
                        <div v-if="test.output">

                        </div>
                    </v-flex>
                    <v-flex xs3>
                        {{test.comment}}
                    </v-flex>
                </v-layout>


            </v-container>
		</v-content>
		<v-dialog
			v-model="options"
			fullscreen
			transition="dialog-bottom-transition"
			:overlay="false"
			scrollable
			>
        <v-card tile>
          <v-toolbar card dark color="primary">
            <v-btn icon @click.native="options = false" dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Settings</v-toolbar-title>
          </v-toolbar>
          <Options />
        </v-card>
	</v-dialog>
	</v-app>
</template>

<script>
import Options from "../components/Options";
import browser from "webextension-polyfill";

export default {
  data() {
    return {
      title: "All Mangas Reader Lab",
      options: false, 
      loadingMirrors: false,
      loadingTests: false,
      current: "Manga Reader", // current selected mirror
      search: "", // current search phrase
      tests: [
          {
              name: "implementation attributes",
              tests: ["mirrorName", "mirrorLanguages", "mirrorIcon", "mirrorWebSites"]
          }, 
          {
              name: "search mangas", 
              tests: ["searchMangas"],
              output: "list"
          }
      ], 
      testsResults: [],
      currentTest: 0, //current test, display all tests before
    };
  },
  computed: {
      mirrors() {
          return this.$store.state.mirrors.all
      }
  },
  name: "App",
  components: { Options },
  created() {
    // initialize state for store in popup from background
    this.$store.dispatch("getStateFromReference", {
      module: "mirrors",
      key: "all",
      mutation: "setMirrors"
    });
  }, 
  methods: {
      async reloadMirrors() {
        this.loadingMirrors = true;
        await this.$store.dispatch("updateMirrorsLists");
        this.loadingMirrors = false;
      }, 
      async loadTests() {
          this.testsResults = [];
          this.currentTest = 0;
          let mirror = this.mirrors.find(mir => mir.mirrorName === this.current);
          let prevres;
          for (let test of this.tests) {
              let passed = true;
              let results = [];
              let output;
              for (let unit of test.tests) {
                  let isok, text, res;
                  try {
                      [isok, text, res] = await this[unit](mirror, prevres);
                  } catch (e) {
                      isok = false;
                      text = "<span style='color:red'>" + e.message + "</span>";
                  }
                  if (test.output === "list") {
                      if (res && res.length) {
                          output = res;
                          passed = isok;
                      } else {
                          passed = false;
                      }
                  } else {
                      passed &= isok;
                  }
                  if (!passed) {
                      results.push("<span style='color:red'><strong>" + text + "</strong></span>");
                  } else {
                      results.push(text);
                  }
              }
              
              this.testsResults[this.currentTest] = {
                  passed: passed, 
                  results: results,
                  output: output,
              }
              prevres = output;
              this.currentTest++;
              if (!passed) {
                  break;
              }
          }
      }, 
        mirrorName(mirror) {
            if (mirror.mirrorName && mirror.mirrorName.length > 0) {
                return [true, "Mirror name is : " + mirror.mirrorName];
            } else {
                return [false, "Mirror name is missing"];
            }
        }, 
        mirrorLanguages(mirror) {
            if (mirror.languages && mirror.languages.length > 0) {
                let spl = mirror.languages.split(",");
                if (spl.length > 0) {
                    return [true, spl.length + " languages found : " + spl.join(", ")]
                } else {
                    return [false, "Languages string is malformed, must be languages separated by commas"]
                }
            } else {
                return [false, "No languages defined for this mirror"]
            }
        }, 
        mirrorIcon(mirror) {
            if (mirror.mirrorIcon) {
                return [true, "Mirror icon of this mirror is <img src='" + mirror.mirrorIcon + "' />"];
            } else {
                return [false, "No mirror icon for this mirror"];
            }
        }, 
        mirrorWebSites(mirror) {
            if (mirror.webSites && mirror.webSites.length > 0) {
                return [true, "Websites on which this mirror will be loaded : " + mirror.webSites.join(", ")];
            } else {
                return [false, "No websites to load this mirror on"];
            }
        }, 
        async searchMangas(mirror) {
            let result = await browser.runtime.sendMessage({
                action: "lab", 
                torun: "search", 
                search: this.search, 
                mirror: mirror.mirrorName
            });
            if (result && result.length > 0) {
                return [true, "<strong>" + result.length + " mangas found</strong> for the search phrase : <i>" + this.search + "</i>", result.map(arr => { 
                    return {
                        value: arr[1], 
                        text: arr[0]
                    }
                })];
            } else {
                return [false, "No mangas found for the search phrase : " + this.search + ". Change the search phrase or fix the implementation"];
            }
        }
  }
};
</script>
<style>
.dialog .card__title,
.dialog .card__text {
  padding: 4px 16px;
}
.dialog .card__title {
  padding-top: 10px;
}
* {
    font-size:12px;
}
</style>
