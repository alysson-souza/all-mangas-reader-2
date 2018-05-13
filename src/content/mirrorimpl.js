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
        this.mirrorImpl = object;
    }
}

export default (new MirrorImpl); //singleton