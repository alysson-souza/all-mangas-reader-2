import store from '../store';

class HandleOptions {
    handle(message, sender) {
        switch (message.action) {
            // get options array
            case "getoptions":
                return Promise.resolve(store.state.options);
        }
    }
}
export default (new HandleOptions)