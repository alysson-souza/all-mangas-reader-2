import Vue from "vue";

/**
 * Encapsulate data collected from mirror implementation to be retrieved everywhere
 */ 
class PageData {
    constructor() {
        this.__data__ = null;
        this.curbookmark = {};
    }
    get() {
        return this.__data__;
    }
    load(object) {
        Object.assign(this, object);
        this.__data__ = object;
    }
    add(key, value) {
        Vue.set(this, key, value) /* Properties added to pageData are reactive in Vue components */
    }
}
export default (new PageData)