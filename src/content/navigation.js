import 'regenerator-runtime/runtime';
import browser from "webextension-polyfill";
import options from './options';
import mirrorImpl from './mirrorimpl';
import pageData from './pagedata'
import util from './util'
import reading from './reading';
import i18n from '../amr/i18n';

/**
 * Manage and create navigation bar in pages
 */
class Navigation {
    constructor() {
        this.timeoutAMRbar = 0;
    }

    async createNavBar() {
        // Get the chapter select from page
        // Build the select
        let selectIns = $("<select></select>");
        selectIns.data("mangaCurUrl", pageData.currentChapterURL);
        
        // try to get list chap from background (already loaded in local db)
        let alreadyLoadedListChaps = await browser.runtime.sendMessage({
            action: "getListChaps",
            url: pageData.currentMangaURL
        });
        if (alreadyLoadedListChaps && alreadyLoadedListChaps.length > 0) {
            this.callbackListChaps(alreadyLoadedListChaps, selectIns)
        } else {
            // Change currentMangaURL so no conflict in http over https
            mirrorImpl.get().getListChaps(util.removeProtocol(pageData.currentMangaURL), pageData.name, selectIns, this.callbackListChaps.bind(this));
        }
    }

    /**
     * Callback of the getListChaps function from mirror implementation (used to fill the created select)
     * @param {*} list 
     * @param {*} select 
     */
    async callbackListChaps(list, select) {
        let hasSelected = false;
        for (let j = 0; j < list.length; j++) {
            let optTmp = $("<option value=\"" + list[j][1] + "\">" + list[j][0] + "</option>");
            if ($(select).data("mangaCurUrl").indexOf(list[j][1]) != - 1 && !hasSelected) {
                optTmp.attr("selected", true);
                if ($(select).data("mangaCurUrl") == list[j][1]) {
                    hasSelected = true;
                }
            }
            optTmp.appendTo($(select));
        }

        let whereNav;
        let barstate = await browser.runtime.sendMessage({ action: "barState" });
        whereNav = this.createBar(barstate.barVis);
        this.writeNavigation(whereNav, select);
    }

    /**
     * Create a toolbar which auto hide
     */
    createBar(barVis) {
        let navigation = this;
        let div = $("<div id='AMRBar'></div>");
        let divIn = $("<div id='AMRBarIn'></div>");

        let img = $("<img src='" + browser.extension.getURL("icons/icon_32.png") + "' width='20px;'/>");
        img.appendTo(divIn);
        let divContent = $("<div></div>");
        divContent.appendTo(divIn);
        divContent.css("display", "inline-block");

        let divBottom = $("<div></div>");
        divBottom.css("display", "inline-block");
        let imgBtn = $("<img src='" + browser.extension.getURL("icons/down.png") + "' width='16px;' title='" + i18n("content_nav_hidebar") + "'/>");
        imgBtn.appendTo(divBottom);
        imgBtn.click(async () => {
            let response = await browser.runtime.sendMessage({ action: "hideBar" });
            if (response.res == 1) {
                if ($("#AMRBarIn").data("temporary")) {
                    $("#AMRBarIn").removeData("temporary");
                    if (navigation.timeoutAMRbar !== 0) {
                        clearTimeout(navigation.timeoutAMRbar);
                    }
                }
                $("#AMRBarInLtl").fadeOut('fast', function () {
                    $("#AMRBar").css("text-align", "center");
                    $("#AMRBarIn").fadeIn();
                });
            } else {
                $("#AMRBarIn").fadeOut('fast', function () {
                    $("#AMRBar").css("text-align", "left");
                    $("#AMRBarInLtl").fadeIn(function () {
                        $(this).css("display", "inline-block");
                    });
                });
            }
        });

        div.mouseenter(function () {
            if (navigation.timeoutAMRbar !== 0) {
                clearTimeout(navigation.timeoutAMRbar);
            }
            if (!$("#AMRBarIn", $(this)).is(":visible")) {
                $("#AMRBarIn").data("temporary", true);
                $("#AMRBarInLtl").fadeOut('fast', function () {
                    $("#AMRBar").css("text-align", "center");
                    $("#AMRBarIn").fadeIn();
                });
            }
        });

        div.mouseleave(function () {
            if ($("#AMRBarIn").data("temporary")) {
                if (navigation.timeoutAMRbar !== 0) {
                    clearTimeout(navigation.timeoutAMRbar);
                }
                navigation.timeoutAMRbar = setTimeout(function () {
                    $("#AMRBarIn").removeData("temporary");
                    $("#AMRBarIn").fadeOut('fast', function () {
                        $("#AMRBar").css("text-align", "left");
                        $("#AMRBarInLtl").fadeIn(function () {
                            $(this).css("display", "inline-block");
                        });
                    });
                }, 2000);
            }
        });

        divBottom.appendTo(divIn);

        let divInLtl = $("<div id='AMRBarInLtl'></div>");
        divInLtl.css("display", "inline-block");

        let imgLtl = $("<img src='" + browser.extension.getURL("icons/icon_32.png") + "' width='40px;' title='" + i18n("content_nav_showbar") + "'/>");
        imgLtl.css("margin-top", "-10px");
        imgLtl.css("margin-left", "-10px");
        imgLtl.css("cursor", "pointer");

        imgLtl.appendTo(divInLtl);
        imgLtl.click(function () {
            $("#AMRBarInLtl").fadeOut('fast', function () {
                $("#AMRBar").css("text-align", "center");
                $("#AMRBarIn").fadeIn();
                browser.runtime.sendMessage({ action: "showBar" });
            });
        });

        divIn.css("display", "inline-block");
        divIn.appendTo(div);
        divInLtl.appendTo(div);

        div.appendTo($(document.body));
        $(document.body).css("border-top", "34px solid black");
        $(document.body).css("background-position-y", "34px");

        if (barVis == 0) {
            $("#AMRBar").css("text-align", "left");
            $("#AMRBarIn").hide();
        } else {
            $("#AMRBar").css("text-align", "center");
            $("#AMRBarInLtl").hide();
        }
        return divContent;
    }

    /**
     * 
     * @param {*} where 
     * @param {*} select 
     */
    async writeNavigation(where, select) {
        let div = $("<div id='bookmarkPop' style='display:none'></div>"),
            btn = $("<a id='saveBtnAMR' class='buttonAMR'>" + i18n("button_save") + "</a>");
        $("<h3>" + i18n("bookmark_popup_title") + "</h3>").appendTo(div);
        $("<div id='descEltAMR'></div>").appendTo(div);
        $("<table><tr><td style='vertical-align:top'><b>" + i18n("bookmark_popup_note") +  ":</b></td><td><textarea id='noteAMR' cols='50' rows='5' /></td></tr></table>").appendTo(div);

        //TODO !!
        //btn.click(add_bookmark_button);

        let btndel = $("<a id='delBtnAMR' class='buttonAMR'>" + i18n("bookmark_popup_delete") + "</a>");
        //TODO !!
        //btndel.click(delete_bookmark_button);
        btndel.appendTo(div);
        btn.appendTo(div);

        let divTip = $("<div id='tipBMAMR'></div>");
        $(i18n("bookmark_popup_tip")).appendTo(divTip);
        $("a", divTip).click(function () {
            browser.runtime.sendMessage({
                action: "opentab",
                url: "/bookmarks.html"
            });
        });
        divTip.appendTo(div);
        div.appendTo($(document.body));

        where.empty();
        let navigation = this;
        //Get specific read for currentManga
        let mangaInfos = await browser.runtime.sendMessage({
            action: "mangaInfos",
            url: pageData.currentMangaURL
        });
        where.each((index, w) => {
            let selectIns;
            let $w = $(w);

            selectIns = $(select).clone();
            $(selectIns).css("float", "none");
            $(selectIns).css("max-width", $(document).width() - 450 + "px");
            selectIns.attr("value", $(select).children("option:selected").val());

            selectIns.change(function () {
                window.location.href = $("option:selected", $(this)).val();
            });

            let prevUrl;
            if (selectIns.children("option:selected").next().length > 0) {
                prevUrl = selectIns.children("option:selected").next().val();
            }
            if (prevUrl !== null) {
                let aprev = $("<a id='pChapBtn" + index + "' class='buttonAMR' href='" + prevUrl + "' onclick='window.location.href = this.href; window.location.reload();'>" + i18n("content_nav_previous") + "</a>");
                aprev.appendTo($w);
            }

            selectIns.appendTo($w);
            let nextUrl;
            if (selectIns.children("option:selected").prev().length > 0) {
                nextUrl = selectIns.children("option:selected").prev().val();
            }
            if (nextUrl !== null) {
                let anext = $("<a id='nChapBtn" + index + "' class='buttonAMR' href='" + nextUrl + "' onclick='window.location.href = this.href; window.location.reload();'>" + i18n("content_nav_next") + "</a>");
                anext.appendTo($w);
                pageData.add("nexturltoload", nextUrl);
            }

            //Add bookmark functionality
            let book = $("<img class='bookAMR' src='" + browser.extension.getURL("icons/bookmark.png") + "'/>");
            book.appendTo($w);
            book.click(function () {
                $("#bookmarkData").data("type", "chapter");
                $("#noteAMR").val($("#bookmarkData").data("note"));
                if ($("#bookmarkData").data("chapbooked")) {
                    $("#delBtnAMR").show();
                } else {
                    $("#delBtnAMR").hide();
                }

                $("#bookmarkPop").modal({
                    focus: false,
                    onShow: navigation.showDialog,
                    zIndex: 10000000
                });
            });
            if (index === 0) {
                //TODO !! careful there is an await but no async as it is an anonymous function wrapped by jQuery --> externalize to function
                /*
                let objBM = {
                    action: "getBookmarkNote",
                    mirror: mirrorImpl.get().mirrorName,
                    url: pageData.currentMangaURL,
                    chapUrl: pageData.currentChapterURL,
                    type: "chapter"
                };
                let result = await browser.runtime.sendMessage(objBM);
                if (!result.isBooked) {
                    $("#bookmarkData").data("note", "");
                    $(".bookAMR").attr("title", "Click here to bookmark this chapter");
                } else {
                    $("#bookmarkData").data("note", result.note);
                    if (result.note !== "") $(".bookAMR").attr("title", "Note : " + result.note);
                    $("#bookmarkData").data("chapbooked", true);
                    $(".bookAMR").attr("src", browser.extension.getURL("icons/bookmarkred.png"));
                }*/
            }

            let isRead = (mangaInfos === null ? false : (mangaInfos.read == 1));
            let imgread = $("<img class='butamrread' src='" + browser.extension.getURL("icons/" + (!isRead ? "read_stop.png" : "read_play.png")) + "' title='" + (!isRead ? i18n("content_nav_stopfollow") : i18n("content_nav_follow")) + "' />");
            if (mangaInfos === null && options.addauto === 0) {
                imgread.hide();
            }
            imgread.appendTo($w);
            imgread.data("mangaurl", pageData.currentMangaURL);

            imgread.click(function () {
                let curRead = ($(this).attr("src") == browser.extension.getURL("icons/read_play.png"));
                let obj = {
                    action: "markReadTop",
                    url: $(this).data("mangaurl"),
                    read: (curRead ? 0 : 1),
                    updatesamemangas: true
                };

                let _but = this;
                util.sendExtRequest(obj, $(this), function () {
                    if (curRead) {
                        $(_but).attr("src", browser.extension.getURL("icons/read_stop.png"));
                        $(_but).attr("title", i18n("content_nav_stopfollow"));
                    } else {
                        $(_but).attr("src", browser.extension.getURL("icons/read_play.png"));
                        $(_but).attr("title", i18n("content_nav_follow"));
                    }
                }, false);
            });

            //Get specific mode for currentManga
            let curmode = -1;
            if (mangaInfos !== null && mangaInfos.display) {
                curmode = mangaInfos.display;
            }
            //If not use res.mode
            if (curmode == -1) {
                curmode = options.displayMode;
            }
            //mode = 1 --> images are displayed on top of one another
            //mode = 2 --> images are displayed two by two occidental reading mode
            //mode = 3 --> images are displayed two by two japanese reading mode
            let imgmode = $("<img src='" + browser.extension.getURL("icons/" + ((curmode == 1) ? "ontop.png" : ((curmode == 2) ? "righttoleft.png" : "lefttoright.png"))) + "' title='" + ((curmode == 1) ? i18n("content_nav_chapmode_1") : ((curmode == 2) ? i18n("content_nav_chapmode_2") : i18n("content_nav_chapmode_3"))) + "' />");
            imgmode.appendTo($w);
            imgmode.data("curmode", curmode);
            imgmode.data("mangaurl", pageData.currentMangaURL);
            imgmode.click(function () {
                let md = $(this).data("curmode");
                let mdnext = (md % 3) + 1;
                let obj = {
                    action: "setDisplayMode",
                    url: $(this).data("mangaurl"),
                    display: mdnext
                };
                let _butMode = this;
                util.sendExtRequest(obj, $(this), function () {
                    $(_butMode).data("curmode", mdnext);
                    reading.transformImagesInBook(pageData.whereScans, mdnext);
                    if (mdnext == 1) {
                        $(_butMode).attr("src", browser.extension.getURL("icons/ontop.png"));
                        $(_butMode).attr("title", i18n("content_nav_chapmode_1"));
                    } else if (mdnext == 2) {
                        $(_butMode).attr("src", browser.extension.getURL("icons/righttoleft.png"));
                        $(_butMode).attr("title", i18n("content_nav_chapmode_2"));
                    } else {
                        $(_butMode).attr("src", browser.extension.getURL("icons/lefttoright.png"));
                        $(_butMode).attr("title", i18n("content_nav_chapmode_3"));
                    }
                }, false);
            });

            let imgstop = $("<img class='butamrstop' src='" + browser.extension.getURL("icons/stop.gif") + "' title='" + i18n("content_nav_mark_read") + "' />");
            if (mangaInfos === null && options.addauto === 0) {
                imgstop.hide();
            }
            imgstop.appendTo($w);
            imgstop.data("mangainfo", pageData);

            imgstop.click(function () {
                let ret = confirm(i18n("content_nav_mark_read_confirm"));
                if (ret) {
                    let obj = {
                        "action": "setMangaChapter",
                        "url": $(this).data("mangainfo").currentMangaURL,
                        "mirror": mirrorImpl.get().mirrorName,
                        "lastChapterReadName": $(this).data("mangainfo").currentChapter,
                        "lastChapterReadURL": $(this).data("mangainfo").currentChapterURL,
                        "name": $(this).data("mangainfo").name
                    };
                    util.sendExtRequest(obj, $(this), function () { }, true);
                }
            });

            if (options.addauto === 0 && mangaInfos === null) {
                let imgadd = $("<img src='" + browser.extension.getURL("icons/add.png") + "' title='" + i18n("content_nav_add_list") + "' />");
                imgadd.appendTo($w);
                imgadd.data("mangainfo", pageData);

                imgadd.click(function () {
                    let obj = {
                        "action": "readManga",
                        "url": $(this).data("mangainfo").currentMangaURL,
                        "mirror": mirrorImpl.get().mirrorName,
                        "lastChapterReadName": $(this).data("mangainfo").currentChapter,
                        "lastChapterReadURL": $(this).data("mangainfo").currentChapterURL,
                        "name": $(this).data("mangainfo").name
                    };
                    let _butadd = this;
                    util.sendExtRequest(obj, $(this), function () {
                        $(".butamrstop").show();
                        $(".butamrread").show();
                        $(_butadd).remove();
                    }, true);
                });
            }

            $w.addClass("amrbarlayout");
        });
    }

    addTrailingLastChap(where) {
        if ($("#nChapBtn0").size() === 0) {
            $("<div style=\"width:100%; background-color:white; border-radius:5px;margin-top:15px;margin-bottom:15px;\"><img src=\"" + browser.extension.getURL("icons/warn.png") + "\" style=\"vertical-align:middle;margin-right:10px;\"/><span style=\"font-weight:bold;font-size:12pt;color:black;vertical-align:middle;\">" + i18n("content_nav_last_chap") + "</span></div>").appendTo(where);
        }
    }

    //TODO
    showDialog(dialog) {
        let textDesc;
        if ($("#bookmarkData").data("type") == "chapter") {
            textDesc = i18n("bookmark_chapter_text", 
                $("#bookmarkData").data("chapName"), 
                $("#bookmarkData").data("name"), 
                $("#bookmarkData").data("mirror"));
        } else {
            textDesc = i18n("bookmark_chapter_scan", 
                $("#bookmarkData").data("scanName"),
                $("#bookmarkData").data("chapName"),
                $("#bookmarkData").data("name"),
                $("#bookmarkData").data("mirror"));
        }
        $("#bookmarkPop #descEltAMR").text(textDesc);
    }
}
export default (new Navigation) // singleton