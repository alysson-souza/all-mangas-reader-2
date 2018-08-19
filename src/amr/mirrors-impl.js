import 'regenerator-runtime/runtime';
import store from '../store';
import * as utils from './utils';

/**
 * Mirrors implementation loader and reference.
 * Loads js implementation scripts and store it
 */
class MirrorsImpl {
    constructor() {
        this.implementations = {};
        this.abstracts = {};

        (function (mirrorsImpl) {
            /**
             * This function is called when an implementation is loaded
             */
            window["registerMangaObject"] = function (object) {
                mirrorsImpl.implementations[object.mirrorName] = object;
            }
            /**
             * This function is called when an abstraction is loaded
             */
            window["registerAbstractImplementation"] = function (mirrorName) {
                mirrorsImpl.abstracts[mirrorName] = {loaded: true};
            }
        })(this);
    }

    /**
     * Removes the implementation cache
     */
    resetImplementations() {
        this.implementations = {};
        for (let i = 0; i < this.abstracts.length; i++) {
            let abs = this.abstracts[i]
            if (window[abs] !== undefined) {
                delete window[abs] // remove window objects from abstracts
            }
        }
        this.abstracts = {};
        let scripts = document.getElementsByTagName("script");
        for (let i = scripts.length - 1; i > 0; i--) {
            if (store.state.options["impl_repositories"].findIndex(repo => scripts[i].src.indexOf(repo) >= 0) >= 0) {
                // delete script
                scripts[i].parentNode.removeChild(scripts[i]);
            }
        }
    }

    /**
     * Load a mirror implementation file and return a Promise containing implementation object when loaded
     * @param {*} scripturl 
     */
    async loadImplScript(name, scripturl, isabstract) {
        let self = this;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            document.body.appendChild(script);
            if (!isabstract) {
                self.implementations[name] = {}
            } else {
                self.abstracts[name] = {}
            }
            script.onload = () => {
                // wait for implementation object to be populated
                (function waitForInit() {
                    if (
                        (!isabstract && self.implementations[name].home) || 
                        self.abstracts[name].loaded
                    ) {
                        return !isabstract ? 
                            resolve(self.implementations[name]) : 
                            resolve(self.abstracts[name]);
                    }
                    setTimeout(waitForInit, 10);
                })()
            };
            script.onerror = reject;
            script.async = true;
            script.src = scripturl + "?ts=" + Date.now(); // do not cache script implementation when loading it
        });
    }

    /**
     * Return mirror implementation object from mirrorName
     * @param {*} mirrorName 
     */
    async getImpl(mirrorName) {
        let self = this;
        if (this.implementations === undefined) this.implementations = {};
        if (this.implementations[mirrorName] !== undefined) {
            if (this.implementations[mirrorName].loaded) { // really loaded
                return Promise.resolve(this.implementations[mirrorName]);
            } else { // loading
                // wait for implementation object to be populated
                return new Promise((resolve, reject) => {
                    (function waitForInit() {
                        if (self.implementations[mirrorName].loaded) return resolve(self.implementations[mirrorName]);
                        setTimeout(waitForInit, 10);
                    })()
                });
            }
        }
        utils.debug("Load implementation of mirror " + mirrorName + " from repository");
        return new Promise(async (resolve, reject) => {
            let found = false;
            // Try to load script from first repo, next, ...
            for (let repo of store.state.options["impl_repositories"]) {
                let mirror = store.state.mirrors.all.find(mir => mir.mirrorName === mirrorName);
                try {
                    let obj = await self.loadImplScript(mirrorName, repo + mirror.jsFile)
                    if (obj.abstract !== undefined) {
                        // implementation is in an abstract, load it too
                        await self.loadAbstract(obj.abstract)
                        // instantiate the abstract class
                        let inst = new window[obj.abstract](obj.abstract_options)
                        // add implementation properties on instance
                        Object.assign(inst, obj)
                        // set object as instanciated abstract
                        obj = inst;
                        self.implementations[mirrorName] = obj
                    }
                    self.implementations[mirrorName].loaded = true;
                    // implementation loaded
                    resolve(obj)
                    found = true
                    break
                } catch (e) {
                    console.error(e)
                    // ignore repo and go to next
                }
            }
            // No repo can load the implementation
            if (!found) reject();
        });
    }

    /**
     * Load abstraction if not loaded
     * @param {*} mirrorName 
     */
    async loadAbstract(name) {
        let self = this;
        if (this.abstracts === undefined) this.abstracts = {};
        if (this.abstracts[name] !== undefined) {
            if (this.abstracts[name].loaded) { // really loaded
                return Promise.resolve(this.abstracts[name]);
            } else { // loading
                // wait for abstract object to be loaded
                return new Promise((resolve, reject) => {
                    (function waitForInit() {
                        if (self.abstracts[name].loaded) return resolve(self.abstracts[name]);
                        setTimeout(waitForInit, 10);
                    })()
                });
            }
        }
        utils.debug("Load abstract implementation " + name + " from repository");
        return new Promise(async (resolve, reject) => {
            let found = false;
            // Try to load script from first repo, next, ...
            for (let repo of store.state.options["impl_repositories"]) {
                let abstract = store.state.mirrors.abstracts.find(mir => mir.mirrorName === name);
                try {
                    await self.loadImplScript(name, repo + abstract.jsFile, true)
                    // implementation loaded
                    resolve(self.abstracts[name])
                    found = true
                    break
                } catch (e) {
                    console.error("Error while loading abstract implementation " + name + " from " + repo)
                    console.error(e)
                    // ignore repo and go to next
                }
            }
            // No repo can load the implementation
            if (!found) reject();
        });
    }
}

export default (new MirrorsImpl)