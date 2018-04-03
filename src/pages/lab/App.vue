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
                        <div v-if="testsResults[index].output.length > 0">
                            <!-- display generated oututs during test -->
                            <div v-for="(out, key) in testsResults[index].output" :key="key">
                                <!-- name, value, display -->
                                {{out.name}} : 
                                <v-select v-if="out.display === 'select'" :items="out.value" v-model="out.currentValue">
                                </v-select>
                                <span v-if="out.display === 'object'">{{JSON.stringify(out.value)}}</span>
                            </div>
                        </div>
                    </v-flex>
                    <v-flex xs3>
                        <span v-html="test.comment"></span>
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
import tests from "./tests";

export default {
  data() {
    return {
      title: "All Mangas Reader Lab",
      options: false,
      loadingMirrors: false,
      loadingTests: false,
      current: "Manga Reader", // current selected mirror
      search: "", // current search phrase
      tests: tests,
      testsResults: [],
      currentTest: 0 //current test, display all tests before
    };
  },
  computed: {
    mirrors() {
      return this.$store.state.mirrors.all;
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
    /**
     * Reload the mirrors list
     */
    async reloadMirrors() {
      this.loadingMirrors = true;
      await this.$store.dispatch("updateMirrorsLists");
      this.loadingMirrors = false;
    },
    /**
     * Runs the test course
     */
    async loadTests() {
      this.testsResults = [];
      this.currentTest = 0;
      let mirror = this.mirrors.find(mir => mir.mirrorName === this.current);
      let outputs = {};
      for (let test of this.tests) {
        let passed = true; // result of current test
        let results = []; // text results of sub tests of the test
        let testouts = [];
        if (test.set) { // values to set before testing
            for (let toset of test.set) {
                let spl = toset.split(" ");
                if (spl.length > 1) {
                    if (spl[0] === "oneof") {
                        // select one entry in previous output list
                        this.selectEntryRandomly(spl[1]);
                    }
                }
            }
        }
        for (let unit of test.tests) {
          let isok, text; // return from the test function
          let tocall; // test function to call
          let inputs = []; // inputs of the test function (first parameter is mirror)
          let output; // output of the test function
          if (typeof unit === "function") {
            tocall = unit;
          } else {
            tocall = unit.test;
            // bind inputs
            if (unit.input) {
              for (let inp of unit.input) {
                let spl = inp.split(" ");
                if (spl.length > 1) {
                  if (!outputs[spl[1]])
                    console.error("the required input " + spl[1] + " is missing.");
                  if (spl[0] === "oneof") {
                    // select one entry in previous output
                    inputs.push(this.selectEntryRandomly(spl[1]));
                  } else if (spl[0] === "valueof") {
                     inputs.push(this.getEntryValue(spl[1]));
                  } else if (spl[0] === "textof") {
                     inputs.push(this.getEntryText(spl[1]));
                  }
                } else {
                  if (!outputs[inp])
                    console.error("the required input " + inp + " is missing.");
                  inputs.push(outputs[inp]);
                }
              }
            }
          }
          try {
            let ress = await tocall.bind(this)(mirror, ...inputs);
            let allres = [];
            // if there is only one result, add it to the result array
            if (ress.length > 0 && (ress[0] === true || ress[0] === false)) { 
                allres.push(ress);
            } else {
                allres.push(...ress);
            }
            for ([isok, text, output] of allres) { // for all results of unit test
                if (unit.output && output) {
                    outputs[unit.output] = output; // save the output
                    testouts.push({
                        name: unit.output,
                        value: output,
                        display: unit.display,
                        currentValue: undefined
                    });
                }
                passed &= isok; // check if test passed
                if (!isok) {
                    results.push(
                    "<span style='color:red'><strong>" + text + "</strong></span>"
                    );
                } else {
                    results.push(text);
                }
            }
          } catch (e) {
            isok = false;
            text =
              "<span style='color:red'>Error while running test : " +
              e.message +
              "</span>";
            console.error(e);
          }
        }
        // global object containing tests results
        this.testsResults[this.currentTest] = {
          passed: passed, // result of the test
          results: results, // list of text unit results
          output: testouts // array of outputs
        };
        this.currentTest++;
        if (!passed) {
          break;
        }
      }
    },
    selectEntryRandomly(outputName) {
      for (let i = 0; i < this.currentTest; i++) {
        for (let out of this.testsResults[i].output) {
          if (out.name === outputName) {
            //select a random value
            let val =
              out.value[Math.floor(Math.random() * out.value.length)].value;
            //set it as model
            out.currentValue = val;
            //return it
            return val;
          }
        }
      }
      return undefined;
    },
    getEntryValue(outputName) {
      for (let i = 0; i < this.currentTest; i++) {
        for (let out of this.testsResults[i].output) {
          if (out.name === outputName) {
            //return it
            return out.currentValue;
          }
        }
      }
      return undefined;
    },
    getEntryText(outputName) {
      for (let i = 0; i < this.currentTest; i++) {
        for (let out of this.testsResults[i].output) {
          if (out.name === outputName) {
            //return the text
            return out.value.find(el => el.value === out.currentValue).text;
          }
        }
      }
      return undefined;
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
  font-size: 12px;
}
</style>
