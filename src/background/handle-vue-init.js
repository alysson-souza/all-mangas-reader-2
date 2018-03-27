import store from '../store';

class HandleVueInit {
    handle(message, sender) {
        switch (message.action) {
            // get state object from reference state in the background store
            case "vuex_initstate":
                return Promise.resolve(store.state[message.module][message.key]);
        }
    }
}
export default (new HandleVueInit)