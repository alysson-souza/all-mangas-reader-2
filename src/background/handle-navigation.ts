import { OptionStorage } from "../shared/OptionStorage"
import { AppStore } from "../types/common"
import { NOT_HANDLED_MESSAGE } from "./background-util"

export class HandleNavigation {
    constructor(private store: AppStore, private optionStorage: OptionStorage) {}

    async handle(message): Promise<undefined | unknown> {
        switch (message.action) {
            // Set bar state
            case "setBarState":
                await this.optionStorage.setKey("isBarVisible", message.barstate)
                return Promise.resolve({})
            // hide navigation bar --> keeps its state
            case "hideBar":
                return this.optionStorage.getKey("isBarVisible").then(current => {
                    const barVisible = (Number(current) + 1) % 2
                    localStorage.isBarVisible = barVisible
                    this.optionStorage.setKey("isBarVisible", barVisible)
                    return { res: barVisible }
                })
            // show navigation bar
            case "showBar":
                await this.optionStorage.setKey("isBarVisible", 1)
                return Promise.resolve({})
            // get current state of navigation bar
            case "barState":
                return this.optionStorage
                    .getKey("isBarVisible")
                    .then(current => ({ barVis: current === undefined ? 1 : current }))
            // get a value from localStorage
            case "get_storage":
                const item = await this.optionStorage.getKey(message.key)
                // undefined means not found handler
                return item === undefined ? null : item
            // set a Value in localStorage
            case "set_storage":
                await this.optionStorage.setKey(message.key, message.value)
                return Promise.resolve(true)
            // set a Value in localStorage
            case "save_option":
                this.store.dispatch("setOption", { key: message.key, value: message.value })
                return Promise.resolve(true)
            default:
                return NOT_HANDLED_MESSAGE
        }
    }
}
