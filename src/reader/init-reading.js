/**
 * All Mangas Reader V2
 * Content script included in every website matching a manga site
 */

import Vue from "vue"
import 'vuetify/dist/vuetify.min.css';
import Vuetify from 'vuetify';
import vuetifyOptions from '../pages/vuetifyOptions';
import VueScrollTo from "vue-scrollto";
import Clipboard from 'v-clipboard'

import AmrReader from './AmrReader.vue';

import browser from "webextension-polyfill";
import mirrorImpl from './state/mirrorimpl';
import options from './state/options';
import ChapterLoader from "./helpers/ChapterLoader";
import store from '../store'

/** DO NOT REMOVE, not used here but define a global object used in loaded implementation */
import mirrorHelper from '../amr/mirrors-helper';

let ourCss = [
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
    'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.8.55/css/materialdesignicons.min.css'
]

if (window["__armreader__"] === undefined) { // avoid loading script twice
    window["__armreader__"] = {}
    window['AMR_STORE'] = store

    window['onPushState'] = async function () {
        //Do load manga only if it's not AMR that triggered the pushState
        if (window["__AMR_IS_LOADING_CHAPTER__"]) {
            //console.log("Push state from within AMR")
            delete window["__AMR_IS_LOADING_CHAPTER__"]
        } else if (window["__AMR_RESTORED_PAGE__"]) {
            //console.log("Website pushed state, load AMR")
            // load AMR ! pushState comes from website
            //window["registerMangaObject"](mirrorImpl.get()) --> css may have been lost... we need to reload the page
            window.location.reload()
        } // else should reload through normal behavior
    }

    /**
     * Every mirror implementation ends by a call to registerMangaObject
     * This function is defined here.
     * This script is injected by background script if the page could be a manga page.
     * Once loaded, the mirror implementation is called and results in this function call
     */
    window["registerMangaObject"] = async function (object) {
        // initialize options
        if (typeof options.load === 'function') {
            options.load(await browser.runtime.sendMessage({action: "getoptions"}));
        }
        console.log("Mirror implementation " + object.mirrorName + " loaded in page.");
        // initialize Mirror Implementation
        if (typeof mirrorImpl.load === 'function') {
            mirrorImpl.load(object);
        }
        // initialize current chapter from data collected from current page
        let chap = new ChapterLoader()
        await chap.checkAndLoadInfos() // get is a chapter ?, infos (current manga, chapter) and scans urls
        let done = chap.loadInReader(options, true) // load chapter data in states
        if (!done) {
            restorePage()
        } else {
            initReader() // create the reader if this is the first chapter loaded in this environment, else, the state mutation will be enough to load new chapter
        }
        window["__current_chapterloader__"] = chap // keep a reference to delete it later
    }
    /**
     * This function is called when an abstraction is loaded
     */
    window["registerAbstractImplementation"] = function (mirrorName) {
        // do nothing there, the abstract object is loaded on the window and referenced by its name
    }
}


/**
 * This function replaces the current page by a custom reader, AMR Reader
 *  - No more glitches depending on the online reader css
 *  - more options, resize fit height, width
 */
function initReader() {
    if (!document.body) { // create body element if non existing (thanks mangarock)
        let bd = document.createElement("body")
        document.children[0].appendChild(bd)
    }
    document.body.innerHTML = ""; //empty the dom page
    let amrdiv = document.createElement("div")
    amrdiv.id = "app"
    document.body.appendChild(amrdiv)

    removeStyles(true)

    // add this line for mobile : <meta name="viewport" content="width=device-width, initial-scale=1">
    var metaview = document.createElement( "meta" )
    metaview.name = "viewport"
    metaview.content = "width=device-width, initial-scale=1"
    document.getElementsByTagName( "head" )[0].appendChild( metaview )

    // document is the only node we keep from the page, ensure it won't break our css :
    document.body.style.padding = "0px"
    document.body.style.margin = "0px"
    document.body.style.setProperty("max-width", "none", "important")
    document.body.style.setProperty("min-width", "auto", "important")
    document.body.style.setProperty("width", "auto", "important")
    // if (options.darkreader === 1) document.body.style.backgroundColor = "#303030"
    // else document.body.style.backgroundColor = "white"

    for (let css of ourCss)
        loadCss(css)

    // Load vue
    Vue.config.productionTip = false
    Vue.use(Vuetify)
    vuetifyOptions.theme.dark = options.darkreader === 1
    Vue.use(VueScrollTo)
    Vue.use(Clipboard)
    new Vue({
        el: amrdiv,
        vuetify: new Vuetify(vuetifyOptions),
        render: h => h(AmrReader)
    });

    setTimeout(removeJsAddedStuff, 1500)
}

function removeJsAddedStuff(times = 10) {
    document.body.style.padding = "0px"
    document.body.style.margin = "0px"
    document.body.style.position = ""
    document.body.style.setProperty("max-width", "none", "important")
    document.body.style.setProperty("min-width", "auto", "important")
    document.body.style.setProperty("width", "auto", "important")

    for (child of document.body.children) {
        if (child.getAttribute('id') !== 'amrapp')
            child.remove()
    }

    if (times > 0) {
        setTimeout(() => removeJsAddedStuff(times - 1), 1500)
    }
}

/** Remove styles from original page to avoid interference with AMR reader */
function removeStyles(withInline = false, times = 10) {
    let stylesheets = document.getElementsByTagName('link'), i, sheet;
    for(i in stylesheets) {
        if (stylesheets.hasOwnProperty(i)) {
            sheet = stylesheets[i];
            if(((sheet.getAttribute("rel") && sheet.getAttribute("rel") == "stylesheet") || (sheet.getAttribute('type') && sheet.getAttribute('type').toLowerCase() == 'text/css'))
                && !ourCss.includes(sheet.getAttribute('href'))) {
                sheet.parentNode.removeChild(sheet);
            }
        }
    }

    if (withInline) {
        let inline = document.getElementsByTagName('style')
        for(i in inline) {
            if (inline.hasOwnProperty(i)) {
                sheet = inline[i];
                if((sheet.getAttribute('type') && sheet.getAttribute('type').toLowerCase() == 'text/css')) {
                    sheet.parentNode.removeChild(sheet);
                }
            }
        }
    }

    if (times > 0) {
        setTimeout(() => removeStyles(false, times - 1), 1500)
    }
}
/** Load css in the page for AMR reader needs */
function loadCss(file) {
    var link = document.createElement( "link" )
    link.href = file
    link.type = "text/css"
    link.rel = "stylesheet"
    link.media = "screen,print"

    document.getElementsByTagName( "head" )[0].appendChild( link )
}
/**
 * Restore the page as it was before we included our scripts tags and code
 * The best would be not to load it but :
 *  - this script is only included in manga websites pages
 *  - we have to load the implementation in the page to know if the reader needs to be loaded. If we do that in a separate script, we will have to reload implementation another time and this will result in more loading time...
 */
function restorePage() {
    console.log("Restore page")
    window["__AMR_RESTORED_PAGE__"] = true
    let cover = document.getElementById("amr-loading-cover")
    if (cover) cover.parentNode.removeChild(cover)

    // For some reason the first run does not actually remove them all, a couple of runs are needed
    for (let a = 0; a < 10; a++) {
        // remove included style
        let styles = document.getElementsByTagName('style'), st;
        for (let i in styles) {
            if (styles.hasOwnProperty(i)) {
                st = styles[i];
                // remove our own styles...
                if (st.innerHTML.indexOf(".amr-") >= 0 || st.innerHTML.indexOf("Vuetify") >= 0) {
                    st.parentNode.removeChild(st);
                }
            }
        }
    }
}
