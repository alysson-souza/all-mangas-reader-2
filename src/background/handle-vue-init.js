import * as utils from "../amr/utils"

export class HandleVueInit {
    constructor(store) {
        this.store = store
    }

    async handle(message, sender) {
        switch (message.action) {
            // get state object from reference state in the background store
            case "vuex_initstate":
                let mod_state_obj = this.store.state[message.module]
                if (message.key) {
                    mod_state_obj = mod_state_obj[message.key]
                }
                return utils.serializeVuexObject(mod_state_obj)
        }
    }
}
