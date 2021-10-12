<template>
<div>
  <!-- Enable Mangadex integration -->
  <v-checkbox v-model="mangadexIntegrationEnable" @change="setOption('mangadexIntegrationEnable')">
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
  <div v-if="mangadexIntegrationEnable && (!mangadexValidCredentials || mangadexExpired)">
    <v-text-field v-model="mangadexLogin" @change="setOption('mangadexLogin')"
                :label="i18n('options_mangadex_login')"></v-text-field>
    <v-text-field type="password" v-model="mangadexPassword" @change="setOption('mangadexPassword')"
                :label="i18n('options_mangadex_password')"></v-text-field>
    <!-- Confirm credentials button -->
    <v-btn :loading="mangadexCredsLoading" v-if="mangadexLogin && mangadexPassword" @click="verifyMangadexCreds"> {{ i18n('options_mangadex_verify_credentials') }}</v-btn>
  </div>
  <!-- Reset credentials button -->
  <v-btn class="mb-4" color="warning" :loading="mangadexCredsLoading" v-if="mangadexValidCredentials && !mangadexExpired" @click="resetMangadexCreds"> {{ i18n('options_mangadex_reset_credentials') }}</v-btn>
  <v-divider v-if="mangadexIntegrationEnable && mangadexValidCredentials && !mangadexExpired" />
  <!-- Mangadex integration options -->
  <div class="mt-4" v-if="mangadexIntegrationEnable && mangadexValidCredentials && !mangadexExpired">
    <v-checkbox
      v-model="mangadexUpdateReadStatus"
      @change="setOption('mangadexUpdateReadStatus')"
      :label="i18n('options_web_markwhendownload_desc')"
      />
    <v-btn v-if="!mdFollows" :loading="mangadexImportLoading" @click="mdImport">LOAD FOLLOWS</v-btn>
    <v-btn v-else :loading="mangadexImportLoading" @click="mdImport">RE-LOAD FOLLOWS</v-btn>
    <div v-if="mdFollows">
      <v-radio-group class="mt-5">
        <v-radio @click="mdFollowsMethod = 'all'">
          <template v-slot:label>
            <div>Select a language and import all</div>
          </template>
        </v-radio>
        <v-radio @click="mdFollowsMethod = 'table'">
          <template v-slot:label>
            <div>Choose from the list</div>
          </template>
        </v-radio>
      </v-radio-group>
      <v-data-table
        v-if="mdFollowsMethod === 'table'"
        :items="mdFollows"
        :items-per-page="10"
        :calculate-widths="true"
        class="elevation-1"
      >
        <template v-slot:item="{item, index}">
          <tr>
            <td class="py-2">
              {{ index+1 }}
            </td>
            <td class="py-2">
              {{ item.title }}
            </td>
            <td class="py-2">
              <v-btn
                class="mx-2"
                v-for="(subitem, index) of item.langs"
                :key="index"
                x-small
                rounded
                color="info"
                @click="mdAddManga(item, subitem)"
              >
                <Flag v-if="subitem.code" :value="subitem.code"/>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-menu v-if="mdFollowsMethod === 'all'" offset-x max-height="196" min-width="50" max-width="100">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on"
          >
            Dropdown
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="(item, index) in mdFollowsLangs"
            :key="index"
            link
          >
            <v-list-item-title @click="mdaddAllMangas(item)"><Flag big :value="item"/></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-alert class="mt-4" v-if="mdaddAllMangasTotal" dense value="true" color="info" icon="mdi-information" text elevation="1">
        importing {{ mdaddAllMangasCount }} / {{ mdaddAllMangasTotal }}
      </v-alert>
    </div>
  </div>
</div>
</template>
<script>
import i18n from "../../amr/i18n";
import Flag from "./Flag";
import { Mangadex } from '../../background/misc/mangadex-v5-integration'

export default {
  props: {

  },
  data() {
    return {
      mangadexCredsLoading: false,
      mangadexLogin: '',
      mangadexPassword: '',
      mangadexImportLoading: false,
      mdFollowsMethod: 'none',
      mdImportAll: false,

    }
  },
  computed: {
    inStore() {
      return this.$store.state.mangas.all.filter(mg => mg.mirror === "MangaDex V5").map(mg => mg.key)
    },
    options() {
      return this.$store.getters.mangadexOptions
    },
    mangadexIntegrationEnable:{
      get () { return this.options.mangadexIntegrationEnable == 1 },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexIntegrationEnable', value: val === true ? 1:0 });
      }
    },
    mangadexValidCredentials: {
      get() { return this.options.mangadexValidCredentials == 1 },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexValidCredentials', value: val === true ? 1:0 });
      }
    },
    // token has expired
    mangadexExpired() {
        if(this.options.mangadexRefreshExpire < Date.now()) return true
        return false
      },
    mangadexUpdateReadStatus: {
      get() { return this.options.mangadexUpdateReadStatus == 1 },
      set (val) {
        this.$store.dispatch("setOption", { key: 'mangadexUpdateReadStatus', value: val === true ? 1:0 });
      }
    }
  },
  watch: {
    mangadexIntegrationEnable(nVal) {
      this.resetMangadexCreds()
    },
  },
  methods: {
    i18n: (message, ...args) => i18n(message, ...args),
    /**
     * Set an option value
     */
    setOption(optstr) {
      //option value in the data model
      let val = this[optstr];
      // Set dark mode before conversion
      if (optstr === 'dark') {
        this.$vuetify.theme.dark = val
      }
      //convert it for base if necessary
      Object.keys(converters).forEach(key => {
        for (let prop of converters[key].properties) {
          if (prop === optstr) val = converters[key].toDb(val);
        }
      });
      this.$store.dispatch("setOption", { key: optstr, value: val });
      // do post treatment for some options
      if (optstr === "deactivateunreadable" && val === 1) { // deactivate all unreadable mirrors if option is checked
          this.deactivateUnreadable();
      }
      // retrieve Sync options, must follow current naming convention : providerSyncEnabled
      if (optstr.toLowerCase().includes('syncenabled') || optstr.toLowerCase().includes('sync')) {
        this.updateSync(optstr, val)
        this.dispatch("updateSync", false);
      }
      if (optstr.toLowerCase().includes('syncenabled') || optstr.toLowerCase().includes('sync')) {
        this.updateSync(optstr, val)
        this.dispatch("updateSync", false);
      }
    },
    async resetMangadexCreds() {
      await this.$store.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 });
      await this.$store.dispatch("setOption", { key: 'mangadexDontRemindMe', value: 0 });
      this.mangadexValidCredentials = 0
    },
    async verifyMangadexCreds() {
      this.mangadexCredsLoading = true
      const res = await fetch("https://api.mangadex.org/auth/login", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: this.mangadexLogin, password: this.mangadexPassword})
      })
      if(res.status == 200) {
        const json = await res.json()
        if(json.result === 'ok') {
          const in13min = Date.now() + (60*1000*13) // 2min margin
          const inAmonthOrSo = Date.now() + (1000*60*60*24*29) // 1 day margin
          this.$store.dispatch("setOption", { key: 'mangadexValidCredentials', value: 1 });
          this.$store.dispatch("setOption", { key: 'mangadexToken', value: json.token.session });
          this.$store.dispatch("setOption", { key: 'mangadexTokenExpire', value: in13min });
          this.$store.dispatch("setOption", { key: 'mangadexRefresh', value: json.token.refresh });
          this.$store.dispatch("setOption", { key: 'mangadexRefreshExpire', value: inAmonthOrSo });
          this.$store.dispatch("setOption", { key: 'mangadexDontRemindMe', value: 0 });
        }

      }
      // adding "fake" loading time
      setTimeout(() => {
        this.mangadexCredsLoading = false
        this.mangadexValidCredentials = 1
      }, 2000)
      
    },
    mdImport() {
      if(this.options.mangadexIntegrationEnable) {
        const md = new Mangadex(this.options, this.$store.dispatch)
        this.mangadexImportLoading = true
        md.getFollows(this.inStore).then((f) => {
          this.mdFollows = f
          const set = new Set(
            [].concat.apply(
              [],
              f.map(f => f.langs.map(l=>l.code))
              )
          )
          this.mdFollowsLangs = Array.from(set).sort((a, b) => a > b ? 1 : -1)
          this.mangadexImportLoading = false
          this.$forceUpdate()
        })
      }
    },
    mdaddAllMangas(lang) {
      const toAdd = this.mdFollows.filter(f=> f.langs.find(l=> l.code === lang))
      this.mdaddAllMangasTotal = String(toAdd.length)
      this.mdaddAllMangasCount = String(0)
      this.mdImportHideLanguage({global: true, lang})
      toAdd.forEach((item, i) => {
        // exponential growth where min = 500 max = 2000
        const wait = i*Math.min(Math.max(i**1.1, 500), 2000)
          setTimeout(() => {
            const selectedSubitem = item.langs.find(l => l.code === lang)
            this.mdAddManga(item, selectedSubitem)
          }, wait)
      })
    },
    /**
     * @param {object} item
     * @param {string} item.id Manga id
     * @param {string} item.title Manga title
     * @param {object} selectedSubitem
     * @param {string} selectedSubitem.code Selected language
     * @param {object} selectedSubitem.lastRead
     * @param {string} selectedSubitem.lastRead.url Last Chapter Read URL
     * @param {string} selectedSubitem.lastRead.title Last Chapter Read Title
     * @param {{title: String, url: String}[]} selectedSubitem.chapters List of chapters
     */
    mdAddManga(item, selectedSubitem) {
      const payload = {
        action: "readManga",
        name: item.title,
        url: `https://mangadex.org/title/${item.id}`,
        mirror: "MangaDex V5",
        lastChapterReadURL: selectedSubitem.lastRead ? selectedSubitem.lastRead.url : selectedSubitem.chapters[0].url,
        lastChapterReadName: selectedSubitem.lastRead ? selectedSubitem.lastRead.title : selectedSubitem.chapters[0].title,
        language: selectedSubitem.code
      }
      browser.runtime.sendMessage(payload).then(() => {
        if(this.mdaddAllMangasCount) {
          this.mdaddAllMangasCount = String(parseInt(this.mdaddAllMangasCount)+1)
        }
        this.mdImportHideLanguage({global: false, item, selectedSubitem})
      })
    },
    /**
     * hide language from import
     * @param {object} params
     * @param {string} params.lang language to hide, works if global is true
     * @param {boolean} params.global true if language is globally hidden
     * @param {object} params.item Manga
     * @param {string} params.item.id Manga id
     * @param {object} params.selectedSubitem selected language object (contains chapters)
     * @param {string} params.selectedSubitem.code selected manga language name
     */
    mdImportHideLanguage({lang, global, item, selectedSubitem}) {
      if(global && lang) {
        this.mdFollowsLangs = this.mdFollowsLangs.filter(l => l !== lang)
        this.mdFollows = this.mdFollows.filter(f => !f.langs.find(l => l.code === lang))
      } else if(item && selectedSubitem) {
        const find = this.mdFollows.find(f => f.id === item.id)
        if(find) {
          find.langs = find.langs.filter(l => l.code !== selectedSubitem.code)
          if(!find.langs.length) {
            this.mdFollows = this.mdFollows.filter(f => f.id !== item.id)
          }
        }
      }
      this.$forceUpdate()
    }
  },
  components: {Flag}
}

</script>

