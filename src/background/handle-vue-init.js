import * as utils from "../amr/utils"

class HandleVueInit {
    handle(message, sender) {
        switch (message.action) {
            // get state object from reference state in the background store
            case "vuex_initstate":
                let mod_state_obj = window["AMR_STORE"].state[message.module]
                if (message.key) mod_state_obj = mod_state_obj[message.key]
                return Promise.resolve(utils.serializeVuexObject(mod_state_obj))
        }
    }
}
export default new HandleVueInit()
