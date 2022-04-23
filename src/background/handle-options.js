import * as utils from "../amr/utils"

class HandleOptions {
    handle(message, sender) {
        switch (message.action) {
            // get options array
            case "getoptions":
                return Promise.resolve(utils.serializeVuexObject(window["AMR_STORE"].state.options)) // doing that because content script is not vue aware, the reactive vuex object needs to be converted to POJSO
        }
    }
}
export default new HandleOptions()
