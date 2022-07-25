import { loadMirrors } from "../mirrors/register_implementations"

/**
 * Mirrors implementation loader and reference.
 * Loads js implementation scripts and store it
 */
class MirrorsImpl {
    constructor() {
        this.implementations = {}
        this.abstracts = {}
        this.createCache()
    }

    createCache() {
        const self = this
        /**
         * This function is called when an implementation is loaded
         */
        globalThis["registerMangaObject"] = function (object) {
            if (self.implementations === undefined) {
                self.implementations = {}
            }
            self.implementations[object.mirrorName] = object
        }
        /**
         * This function is called when an abstraction is loaded
         */
        globalThis["registerAbstractImplementation"] = function (mirrorName) {
            if (self.abstracts === undefined) {
                self.abstracts = {}
            }
            self.abstracts[mirrorName] = { loaded: true }
        }
    }

    /**
     * Removes the implementation cache
     */
    resetImplementations() {
        // Nothing to do...
    }

    /**
     * Return mirror implementation object from mirrorName
     * @param {*} mirrorName
     */
    async getImpl(mirrorName) {
        if (Object.keys(this.implementations).length === 0) {
            loadMirrors()
        }
        if (this.implementations[mirrorName] !== undefined) {
            let obj = this.implementations[mirrorName]
            if (obj.abstract) {
                let inst = new window[obj.abstract](obj.abstract_options)
                // add implementation properties on instance
                Object.assign(inst, obj)
                obj = inst
            }
            return Promise.resolve(obj)
        }
    }
}

export default new MirrorsImpl()
