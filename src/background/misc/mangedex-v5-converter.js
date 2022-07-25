export async function converToMangadexV5(store, logger) {
    // retry later if one of these is running
    if (store.state.options.isUpdatingChapterLists || store.state.options.isSyncing) {
        setTimeout(() => {
            converToMangadexV5()
        }, 30 * 1000)
        return
    }

    store.dispatch("setOption", { key: "isConverting", value: 1 }) // Set watcher
    let mangaToUpdate = store.state.mangas.all.filter(manga => manga.mirror == "MangaDex")

    for (const manga of mangaToUpdate) {
        try {
            // let manga = mangaToUpdate[0]
            logger.debug("Checking for manga id", manga.key)
            let id = parseInt(manga.url.split("/").pop())

            let seriesUpdate = await fetch("https://api.mangadex.org/legacy/mapping", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    type: "manga",
                    ids: [id]
                })
            }).then(r => r.json())

            // console.debug('MD Response', seriesUpdate)

            if (seriesUpdate[0].result == "ok") {
                let newId = seriesUpdate[0].data.attributes.newId
                let chapterId = parseInt(manga.lastChapterReadURL.split("/").pop())

                let lastChapterUpdate = await fetch("https://api.mangadex.org/legacy/mapping", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        type: "chapter",
                        ids: [chapterId]
                    })
                }).then(r => r.json())

                let lastChapterInfo = await fetch(
                    "https://api.mangadex.org/chapter/" + lastChapterUpdate[0].data.attributes.newId
                ).then(r => r.json())

                if (lastChapterInfo.result !== "ok") throw new Error("Something failed")

                let readmg = {
                    mirror: "MangaDex V5",
                    name: manga.name,
                    url: "https://mangadex.org/title/" + newId, ///
                    lastChapterReadURL: "https://mangadex.org/chapter/" + lastChapterInfo.data.id,
                    display: manga.display,
                    layout: manga.layout,
                    // cats: manga.cats,
                    language: lastChapterInfo.data.attributes.translatedLanguage,
                    displayName: manga.displayName,
                    webtoon: manga.webtoon,
                    action: "readManga"
                }

                await new Promise(r => setTimeout(r, 1000))

                await store.dispatch("readManga", readmg)

                await store.dispatch("deleteManga", manga)
            }
        } catch (e) {
            // Do nothing because I don't care if it fails
            logger.debug("Error updating mangadex entry", e)
        }

        await new Promise(r => setTimeout(r, 2000)) // Pause to give mangadex servers a rest
    }
    store.dispatch("setOption", { key: "isConverting", value: 0 }) // Unset watcher
}
