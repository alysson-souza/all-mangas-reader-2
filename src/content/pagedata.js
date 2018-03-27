/**
 * Encapsulate data collected from mirror implementation to be retrieved everywhere
 */ 
class PageData {
    constructor() {
        this.__data__ = null;
    }
    get() {
        return this.__data__;
    }
    load(object) {
        Object.assign(this, object);
        this.__data__ = object;
    }
    add(key, value) {
        this[key] = value;
    }
}
export default (new PageData)