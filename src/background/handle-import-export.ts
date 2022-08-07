import { AppStore } from "../types/common"
import { NOT_HANDLED_MESSAGE } from "./background-util"

export class HandleImportExport {
    constructor(private store: AppStore) {}

    async handle(message) {
        switch (message.action) {
            case "mangadexVerifyCredentials":
                return this.store.dispatch("mangadexVerifyCredentials", message)
            case "mangadexResetCredentials":
                return this.store.dispatch("mangadexResetCredentials")
            case "mangadexExportToList":
                return this.store.dispatch("mangadexExportToList", message)
            case "mangadexExportToFollows":
                return this.store.dispatch("mangadexExportToFollows", message)
            case "mangadexImportMangas":
                return this.store.dispatch("mangadexImportMangas")
            case "mangadexAddManga":
                return this.store.dispatch("mangadexAddManga", message)
            case "mangadexAddMangasInLang":
                return this.store.dispatch("mangadexAddMangasInLang", message)
            case "exportReadStatus":
                return this.store.dispatch("exportReadStatus", message)
            default:
                return NOT_HANDLED_MESSAGE
        }
    }
}
