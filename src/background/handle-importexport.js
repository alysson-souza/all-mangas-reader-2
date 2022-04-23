class HandleImportExport {
    handle(message, sender) {
        switch (message.action) {
            case "mangadexVerifyCredentials":
                return window["AMR_STORE"].dispatch("mangadexVerifyCredentials", message)
            case "mangadexResetCredentials":
                return window["AMR_STORE"].dispatch("mangadexResetCredentials")
            case "mangadexExportToList":
                return window["AMR_STORE"].dispatch("mangadexExportToList", message)
            case "mangadexExportToFollows":
                return window["AMR_STORE"].dispatch("mangadexExportToFollows", message)
            case "mangadexImportMangas":
                return window["AMR_STORE"].dispatch("mangadexImportMangas")
            case "mangadexAddManga":
                return window["AMR_STORE"].dispatch("mangadexAddManga", message)
            case "mangadexAddMangasInLang":
                return window["AMR_STORE"].dispatch("mangadexAddMangasInLang", message)
            case "exportReadStatus":
                return window["AMR_STORE"].dispatch("exportReadStatus", message)
        }
    }
}

export default new HandleImportExport()
