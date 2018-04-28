<template>
    <div>
        <v-tabs
            v-model="tabs"
            fixed-tabs
            color="transparent"
        >
            <v-tabs-slider></v-tabs-slider>
            <v-tab href="#import" class="primary--text">
                {{ i18n("ie_import") }}
            </v-tab>
            <v-tab href="#export" class="primary--text">
                {{ i18n("ie_export") }}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabs" :class="($store.state.options.dark === 1 ? 'black' : 'white')">
            <!-- Import tab -->
            <v-tab-item id="import">
                <v-container fluid>
                    <label class="file-select">
                        <v-btn @click.native="onFocus" color="primary">{{i18n("ie_import_pickfile")}}</v-btn>
                        <input ref="fileInput" type="file" @change="handleFileChange"/>
                    </label>
                    <v-text-field
                        v-model="importstr"
                        :label="i18n('ie_import_placeholder')"
                        multi-line
                        class="import-text txtfield"
                    ></v-text-field>
                    <span v-html="importmessage"></span>
                    <v-text-field v-if="hasmgs" v-model="importcat" :label="i18n('ie_import_defaultcat')" class="txtfield"></v-text-field>
                    <v-btn 
                        v-if="hasmgs" 
                        @click="importMangas()" 
                        color="primary"
                        :loading="importingmangas" 
                        :disabled="importingmangas">
                        {{i18n('ie_import_mangas')}}
                    </v-btn>
                    <v-btn 
                        v-if="hasbms" 
                        @click="importBookmarks()" 
                        color="primary"
                        :loading="importingbookmarks" 
                        :disabled="importingbookmarks">
                        {{i18n('ie_import_bookmarks')}}
                    </v-btn>
                    <v-btn 
                        v-if="hasmgs && hasbms" 
                        @click="importAll()" 
                        color="primary"
                        :loading="importingmangas || importingbookmarks" 
                        :disabled="importingmangas || importingbookmarks">
                        {{i18n('ie_import_all')}}
                    </v-btn>
                </v-container>
            </v-tab-item>
            <!-- Export tab -->
            <v-tab-item id="export">
                <v-container fluid>
                    <!-- Export options -->
                    <div class="subtitle">{{ i18n("ie_export_mangas_viewable_desc") }}</div>
                    <v-checkbox v-model="viewable"
                        :label="i18n('ie_export_mangas_viewable')"></v-checkbox>
                    <div class="subtitle">{{ i18n("ie_export_content") }}</div>
                    <v-radio-group v-model="exportMode" column>
                        <v-radio :label="i18n('ie_export_manga_all')" :value="1" ></v-radio>
                        <v-radio :label="i18n('ie_export_manga_noreading')" :value="2"></v-radio>
                    </v-radio-group>
                    <div class="subtitle">{{ i18n("ie_export_bookmarks_desc") }}</div>
                    <v-checkbox v-model="bookmarks"
                        :label="i18n('ie_export_bookmarks_opt')"></v-checkbox>
                    <v-text-field v-model="filename" :label="i18n('ie_export_filename')" class="txtfield"></v-text-field>
                    <v-btn @click="exportFile()" color="primary">{{i18n('ie_export_btn')}}</v-btn>
                </v-container>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>
<script>
import i18n from "../../amr/i18n";
import * as utils from "../../amr/utils";
import * as mgutils from "../utils";
import browser from "webextension-polyfill";

export default {
  data() {
    return {
      tabs: null, // manage tabs state
      importstr: "", // json to import
      viewable: false, // export only viewable mangas in list
      bookmarks: true, // export bookmarks
      exportMode: 1, // 1 is export all, 2 is without reading state
      filename: "AMR_" + utils.fdate(), // name of the file to export
      importmessage: "", // message describing data to import
      hasmgs: false, // data to import contain mangas
      hasbms: false, // data to import contain bookmarks
      importingmangas: false, // currently importing mangas
      importingbookmarks: false, // currently importing bookmarks
      importcat: "", // category for all imported mangas
    };
  },
  watch: {
      importstr: function(str) {
          try {
              let res = "";
              let imps = JSON.parse(str);
              if (imps.mangas && imps.mangas.length > 0) {
                  this.hasmgs = true;
                  res += i18n("ie_has_mangas", imps.mangas.length) + "<br/>";
              } else {
                  this.hasmgs = false;
              }
              if (imps.bookmarks && imps.bookmarks.length > 0) {
                  this.hasbms = true;
                  res += i18n("ie_has_bookmarks", imps.bookmarks.length);
              } else {
                  this.hasbms = false;
              }
              this.importmessage = res;
          }
          catch (e) {
              this.importmessage = e.name + ": " + e.message
              this.hasmgs = false
              this.hasbms = false
          }
      }
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    /**
     * Button import file is clicked --> simulate click on hidden file input 
     */
    onFocus() {
        this.$refs.fileInput.click();
    },
    /**
     * File is selected
     */
    async handleFileChange(e) {
      let reader = new FileReader()
      let self = this
      reader.readAsText(e.target.files[0])
      reader.onload = function(event) {
        self.importstr = event.target.result
      }
    },
    /**
     * Export data to file
     */
    exportFile: function() {
      let self = this;
      let mgs = this.$store.state.mangas.all;
      if (this.viewable) {
        mgs = mgs.filter(mg =>
          mgutils.displayFilterCats(
            mg,
            self.$store.state.options.categoriesStates
          )
        );
      }
      mgs = mgs.map(mg => {
        if (self.exportMode === 1) {
          let res = {
            m: mg.mirror,
            n: mg.name,
            u: mg.url,
            l: mg.lastChapterReadURL
          };
          if (mg.read !== 0) res.r = mg.read;
          if (mg.update !== 1) res.p = mg.update;
          if (mg.display !== 0) res.d = mg.display;
          if (mg.cats.length > 0) res.c = mg.cats;
          return res;
        } else {
          return {
            m: mg.mirror,
            n: mg.name,
            u: mg.url
          };
        }
      });

      //TODO add bookmarks

      // create a file containing export and download it  
      let exp = { mangas: mgs /*, bookmarks: bms */ };
      var blob = new Blob([JSON.stringify(exp, null, 2)], {
        type: "text/json"
      });
      var url = URL.createObjectURL(blob);
      browser.downloads.download({
        url: url,
        filename: this.filename + ".json"
      });
    },
    /**
     * Import mangas described in importstr in reading list. 
     * Button is accessible only if json is valid and contains mangas
     */
    importMangas: async function() {
        this.importingmangas = true
        let imps = JSON.parse(this.importstr)
        if (imps.mangas && imps.mangas.length > 0) {
            // add default category if inexistant
            if (this.importcat !== "") {
                let cats = this.$store.state.options.categoriesStates;
                if (-1 === cats.findIndex(cat => cat.name === this.importcat)) {
                    this.$store.dispatch("addCategory", this.importcat);
                }
            }

            let readall = [];
            imps.mangas.forEach(mg => {
                // convert manga to something matching readManga requirements
                let readmg = {
                    mirror: mg.m,
                    name: mg.n,
                    url: mg.u
                }
                if (mg.l) readmg.lastChapterReadURL = mg.l
                if (mg.r) readmg.read = mg.r
                if (mg.p) readmg.update = mg.p
                if (mg.d) readmg.display = mg.d
                if (mg.c) readmg.cats = mg.c
                // add default category if specified
                if (this.importcat !== "") {
                    if (readmg.cats && readmg.cats.length > 0) readmg.cats.push(this.importcat)
                    else readmg.cats = [this.importcat]
                }
                readmg.action = "readManga"
                readall.push(browser.runtime.sendMessage(readmg))
            })
            // read all mangas
            await Promise.all(readall)
        }
        this.importingmangas = false
    },
    /**
     * Import bookmarks described in importstr in reading list. 
     * Button is accessible only if json is valid and contains bookmarks
     */
    importBookmarks: function() {
        //TODO
    },
    /**
     * Import mangas and bookmarks described in importstr in reading list. 
     * Button is accessible only if json is valid and contains data
     */
    importAll: function() {
        this.importMangas();
        this.importBookmarks();
    }
  }
};
</script>
<style>
.import-text textarea {
    font-size: 8pt;
}
.txtfield {
  padding-top: 18px;
}
.subtitle {
  font-size: 14px !important;
  line-height: 24px !important;
  letter-spacing: normal !important;
}
.file-select input[type="file"] {
  display: none;
}
</style>
