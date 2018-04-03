import browser from "webextension-polyfill";
import * as utils from "../../amr/utils";

const tests = [
    {
        name: "implementation attributes",
        tests: [
            function mirrorName(mirror) {
                if (mirror.mirrorName && mirror.mirrorName.length > 0) {
                    return [true, "Mirror name is : " + mirror.mirrorName];
                } else {
                    return [false, "Mirror name is missing"];
                }
            },
            function mirrorLanguages(mirror) {
                if (mirror.languages && mirror.languages.length > 0) {
                    let spl = mirror.languages.split(",");
                    if (spl.length > 0) {
                        return [true, spl.length + " languages found : " + spl.join(", ")]
                    } else {
                        return [false, "Languages string is malformed, must be languages separated by commas"]
                    }
                } else {
                    return [false, "No languages defined for this mirror"]
                }
            },
            function mirrorIcon(mirror) {
                if (mirror.mirrorIcon) {
                    return [true, "Mirror icon of this mirror is <img src='" + mirror.mirrorIcon + "' />"];
                } else {
                    return [false, "No mirror icon for this mirror"];
                }
            },
            function mirrorWebSites(mirror) {
                if (mirror.webSites && mirror.webSites.length > 0) {
                    return [true, "Websites on which this mirror will be loaded : " + mirror.webSites.join(", ")];
                } else {
                    return [false, "No websites to load this mirror on"];
                }
            },
        ], 
        comment: "Your mirror icon must be a png file with transparency."
    },
    {
        name: "search mangas",
        tests: [
            {
                output: "searchList",
                display: "select",
                test: async function searchMangas(mirror) {
                    let result = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "search",
                        search: this.search,
                        mirror: mirror.mirrorName
                    });
                    if (result && result.length > 0) {
                        return [true, "<strong>" + result.length + " mangas found</strong> for the search phrase : <i>" + this.search + "</i>", result.map(arr => {
                            return {
                                value: arr[1],
                                text: arr[0]
                            }
                        })];
                    } else {
                        return [false, "No mangas found for the search phrase : " + this.search + ". Change the search phrase or fix the implementation"];
                    }
                }
            }
        ]
    }, 
    {
        name: "list of chapters", 
        tests: [
            {
                input: ["oneof searchList"], 
                output: "chaptersList",
                display: "select",
                test: async function loadChapters(mirror, manga_url) {
                    let result = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "chapters",
                        url: manga_url,
                        mirror: mirror.mirrorName
                    });
                    if (result && result.length > 0) {
                        return [true, "<strong>" + result.length + " chapters found</strong> for manga url : <i>" + manga_url + "</i>", result.map(arr => {
                            return {
                                value: arr[1],
                                text: arr[0]
                            }
                        })];
                    } else {
                        return [false, "No chapters found for manga url : <i>" + manga_url + "</i>. Fix the implementation"];
                    }
                }
            },
            {
                input: ["chaptersList"],
                test: function (mirror, list) {
                    let nbok = 0;
                    let lstko = [];
                    for (let res of list) {
                        let found = false;
                        for (let u of mirror.webSites) {
                            if (utils.matchUrlWildCards(res.value, u)) {
                                found = true;
                                nbok++;
                                break;
                            }
                        }
                        if (!found) {
                            lstko.push(res.value);
                        }
                    }
                    if (lstko.length === 0) {
                        return [true, "All chapters url can be discovered by the mirror webSites entries."]
                    } else {
                        return [false, "The following chapters urls do not match the mirror webSites entry : " + lstko.join(", ")]
                    }
                }
            }
        ], 
        comment: "<strong>Verify that the list of chapter is in descending order. The latest Chapter must be the first on the list</strong>"
    }, 
    {
        name: "load chapter page in background and get informations",
        set: ["oneof chaptersList"],
        tests: [
            {
                input: ["valueof chaptersList"], 
                test: async function containScans(mirror, chapter_url) {
                    let result = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "loadChapterAndDo",
                        task: "containScans",
                        url: chapter_url,
                        mirror: mirror.mirrorName
                    });
                    if (result) {
                        return [true, "The chapter " + chapter_url + " is recognized as a chapter page by the mirror implementation"]
                    } else {
                        return [false, "The chapter " + chapter_url + " is not recognized as a chapter page by the mirror implementation. Fix the implementation or check that this chapter is really a chapter"]
                    }
                }
            }, 
            {
                input: ["valueof chaptersList", "textof chaptersList", "valueof searchList", "textof searchList"], 
                output: "chapterInformations",
                display: "object",
                test: async function getInformations(mirror, chapter_url, chapter_name, manga_url, manga_name) {
                    let infos = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "loadChapterAndDo",
                        task: "informations",
                        url: chapter_url,
                        mirror: mirror.mirrorName
                    });
                    if (infos) {
                        let listresults = [];
                        if (manga_name === infos.name) {
                            listresults.push([true, "Manga name retrieved match selected manga"])
                        } else {
                            listresults.push([false, "Manga name retrieved does not match selected manga !"])
                        }
                        if (manga_url === infos.currentMangaURL) {
                            listresults.push([true, "Manga url retrieved match selected manga"])
                        } else {
                            listresults.push([false, "Manga url retrieved does not match selected manga !"])
                        }
                        if (chapter_name === infos.currentChapter) {
                            listresults.push([true, "Chapter name retrieved match selected chapter"])
                        } else {
                            listresults.push([false, "Chapter name retrieved does not match selected chapter !"])
                        }
                        if (chapter_url === infos.currentChapterURL) {
                            listresults.push([true, "Chapter url retrieved match selected chapter"])
                        } else {
                            listresults.push([false, "Chapter url retrieved does not match selected chapter !"])
                        }
                        return listresults;
                    } else {
                        return [false, "The chapter " + chapter_url + " do not return any information. Fix the implementation"]
                    }
                }
            }
        ]
    }
]
export default tests;