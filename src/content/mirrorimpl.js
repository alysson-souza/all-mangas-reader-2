/**
 * DEPRECATED
 * This code is part of the old version of the reader inherited from V1
 * It still contains code using jQuery or importing code using jQuery
 * The new reader can be found in the reader folder and is full VueJS
 * 
 * This code is kept for debugging reasons and "just in case"
 * It will be removed from V2.5
 */

class MirrorImpl {
    constructor() {
        /**
         * Current mirror implementation
         */
        this.mirrorImpl = null;
    }

    get() {
        return this.mirrorImpl;
    }

    load(object) {
        if (object.abstract !== undefined) {
            // instantiate the abstract class
            let inst = new window[object.abstract](object.abstract_options)
            // add implementation properties on instance
            Object.assign(inst, object)
            // set object as instanciated abstract
            object = inst;
        }
        this.mirrorImpl = object;
    }
}

export default (new MirrorImpl); //singleton