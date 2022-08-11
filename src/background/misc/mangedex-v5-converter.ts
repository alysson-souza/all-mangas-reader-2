import { AppStore } from "../../types/common"
import { AppLogger } from "../../shared/AppLogger"

export async function convertToMangaDexV5(store: AppStore, logger: AppLogger) {
    // retry later if one of these is running
    if (store.state.options.isUpdatingChapterLists || store.state.options.isSyncing) {
        setTimeout(() => {
            convertToMangaDexV5(store, logger)
        }, 30 * 1000)
        return
    }
    const mangaToUpdate = store.state.mangas.all.filter(manga => manga.mirror == "MangaDex")
    if (mangaToUpdate.length === 0) {
        return
    }

    logger.debug(`Found ${mangaToUpdate.length} MangaDex mangas. Converting...`)
    store.dispatch("setOption", { key: "isConverting", value: 1 }) // Set watcher

    for (const manga of mangaToUpdate) {
        try {
            logger.debug("Checking for manga id " + manga.key)
            const id = parseInt(manga.url.split("/").pop())

            const response = await fetch("https://api.mangadex.org/legacy/mapping", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    type: "manga",
                    ids: [id]
                })
            }).then(r => r.json())

            if (response.result === "ok") {
                const newId = response.data[0].attributes.newId
                const chapterId = parseInt(manga.lastChapterReadURL.split("/").pop())

                const lastChapterUpdate = await fetch("https://api.mangadex.org/legacy/mapping", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        type: "chapter",
                        ids: [chapterId]
                    })
                }).then(r => r.json())

                if (lastChapterUpdate.result !== "ok") {
                    throw new Error(JSON.stringify(lastChapterUpdate.error))
                }

                const lastChapterInfo = await fetch(
                    "https://api.mangadex.org/chapter/" + lastChapterUpdate.data[0].attributes.newId
                ).then(r => r.json())

                if (lastChapterInfo.result !== "ok") {
                    throw new Error(JSON.stringify(lastChapterInfo.error))
                }

                const readmg = {
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
            logger.debug("Error updating mangadex entry: " + e.message)
        }

        await new Promise(r => setTimeout(r, 2000)) // Pause to give mangadex servers a rest
    }
    store.dispatch("setOption", { key: "isConverting", value: 0 }) // Unset watcher
}
