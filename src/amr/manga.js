import * as utils from './utils'

/**
 * Manga entry followed in AMR 
 */
export default class {
    /**
     * Manga object constructor, copy properties and check validation
     * @param {*} obj 
     */
    constructor(obj) {
        this.key = utils.mangaKey(obj.url);
        this.mirror = obj.mirror;
        this.name = obj.name;
        this.url = obj.url;
        this.lastChapterReadURL = obj.lastChapterReadURL || null;
        this.lastChapterReadName = obj.lastChapterReadName || null;
        this.listChaps = [];
        if (obj.listChaps && typeof obj.listChaps === "string") {
            this.listChaps = JSON.parse(obj.listChaps)
        } else if (obj.listChaps) {
            this.listChaps = obj.listChaps;
        }
        this.read = obj.read || 0;
        this.update = obj.update || 1;
        this.display = obj.display || 0;
        this.cats = obj.cats || [];
        if (obj.cats && typeof obj.cats === "string") {
            this.cats = JSON.parse(obj.cats);
        } else if (obj.cats) {
            this.cats = obj.cats;
        }
        this.ts = obj.ts || Math.round((new Date()).getTime() / 1000);
        this.upts = obj.upts || 0;
    }
}