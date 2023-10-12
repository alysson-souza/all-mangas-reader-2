import browser from "webextension-polyfill"
import { amrLanguages } from "../../constants/language"
import { matchDomainRule } from "../../shared/utils"

const tests = [
    {
        name: "implementation attributes",
        tests: [
            function mirrorName(mirror) {
                if (mirror.mirrorName && mirror.mirrorName.length > 0) {
                    return [true, "Mirror name is : " + mirror.mirrorName]
                } else {
                    return [false, "Mirror name is missing, check the mirrorName atribute of the implementation"]
                }
            },
            function mirrorLanguages(mirror) {
                if (mirror.languages && mirror.languages.length > 0) {
                    let spl = mirror.languages.split(",")
                    if (spl.length > 0) {
                        let notfound = [],
                            alllangs = amrLanguages.reduce((arr, el) => {
                                Array.isArray(el) ? arr.push(...el) : arr.push(el)
                                return arr
                            }, [])
                        for (let lang of spl) {
                            if (!alllangs.includes(lang)) {
                                notfound.push(lang)
                            }
                        }
                        if (notfound.length > 0) {
                            return [false, "Languages " + notfound.join(", ") + " are not supported in AMR"]
                        } else {
                            return [true, spl.length + " languages found : " + spl.join(", ")]
                        }
                    } else {
                        return [false, "Languages string is malformed, must be languages separated by commas"]
                    }
                } else {
                    return [
                        false,
                        "No languages defined for this mirror, check the languages attribute of the implementation"
                    ]
                }
            },
            function mirrorIcon(mirror) {
                if (mirror.mirrorIcon) {
                    return [true, "Mirror icon of this mirror is <img src='" + mirror.mirrorIcon + "' />"]
                } else {
                    return [
                        false,
                        "No mirror icon for this mirror, check the mirrorIcon attribute of the implementation"
                    ]
                }
            },
            function mirrorWebSites(mirror) {
                if (mirror.domains && mirror.domains.length > 0) {
                    return [true, "Domains on which this mirror will be loaded : " + mirror.domains.join(", ")]
                } else {
                    return [
                        false,
                        "No domains to load this mirror on, check the domains attribute of the implementation"
                    ]
                }
            }
        ],
        comment: "Your mirror icon must be a png file with transparency."
    },
    {
        name: "search mangas",
        tests: [
            {
                output: ["searchList"],
                display: ["select"],
                buttons: [["gotourl", "reloadtestforvalue"]],
                test: async function searchMangas(mirror) {
                    let result = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "search",
                        search: this.search,
                        mirror: mirror.mirrorName
                    })
                    if (result) {
                        if (!Array.isArray(result)) {
                            let nb = 0,
                                listlangs = [],
                                pickable = []
                            for (let lang in result) {
                                if (result[lang].length > 0) pickable.push(lang)
                                nb += result[lang].length
                                listlangs.push(lang)
                            }
                            let picked = pickable[Math.floor(Math.random() * pickable.length)]
                            if (nb > 0) {
                                return [
                                    true,
                                    "<strong>" +
                                        nb +
                                        " mangas found</strong> for the search phrase : <i>" +
                                        this.search +
                                        "</i> in " +
                                        listlangs.length +
                                        " different languages (" +
                                        listlangs.join(", ") +
                                        "), pick language " +
                                        picked +
                                        " for test, containing " +
                                        result[picked].length +
                                        " mangas",
                                    result[picked].map(arr => {
                                        return {
                                            value: arr[1],
                                            text: arr[0]
                                        }
                                    }),
                                    picked
                                ]
                            } else {
                                return [
                                    false,
                                    "Return value is an object, supposed to contain list of results for different languages but no mangas found in these lists for the search phrase : <i>" +
                                        this.search +
                                        "</i>. Fix the implementation method <strong>getMangaList</strong>"
                                ]
                            }
                        } else {
                            if (result.length > 0) {
                                return [
                                    true,
                                    "<strong>" +
                                        result.length +
                                        " mangas found</strong> for the search phrase : <i>" +
                                        this.search +
                                        "</i>",
                                    result.map(arr => {
                                        return {
                                            value: arr[1],
                                            text: arr[0]
                                        }
                                    })
                                ]
                            } else {
                                return [
                                    false,
                                    "No mangas found for the search phrase : " +
                                        this.search +
                                        ". Change the search phrase or fix the implementation method <strong>getMangaList</strong>"
                                ]
                            }
                        }
                    } else {
                        return [
                            false,
                            "No object returned by the imlementation. Fix the implementation method <strong>getMangaList</strong>"
                        ]
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
                output: ["chaptersList", "pickedLanguage"],
                display: ["select", "text"],
                buttons: [["gotourl", "reloadtestforvalue"]],
                test: async function loadChapters(mirror, manga_url) {
                    let result = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "chapters",
                        url: manga_url,
                        mirror: mirror.mirrorName
                    })
                    if (result !== undefined) {
                        if (result.length > 0) {
                            return [
                                true,
                                "<strong>" +
                                    result.length +
                                    " chapters found</strong> for manga url : <i>" +
                                    manga_url +
                                    "</i>",
                                result.map(arr => {
                                    return {
                                        value: arr[1],
                                        text: arr[0]
                                    }
                                })
                            ]
                        } else {
                            let nb = 0,
                                listlangs = [],
                                pickable = []
                            for (let lang in result) {
                                if (result[lang].length > 0) pickable.push(lang)
                                nb += result[lang].length
                                listlangs.push(lang)
                            }
                            let picked = pickable[Math.floor(Math.random() * pickable.length)]
                            if (nb > 0) {
                                return [
                                    true,
                                    "<strong>" +
                                        nb +
                                        " chapters found</strong> for manga url : <i>" +
                                        manga_url +
                                        "</i> in " +
                                        listlangs.length +
                                        " different languages (" +
                                        listlangs.join(", ") +
                                        "), pick language " +
                                        picked +
                                        " for test, containing " +
                                        result[picked].length +
                                        " chapters",
                                    result[picked].map(arr => {
                                        return {
                                            value: arr[1],
                                            text: arr[0]
                                        }
                                    }),
                                    picked
                                ]
                            } else {
                                return [
                                    false,
                                    "No chapters found for manga url : <i>" +
                                        manga_url +
                                        "</i>. Fix the implementation method <strong>getListChaps</strong>"
                                ]
                            }
                        }
                    } else {
                        return [
                            false,
                            "No chapters found for manga url : <i>" +
                                manga_url +
                                "</i>. Fix the implementation method <strong>getListChaps</strong>"
                        ]
                    }
                }
            }
        ],
        comment:
            "<strong>Verify that the list of chapter is in descending order. The latest Chapter must be the first on the list</strong>"
    },
    {
        name: "implementation script will be included in chapters pages found",
        tests: [
            {
                input: ["chaptersList"],
                test: function (mirror, list) {
                    if (!mirror.domains || mirror.domains.length === 0) {
                        return [false, "Can't run test because the domains attribute is missing on implementation"]
                    }
                    let nbok = 0
                    let lstko = []
                    for (let res of list) {
                        let found = false
                        let urlHostname = new URL(res.value).host
                        if (urlHostname.startsWith("www.")) {
                            urlHostname = urlHostname.substring(4, urlHostname.length)
                        }
                        for (let domain of mirror.domains) {
                            if (matchDomainRule({ urlHostname, domain })) {
                                found = true
                                nbok++
                                break
                            }
                        }
                        if (!found) {
                            lstko.push(res.value)
                        }
                    }
                    if (lstko.length === 0) {
                        return [true, "All chapters url can be discovered by the mirror domains entries."]
                    } else {
                        return [
                            false,
                            "The following chapters urls do not match the mirror domains entry : " + lstko.join(", ")
                        ]
                    }
                }
            }
        ]
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
                    })
                    if (result) {
                        return [
                            true,
                            "The chapter " +
                                chapter_url +
                                " is recognized as a chapter page by the mirror implementation"
                        ]
                    } else {
                        return [
                            false,
                            "The chapter " +
                                chapter_url +
                                " is not recognized as a chapter page by the mirror implementation. Fix the implementation method <strong>isCurrentPageAChapterPage</strong> or check that this chapter is really a chapter"
                        ]
                    }
                }
            },
            {
                input: [
                    "valueof chaptersList",
                    "textof chaptersList",
                    "valueof searchList",
                    "textof searchList",
                    "optional:pickedLanguage"
                ],
                output: ["chapterInformations"],
                display: ["object"],
                test: async function getInformations(
                    mirror,
                    chapter_url,
                    chapter_name,
                    manga_url,
                    manga_name,
                    pickedLanguage
                ) {
                    let infos = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "loadChapterAndDo",
                        task: "informations",
                        url: chapter_url,
                        mirror: mirror.mirrorName
                    })
                    if (infos) {
                        let listresults = []
                        listresults.push([true, "Informations retrieved from chapter page", infos])
                        if (manga_name === infos.name) {
                            listresults.push([true, "Manga name retrieved match selected manga"])
                        } else {
                            listresults.push([
                                false,
                                "Manga name retrieved does not match selected manga : name retrieved : <i>" +
                                    infos.name +
                                    "</i>, name must be <i>" +
                                    manga_name +
                                    "</i>. Fix the implementation method <strong>getCurrentPageInfo</strong>"
                            ])
                        }
                        if (manga_url === infos.currentMangaURL) {
                            listresults.push([true, "Manga url retrieved match selected manga"])
                        } else {
                            listresults.push([
                                false,
                                "Manga url retrieved does not match selected manga : url retrieved : <i>" +
                                    infos.currentMangaURL +
                                    "</i>, url must be <i>" +
                                    manga_url +
                                    "</i>. Fix the implementation method <strong>getCurrentPageInfo</strong>"
                            ])
                        }
                        // No more chapter name required, get it for chapters list results
                        /*if (chapter_name === infos.currentChapter) {
                            listresults.push([true, "Chapter name retrieved match selected chapter"])
                        } else {
                            listresults.push([false, "Chapter name retrieved does not match selected chapter : name retrieved : <i>" + infos.currentChapter + "</i>, name must be <i>" + chapter_name + "</i>. Fix the implementation method <strong>getCurrentPageInfo</strong>"])
                        }*/
                        if (chapter_url === infos.currentChapterURL) {
                            listresults.push([true, "Chapter url retrieved match selected chapter"])
                        } else {
                            listresults.push([
                                false,
                                "Chapter url retrieved does not match selected chapter : url retrieved : <i>" +
                                    infos.currentChapterURL +
                                    "</i>, url must be <i>" +
                                    chapter_url +
                                    "</i>. Fix the implementation method <strong>getCurrentPageInfo</strong>"
                            ])
                        }
                        if (pickedLanguage !== undefined && pickedLanguage === infos.language) {
                            listresults.push([true, "Selected language match language returned"])
                        } else if (pickedLanguage !== undefined) {
                            listresults.push([
                                false,
                                "Selected language does not match language returned : language retrieved : <i>" +
                                    infos.language +
                                    "</i>, language must be <i>" +
                                    pickedLanguage +
                                    "</i>. Fix the implementation method <strong>getCurrentPageInfo</strong>"
                            ])
                        }
                        return listresults
                    } else {
                        return [
                            false,
                            "The chapter " +
                                chapter_url +
                                " do not return any information. Fix the implementation method <strong>getCurrentPageInfo</strong>"
                        ]
                    }
                }
            }
        ]
    },
    {
        name: "get list of scans",
        tests: [
            {
                input: ["valueof chaptersList"],
                output: ["listScans"],
                display: ["select"],
                buttons: [["gotourl", "reloadtestforvalue"]],
                test: async function getListScans(mirror, chapter_url) {
                    let result = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "loadChapterAndDo",
                        task: "listScans",
                        url: chapter_url,
                        mirror: mirror.mirrorName
                    })
                    if (result && result.length > 0) {
                        return [
                            true,
                            "<strong>" +
                                result.length +
                                " scans found</strong> for the manga chapter : <i>" +
                                chapter_url +
                                "</i>",
                            result.map(url => {
                                return { value: url, text: url }
                            })
                        ]
                    } else {
                        return [
                            false,
                            "No scans found for the manga chapter : <i>" +
                                chapter_url +
                                "</i>. Fix the implementation method <strong>getListImages</strong>"
                        ]
                    }
                }
            }
        ]
    },
    {
        name: "display scan",
        tests: [
            {
                input: ["oneof listScans"],
                output: ["scanUrl"],
                display: ["image"],
                test: async function loadImage(mirror, scan_url) {
                    let url = await browser.runtime.sendMessage({
                        action: "lab",
                        torun: "getScanUrl",
                        url: scan_url,
                        mirror: mirror.mirrorName
                    })
                    return [true, "Scan loaded with url <i>" + url + "</i>.", url]
                }
            }
        ],
        comment: "<strong>Check if the image loads well !</strong>"
    }
]
export default tests
