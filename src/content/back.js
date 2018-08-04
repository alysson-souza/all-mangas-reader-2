/**
 * All Mangas Reader V2
 * Content script included in every website matching a manga site
 */
import 'regenerator-runtime/runtime';
import browser from "webextension-polyfill";
import reading from './reading';
import navigation from './navigation';
import mirrorImpl from './mirrorimpl';
import pageData from './pagedata';
import util from './util';
import options from './options';
import HandleKeys from './handlekeys';

/**
 * Every mirror implementation ends by a call to registerMangaObject
 * This function is defined here.
 * This script is injected by background script if the page could be a manga page. 
 * Once loaded, the mirror implementation is called and results in this function call
 */
window["registerMangaObject"] = async function (mirrorName, object) {
    util.debug("Mirror implementation " + object.mirrorName + " loaded in page.");
    // initialize Mirror Implementation
    mirrorImpl.load(object);

    // initialize options
    options.load(await browser.runtime.sendMessage({action: "getoptions"}));

    // Initialize the page once the mirror implementation has been loaded
    // Test if current page is a chapter page (according to mirror implementation)
    if (!mirrorImpl.get().isCurrentPageAChapterPage(document, window.location.href)) {
        util.debug("Current page is not recognize as a chapter page by mirror implementation");
        return;
    }
    // Retrieve informations relative to current chapter / manga read
    mirrorImpl.get().getInformationsFromCurrentPage(document, window.location.href, function (data) {
        util.debug("Informations for current page loaded : ");
        util.debug(data);
        // Initialize pageData state
        pageData.load(data);

        let imagesUrl = [];
        if (options.displayChapters == 1) { // if display book
            // retrieve images to load (before doSomethingBeforeWritingScans because it can harm the source of data)
            imagesUrl = mirrorImpl.get().getListImages(document, window.location.href);
            util.debug(imagesUrl.length + " images to load");
        }
        // some mirrors need to do something before the page is transformed
        mirrorImpl.get().doSomethingBeforeWritingScans(document, window.location.href);
    
        // create AMR navigation bar
        navigation.createNavBar();
        // tranform the page to a book
        reading.createBook(imagesUrl);

        // mark manga as read
        if (options.markwhendownload === 0 && options.addauto == 1) {
            reading.consultManga();
        }

        // Initialize key handling
        if (options.displayChapters == 1) { // if display book
            HandleKeys.init();
        }

        // TODO stats perso --> v2.0.3
    });
}

/** Function called through executeScript when context menu button invoked */
window["clickOnBM"] = function(src) {
    let imgScan = $(".spanForImg img[src='" + src + "']");
    if (imgScan.length === 0) {
        imgScan = $(".spanForImg img[src='" + decodeURI(src) + "']");
    }

    pageData.curbookmark.type = "scan";
    pageData.curbookmark.scanUrl = src;
    pageData.curbookmark.scanName = imgScan.data("idScan");

    if (imgScan.data("note") !== undefined) {
        $("#noteAMR").val(imgScan.data("note"));
    } else {
        $("#noteAMR").val("");
    }
    if (imgScan.data("booked")) {
        $("#delBtnAMR").show();
    } else {
        $("#delBtnAMR").hide();
    }

    navigation.showDialog();

}