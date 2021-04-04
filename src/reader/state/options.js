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
