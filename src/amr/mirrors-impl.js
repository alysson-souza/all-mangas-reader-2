import 'regenerator-runtime/runtime';
import store from '../store';

/**
 * Mirrors implementation loader and reference.
 * Loads js implementation scripts and store it
 */
class MirrorsImpl {
    constructor() {
        this.implementations = [];
        /**
         * This function is called when an implementation is loaded
         */
        (function (mirrorsImpl) {
            window["registerMangaObject"] = function (mirrorName, object) {
                mirrorsImpl.implementations[mirrorName] = object;
            }
        })(this);
    }

    /**
     * Removes the implementation cache
     */
    resetImplementations() {
        this.implementations = [];
    }

    /**
     * Load a mirror implementation file and return a Promise containing implementation object when loaded
     * @param {*} scripturl 
     */
    async loadImplScript(mirrorName, scripturl) {
        let self = this;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            document.body.appendChild(script);
            script.onload = () => {
                //wait for implemenattion object to be populated
                (function waitForInit() {
                    if (self.implementations[mirrorName]) return resolve(self.implementations[mirrorName]);
                    setTimeout(waitForInit, 10);
                })();
            };
            script.onerror = reject;
            script.async = true;
            script.src = scripturl + "?ts=" + new Date().getTime(); // do not cache script implementation when loading it
        });
    }

    /**
     * Return mirror implementation object from mirrorName
     * @param {*} mirrorName 
     */
    async getImpl(mirrorName) {
        if (!this.implementations) this.implementations = [];
        if (this.implementations[mirrorName]) {
            return Promise.resolve(this.implementations[mirrorName]);
        }
        let self = this;
        return new Promise(async (resolve, reject) => {
            let found = false;
            // Try to load script from first repo, next, ...
            for (let repo of store.state.options["impl_repositories"]) {
                let mirror = store.state.mirrors.all.find(mir => mir.mirrorName === mirrorName);
                await self.loadImplScript(mirrorName, repo + mirror.jsFile)
                    .catch(() => { }) // ignore repo and go to next
                    .then((obj) => {
                        // implementation loaded
                        resolve(obj);
                        found = true;
                    });
                if (found) break;
            }
            // No repo can load the implementation
            if (!found) return Promise.reject();
        });
    }
}

export default (new MirrorsImpl)