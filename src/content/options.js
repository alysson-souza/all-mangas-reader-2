/**
 * DEPRECATED
 * This code is part of the old version of the reader inherited from V1
 * It still contains code using jQuery or importing code using jQuery
 * The new reader can be found in the reader folder and is full VueJS
 * 
 * This code is kept for debugging reasons and "just in case"
 * It will be removed from V2.5
 */

/**
 * Class to retrieve AMR options
 */
class Options {
    constructor() {
        this.__data__ = null;
    }
    get() {
        return this.__data__;
    }
    /**
     * When scripts are loaded in page, AMR options are injected too
     * This function is called to initialize options
     * @param {*} name 
     */
    load(object) {
        Object.assign(this, object);
        this.__data__ = object;
    }
}

export default (new Options);