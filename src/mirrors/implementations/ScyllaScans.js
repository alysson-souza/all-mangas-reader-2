if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Scylla Scans",
        mirrorIcon: "scyllascans.png",
        languages: "en",
        domains: ["scyllascans.org"],
        home: "https://scyllascans.org/",
        apiUrl: "https://api.scyllascans.org/",
        chapter_url: /\/(read).*/,

        fetchGraphQl: async function (query, variables) {
            const { data } = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            }).then(res => res.json())

            return data
        },

        getMangaList: async function () {
            const query = `
                query works($orderBy: String, $sortBy: String, $first: Int, $offset: Int, $languages: [Int], $showHidden: Boolean) {
                    works(orderBy: $orderBy, sortBy: $sortBy, first: $first, offset: $offset, languages: $languages, showHidden: $showHidden) {
                    name
                    language_name
                    stub
                    }
                }
              `

            const { works } = await this.fetchGraphQl(query, {
                orderBy: "asc",
                sortBy: "id",
                first: 1000,
                offset: 0,
                languages: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                showHidden: true
            })

            return works.map(({ name, language_name, stub }) => {
                return [name, "https://scyllascans.org/work/" + language_name + "/" + stub]
            })
        },

        getListChaps: async function (urlManga) {
            const query = `
                query chaptersByWork($workStub: String, $languages: [Int], $showHidden: Boolean) {
                    chaptersByWork(workStub: $workStub, languages: $languages, showHidden: $showHidden) {
                        chapter
                        subchapter
                        read_path
                    }
                }
            `
            const { chaptersByWork } = await this.fetchGraphQl(query, {
                workStub: urlManga.match(/([^\/]*)$/)[0],
                languages: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                showHidden: true
            })

            return chaptersByWork.map(({ chapter, subChapter, read_path }) => {
                if (subChapter > 0) chapter = chapter + "." + subChapter
                return [chapter, this.home + read_path]
            })
        },

        getChapterInfo: function (curUrl) {
            const dataFromUrl = curUrl.match(/(?<=read\/)(.*)/)[0].split("/")
            const [workStub, language, volume] = dataFromUrl
            const [chapter, subChapter] = dataFromUrl[3].split(".")
            const langIdentifiers = {
                en: 2
            }

            return {
                workStub,
                languageId: langIdentifiers[language],
                language: language,
                chapter: parseInt(chapter),
                volume: parseInt(volume),
                subChapter: parseInt(subChapter)
            }
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            const url = new URL(curUrl)
            const { workStub, language } = this.getChapterInfo(curUrl)
            const elemWithTitle = new Array(...doc.querySelectorAll("a")).find(elem => {
                return elem.title && elem.className.includes("ReaderControlsWork")
            })

            return {
                name: elemWithTitle.title,
                currentMangaURL: this.home + "work/" + language + "/" + workStub,
                currentChapterURL: url.origin.replace(/\/$/, "") + url.pathname
            }
        },

        getListImages: async function (_, curUrl) {
            const query = `
                query chapterByWorkAndChapter($workStub: String, $language: Int, $volume: Int, $chapter: Int, $subChapter: Int, $showHidden: Boolean) {
                    chapterByWorkAndChapter(workStub: $workStub, language: $language, volume: $volume, chapter: $chapter, subchapter: $subChapter, showHidden: $showHidden) {
                        uniqid
                        work {
                            uniqid
                        }
                        pages {
                            filename
                        }
                    }
                }
            `

            const { languageId, workStub, chapter, subChapter, volume } = this.getChapterInfo(curUrl)
            const { chapterByWorkAndChapter: cha } = await this.fetchGraphQl(query, {
                workStub,
                language: languageId,
                chapter,
                subChapter,
                volume,
                showHidden: true
            })
            const startUrl = `${this.apiUrl}/works/${cha.work.uniqid}/${cha.uniqid}`
            return cha.pages.map(page => `${startUrl}/${page.filename}?strip=all&quality=100`)
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (_, curUrl) {
            return this.chapter_url.test(curUrl)
        }
    })
}
