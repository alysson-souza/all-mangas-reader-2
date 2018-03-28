import store from '../store';
import * as utils from '../amr/utils';

class HandleVueInit {
    handle(message, sender) {
        switch (message.action) {
            // get state object from reference state in the background store
            case "vuex_initstate":
                return Promise.resolve(utils.serializeVuexObject(store.state[message.module][message.key]));
        }
    }
}
export default (new HandleVueInit)