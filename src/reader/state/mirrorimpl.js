class MirrorImpl {
    constructor() {
        /**
         * Current mirror implementation
         */
        this.mirrorImpl = null
    }

    get() {
        return this.mirrorImpl
    }

    load(object) {
        if (object.abstract !== undefined) {
            // instantiate the abstract class
            let inst = new window[object.abstract](object.abstract_options)
            // add implementation properties on instance
            Object.assign(inst, object)
            // set object as instanciated abstract
            object = inst
        }
        this.mirrorImpl = object
    }
}

export default new MirrorImpl() //singleton
