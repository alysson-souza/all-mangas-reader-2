import * as utils from './utils'


// 0/1 have different meanings
export const MANGA_READ_START = 0;
export const MANGA_READ_STOP = 1;

export const MANGA_UPDATE_START = 1;
export const MANGA_UPDATE_STOP= 0;

/**
 * Manga entry followed in AMR
 */
export default class {
    /**
     * Manga object constructor, copy properties and check validation
     * @param {*} obj
     */
    constructor(obj) {
        /** key of the manga */
        this.key = utils.mangaKey(obj.url, obj.mirror, obj.language);
        this.mirror = obj.mirror;
        this.name = obj.name;
        this.url = obj.url;
        this.lastChapterReadURL = obj.lastChapterReadURL;
        this.lastChapterReadName = obj.lastChapterReadName;
        this.listChaps = [];
        if (obj.listChaps && typeof obj.listChaps === "string") {
            this.listChaps = JSON.parse(obj.listChaps)
        } else if (obj.listChaps) {
            this.listChaps = obj.listChaps;
        }

        // start(0) / stop(1) following updates (unread chapters in manga list)
        this.read = obj.read || MANGA_READ_START;

        // start(1) / stop(0) updating (looking for new chapters) mangas
        this.update = obj.update;
        if (this.update === undefined || this.update === null) this.update = MANGA_UPDATE_START;
        this.display = obj.display || 0;
        this.layout = obj.layout || 0;
        this.cats = obj.cats || [];
        if (obj.cats && typeof obj.cats === "string") {
            this.cats = JSON.parse(obj.cats);
        } else if (obj.cats) {
            this.cats = obj.cats;
        }

        // Update the last read chapter of a manga (last updated?)
        this.ts = obj.ts || Math.round(Date.now() / 1000);

        // last time we found a new chapter
        this.upts = obj.upts || 0;

        // Webtoon mode (no whitespace between images)
        this.webtoon = obj.webtoon || false;

        // Scale Up images
        this.scaleUp = obj.scaleUp || 0;

        // Display name (so mangas can be renamed)
        this.displayName = obj.displayName || ''

        /* listChaps can contain an object with multiple lists for each lang
        this value is the lang of the followed manga */
        this.language = obj.language;
        /* all other possible values for this manga langs */
        this.languages = obj.languages;
        /** Currently reading chapter and page to restart from there if needed */
        this.currentChapter = obj.currentChapter;
        this.currentScanUrl = obj.currentScanUrl;
    }
}
