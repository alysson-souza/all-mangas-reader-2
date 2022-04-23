import Vue from "vue"

/**
 * Encapsulate data collected from mirror implementation to be retrieved everywhere
 */
export default {
    state: {},
    load(object) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                Vue.set(this.state, key, object[key])
            }
        }
    },
    add(key, value) {
        Vue.set(this.state, key, value) /* Properties added to pageData are reactive in Vue components */
    }
}
