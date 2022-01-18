<template>
	<v-app>
		<v-toolbar app max-height="64">
			<img src="/icons/icon_32.png" alt="All Mangas Reader">
			<v-toolbar-title v-text="title"></v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn icon @click.stop="options = true">
				<v-icon>mdi-settings</v-icon>
			</v-btn>
		</v-toolbar>
		<v-main>
      <v-container fluid>
        <v-form ref="form" @submit.prevent="loadCourse" id="mirrorTests">
          <div class="text-h5">Select the mirror to test : </div>
          <v-row >
            <v-col cols="6">
              <v-row >
                <v-col cols="3">
                  <v-subheader>Mirrors : </v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-select v-model="current" :items="mirrors" item-value="mirrorName" item-text="mirrorName" :menu-props="{auto: true}" :rules="mirrorRules" required></v-select>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row>
                <v-col cols="4">
                  <v-subheader>Search field : </v-subheader>
                </v-col>
                <v-col cols="8">
                  <v-text-field v-model="search" :rules="searchRules" required></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row >
            <v-col cols="12">
              <v-btn
                  :loading="loadingTests"
                  :disabled="loadingTests"
                  color="primary"
                  type="submit"
                  form="mirrorTests"
                  @click="loadCourse()">Load tests</v-btn>
            </v-col>
          </v-row>
          <v-row  v-if="testsResults.length > 0" class="mt-4">
            <v-col cols="3">
              <div class="text-h5">
                  Course of tests
              </div>
            </v-col>
            <v-col cols="9">
              Test {{ currentTest + 1 }} / {{ nbtests }} ({{ nbfailed }} failed)
              <v-progress-linear :value="(currentTest + 1) / nbtests * 100" :color="nbfailed > 0 ? 'red' : 'green'"></v-progress-linear>
            </v-col>
          </v-row>
          <!-- Display tests -->
          <!-- <v-row  v-if="currentTest >= 0 && index <= currentTest && testsResults.length >= index" v-for="(test, index) in tests" :key="index" :class="'ma-4 pa-4 elevation-1 lighten-5 ' + (testsResults[index] && testsResults[index].passed ? 'green' : 'red')"> -->
          <v-row  v-for="(test, index) in finishedTests" :key="index" :class="'ma-4 pa-4 elevation-1 rounded-xl darken-1 ' + (testsResults[index] && testsResults[index].passed ? 'brown' : 'danger')">
            <v-col cols="3">
              <v-icon v-if="testsResults[index] && testsResults[index].passed" color="green" class="test-icon">mdi-check</v-icon>
              <v-icon v-else-if="testsResults[index]" color="red" class="test-icon">mdi-alert-circle</v-icon>
              <v-progress-circular v-else indeterminate color="green" class="test-icon"></v-progress-circular>
              <span><strong>Test {{test.name}}</strong></span>
            </v-col>
            <v-col cols="6" v-if="testsResults[index]">
              <div v-for="(res, index) in testsResults[index].results" :key="index">
                <span v-html="res"></span>
              </div>
              <div v-if="testsResults[index].output.length > 0" :class="(testsResults[index] && testsResults[index].passed ? 'brown' : 'danger') + ' darken-4 ma-2 pa-2 elevation-1'">
                <!-- display generated oututs during test -->
                <div v-for="(out, ind) in testsResults[index].output" :key="ind">
                  <!-- name, value, display -->
                  {{out.name}} :
                  <v-select v-if="out.display === 'select'" :items="out.value" v-model="out.currentValue" class="list-results"></v-select>
                  <div v-if="out.display === 'select'">Selected value : <i>{{ out.currentValue }}</i></div>
                  <span v-if="out.display === 'object'">{{JSON.stringify(out.value, null, 4)}}</span>
                  <span v-if="out.display === 'text'">{{out.value}}</span>
                  <div v-if="out.display === 'image'" :ref='out.name' class="dom-elt">
                    <img :src="out.value" />
                  </div>
                  <div v-if="out.buttons && out.buttons.length > 0">
                    <div v-for="(but, indd) in out.buttons" :key="indd" class="result-button">
                      <v-btn v-if="but === 'gotourl'" @click="goToUrl(out.currentValue)" small>Go to url</v-btn>
                      <v-btn v-if="but === 'reloadtestforvalue'" @click="reloadNextWith(out.name, out.currentValue)" small>Reload following tests with the selected value</v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="3" v-if="testsResults[index]">
              <span v-html="test.comment"></span>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
		</v-main>
		<v-dialog
        v-model="options"
        fullscreen
        transition="dialog-bottom-transition"
        :overlay="false"
        scrollable
    >
      <v-card tile>
        <v-toolbar flat dark color="primary">
          <v-btn icon @click.native="options = false" dark>
            <v-icon>mdi-close</v-icon>
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
import browser from "webextension-polyfill";
import Vue from 'vue';

export default {
  data() {
    return {
      title: "All Mangas Reader Lab",
      options: false,
      loadingMirrors: false,
      loadingTests: false,
      current: "", // current selected mirror
      search: "", // current search phrase
      tests: tests,
      testsResults: [],
      currentTest: -1, //current test, display all tests before,
      forcedValues: {}, // values selected manually to test
      outputs: {}, // values retrieved while testing
      curtest: 0, // current test id
      mirrorRules: [
        v => !!v || 'Select a mirror.'
      ],
      searchRules: [
        v => !!v || 'Enter a search term.'
      ]
    };
  },
  computed: {
    mirrors() {
      return this.$store.state.mirrors.all.filter(m => (m.disabled == undefined || !m.disabled));
    },
    nbtests() {
        return this.tests.length;
    },
    nbfailed() {
        let nb = 0;
        for (let res of this.testsResults) {
            if (!res.passed) nb++;
        }
        return nb;
    },
    finishedTests() {
      //<v-row  v-if="currentTest >= 0 && index <= currentTest && testsResults.length >= index" v-for="(test, index) in tests"
      let fin = this.tests.filter((val, index) => this.currentTest >= 0 && index <= this.currentTest && this.testsResults.length >= index)
      return fin
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

    const params = new URLSearchParams(window.location.search);
    this.search = params.get('search');
    this.current = params.get('mirror');
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
    loadCourse() {
      if (!this.$refs.form.validate()) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      params.set('search', this.search);
      params.set('mirror', this.current);
      window.history.replaceState({}, '', `${location.pathname}?${params}`);

      this.curtest++;
      this.loadTests();
    },
    /**
     * Runs the test course
     */
    async loadTests(step = 0, substep = 0) {
        console.log("Load the test course " + this.curtest);
        let testid = this.curtest;
        if (step === substep && step === 0) {
            this.testsResults = [];
            this.currentTest = 0;
            this.forcedValues = {};
            this.outputs = {};
        }
      let mirror = this.mirrors.find(mir => mir.mirrorName === this.current);
      let i = 0;
      for (let test of this.tests) {
          i++;
          if (step !== 0 && i <= step) continue;
          this.currentTest = i - 1;
          let breakingFail = false;
        try {
            let passed = true; // result of current test
            let results = []; // text results of sub tests of the test
            let testouts = [];
            if (test.set) { // values to set before testing
                for (let toset of test.set) {
                    let spl = toset.split(" ");
                    if (spl.length > 1) {
                        if (!this.outputs[spl[1]])
                            throw({message:"the required input " + spl[1] + " is missing."});
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
                                let outname = spl[1];
                                let optional = false;
                                if (outname.indexOf("optional:") === 0) {
                                    optional = true;
                                    outname = outname.substr(9)
                                }
                                if (!optional && !this.outputs[outname])
                                    throw({message:"the required input " + outname + " is missing."});
                                if (this.outputs[outname]) {
                                    if (spl[0] === "oneof") {
                                        // select one entry in previous output
                                        inputs.push(this.selectEntryRandomly(outname));
                                    } else if (spl[0] === "valueof") {
                                        inputs.push(this.getEntryValue(outname));
                                    } else if (spl[0] === "textof") {
                                        inputs.push(this.getEntryText(outname));
                                    }
                                } else {
                                    inputs.push(undefined)
                                }
                            } else {
                                let optional = false;
                                if (inp.indexOf("optional:") === 0) {
                                    optional = true;
                                    inp = inp.substr(9)
                                }
                                if (!optional && !this.outputs[inp])
                                    throw({message:"the required input " + inp + " is missing."});
                                if (this.outputs[inp]) {
                                    inputs.push(this.outputs[inp]);
                                } else {
                                    inputs.push(undefined)
                                }
                            }
                        }
                    }
                }
                try {
                    let ress = await tocall.bind(this)(mirror, ...inputs);
                    if (testid !== this.curtest) {
                        console.log("Interrupt the " + testid + " test course, has been deprecated")
                        return // the current test course is deprecated, a new one has been launched
                    }
                    let allres = [];
                    // if there is only one result, add it to the result array
                    if (ress.length > 0 && (ress[0] === true || ress[0] === false)) {
                        allres.push(ress);
                    } else {
                        allres.push(...ress);
                    }
                    let cur_outputs = []
                    for ([isok, text, ...cur_outputs] of allres) { // for all results of unit test
                        if (unit.output !== undefined && unit.output.length > 0 && cur_outputs.length > 0) {
                            for (let o = 0; o < cur_outputs.length; o++) {
                                let output = cur_outputs[o]
                                let name = unit.output[o]
                                this.outputs[name] = output; // save the output
                                testouts.push({
                                    name: name,
                                    value: output,
                                    display: unit.display !== undefined && unit.display.length >= o+1 ? unit.display[o] : undefined,
                                    currentValue: undefined,
                                    buttons: unit.buttons !== undefined && unit.buttons.length >= o+1 ? unit.buttons[o] : undefined
                                });
                            }
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
                    passed = false;
                    breakingFail = true;
                    results.push(
                        "<span style='color:red'>Error while running test : " + e.message + "</span>"
                    );
                    console.error(e);
                }
            }
            // global object containing tests results
            Vue.set(this.testsResults, this.currentTest, {
                passed: passed, // result of the test
                results: results, // list of text unit results
                output: testouts // array of outputs
            });
            if (breakingFail) {
                break;
            }
        } catch (e) {
            console.error(e);
            Vue.set(this.testsResults, this.currentTest, {
                passed: false, // result of the test
                results: ["<span style='color:red'><strong>" + e.message + "</strong></span>"], // list of text unit results
                output: []
            });
            break;
        }
      }
    },
    /**
     * Select a value randomly in an output
     */
    selectEntryRandomly(outputName) {
      if (this.forcedValues[outputName]) return this.forcedValues[outputName]
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
    /**
     * Return the value of an output
     */
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
    /**
     * Return the text of an output
     */
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
    },
    /**
     * Opens a url
     */
    goToUrl(url) {
        browser.runtime.sendMessage({
            action: "opentab",
            url: url
        });
    },
    /**
     * Reloads the tests after a step with a selected value
     */
    reloadNextWith(outname, outvalue) {
        // slice the results after the generated output
        let i = 0, found = false;
        for (let res of this.testsResults) {
            for (let out of res.output) {
                if (found === true) {
                    //delete outputs found after from previous outputs
                    delete this.outputs[out.name];
                }
                if (out.name === outname) {
                    this.currentTest = i + 1;
                    found = true;
                }
            }
            i++;
        }
        // adds the forced value
        this.forcedValues = {}; // reset forced values, only one at a time
        this.forcedValues[outname] = outvalue;
        // remove the results of previous tests after the one to reload
        this.testsResults.splice(this.currentTest, this.testsResults.length);
        // reload tests after
        this.curtest++;
        this.loadTests(this.currentTest, 0);
    }
  }
};
</script>
<style data-amr="true">
.v-dialog .v-card__title,
.v-dialog .v-card__text {
  padding: 4px 16px;
}
.v-dialog .v-card__title {
  padding-top: 10px;
}
* {
  font-size: 1rem;
}
.test-icon {
    vertical-align: middle;
    margin-right: 10px;
}
.dom-elt img {
    height: 200px;
}
.list-results {
    display: inline-block;
    vertical-align: middle;
    margin-left: 10px;
    width: auto;
}
.list-results .input-group__details {
    min-height: auto;
}
.result-button {
    display: inline-block;
}
</style>
