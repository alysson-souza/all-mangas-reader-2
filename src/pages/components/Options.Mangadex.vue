<template>
<div>
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
    <v-text-field v-model="login" @change="setOption('login')"
                :label="i18n('options_mangadex_login')"></v-text-field>
    <v-text-field type="password" v-model="password" @change="setOption('password')"
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
      :label="i18n('options_web_markwhendownload_desc')"
      />
    <v-row class="mb-4">
      <v-col cols="3">
        <v-btn
          v-bind="attrs"
          v-on="on"
          :loading="importLoading"
          :disabled="importLoading"
          @click="importManga"
        >
          {{ follows ? 'RE-LOAD FOLLOWS': 'LOAD FOLLOWS' }}
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-alert
          v-if="importLoading && fetchProgress && fetchTotal"
          text
          elevation="1"
          color="info"
          icon="mdi-information"
        >
          {{ i18n(importLoadingText, fetchProgress, fetchTotal) }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row v-if="follows">
      <v-col cols="6" offset="3" offset-lg="0" lg="3">
        <v-card class="pb-6">
          <v-card-title>Import by language</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="importAllTableHeaders"
              :items="followsLangs"
              :items-per-page="5"
              :calculate-widths="true"
              class="elevation-4"
              dense
            >
              <template v-slot:item="{item, index}">
                <tr>
                  <td class="py-2">
                  <v-btn
                    class="mx-2"
                    x-small
                    text
                    :loading="addLangLoading.value && addLangLoading.index === index"
                    @click="addLangLoading.value = true; addLangLoading.index = index;addLang(item.code)"
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
      <v-col cols="12" lg="9">
        <v-card class="pb-6">
          <v-card-title>Choose mangas to import</v-card-title>
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
import { Mangadex } from '../../background/misc/mangadex-v5-integration'
import Manga from '../../amr/manga'

export default {
  props: {

  },
  data() {
    return {
      credentialLoading: false,
      login: '',
      password: '',
      importLoading: false,
      importLoadingText: 'options_mangadex_loading_list',
      importMethod: 'none',
      addLangLoading: { value: false, index: -1 },
      follows: undefined,
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
      return this.$store.state.mangas.all.filter(mg => mg.mirror === "MangaDex V5").map(mg => mg.key)
    },
    options() {
      return this.$store.getters.mangadexOptions
    },
    enabled:{
      get () { return this.options.mangadexIntegrationEnable == 1 },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexIntegrationEnable', value: val === true ? 1:0 });
      }
    },
    validCredentials: {
      get() { return this.options.mangadexValidCredentials == 1 },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexValidCredentials', value: val === true ? 1:0 });
      }
    },
    // token has expired
    tokenExpired() {
        if(this.options.mangadexRefreshExpire < Date.now()) return true
        return false
    },
    updateReadMarker: {
      get() { return this.options.mangadexUpdateReadStatus == 1 },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexUpdateReadStatus', value: val === true ? 1:0 });
      }
    }
  },
  watch: {
    enabled() {
      this.resetCredentials()
    },
    follows() {
      this.$forceUpdate()
    },
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    async resetCredentials() {
      await this.$store.dispatch("setOption", { key: 'mangadexDontRemindMe', value: 0 });
      this.validCredentials = false
    },
    async verifyCredentials() {
      this.credentialLoading = true
      const res = await fetch("https://api.mangadex.org/auth/login", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: this.login, password: this.password})
      }).catch(this.verifyCredentialsCallback(false))
      if(res.status == 200) {
        const json = await res.json().catch(this.verifyCredentialsCallback(false))
        if(json.result === 'ok') {
          const in13min = Date.now() + (60*1000*13) // 2min margin
          const inAmonthOrSo = Date.now() + (1000*60*60*24*29) // 1 day margin
          this.$store.dispatch("setOption", { key: 'mangadexValidCredentials', value: 1 });
          this.$store.dispatch("setOption", { key: 'mangadexToken', value: json.token.session });
          this.$store.dispatch("setOption", { key: 'mangadexTokenExpire', value: in13min });
          this.$store.dispatch("setOption", { key: 'mangadexRefresh', value: json.token.refresh });
          this.$store.dispatch("setOption", { key: 'mangadexRefreshExpire', value: inAmonthOrSo });
          this.$store.dispatch("setOption", { key: 'mangadexDontRemindMe', value: 0 });
          return this.verifyCredentialsCallback(true)
        }
        return this.verifyCredentialsCallback(false)
      }
      return this.verifyCredentialsCallback(false)
    },
    /**
     * @param {boolean} validity
     */
    verifyCredentialsCallback(validity) {
        // adding "fake" loading time
        setTimeout(() => {
          this.credentialLoading = false
          this.validCredentials = validity
        }, 2000)
    },
    /**
     * Load followed mangas from MD
     */
    async importManga() {
      this.importLoading = true
      const md = new Mangadex(this.options, this.$store.dispatch)
      
      // updating counts
      md.on('getFollows:list:progress', ({total, current}) => {
        this.fetchProgress = String(current > total ? total : current)
        this.fetchTotal = String(total)
        this.$forceUpdate()  
      })
      let loading = 0
      md.on('getFollows:loading:progress', () => {
        if(loading === 0) {
          this.importLoadingText = 'options_mangadex_loading_mangas'
          this.fetchProgress = 0
          loading = 1
        }
        this.fetchProgress = this.fetchProgress+1
        this.$forceUpdate()  
      })
      
      // fetch data
      this.follows = await md.getFollows(this.inStore)
      this.importLoading = false
      this.updatefollowsLangs()
      this.$forceUpdate()
    },
    /**
     * add manga
     * @typedef { { code: String, lastChapterReadURL: String|Void, lastChapterReadName: String|Void, chapters: Array<Array<String>>  } } langsContent
     * @param { { key: String, name: String, mirror: String, url: String, langs: langsContent[] } } item Manga fetched data
     * @param { langsContent } selectedSubitem List of chapters in every languages
     * @param { Boolean } lastItemFromLang automatically set by `addLang()`
     */
    addManga(item, selectedSubitem, lastItemFromLang) {
      const mg = new Manga({
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
      mg.action = "readManga"
      browser.runtime.sendMessage(mg).then(() => {
        const entry = this.follows.find(f=> f.key === item.key)
        if(entry) entry.langs = entry.langs.filter(l => l.code !== selectedSubitem.code)
        this.follows = this.follows.filter(f=> f.langs.length)
        this.updatefollowsLangs()
        if(lastItemFromLang) this.addLangLoading = {value: false, index: -1}
      })
    },
    /**
     * add all mangas available in language
     * @param {String} lang selected language
     */
    addLang(lang) {
      const toAdd = this.follows.filter(f=> f.langs.find(l=> l.code == lang))
      toAdd.forEach((item, i, arr) => {
        const wait = i*150
          setTimeout(() => {
            const selectedSubitem = item.langs.find(l => l.code == lang)
            if(i === arr.length-1) this.addManga(item, selectedSubitem, true)
            else this.addManga(item, selectedSubitem)
          }, wait)
      })
    },
    /**
     * Update this.followsLangs based on this.follows values
     */
    updatefollowsLangs() {
      // get all available languages from data
      const langs = Array.from(
        new Set(
          [].concat.apply(
            [],
            this.follows.map(follow => follow.langs.map(lang => lang.code))
          )
        )
      )

      // display the number of available entries for each languages
      this.followsLangs = langs.map(l => {
        return {
          code: l,
          count: this.follows.filter(follow => follow.langs.find(lang => lang.code === l && lang.chapters.length)).length
        }
      }).sort((a, b) => a.code > b.code ? 1 : -1)
    },
  },
  components: {Flag}
}

</script>

