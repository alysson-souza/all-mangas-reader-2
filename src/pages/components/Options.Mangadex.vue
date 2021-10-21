<template>
<div>
    <v-checkbox v-model="datasaver">
    <template v-slot:label>
      <div>
        {{ i18n('options_mangadex_datasaver') }}
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" color="blue darken-2" class="superscript" small>
              mdi-information
            </v-icon>
          </template>
          {{ i18n('options_mangadex_datasaver_info') }}
        </v-tooltip>
      </div>
    </template>
  </v-checkbox>
  <!-- Enable Mangadex integration -->
  <v-checkbox v-model="enabled">
    <template v-slot:label>
      <div>
        {{ i18n('options_mangadex_integration') }}
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" color="blue darken-2" class="superscript" small>
              mdi-information
            </v-icon>
          </template>
          {{ i18n('options_mangadex_integration_info') }}
        </v-tooltip>
      </div>
    </template>
  </v-checkbox>
  <!-- Credentials -->
  <div v-if="enabled && (!validCredentials || tokenExpired)">
    <v-text-field v-model="login"
                :label="i18n('options_mangadex_login')"></v-text-field>
    <v-text-field type="password" v-model="password"
                :label="i18n('options_mangadex_password')"></v-text-field>
    <!-- Confirm credentials button -->
    <v-btn :loading="credentialLoading" v-if="login && password" @click="verifyCredentials"> {{ i18n('options_mangadex_verify_credentials') }}</v-btn>
  </div>
  <!-- Reset credentials button -->
  <v-btn class="mb-4" color="warning" :loading="credentialLoading" v-if="validCredentials && !tokenExpired" @click="resetCredentials"> {{ i18n('options_mangadex_reset_credentials') }}</v-btn>
  <v-divider v-if="enabled && validCredentials && !tokenExpired" />
  <!-- Mangadex integration options -->
  <div class="mt-4" v-if="enabled && validCredentials && !tokenExpired">
    <v-checkbox
      v-model="updateReadMarker"
      :label="i18n('options_mangadex_integration_markwhendownload')"
      />
    <!-- Export to Follows option-->
    <v-checkbox
      v-model="updateExportToFollowsMarker"
      :label="i18n('options_mangadex_integration_export_follows')"
      :disabled="exportLoading || exportFollowsLoading"
    />

    <v-alert
      v-if="(exportFollowsLoading && exportFollowsProgress && exportFollowsTotal) || exportFollowsDone"
      text
      elevation="1"
      :color="exportFollowsDone ? 'success' : 'info'"
      icon="mdi-information"
    >
      {{ i18n(exportFollowsLoadingText, exportFollowsProgress, exportFollowsTotal) }}
    </v-alert>
    <!-- Export to MDList option-->
    <v-checkbox
      v-model="updateExportToListMarker"
      :label="i18n('options_mangadex_integration_export')"
      :disabled="exportLoading || exportFollowsLoading"
    />

    <v-alert
      v-if="(exportLoading && exportProgress && exportTotal) || exportDone"
      text
      elevation="1"
      :color="exportDone ? 'success' : 'info'"
      icon="mdi-information"
    >
      {{ i18n(exportLoadingText, exportProgress, exportTotal) }}
    </v-alert>
    <!-- Import option-->
    <v-row class="mb-4">
      <v-col cols="3">
        <v-btn
          v-bind="attrs"
          v-on="on"
          :loading="importLoading"
          :disabled="importLoading"
          @click="importManga"
        >
          {{ i18n(importButtonText) }}
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-alert
          v-if="importLoading && importProgress && importTotal"
          text
          elevation="1"
          color="info"
          icon="mdi-information"
        >
          {{ i18n(importLoadingText, importProgress, importTotal) }}
        </v-alert>
      </v-col>
    </v-row>
    <!-- dialog please wait -->
    <v-dialog
			v-model="importMangaWait"
			max-width="500"
			hide-overlay
		>
			<v-card>
				<v-card-text>
					<div class="text-h6 pa-10 pb-5" v-html="i18n('options_mangadex_integration_wait')" />
				</v-card-text>
				<v-card-actions class="justify-end">
					<v-btn text @click="importMangaWait = false">{{ i18n('button_close') }}</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
    <!-- import tables -->
    <v-row v-if="follows.length">
      <v-col cols="6" offset="3" offset-lg="0" lg="3">
        <v-card class="pb-6">
          <v-card-title>{{ i18n('options_mangadex_integration_load_bylang') }}</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="importAllTableHeaders"
              :items="followsLangs"
              :items-per-page="5"
              :calculate-widths="true"
              class="elevation-4"
              dense
            >
              <template v-slot:item="{item}">
                <tr>
                  <td class="py-2">
                  <v-btn
                    class="mx-2"
                    x-small
                    text
                    :loading="addLangLoading == item.code"
                    :disabled="addLangLoading !== ''"
                    @click="addLang(item.code)"
                  >
                    <v-icon left>
                      mdi-plus
                    </v-icon>
                  </v-btn>
                    <Flag big :value="item.code"/>
                  </td>
                  <td class="py-2">
                    {{ item.count }}
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        v-if="!addLangLoading || addLangLoading == ''"
        cols="12"
        lg="9"
      >
        <v-card class="pb-6">
          <v-card-title>{{ i18n('options_mangadex_integration_load_bymanga') }}</v-card-title>
          <v-card-text>
            <v-data-table
              :items="follows"
              :items-per-page="10"
              :calculate-widths="true"
              class="elevation-4"
            >
              <template v-slot:item="{item, index}">
                <tr>
                  <td class="py-2">
                    {{ index+1 }}
                  </td>
                  <td class="py-2">
                    {{ item.name }}
                  </td>
                  <td class="py-2">
                    <v-btn
                      class="my-2"
                      v-for="(subitem, index) of item.langs"
                      :key="index"
                      x-small
                      rounded
                      text
                      @click="addManga(item, subitem)"
                    >
                      <Flag v-if="subitem.code" :value="subitem.code"/>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</div>
</template>
<script>
import browser from "webextension-polyfill";
import i18n from "../../amr/i18n";
import Flag from "./Flag";

export default {
  props: {

  },
  data() {
    return {
      login: '',
      password: '',
      importMangaWait: false,
      importMethod: 'none',
      importAllTableHeaders: [
        { text: this.i18n('options_gen_mirrors_header_lang'), value: 'code', width: '150' },
        { text: 'Mangas', value: 'count' },
      ],
      langs: [{
        text: "English",
        value: "en"
      }, {
        text: "Portuguese (Br)",
        value: "pt-br"
      }, {
        text: "Russian",
        value: "ru"
      }, {
        text: "French",
        value: "fr"
      }, {
        text: "Spanish (LATAM)",
        value: "es-la"
      }, {
        text: "Polish",
        value: "pl"
      }, {
        text: "Turkish",
        value: "tr"
      }, {
        text: "Italian",
        value: "it"
      }, {
        text: "Spanish (Es)",
        value: "es"
      }, {
        text: "Indonesian",
        value: "id"
      }, {
        text: "Vietnamese",
        value: "vi"
      }, {
        text: "Hungarian",
        value: "hu"
      }, {
        text: "Chinese (Simp.)",
        value: "zh"
      }, {
        text: "Arabic",
        value: "ar"
      }, {
        text: "German",
        value: "de"
      }, {
        text: "Chinese (Trad.)",
        value: "zh-hk"
      }, {
        text: "Catalan",
        value: "ca"
      }, {
        text: "Thai",
        value: "th"
      }, {
        text: "Bulgarian",
        value: "bg"
      }, {
        text: "Persian",
        value: "fa"
      }, {
        text: "Ukrainian",
        value: "uk"
      }, {
        text: "Mongolian",
        value: "mn"
      }, {
        text: "Hebrew",
        value: "he"
      }, {
        text: "Romanian",
        value: "ro"
      }, {
        text: "Malay",
        value: "ms"
      }, {
        text: "Tagalog",
        value: "tl"
      }, {
        text: "Japanese",
        value: "ja"
      }, {
        text: "Korean",
        value: "ko"
      }, {
        text: "Hindi",
        value: "hi"
      }, {
        text: "Burmese",
        value: "my"
      }, {
        text: "Czech",
        value: "cs"
      }, {
        text: "Portuguese (Pt)",
        value: "pt"
      }, {
        text: "Dutch",
        value: "nl"
      }, {
        text: "Swedish",
        value: "sv"
      }, {
        text: "Bengali",
        value: "bn"
      }, {
        text: "Norwegian",
        value: "no"
      }, {
        text: "Lithuanian",
        value: "lt"
      }, {
        text: "Greek",
        value: "el"
      }, {
        text: "Serbo-Croatian",
        value: "sr"
      }, {
        text: "Danish",
        value: "da"
      }, {
        text: "Finnish",
        value: "fi"
      }]
    }
  },
  computed: {
    inStore() {
      return this.$store.getters.md_inStore
    },
    inStoreKeys() {
      return this.inStore.map(mg => mg.key)
    },
    allOptions() {
      return this.$store.state.options
    },
    options() {
      return this.$store.getters.md_options
    },
    datasaver: {
      get() { return this.allOptions.mangadexDataSaver == 1},
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexDataSaver', value: val === true ? 1:0 })
      }
    },
    enabled:{
      get () { return this.options.enabled },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexIntegrationEnable', value: val === true ? 1:0 });
      }
    },
    validCredentials() { return this.options.valid },
    // token has expired
    tokenExpired() {
        if(this.allOptions.mangadexRefreshExpire < Date.now()) return true
        return false
    },
    updateReadMarker: {
      get() { return this.options.markAsRead },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexUpdateReadStatus', value: val === true ? 1:0 });
      }
    },
    updateExportToListMarker: {
      get() { return this.options.exportToList },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexExportToList', value: val === true ? 1:0 });
        if(val) this.exportMangasToList()
      }
    },
    updateExportToFollowsMarker: {
      get() { return this.options.exportToFollows },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexExportToFollows', value: val === true ? 1:0 });
        if(val) this.exportMangasToFollows()
      }
    },
    loadings() { return this.$store.getters.md_loadings },
    texts() { return this.$store.getters.md_texts },
    misc() { return this.$store.getters.md_misc },
    credentialLoading() { return this.loadings.credential },
    exportLoading() { return this.loadings.export },
    exportLoadingText() { return this.texts.export },
    exportProgress() { return this.texts.exportProgress },
    exportTotal() { return this.texts.exportTotal },
    exportDone() { return this.misc.exportDone },
    exportFollowsLoading() { return this.loadings.exportFollows },
    exportFollowsLoadingText() { return this.texts.exportFollows },
    exportFollowsProgress() { return this.texts.exportFollowsProgress },
    exportFollowsTotal() { return this.texts.exportFollowsTotal },
    exportFollowsDone() { return this.misc.exportFollowsDone },
    importLoading() { return this.loadings.import },
    importButtonText() { return this.follows.length ? 'options_mangadex_integration_reload' : 'options_mangadex_integration_load' },
    importLoadingText() { return this.texts.import},
    importProgress() { return this.texts.importProgress },
    importTotal() { return this.texts.importTotal },
    addLangLoading() { return this.loadings.importLang },
    follows() { return this.$store.getters.md_imports },
    followsLangs() {
    return Array.from(
        new Set(
          [].concat.apply(
            [],
            this.follows.map(follow => follow.langs.map(lang => lang.code))
          )
        )
      ).map(l => {
        return {
          code: l,
          count: this.follows.filter(follow => follow.langs.find(lang => lang.code === l && lang.chapters.length)).length
        }
      }).sort((a, b) => a.code > b.code ? 1 : -1)
    }
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    async resetCredentials() {
      browser.runtime.sendMessage({action: 'mangadexResetCredentials'})
    },
    async verifyCredentials() {
      browser.runtime.sendMessage({action: 'mangadexVerifyCredentials', username: this.login, password: this.password})
    },
    exportMangasToList() {
      if(this.allOptions.isUpdatingChapterLists == 1) {
        this.importMangaWait = true
        return
      }
      browser.runtime.sendMessage({action: 'mangadexExportToList', fromOptionMenu: true })
    },
    exportMangasToFollows() {
      if(this.allOptions.isUpdatingChapterLists == 1) {
        this.importMangaWait = true
        return
      }
      browser.runtime.sendMessage({action: 'mangadexExportToFollows', fromOptionMenu: true })
    },
    /**
     * Load followed mangas from MD
     */
    importManga() {
      if(this.allOptions.isUpdatingChapterLists == 1) {
        this.importMangaWait = true
        return
      }
      browser.runtime.sendMessage({action: 'mangadexImportMangas'})
      // this.importLoading = true
      // const md = new Mangadex(this.options, this.$store.dispatch)
      
      // // updating counts
      // md.on('getFollows:list:progress', ({total, current}) => {
      //   this.fetchProgress = String(current > total ? total : current)
      //   this.fetchTotal = String(total)
      //   this.$forceUpdate()  
      // })
      // let loading = 0
      // md.on('getFollows:loading:progress', () => {
      //   if(loading === 0) {
      //     this.importLoadingText = 'options_mangadex_loading_mangas'
      //     this.fetchProgress = 0
      //     loading = 1
      //   }
      //   this.fetchProgress = this.fetchProgress+1
      //   this.$forceUpdate()  
      // })
      
      // // fetch data
      // this.follows = await md.getFollows(this.inStoreKeys)
      // this.importLoading = false
      // this.updatefollowsLangs()
      // this.$forceUpdate()
    },
    /**
     * add manga
     * @typedef { { code: String, lastChapterReadURL: String|Void, lastChapterReadName: String|Void, chapters: Array<Array<String>>  } } langsContent
     * @param { { key: String, name: String, mirror: String, url: String, langs: langsContent[] } } item Manga fetched data
     * @param { langsContent } selectedSubitem List of chapters in every languages
     */
    addManga(item, selectedSubitem) {
      const payload = {
        key: item.key+'_'+selectedSubitem.code,
        name: item.name,
        url: item.url,
        mirror: item.mirror,
        listChaps: selectedSubitem.chapters,
        lastChapterReadURL: selectedSubitem.lastChapterReadURL ? selectedSubitem.lastChapterReadURL : selectedSubitem.chapters[0][1],
        lastChapterReadName: selectedSubitem.lastChapterReadName ? selectedSubitem.lastChapterReadName : selectedSubitem.chapters[0][0],
        language: selectedSubitem.code,
        languages: item.langs.map(l=> l.code).join(','),
        update: 1,
      }
      browser.runtime.sendMessage({action: 'mangadexAddManga', payload, lastOfList: true })
    },
    /**
     * add all mangas available in language
     * @param {String} lang selected language
     */
    addLang(lang) {
      const payload = []
      this.follows
        .filter(f=> f.langs.find(l=>l.code == lang))
        .forEach(item => {
          const selectedSubitem = item.langs.find(l => l.code == lang)
          payload.push({
            key: item.key+'_'+selectedSubitem.code,
            name: item.name,
            url: item.url,
            mirror: item.mirror,
            listChaps: selectedSubitem.chapters,
            lastChapterReadURL: selectedSubitem.lastChapterReadURL ? selectedSubitem.lastChapterReadURL : selectedSubitem.chapters[0][1],
            lastChapterReadName: selectedSubitem.lastChapterReadName ? selectedSubitem.lastChapterReadName : selectedSubitem.chapters[0][0],
            language: selectedSubitem.code,
            languages: item.langs.map(l=> l.code).join(','),
            update: 1,
          })
        })
      browser.runtime.sendMessage({action: 'mangadexAddMangasInLang', payload, lang})
    },
  },
  components: {Flag}
}

</script>

