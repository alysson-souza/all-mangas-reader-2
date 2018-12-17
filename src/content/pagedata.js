/**
 * DEPRECATED
 * This code is part of the old version of the reader inherited from V1
 * It still contains code using jQuery or importing code using jQuery
 * The new reader can be found in the reader folder and is full VueJS
 * 
 * This code is kept for debugging reasons and "just in case"
 * It will be removed from V2.5
 */

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