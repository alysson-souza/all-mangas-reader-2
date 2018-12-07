/**
 * All Mangas Reader V2
 * Content script included in every website matching a manga site
 */

import Vue from "vue"
import 'vuetify/dist/vuetify.min.css';
import Vuetify from 'vuetify';
import theme from '../pages/theme';
import VueScrollTo from "vue-scrollto";

import AmrReader from './AmrReader.vue';

import browser from "webextension-polyfill";
import mirrorImpl from '../content/mirrorimpl';
import pageData from '../content/pagedata';
import options from '../content/options';
import bookmarks from './bookmarks';

import mirrorHelper from '../amr/mirrors-helper';

if (window["__armreader__"] === undefined) { // avoid loading script twice
    window["__armreader__"] = {}

    /**
     * Every mirror implementation ends by a call to registerMangaObject
     * This function is defined here.
     * This script is injected by background script if the page could be a manga page. 
     * Once loaded, the mirror implementation is called and results in this function call
     */
    window["registerMangaObject"] = async function (object) {
        // initialize options
        options.load(await browser.runtime.sendMessage({action: "getoptions"}));
        
        console.log("Mirror implementation " + object.mirrorName + " loaded in page.");
        // initialize Mirror Implementation
        mirrorImpl.load(object);

        // Initialize the page once the mirror implementation has been loaded
        // Test if current page is a chapter page (according to mirror implementation)
        if (!mirrorImpl.get().isCurrentPageAChapterPage(document, window.location.href)) {
            console.log("Current page is not recognize as a chapter page by mirror implementation");
            restorePage()
            return;
        }
        let imagesUrl
        try {
            // Retrieve informations relative to current chapter / manga read
            let data = await mirrorImpl.get().getInformationsFromCurrentPage(document, window.location.href)
            console.log("Informations for current page loaded : ");
            console.log(data);
            // Initialize pageData state
            pageData.load(data);

            // retrieve images to load (before doSomethingBeforeWritingScans because it can harm the source of data)
            imagesUrl = await mirrorImpl.get().getListImages(document, window.location.href);
            if (!imagesUrl || imagesUrl.length === 0) {
                // No images, do not load the loader
                restorePage()
                return;
            }
        } catch (e) {
            console.error("Error while initializing AMR : ");
            console.error(e)
            // Error while getting informations or images
            restorePage()
            return;
        }
        console.log(imagesUrl.length + " images to load");

        bookmarks.init(imagesUrl)
        initReader(imagesUrl)
    }

    /**
     * This function is called when an abstraction is loaded
     */
    window["registerAbstractImplementation"] = function (mirrorName) {
        // do nothing there, the abstract object is loaded on the window and referenced by its name
    }

    /** Function called through executeScript when context menu button invoked */
    window["clickOnBM"] = function(src) {
    }
}

/**
 * This class replaces the current page by a custom reader, AMR Reader
 *  - No more glitches depending on the online reader css
 *  - more options, resize fit height, width
 */
function initReader(images) {
    document.body.innerHTML = ""; //empty the dom page
    let amrdiv = document.createElement("div")
    amrdiv.id = "app"
    document.body.appendChild(amrdiv)
    
    removeStyles()

    document.body.style.padding = "0px"
    document.body.style.margin = "0px"
    if (options.darkreader === 1) document.body.style.backgroundColor = "#303030"
    else document.body.style.backgroundColor = "white"

    loadCss("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700")
    loadCss("https://cdn.materialdesignicons.com/3.0.39/css/materialdesignicons.min.css")
    
    // Load vue
    Vue.config.productionTip = false
    Vue.use(Vuetify, { theme: theme, iconfont: 'mdi' })
    Vue.use(VueScrollTo)
    new Vue({
        el: amrdiv,
        render: h => h(AmrReader, { props: {images: images} })
    });
}

function removeStyles() {
    let stylesheets = document.getElementsByTagName('link'), i, sheet;
    for(i in stylesheets) {
        if (stylesheets.hasOwnProperty(i)) {
            sheet = stylesheets[i];
            if((sheet.getAttribute("rel") && sheet.getAttribute("rel") == "stylesheet") || (sheet.getAttribute('type') && sheet.getAttribute('type').toLowerCase() == 'text/css')) {
                sheet.parentNode.removeChild(sheet);
            }
        }
    }
}
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
    let cover = document.getElementById("amr-loading-cover")
    if (cover) cover.parentNode.removeChild(cover)

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